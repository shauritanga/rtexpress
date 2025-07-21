<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'barcode',
        'name',
        'description',
        'category',
        'brand',
        'model',
        'weight',
        'dimensions',
        'unit_of_measure',
        'unit_cost',
        'unit_price',
        'supplier',
        'manufacturer',
        'min_stock_level',
        'max_stock_level',
        'reorder_point',
        'reorder_quantity',
        'is_active',
        'is_trackable',
        'is_serialized',
        'custom_fields',
        'image_url',
    ];

    protected $casts = [
        'dimensions' => 'array',
        'custom_fields' => 'array',
        'weight' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_trackable' => 'boolean',
        'is_serialized' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->sku)) {
                $item->sku = static::generateSKU();
            }
        });
    }

    /**
     * Generate unique SKU.
     */
    public static function generateSKU(): string
    {
        do {
            $sku = 'RT-' . strtoupper(substr(uniqid(), -8));
        } while (static::where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * Get stock movements for this item.
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Get warehouse stock levels for this item.
     */
    public function warehouseStock(): HasMany
    {
        return $this->hasMany(WarehouseStock::class);
    }

    /**
     * Get stock alerts for this item.
     */
    public function stockAlerts(): HasMany
    {
        return $this->hasMany(StockAlert::class);
    }

    /**
     * Get total quantity across all warehouses.
     */
    public function getTotalQuantityAttribute(): int
    {
        return $this->warehouseStock()->sum('quantity_available');
    }

    /**
     * Get total reserved quantity across all warehouses.
     */
    public function getTotalReservedAttribute(): int
    {
        return $this->warehouseStock()->sum('quantity_reserved');
    }

    /**
     * Get available quantity (total - reserved).
     */
    public function getAvailableQuantityAttribute(): int
    {
        return $this->total_quantity - $this->total_reserved;
    }

    /**
     * Check if item is low stock.
     */
    public function isLowStock(): bool
    {
        return $this->total_quantity <= $this->reorder_point;
    }

    /**
     * Check if item is out of stock.
     */
    public function isOutOfStock(): bool
    {
        return $this->total_quantity <= 0;
    }

    /**
     * Check if item is overstocked.
     */
    public function isOverstocked(): bool
    {
        return $this->total_quantity > $this->max_stock_level;
    }

    /**
     * Get stock status.
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->isOutOfStock()) {
            return 'out_of_stock';
        } elseif ($this->isLowStock()) {
            return 'low_stock';
        } elseif ($this->isOverstocked()) {
            return 'overstock';
        }

        return 'in_stock';
    }

    /**
     * Get formatted dimensions.
     */
    public function getFormattedDimensionsAttribute(): ?string
    {
        if (!$this->dimensions) {
            return null;
        }

        $dims = $this->dimensions;
        return "{$dims['length']}L x {$dims['width']}W x {$dims['height']}H cm";
    }

    /**
     * Scope for active items.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for trackable items.
     */
    public function scopeTrackable($query)
    {
        return $query->where('is_trackable', true);
    }

    /**
     * Scope for low stock items.
     */
    public function scopeLowStock($query)
    {
        return $query->whereHas('warehouseStock', function ($q) {
            $q->selectRaw('inventory_item_id, SUM(quantity_available) as total_qty')
              ->groupBy('inventory_item_id')
              ->havingRaw('total_qty <= inventory_items.reorder_point');
        });
    }

    /**
     * Scope for out of stock items.
     */
    public function scopeOutOfStock($query)
    {
        return $query->whereHas('warehouseStock', function ($q) {
            $q->selectRaw('inventory_item_id, SUM(quantity_available) as total_qty')
              ->groupBy('inventory_item_id')
              ->havingRaw('total_qty <= 0');
        });
    }
}
