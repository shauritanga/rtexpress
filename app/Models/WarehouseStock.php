<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WarehouseStock extends Model
{
    use HasFactory;

    protected $table = 'warehouse_stock';

    protected $fillable = [
        'inventory_item_id',
        'warehouse_id',
        'quantity_available',
        'quantity_reserved',
        'quantity_damaged',
        'location',
        'average_cost',
        'last_counted_at',
        'last_counted_by',
    ];

    protected $casts = [
        'average_cost' => 'decimal:2',
        'last_counted_at' => 'datetime',
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
     * Get the user who last counted the stock.
     */
    public function lastCountedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_counted_by');
    }

    /**
     * Get total quantity (available + reserved + damaged).
     */
    public function getTotalQuantityAttribute(): int
    {
        return $this->quantity_available + $this->quantity_reserved + $this->quantity_damaged;
    }

    /**
     * Get usable quantity (available only).
     */
    public function getUsableQuantityAttribute(): int
    {
        return $this->quantity_available;
    }

    /**
     * Check if stock is low.
     */
    public function isLowStock(): bool
    {
        return $this->quantity_available <= $this->inventoryItem->reorder_point;
    }

    /**
     * Check if out of stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->quantity_available <= 0;
    }

    /**
     * Reserve stock quantity.
     */
    public function reserveStock(int $quantity): bool
    {
        if ($this->quantity_available < $quantity) {
            return false;
        }

        $this->decrement('quantity_available', $quantity);
        $this->increment('quantity_reserved', $quantity);

        return true;
    }

    /**
     * Release reserved stock.
     */
    public function releaseReservedStock(int $quantity): bool
    {
        if ($this->quantity_reserved < $quantity) {
            return false;
        }

        $this->decrement('quantity_reserved', $quantity);
        $this->increment('quantity_available', $quantity);

        return true;
    }

    /**
     * Consume reserved stock.
     */
    public function consumeReservedStock(int $quantity): bool
    {
        if ($this->quantity_reserved < $quantity) {
            return false;
        }

        $this->decrement('quantity_reserved', $quantity);

        return true;
    }

    /**
     * Add stock quantity.
     */
    public function addStock(int $quantity, ?float $unitCost = null): void
    {
        $oldQuantity = $this->quantity_available;
        $oldCost = $this->average_cost;

        $this->increment('quantity_available', $quantity);

        // Update average cost if unit cost provided
        if ($unitCost !== null && $quantity > 0) {
            $totalValue = ($oldQuantity * $oldCost) + ($quantity * $unitCost);
            $totalQuantity = $oldQuantity + $quantity;

            if ($totalQuantity > 0) {
                $this->update(['average_cost' => $totalValue / $totalQuantity]);
            }
        }
    }

    /**
     * Remove stock quantity.
     */
    public function removeStock(int $quantity): bool
    {
        if ($this->quantity_available < $quantity) {
            return false;
        }

        $this->decrement('quantity_available', $quantity);

        return true;
    }

    /**
     * Mark stock as damaged.
     */
    public function markAsDamaged(int $quantity): bool
    {
        if ($this->quantity_available < $quantity) {
            return false;
        }

        $this->decrement('quantity_available', $quantity);
        $this->increment('quantity_damaged', $quantity);

        return true;
    }

    /**
     * Update stock count.
     */
    public function updateCount(int $newQuantity, User $user): void
    {
        $this->update([
            'quantity_available' => $newQuantity,
            'last_counted_at' => now(),
            'last_counted_by' => $user->id,
        ]);
    }

    /**
     * Scope for low stock items.
     */
    public function scopeLowStock($query)
    {
        return $query->whereHas('inventoryItem', function ($q) {
            $q->whereRaw('warehouse_stock.quantity_available <= inventory_items.reorder_point');
        });
    }

    /**
     * Scope for out of stock items.
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('quantity_available', '<=', 0);
    }

    /**
     * Scope for specific warehouse.
     */
    public function scopeInWarehouse($query, int $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }
}
