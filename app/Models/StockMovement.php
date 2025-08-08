<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'warehouse_id',
        'type',
        'quantity',
        'quantity_before',
        'quantity_after',
        'unit_cost',
        'reference_type',
        'reference_id',
        'batch_number',
        'expiry_date',
        'notes',
        'created_by',
        'movement_date',
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'expiry_date' => 'date',
        'movement_date' => 'datetime',
    ];

    /**
     * Get the inventory item.
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the warehouse.
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Get the user who created the movement.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the reference model (polymorphic).
     */
    public function reference()
    {
        if (! $this->reference_type || ! $this->reference_id) {
            return null;
        }

        $class = 'App\\Models\\'.$this->reference_type;
        if (class_exists($class)) {
            return $class::find($this->reference_id);
        }

        return null;
    }

    /**
     * Check if movement is inbound.
     */
    public function isInbound(): bool
    {
        return in_array($this->type, ['in', 'found', 'adjustment']) && $this->quantity > 0;
    }

    /**
     * Check if movement is outbound.
     */
    public function isOutbound(): bool
    {
        return in_array($this->type, ['out', 'damaged', 'lost', 'adjustment']) && $this->quantity < 0;
    }

    /**
     * Get movement type label.
     */
    public function getTypeLabel(): string
    {
        $labels = [
            'in' => 'Stock In',
            'out' => 'Stock Out',
            'adjustment' => 'Adjustment',
            'transfer' => 'Transfer',
            'damaged' => 'Damaged',
            'lost' => 'Lost',
            'found' => 'Found',
        ];

        return $labels[$this->type] ?? $this->type;
    }

    /**
     * Get movement direction.
     */
    public function getDirectionAttribute(): string
    {
        if ($this->quantity > 0) {
            return 'in';
        } elseif ($this->quantity < 0) {
            return 'out';
        }

        return 'neutral';
    }

    /**
     * Scope for inbound movements.
     */
    public function scopeInbound($query)
    {
        return $query->where('quantity', '>', 0);
    }

    /**
     * Scope for outbound movements.
     */
    public function scopeOutbound($query)
    {
        return $query->where('quantity', '<', 0);
    }

    /**
     * Scope for specific movement type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for movements within date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('movement_date', [$startDate, $endDate]);
    }
}
