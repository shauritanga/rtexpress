<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'name',
        'email',
        'phone',
        'license_number',
        'license_expiry',
        'address',
        'date_of_birth',
        'status',
        'rating',
        'total_deliveries',
        'total_distance',
        'emergency_contact',
        'vehicle_type',
        'vehicle_plate',
        'vehicle_capacity',
        'is_available',
        'last_location_update',
        'current_latitude',
        'current_longitude',
        'working_hours',
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'date_of_birth' => 'date',
        'rating' => 'decimal:2',
        'total_distance' => 'decimal:2',
        'vehicle_capacity' => 'decimal:2',
        'is_available' => 'boolean',
        'last_location_update' => 'datetime',
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
        'emergency_contact' => 'array',
        'working_hours' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($driver) {
            if (empty($driver->driver_id)) {
                $driver->driver_id = static::generateDriverId();
            }
        });
    }

    /**
     * Generate unique driver ID.
     */
    public static function generateDriverId(): string
    {
        do {
            $id = 'DRV-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('driver_id', $id)->exists());

        return $id;
    }

    /**
     * Get delivery routes for this driver.
     */
    public function deliveryRoutes(): HasMany
    {
        return $this->hasMany(DeliveryRoute::class);
    }

    /**
     * Get location history for this driver.
     */
    public function locations(): HasMany
    {
        return $this->hasMany(DriverLocation::class);
    }

    /**
     * Get current active route.
     */
    public function getCurrentRoute()
    {
        return $this->deliveryRoutes()
            ->where('delivery_date', today())
            ->where('status', 'in_progress')
            ->first();
    }

    /**
     * Get latest location.
     */
    public function getLatestLocation()
    {
        return $this->locations()
            ->orderBy('recorded_at', 'desc')
            ->first();
    }

    /**
     * Check if driver is currently working.
     */
    public function isWorking(): bool
    {
        if (!$this->is_available || $this->status !== 'active') {
            return false;
        }

        $currentTime = now()->format('H:i');
        $currentDay = strtolower(now()->format('l'));

        if (!isset($this->working_hours[$currentDay])) {
            return false;
        }

        $workingHours = $this->working_hours[$currentDay];
        return $currentTime >= $workingHours['start'] && $currentTime <= $workingHours['end'];
    }

    /**
     * Update driver location.
     */
    public function updateLocation(float $latitude, float $longitude, array $metadata = []): void
    {
        $this->update([
            'current_latitude' => $latitude,
            'current_longitude' => $longitude,
            'last_location_update' => now(),
        ]);

        // Record location history
        $this->locations()->create([
            'delivery_route_id' => $this->getCurrentRoute()?->id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'recorded_at' => now(),
            'metadata' => $metadata,
        ]);
    }

    /**
     * Calculate distance from current location to coordinates.
     */
    public function distanceTo(float $latitude, float $longitude): float
    {
        if (!$this->current_latitude || !$this->current_longitude) {
            return 0;
        }

        return $this->calculateDistance(
            $this->current_latitude,
            $this->current_longitude,
            $latitude,
            $longitude
        );
    }

    /**
     * Calculate distance between two coordinates using Haversine formula.
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Get driver's performance metrics.
     */
    public function getPerformanceMetrics(): array
    {
        $completedRoutes = $this->deliveryRoutes()
            ->where('status', 'completed')
            ->count();

        $avgRating = $this->rating;
        $totalDeliveries = $this->total_deliveries;
        $totalDistance = $this->total_distance;

        $onTimeDeliveries = $this->deliveryRoutes()
            ->where('status', 'completed')
            ->whereRaw('actual_end_time <= planned_end_time')
            ->count();

        $onTimePercentage = $completedRoutes > 0 ?
            round(($onTimeDeliveries / $completedRoutes) * 100, 1) : 0;

        return [
            'completed_routes' => $completedRoutes,
            'total_deliveries' => $totalDeliveries,
            'total_distance' => $totalDistance,
            'average_rating' => $avgRating,
            'on_time_percentage' => $onTimePercentage,
        ];
    }

    /**
     * Scope for active drivers.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for available drivers.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
                    ->where('status', 'active');
    }

    /**
     * Scope for drivers currently working.
     */
    public function scopeWorking($query)
    {
        return $query->available()
                    ->whereHas('deliveryRoutes', function ($q) {
                        $q->where('delivery_date', today())
                          ->where('status', 'in_progress');
                    });
    }
}
