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
            $id = 'NOTIF-' . date('Ymd') . '-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
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
        $class = 'App\\Models\\' . ucfirst($this->recipient_type);
        if (class_exists($class)) {
            return $class::find($this->recipient_id);
        }
        return null;
    }

    /**
     * Mark notification as sent.
     */
    public function markAsSent(string $externalId = null): void
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
               (!$this->scheduled_at || $this->scheduled_at <= now());
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
}
