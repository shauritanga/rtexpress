<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'invoice_id',
        'description',
        'item_code',
        'type',
        'quantity',
        'unit',
        'unit_price',
        'discount_percentage',
        'discount_amount',
        'line_total',
        'tax_rate',
        'tax_amount',
        'notes',
        'metadata',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'discount_percentage' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'line_total' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'metadata' => 'array',
            'sort_order' => 'integer',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            // Calculate line total
            $lineTotal = $item->quantity * $item->unit_price;

            // Apply discount
            if ($item->discount_percentage > 0) {
                $item->discount_amount = $lineTotal * ($item->discount_percentage / 100);
            }

            $lineTotal -= $item->discount_amount;

            // Calculate tax
            if ($item->tax_rate > 0) {
                $item->tax_amount = $lineTotal * ($item->tax_rate / 100);
            }

            $item->line_total = $lineTotal;
        });

        static::saved(function ($item) {
            // Recalculate invoice totals
            $item->invoice->calculateTotals();
        });

        static::deleted(function ($item) {
            // Recalculate invoice totals
            $item->invoice->calculateTotals();
        });
    }

    /**
     * Get the invoice that owns the item.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the total amount including tax.
     */
    public function getTotalWithTax(): float
    {
        return $this->line_total + $this->tax_amount;
    }

    /**
     * Get the effective unit price after discount.
     */
    public function getEffectiveUnitPrice(): float
    {
        $discountPerUnit = $this->discount_amount / $this->quantity;

        return $this->unit_price - $discountPerUnit;
    }
}
