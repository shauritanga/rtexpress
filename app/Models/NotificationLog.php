<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'notification_id',
        'event',
        'event_time',
        'event_data',
        'provider',
        'provider_message_id',
        'provider_response',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'event_time' => 'datetime',
        'event_data' => 'array',
    ];

    /**
     * Get the notification that owns this log.
     */
    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class);
    }

    /**
     * Get event icon.
     */
    public function getEventIcon(): string
    {
        $icons = [
            'sent' => 'send',
            'delivered' => 'check',
            'failed' => 'x',
            'read' => 'eye',
            'opened' => 'mail-open',
            'clicked' => 'mouse-pointer',
        ];

        return $icons[$this->event] ?? 'activity';
    }

    /**
     * Get event color.
     */
    public function getEventColor(): string
    {
        $colors = [
            'sent' => 'blue',
            'delivered' => 'green',
            'failed' => 'red',
            'read' => 'green',
            'opened' => 'blue',
            'clicked' => 'purple',
        ];

        return $colors[$this->event] ?? 'gray';
    }

    /**
     * Scope for events by type.
     */
    public function scopeByEvent($query, string $event)
    {
        return $query->where('event', $event);
    }

    /**
     * Scope for events by provider.
     */
    public function scopeByProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Scope for recent events.
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('event_time', '>=', now()->subHours($hours));
    }
}
