<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'customer_id',
        'assigned_to',
        'created_by',
        'subject',
        'description',
        'status',
        'priority',
        'category',
        'source',
        'tags',
        'first_response_at',
        'resolved_at',
        'closed_at',
        'archived_at',
        'satisfaction_rating',
        'satisfaction_feedback',
    ];

    protected $casts = [
        'tags' => 'array',
        'first_response_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'archived_at' => 'datetime',
        'satisfaction_rating' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = static::generateTicketNumber();
            }
        });
    }

    /**
     * Generate unique ticket number.
     */
    public static function generateTicketNumber(): string
    {
        do {
            $number = 'RT-'.date('Y').'-'.str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        } while (static::where('ticket_number', $number)->exists());

        return $number;
    }

    /**
     * Get the customer that owns the ticket.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user assigned to the ticket.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created the ticket.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the replies for the ticket.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(TicketReply::class, 'ticket_id');
    }

    /**
     * Get public replies (visible to customer).
     */
    public function publicReplies(): HasMany
    {
        return $this->replies()->where('is_internal', false);
    }

    /**
     * Get internal notes (not visible to customer).
     */
    public function internalNotes(): HasMany
    {
        return $this->replies()->where('is_internal', true);
    }

    /**
     * Check if ticket is overdue.
     */
    public function isOverdue(): bool
    {
        if ($this->status === 'closed' || $this->status === 'resolved') {
            return false;
        }

        // Define SLA times based on priority (in hours)
        $slaHours = [
            'urgent' => 2,
            'high' => 8,
            'medium' => 24,
            'low' => 72,
        ];

        $slaTime = $slaHours[$this->priority] ?? 24;
        $dueTime = $this->created_at->addHours($slaTime);

        return now() > $dueTime;
    }

    /**
     * Get time until due.
     */
    public function getTimeUntilDue(): string
    {
        if ($this->status === 'closed' || $this->status === 'resolved') {
            return 'N/A';
        }

        $slaHours = [
            'urgent' => 2,
            'high' => 8,
            'medium' => 24,
            'low' => 72,
        ];

        $slaTime = $slaHours[$this->priority] ?? 24;
        $dueTime = $this->created_at->addHours($slaTime);
        $diff = now()->diff($dueTime);

        if ($diff->invert) {
            return 'Overdue by '.$diff->format('%h hours %i minutes');
        }

        return $diff->format('%h hours %i minutes remaining');
    }

    /**
     * Mark ticket as resolved.
     */
    public function markAsResolved(): void
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }

    /**
     * Mark ticket as closed.
     */
    public function markAsClosed(): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }

    /**
     * Assign ticket to user.
     */
    public function assignTo(User $user): void
    {
        $this->update(['assigned_to' => $user->id]);
    }

    /**
     * Get response time in hours.
     */
    public function getResponseTimeAttribute(): ?float
    {
        if (! $this->first_response_at) {
            return null;
        }

        return round($this->created_at->diffInHours($this->first_response_at), 1);
    }

    /**
     * Get resolution time in hours.
     */
    public function getResolutionTimeAttribute(): ?float
    {
        if (! $this->resolved_at) {
            return null;
        }

        return round($this->created_at->diffInHours($this->resolved_at), 1);
    }

    /**
     * Scope for open tickets.
     */
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'in_progress', 'waiting_customer']);
    }

    /**
     * Scope for closed tickets.
     */
    public function scopeClosed($query)
    {
        return $query->whereIn('status', ['resolved', 'closed']);
    }

    /**
     * Scope for overdue tickets.
     */
    public function scopeOverdue($query)
    {
        return $query->whereNotIn('status', ['resolved', 'closed'])
            ->where(function ($q) {
                $q->where(function ($sq) {
                    $sq->where('priority', 'urgent')
                        ->where('created_at', '<', now()->subHours(2));
                })->orWhere(function ($sq) {
                    $sq->where('priority', 'high')
                        ->where('created_at', '<', now()->subHours(8));
                })->orWhere(function ($sq) {
                    $sq->where('priority', 'medium')
                        ->where('created_at', '<', now()->subHours(24));
                })->orWhere(function ($sq) {
                    $sq->where('priority', 'low')
                        ->where('created_at', '<', now()->subHours(72));
                });
            });
    }

    /**
     * Check if this specific ticket is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->isOverdue();
    }

    /**
     * Scope for archived tickets.
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    /**
     * Scope for active (non-archived) tickets.
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'archived');
    }
}
