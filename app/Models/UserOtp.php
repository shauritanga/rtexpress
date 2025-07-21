<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class UserOtp extends Model
{
    protected $fillable = [
        'user_id',
        'otp_code',
        'phone_number',
        'type',
        'expires_at',
        'is_used',
        'used_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired();
    }

    public function markAsUsed(): void
    {
        $this->update([
            'is_used' => true,
            'used_at' => now(),
        ]);
    }

    public static function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public static function createForUser(User $user, string $type = 'login', ?string $phoneNumber = null): self
    {
        // Clean up old OTPs for this user and type
        self::where('user_id', $user->id)
            ->where('type', $type)
            ->delete();

        return self::create([
            'user_id' => $user->id,
            'otp_code' => self::generateOtp(),
            'phone_number' => $phoneNumber ?? $user->phone,
            'type' => $type,
            'expires_at' => now()->addMinutes(5), // OTP expires in 5 minutes
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
