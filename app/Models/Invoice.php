<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use App\Notifications\InvoiceCreatedNotification;
use App\Notifications\InvoiceSentNotification;
use Illuminate\Support\Facades\Notification;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'invoice_number',
        'customer_id',
        'shipment_id',
        'status',
        'type',
        'issue_date',
        'due_date',
        'paid_date',
        'currency',
        'exchange_rate',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'balance_due',
        'tax_rate',
        'tax_type',
        'billing_address',
        'company_address',
        'notes',
        'terms_conditions',
        'payment_terms',
        'payment_methods',
        'created_by',
        'sent_by',
        'sent_at',
        'viewed_at',
        'view_count',
        'cancelled_at',
        'cancelled_by',
        'recurring_frequency',
        'next_recurring_date',
        'parent_invoice_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'paid_date' => 'date',
            'next_recurring_date' => 'date',
            'sent_at' => 'datetime',
            'viewed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'billing_address' => 'array',
            'company_address' => 'array',
            'payment_methods' => 'array',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'balance_due' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'exchange_rate' => 'decimal:6',
            'view_count' => 'integer',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = static::generateInvoiceNumber();
            }
        });

        static::updating(function ($invoice) {
            // Update balance due when amounts change
            if ($invoice->isDirty(['total_amount', 'paid_amount'])) {
                $invoice->balance_due = $invoice->total_amount - $invoice->paid_amount;
            }
        });
    }

    /**
     * Generate unique invoice number.
     */
    public static function generateInvoiceNumber(): string
    {
        $year = date('Y');
        $prefix = "INV-{$year}-";

        // Get the last invoice number for this year
        $lastInvoice = static::where('invoice_number', 'like', $prefix . '%')
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, -6);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get the customer that owns the invoice.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the shipment associated with the invoice.
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * Get the user who created the invoice.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who sent the invoice.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    /**
     * Get the user who cancelled the invoice.
     */
    public function canceller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Get the invoice items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    /**
     * Get the payments for this invoice.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the parent invoice (for recurring invoices).
     */
    public function parentInvoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'parent_invoice_id');
    }

    /**
     * Get child invoices (recurring invoices).
     */
    public function childInvoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'parent_invoice_id');
    }

    /**
     * Check if invoice is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status !== 'paid' &&
               $this->status !== 'cancelled' &&
               $this->due_date < now()->toDateString();
    }

    /**
     * Check if invoice is paid.
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid' || $this->balance_due <= 0;
    }

    /**
     * Check if invoice is partially paid.
     */
    public function isPartiallyPaid(): bool
    {
        return $this->paid_amount > 0 && $this->balance_due > 0;
    }

    /**
     * Get days until due date.
     */
    public function getDaysUntilDue(): int
    {
        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Get days overdue.
     */
    public function getDaysOverdue(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }

        return now()->diffInDays($this->due_date);
    }

    /**
     * Mark invoice as sent.
     */
    public function markAsSent(?User $sentBy = null): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
            'sent_by' => $sentBy?->id,
        ]);
    }

    /**
     * Mark invoice as viewed.
     */
    public function markAsViewed(): void
    {
        $this->increment('view_count');

        if (!$this->viewed_at) {
            $this->update([
                'status' => 'viewed',
                'viewed_at' => now(),
            ]);
        }
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid(?float $amount = null): void
    {
        $amount = $amount ?? $this->total_amount;

        $this->update([
            'status' => 'paid',
            'paid_amount' => $amount,
            'balance_due' => $this->total_amount - $amount,
            'paid_date' => now(),
        ]);
    }

    /**
     * Calculate totals from items.
     */
    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum('line_total');
        $taxAmount = $this->items->sum('tax_amount');
        $discountAmount = $this->discount_amount ?? 0;

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $subtotal + $taxAmount - $discountAmount,
            'balance_due' => ($subtotal + $taxAmount - $discountAmount) - $this->paid_amount,
        ]);
    }

    /**
     * Send invoice created notification to customer.
     */
    public function sendCreatedNotification(): void
    {
        if ($this->customer) {
            // Find the user associated with this customer
            $customerUser = \App\Models\User::where('customer_id', $this->customer->id)->first();

            if ($customerUser) {
                $customerUser->notify(new InvoiceCreatedNotification($this));
            }

            // Also send email directly to customer email if no user account exists
            if (!$customerUser && $this->customer->email) {
                \Illuminate\Support\Facades\Notification::route('mail', $this->customer->email)
                    ->notify(new InvoiceCreatedNotification($this));
            }
        }
    }

    /**
     * Send invoice sent notification to customer.
     */
    public function sendSentNotification(): void
    {
        if ($this->customer) {
            // Find the user associated with this customer
            $customerUser = \App\Models\User::where('customer_id', $this->customer->id)->first();

            if ($customerUser) {
                $customerUser->notify(new InvoiceSentNotification($this));
            }

            // Also send email directly to customer email if no user account exists
            if (!$customerUser && $this->customer->email) {
                \Illuminate\Support\Facades\Notification::route('mail', $this->customer->email)
                    ->notify(new InvoiceSentNotification($this));
            }
        }
    }

    /**
     * Send notification to admin users about invoice creation.
     */
    public function sendAdminNotification(): void
    {
        // Get admin users using the roles relationship
        $adminUsers = \App\Models\User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        foreach ($adminUsers as $admin) {
            $admin->notify(new InvoiceCreatedNotification($this));
        }
    }
}
