<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_type',
        'user_id',
        'notification_type',
        'email_enabled',
        'sms_enabled',
        'push_enabled',
        'in_app_enabled',
        'schedule',
        'filters',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'push_enabled' => 'boolean',
        'in_app_enabled' => 'boolean',
        'schedule' => 'array',
        'filters' => 'array',
    ];

    /**
     * Get the user model.
     */
    public function user()
    {
        $class = 'App\\Models\\'.ucfirst($this->user_type);
        if (class_exists($class)) {
            return $class::find($this->user_id);
        }

        return null;
    }

    /**
     * Get enabled channels.
     */
    public function getEnabledChannels(): array
    {
        $channels = [];

        if ($this->email_enabled) {
            $channels[] = 'email';
        }
        if ($this->sms_enabled) {
            $channels[] = 'sms';
        }
        if ($this->push_enabled) {
            $channels[] = 'push';
        }
        if ($this->in_app_enabled) {
            $channels[] = 'in_app';
        }

        return $channels;
    }

    /**
     * Check if channel is enabled.
     */
    public function isChannelEnabled(string $channel): bool
    {
        return in_array($channel, $this->getEnabledChannels());
    }

    /**
     * Update channel preference.
     */
    public function updateChannel(string $channel, bool $enabled): void
    {
        $field = $channel.'_enabled';
        if (in_array($field, $this->fillable)) {
            $this->update([$field => $enabled]);
        }
    }

    /**
     * Get default preferences for user.
     */
    public static function getDefaults(string $userType, int $userId): array
    {
        return [
            'user_type' => $userType,
            'user_id' => $userId,
            'email_enabled' => true,
            'sms_enabled' => false,
            'push_enabled' => true,
            'in_app_enabled' => true,
        ];
    }

    /**
     * Create default preferences for all notification types.
     */
    public static function createDefaults(string $userType, int $userId): void
    {
        $notificationTypes = [
            'shipment_update',
            'delivery_scheduled',
            'payment_received',
            'invoice_generated',
            'support_ticket_update',
            'system_maintenance',
            'security_alert',
        ];

        foreach ($notificationTypes as $type) {
            static::firstOrCreate([
                'user_type' => $userType,
                'user_id' => $userId,
                'notification_type' => $type,
            ], static::getDefaults($userType, $userId));
        }
    }

    /**
     * Scope for user preferences.
     */
    public function scopeForUser($query, string $userType, int $userId)
    {
        return $query->where('user_type', $userType)
            ->where('user_id', $userId);
    }

    /**
     * Scope for notification type.
     */
    public function scopeForType($query, string $type)
    {
        return $query->where('notification_type', $type);
    }

    /**
     * Scope for enabled channels.
     */
    public function scopeWithEnabledChannel($query, string $channel)
    {
        $field = $channel.'_enabled';

        return $query->where($field, true);
    }
}
