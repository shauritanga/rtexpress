<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'payment_number',
        'invoice_id',
        'customer_id',
        'status',
        'type',
        'method',
        'currency',
        'exchange_rate',
        'amount',
        'fee_amount',
        'net_amount',
        'gateway',
        'gateway_transaction_id',
        'gateway_payment_id',
        'gateway_response',
        'payment_method_details',
        'reference_number',
        'payment_date',
        'processed_at',
        'failed_at',
        'refunded_at',
        'notes',
        'failure_reason',
        'metadata',
        'processed_by',
        'created_by',
        'refund_parent_id',
        'refund_amount',
        'refund_reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'fee_amount' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'refund_amount' => 'decimal:2',
            'exchange_rate' => 'decimal:6',
            'payment_date' => 'datetime',
            'processed_at' => 'datetime',
            'failed_at' => 'datetime',
            'refunded_at' => 'datetime',
            'gateway_response' => 'array',
            'metadata' => 'array',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->payment_number)) {
                $payment->payment_number = static::generatePaymentNumber();
            }

            // Calculate net amount
            $payment->net_amount = $payment->amount - $payment->fee_amount;
        });

        static::updating(function ($payment) {
            // Recalculate net amount if amount or fee changes
            if ($payment->isDirty(['amount', 'fee_amount'])) {
                $payment->net_amount = $payment->amount - $payment->fee_amount;
            }
        });

        static::saved(function ($payment) {
            // Update invoice paid amount when payment status changes
            if ($payment->isDirty('status') && $payment->status === 'completed') {
                $payment->invoice->increment('paid_amount', $payment->amount);
                $payment->invoice->decrement('balance_due', $payment->amount);

                // Mark invoice as paid if balance is zero
                if ($payment->invoice->balance_due <= 0) {
                    $payment->invoice->markAsPaid();
                }
            }
        });
    }

    /**
     * Generate unique payment number.
     */
    public static function generatePaymentNumber(): string
    {
        $year = date('Y');
        $prefix = "PAY-{$year}-";

        // Get the last payment number for this year
        $lastPayment = static::where('payment_number', 'like', $prefix . '%')
            ->orderBy('payment_number', 'desc')
            ->first();

        if ($lastPayment) {
            $lastNumber = (int) substr($lastPayment->payment_number, -6);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get the invoice that owns the payment.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the customer that owns the payment.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user who processed the payment.
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Get the user who created the payment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the parent payment (for refunds).
     */
    public function refundParent(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'refund_parent_id');
    }

    /**
     * Check if payment is successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    /**
     * Check if payment failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if payment is refunded.
     */
    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }

    /**
     * Mark payment as completed.
     */
    public function markAsCompleted(?User $processedBy = null): void
    {
        $this->update([
            'status' => 'completed',
            'processed_at' => now(),
            'processed_by' => $processedBy?->id,
        ]);
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed(string $reason = null): void
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => $reason,
        ]);
    }

    /**
     * Process refund.
     */
    public function processRefund(float $amount, string $reason = null): Payment
    {
        $refund = static::create([
            'invoice_id' => $this->invoice_id,
            'customer_id' => $this->customer_id,
            'status' => 'completed',
            'type' => 'refund',
            'method' => $this->method,
            'currency' => $this->currency,
            'amount' => -$amount,
            'payment_date' => now(),
            'processed_at' => now(),
            'refund_parent_id' => $this->id,
            'refund_amount' => $amount,
            'refund_reason' => $reason,
            'created_by' => auth()->id(),
        ]);

        $this->update([
            'status' => 'refunded',
            'refunded_at' => now(),
        ]);

        return $refund;
    }
}
