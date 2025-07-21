<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'name',
        'address_line_1',
        'address_line_2',
        'city',
        'state_province',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'capacity_cubic_meters',
        'operating_hours',
        'contact_person',
        'phone',
        'email',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'capacity_cubic_meters' => 'decimal:2',
        'operating_hours' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'warehouse_code',
        'type',
        'address',
        'state',
        'capacity',
        'current_utilization',
        'manager_name',
        'inventory_count',
        'shipments_count'
    ];

    /**
     * Get the shipments originating from this warehouse.
     */
    public function originShipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'origin_warehouse_id');
    }

    /**
     * Get the shipments destined for this warehouse.
     */
    public function destinationShipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'destination_warehouse_id');
    }

    /**
     * Get all shipments related to this warehouse.
     */
    public function allShipments()
    {
        return Shipment::where('origin_warehouse_id', $this->id)
            ->orWhere('destination_warehouse_id', $this->id);
    }

    // Note: Inventory, WarehouseZone, and Route relationships will be added
    // in later phases when those models and tables are created

    /**
     * Get the warehouse code.
     */
    public function getWarehouseCodeAttribute(): string
    {
        return $this->code ?? 'N/A';
    }

    /**
     * Get the warehouse type (mock for now).
     */
    public function getTypeAttribute(): string
    {
        // This would be a real field in production
        return 'distribution';
    }

    /**
     * Get the warehouse full address.
     */
    public function getAddressAttribute(): string
    {
        $address = $this->address_line_1 ?? '';
        if ($this->address_line_2) {
            $address .= ', ' . $this->address_line_2;
        }
        return $address ?: 'No address provided';
    }

    /**
     * Get the warehouse state.
     */
    public function getStateAttribute(): string
    {
        return $this->state_province ?? '';
    }

    /**
     * Get the warehouse capacity.
     */
    public function getCapacityAttribute(): float
    {
        return $this->capacity_cubic_meters ?? 1000;
    }

    /**
     * Get the current utilization percentage.
     */
    public function getCurrentUtilizationAttribute(): float
    {
        // Mock calculation - in production this would be based on actual inventory
        return rand(30, 95);
    }

    /**
     * Get the manager name.
     */
    public function getManagerNameAttribute(): ?string
    {
        return $this->contact_person ?: null;
    }

    /**
     * Get the inventory count.
     */
    public function getInventoryCountAttribute(): int
    {
        // Mock count - in production this would be from inventory table
        return rand(100, 5000);
    }

    /**
     * Get the shipments count.
     */
    public function getShipmentsCountAttribute(): int
    {
        return $this->originShipments()->count() + $this->destinationShipments()->count();
    }

    /**
     * Check if warehouse is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if warehouse is operational at given time.
     */
    public function isOperational(?\DateTime $dateTime = null): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        if (!$this->operating_hours || empty($this->operating_hours)) {
            return true; // 24/7 operation if no hours specified
        }

        $dateTime = $dateTime ?: new \DateTime();
        $dayOfWeek = strtolower($dateTime->format('l'));
        $currentTime = $dateTime->format('H:i');

        if (!isset($this->operating_hours[$dayOfWeek])) {
            return false; // Closed on this day
        }

        $hours = $this->operating_hours[$dayOfWeek];

        if ($hours === 'closed') {
            return false;
        }

        if ($hours === '24/7') {
            return true;
        }

        // Parse hours like "08:00-17:00"
        if (preg_match('/(\d{2}:\d{2})-(\d{2}:\d{2})/', $hours, $matches)) {
            $openTime = $matches[1];
            $closeTime = $matches[2];

            return $currentTime >= $openTime && $currentTime <= $closeTime;
        }

        return true;
    }

    /**
     * Get current capacity utilization percentage.
     * Note: This will be implemented when Inventory model is created
     */
    public function getCapacityUtilization(): float
    {
        // TODO: Implement when Inventory model is available
        return 0.0;
    }

    /**
     * Get full address as string.
     */
    public function getFullAddressAttribute(): string
    {
        $address = $this->address_line_1;

        if ($this->address_line_2) {
            $address .= ', ' . $this->address_line_2;
        }

        $address .= ', ' . $this->city;
        $address .= ', ' . $this->state_province;
        $address .= ' ' . $this->postal_code;
        $address .= ', ' . $this->country;

        return $address;
    }

    /**
     * Calculate distance to another warehouse in kilometers.
     */
    public function distanceTo(Warehouse $warehouse): ?float
    {
        if (!$this->latitude || !$this->longitude || !$warehouse->latitude || !$warehouse->longitude) {
            return null;
        }

        $earthRadius = 6371; // Earth's radius in kilometers

        $latFrom = deg2rad($this->latitude);
        $lonFrom = deg2rad($this->longitude);
        $latTo = deg2rad($warehouse->latitude);
        $lonTo = deg2rad($warehouse->longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($latFrom) * cos($latTo) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Scope query to get active warehouses.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope query to search warehouses.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%")
              ->orWhere('city', 'like', "%{$search}%")
              ->orWhere('country', 'like', "%{$search}%");
        });
    }

    /**
     * Scope query to filter by country.
     */
    public function scopeByCountry($query, string $country)
    {
        return $query->where('country', $country);
    }

    /**
     * Scope query to find warehouses within radius.
     */
    public function scopeWithinRadius($query, float $latitude, float $longitude, float $radiusKm)
    {
        return $query->whereRaw(
            "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) < ?",
            [$latitude, $longitude, $latitude, $radiusKm]
        );
    }
}
