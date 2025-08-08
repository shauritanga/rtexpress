<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'user_id',
        'customer_id',
        'message',
        'type',
        'is_internal',
        'attachments',
        'read_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_internal' => 'boolean',
        'read_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($reply) {
            // Update ticket's first response time if this is the first response
            $ticket = $reply->ticket;
            if (! $ticket->first_response_at && $reply->user_id) {
                $ticket->update(['first_response_at' => $reply->created_at]);
            }
        });
    }

    /**
     * Get the ticket that owns the reply.
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class, 'ticket_id');
    }

    /**
     * Get the user that created the reply.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the customer that created the reply.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the author of the reply (user or customer).
     */
    public function getAuthorAttribute()
    {
        return $this->user ?: $this->customer;
    }

    /**
     * Get the author name.
     */
    public function getAuthorNameAttribute(): string
    {
        if ($this->user) {
            return $this->user->name;
        }

        if ($this->customer) {
            return $this->customer->name;
        }

        return 'Unknown';
    }

    /**
     * Check if reply is from staff.
     */
    public function isFromStaff(): bool
    {
        return ! is_null($this->user_id);
    }

    /**
     * Check if reply is from customer.
     */
    public function isFromCustomer(): bool
    {
        return ! is_null($this->customer_id);
    }

    /**
     * Mark reply as read.
     */
    public function markAsRead(): void
    {
        if (! $this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Scope for public replies.
     */
    public function scopePublic($query)
    {
        return $query->where('is_internal', false);
    }

    /**
     * Scope for internal notes.
     */
    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }
}
