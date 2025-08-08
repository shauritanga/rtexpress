<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'notification_id',
        'type',
        'channel',
        'recipient_type',
        'recipient_id',
        'recipient_email',
        'recipient_phone',
        'title',
        'message',
        'data',
        'template',
        'priority',
        'status',
        'scheduled_at',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
        'archived_at',
        'failure_reason',
        'external_id',
        'metadata',
        'related_type',
        'related_id',
        'created_by',
    ];

    protected $casts = [
        'data' => 'array',
        'metadata' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'failed_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($notification) {
            if (empty($notification->notification_id)) {
                $notification->notification_id = static::generateNotificationId();
            }
        });
    }

    /**
     * Generate unique notification ID.
     */
    public static function generateNotificationId(): string
    {
        do {
            $id = 'NOTIF-'.date('Ymd').'-'.str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (static::where('notification_id', $id)->exists());

        return $id;
    }

    /**
     * Get the user who created this notification.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the notification logs.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * Get the related model (polymorphic).
     */
    public function related(): MorphTo
    {
        return $this->morphTo('related', 'related_type', 'related_id');
    }

    /**
     * Get the recipient model.
     */
    public function recipient()
    {
        $class = 'App\\Models\\'.ucfirst($this->recipient_type);
        if (class_exists($class)) {
            return $class::find($this->recipient_id);
        }

        return null;
    }

    /**
     * Mark notification as sent.
     */
    public function markAsSent(?string $externalId = null): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
            'external_id' => $externalId,
        ]);

        $this->logEvent('sent');
    }

    /**
     * Mark notification as delivered.
     */
    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        $this->logEvent('delivered');
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(): void
    {
        $this->update([
            'status' => 'read',
            'read_at' => now(),
        ]);

        $this->logEvent('read');

        // Auto-archive certain notification types immediately after reading
        $autoArchiveTypes = ['payment_received', 'shipment_delivered'];
        if (in_array($this->type, $autoArchiveTypes)) {
            $this->markAsArchived();
        }
    }

    /**
     * Mark notification as failed.
     */
    public function markAsFailed(string $reason): void
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => $reason,
        ]);

        $this->logEvent('failed', ['reason' => $reason]);
    }

    /**
     * Log notification event.
     */
    public function logEvent(string $event, array $data = []): void
    {
        $this->logs()->create([
            'event' => $event,
            'event_time' => now(),
            'event_data' => $data,
        ]);
    }

    /**
     * Check if notification is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->scheduled_at && $this->scheduled_at > now();
    }

    /**
     * Check if notification is ready to send.
     */
    public function isReadyToSend(): bool
    {
        return $this->status === 'pending' &&
               (! $this->scheduled_at || $this->scheduled_at <= now());
    }

    /**
     * Get notification priority color.
     */
    public function getPriorityColor(): string
    {
        $colors = [
            'low' => 'gray',
            'medium' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
        ];

        return $colors[$this->priority] ?? 'gray';
    }

    /**
     * Get notification status color.
     */
    public function getStatusColor(): string
    {
        $colors = [
            'pending' => 'yellow',
            'sent' => 'blue',
            'delivered' => 'green',
            'failed' => 'red',
            'read' => 'green',
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get channel icon.
     */
    public function getChannelIcon(): string
    {
        $icons = [
            'email' => 'mail',
            'sms' => 'message-square',
            'push' => 'bell',
            'in_app' => 'monitor',
        ];

        return $icons[$this->channel] ?? 'bell';
    }

    /**
     * Scope for pending notifications.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for ready to send notifications.
     */
    public function scopeReadyToSend($query)
    {
        return $query->pending()
            ->where(function ($q) {
                $q->whereNull('scheduled_at')
                    ->orWhere('scheduled_at', '<=', now());
            });
    }

    /**
     * Scope for notifications by channel.
     */
    public function scopeByChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    /**
     * Scope for notifications by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for notifications by recipient.
     */
    public function scopeForRecipient($query, string $type, int $id)
    {
        return $query->where('recipient_type', $type)
            ->where('recipient_id', $id);
    }

    /**
     * Scope for high priority notifications.
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    /**
     * Scope for failed notifications.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope for sent notifications.
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope for delivered notifications.
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    /**
     * Scope for read notifications.
     */
    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    /**
     * Scope for unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->whereIn('status', ['sent', 'delivered'])
            ->whereNull('read_at');
    }

    /**
     * Scope for customer notifications.
     */
    public function scopeForCustomer($query, int $customerId)
    {
        return $query->where('recipient_type', 'customer')
            ->where('recipient_id', $customerId);
    }

    /**
     * Scope for user notifications.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('recipient_type', 'user')
            ->where('recipient_id', $userId);
    }

    /**
     * Scope for today's notifications.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope for recent notifications.
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope for notifications within date range.
     */
    public function scopeWithinDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Check if notification is read.
     */
    public function isRead(): bool
    {
        return ! is_null($this->read_at);
    }

    /**
     * Check if notification is unread.
     */
    public function isUnread(): bool
    {
        return is_null($this->read_at);
    }

    /**
     * Get notification statistics for a customer.
     */
    public static function getStatsForCustomer(int $customerId): array
    {
        $notifications = static::forCustomer($customerId);

        return [
            'total' => $notifications->count(),
            'unread' => $notifications->unread()->count(),
            'failed' => $notifications->failed()->count(),
            'today' => $notifications->today()->count(),
            'delivered' => $notifications->delivered()->count(),
        ];
    }

    /**
     * Get notification statistics for a user.
     */
    public static function getStatsForUser(int $userId): array
    {
        $notifications = static::forUser($userId);

        return [
            'total' => $notifications->count(),
            'unread' => $notifications->unread()->count(),
            'failed' => $notifications->failed()->count(),
            'today' => $notifications->today()->count(),
            'delivered' => $notifications->delivered()->count(),
        ];
    }

    /**
     * Mark notification as archived.
     */
    public function markAsArchived(): void
    {
        $this->update([
            'archived_at' => now(),
        ]);

        $this->logEvent('archived');
    }

    /**
     * Check if notification is archived.
     */
    public function isArchived(): bool
    {
        return ! is_null($this->archived_at);
    }

    /**
     * Scope for archived notifications.
     */
    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }

    /**
     * Scope for active (non-archived) notifications.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('archived_at');
    }

    /**
     * Auto-archive old read notifications.
     */
    public static function autoArchiveOldNotifications(int $daysOld = 30): int
    {
        $cutoffDate = now()->subDays($daysOld);

        $notifications = static::whereNotNull('read_at')
            ->where('read_at', '<', $cutoffDate)
            ->whereNull('archived_at')
            ->get();

        $count = 0;
        foreach ($notifications as $notification) {
            $notification->markAsArchived();
            $count++;
        }

        return $count;
    }

    /**
     * Delete old archived notifications permanently.
     */
    public static function deleteOldArchivedNotifications(int $daysOld = 90): int
    {
        $cutoffDate = now()->subDays($daysOld);

        return static::whereNotNull('archived_at')
            ->where('archived_at', '<', $cutoffDate)
            ->delete();
    }

    /**
     * Get notification statistics for a customer (excluding archived).
     */
    public static function getActiveStatsForCustomer(int $customerId): array
    {
        $notifications = static::forCustomer($customerId)->active();

        return [
            'total' => $notifications->count(),
            'unread' => $notifications->unread()->count(),
            'failed' => $notifications->failed()->count(),
            'today' => $notifications->today()->count(),
            'delivered' => $notifications->delivered()->count(),
        ];
    }

    /**
     * Create notification only if the customer has enabled the channel for this type.
     */
    public static function createIfEnabled(array $data): ?self
    {
        // Check if this is a customer notification
        if ($data['recipient_type'] === 'customer' && isset($data['recipient_id'], $data['type'], $data['channel'])) {
            $preference = NotificationPreference::where('user_type', 'customer')
                ->where('user_id', $data['recipient_id'])
                ->where('notification_type', $data['type'])
                ->first();

            if ($preference) {
                $channelEnabled = match ($data['channel']) {
                    'email' => $preference->email_enabled,
                    'sms' => $preference->sms_enabled,
                    'push' => $preference->push_enabled,
                    'in_app' => $preference->in_app_enabled,
                    default => true
                };

                if (! $channelEnabled) {
                    // Channel is disabled for this notification type
                    return null;
                }
            }
        }

        return static::create($data);
    }

    /**
     * Create notifications for all enabled channels for a customer.
     * Uses global channel preferences - if notification type is enabled,
     * creates notifications for all globally enabled channels.
     */
    public static function createForCustomer(int $customerId, string $type, array $baseData): array
    {
        $customer = \App\Models\Customer::find($customerId);
        if (! $customer) {
            return [];
        }

        $preference = NotificationPreference::where('user_type', 'customer')
            ->where('user_id', $customerId)
            ->where('notification_type', $type)
            ->first();

        // If no preference found or notification type is disabled, don't create any notifications
        if (! $preference || (! $preference->email_enabled && ! $preference->sms_enabled && ! $preference->push_enabled && ! $preference->in_app_enabled)) {
            return [];
        }

        $notifications = [];
        $channels = [
            'email' => $preference->email_enabled,
            'sms' => $preference->sms_enabled,
            'push' => $preference->push_enabled,
            'in_app' => $preference->in_app_enabled,
        ];

        foreach ($channels as $channel => $enabled) {
            if ($enabled) {
                $notificationData = array_merge($baseData, [
                    'type' => $type,
                    'channel' => $channel,
                    'recipient_type' => 'customer',
                    'recipient_id' => $customerId,
                    'recipient_email' => $customer->email,
                    'recipient_phone' => $customer->phone,
                ]);

                $notification = static::create($notificationData);
                $notifications[] = $notification;
            }
        }

        return $notifications;
    }
}
