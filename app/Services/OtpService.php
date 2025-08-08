<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserOtp;
use App\Notifications\OtpCodeNotification;
use Illuminate\Support\Facades\Log;

class OtpService
{
    /**
     * Send OTP via email notification
     */
    public function sendOtp(User $user, string $type = 'login'): UserOtp
    {
        // Generate OTP
        $otp = $user->generateOtp($type);

        // Send email notification
        $this->sendEmail($user, $otp->otp_code, $type);

        // Log OTP generation for security audit
        Log::info('OTP generated', [
            'user_id' => $user->id,
            'type' => $type,
            'email' => $user->email,
            'ip' => request()->ip(),
        ]);

        return $otp;
    }

    /**
     * Verify OTP code
     */
    public function verifyOtp(User $user, string $otpCode, string $type = 'login'): bool
    {
        $otp = UserOtp::where('user_id', $user->id)
            ->where('otp_code', $otpCode)
            ->where('type', $type)
            ->where('is_used', false)
            ->first();

        if (! $otp || $otp->isExpired()) {
            Log::warning('Invalid OTP attempt', [
                'user_id' => $user->id,
                'otp_code' => $otpCode,
                'type' => $type,
                'ip' => request()->ip(),
            ]);

            return false;
        }

        // Mark OTP as used
        $otp->markAsUsed();

        Log::info('OTP verified successfully', [
            'user_id' => $user->id,
            'type' => $type,
            'ip' => request()->ip(),
        ]);

        return true;
    }

    /**
     * Send OTP via email notification
     */
    private function sendEmail(User $user, string $otpCode, string $type): bool
    {
        try {
            $expirationMinutes = config('otp.expiration_minutes', 5);

            // Log mail configuration for debugging
            Log::info('Attempting to send OTP email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'type' => $type,
                'mail_driver' => config('mail.default'),
                'mail_host' => config('mail.mailers.smtp.host'),
                'mail_from' => config('mail.from.address'),
            ]);

            $user->notify(new OtpCodeNotification($otpCode, $type, $expirationMinutes));

            Log::info('OTP email sent successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'type' => $type,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('OTP email sending failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'type' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'mail_driver' => config('mail.default'),
            ]);

            return false;
        }
    }

    /**
     * Clean up expired OTPs
     */
    public function cleanupExpiredOtps(): int
    {
        $deleted = UserOtp::where('expires_at', '<', now())
            ->orWhere('is_used', true)
            ->delete();

        Log::info('Expired OTPs cleaned up', ['count' => $deleted]);

        return $deleted;
    }

    /**
     * Check if user can request new OTP (rate limiting)
     */
    public function canRequestOtp(User $user, string $type = 'login'): bool
    {
        $recentOtp = UserOtp::where('user_id', $user->id)
            ->where('type', $type)
            ->where('created_at', '>', now()->subMinute())
            ->first();

        return ! $recentOtp;
    }

    /**
     * Get remaining time before user can request new OTP
     */
    public function getOtpCooldownSeconds(User $user, string $type = 'login'): int
    {
        $recentOtp = UserOtp::where('user_id', $user->id)
            ->where('type', $type)
            ->where('created_at', '>', now()->subMinute())
            ->orderBy('created_at', 'desc')
            ->first();

        if (! $recentOtp) {
            return 0;
        }

        return 60 - $recentOtp->created_at->diffInSeconds(now());
    }
}
