<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserOtp;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class OtpService
{
    /**
     * Send OTP via SMS using a mock service (replace with actual SMS provider)
     */
    public function sendOtp(User $user, string $type = 'login'): UserOtp
    {
        // Generate OTP
        $otp = $user->generateOtp($type);

        // Send SMS (mock implementation - replace with actual SMS service)
        $this->sendSms($otp->phone_number, $otp->otp_code);

        // Log OTP generation for security audit
        Log::info('OTP generated', [
            'user_id' => $user->id,
            'type' => $type,
            'phone' => $otp->phone_number,
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

        if (!$otp || $otp->isExpired()) {
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
     * Send SMS (mock implementation)
     * Replace this with actual SMS service like Twilio, Nexmo, or local provider
     */
    private function sendSms(string $phoneNumber, string $otpCode): bool
    {
        // Mock SMS sending - replace with actual implementation
        Log::info('SMS sent (mock)', [
            'phone' => $phoneNumber,
            'message' => "Your RT Express verification code is: {$otpCode}. Valid for 5 minutes.",
        ]);

        // For actual implementation, you might use:
        /*
        try {
            Http::post('https://api.sms-provider.com/send', [
                'to' => $phoneNumber,
                'message' => "Your RT Express verification code is: {$otpCode}. Valid for 5 minutes.",
                'api_key' => config('services.sms.api_key'),
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('SMS sending failed', ['error' => $e->getMessage()]);
            return false;
        }
        */

        return true; // Mock success
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

        return !$recentOtp;
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

        if (!$recentOtp) {
            return 0;
        }

        return 60 - $recentOtp->created_at->diffInSeconds(now());
    }
}
