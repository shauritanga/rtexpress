<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_number',
        'driver_id',
        'warehouse_id',
        'delivery_date',
        'status',
        'planned_start_time',
        'planned_end_time',
        'actual_start_time',
        'actual_end_time',
        'total_distance',
        'estimated_duration',
        'actual_duration',
        'total_stops',
        'completed_stops',
        'total_weight',
        'fuel_cost',
        'route_coordinates',
        'optimization_data',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'planned_start_time' => 'datetime:H:i',
        'planned_end_time' => 'datetime:H:i',
        'actual_start_time' => 'datetime',
        'actual_end_time' => 'datetime',
        'total_distance' => 'decimal:2',
        'estimated_duration' => 'decimal:2',
        'actual_duration' => 'decimal:2',
        'total_weight' => 'decimal:2',
        'fuel_cost' => 'decimal:2',
        'route_coordinates' => 'array',
        'optimization_data' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($route) {
            if (empty($route->route_number)) {
                $route->route_number = static::generateRouteNumber();
            }
        });
    }

    /**
     * Generate unique route number.
     */
    public static function generateRouteNumber(): string
    {
        do {
            $number = 'RT-'.date('Ymd').'-'.str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        } while (static::where('route_number', $number)->exists());

        return $number;
    }

    /**
     * Get the driver assigned to this route.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * Get the warehouse for this route.
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Get the user who created this route.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all stops for this route.
     */
    public function stops(): HasMany
    {
        return $this->hasMany(RouteStop::class)->orderBy('stop_order');
    }

    /**
     * Get pending stops.
     */
    public function pendingStops(): HasMany
    {
        return $this->stops()->where('status', 'pending');
    }

    /**
     * Get completed stops.
     */
    public function completedStops(): HasMany
    {
        return $this->stops()->where('status', 'completed');
    }

    /**
     * Get current stop (next pending stop).
     */
    public function getCurrentStop()
    {
        return $this->stops()
            ->whereIn('status', ['pending', 'in_transit', 'arrived'])
            ->orderBy('stop_order')
            ->first();
    }

    /**
     * Start the route.
     */
    public function start(): void
    {
        $this->update([
            'status' => 'in_progress',
            'actual_start_time' => now(),
        ]);

        // Update first stop to in_transit
        $firstStop = $this->stops()->orderBy('stop_order')->first();
        if ($firstStop) {
            $firstStop->update(['status' => 'in_transit']);
        }
    }

    /**
     * Complete the route.
     */
    public function complete(): void
    {
        $this->update([
            'status' => 'completed',
            'actual_end_time' => now(),
            'actual_duration' => $this->actual_start_time ?
                $this->actual_start_time->diffInHours(now()) : null,
            'completed_stops' => $this->stops()->where('status', 'completed')->count(),
        ]);

        // Update driver availability
        $this->driver->update(['is_available' => true]);
    }

    /**
     * Calculate route progress percentage.
     */
    public function getProgressPercentage(): float
    {
        if ($this->total_stops === 0) {
            return 0;
        }

        return round(($this->completed_stops / $this->total_stops) * 100, 1);
    }

    /**
     * Check if route is on schedule.
     */
    public function isOnSchedule(): bool
    {
        if ($this->status !== 'in_progress') {
            return true;
        }

        $currentTime = now();
        $currentStop = $this->getCurrentStop();

        if (! $currentStop) {
            return true;
        }

        $plannedArrival = $this->delivery_date->setTimeFromTimeString($currentStop->planned_arrival_time);

        return $currentTime <= $plannedArrival->addMinutes(15); // 15 minutes tolerance
    }

    /**
     * Get estimated completion time.
     */
    public function getEstimatedCompletionTime()
    {
        if ($this->status === 'completed') {
            return $this->actual_end_time;
        }

        if ($this->status !== 'in_progress') {
            return $this->delivery_date->setTimeFromTimeString($this->planned_end_time);
        }

        // Calculate based on current progress and remaining stops
        $remainingStops = $this->stops()->whereIn('status', ['pending', 'in_transit', 'arrived'])->count();
        $avgStopDuration = 20; // minutes per stop

        return now()->addMinutes($remainingStops * $avgStopDuration);
    }

    /**
     * Get route efficiency metrics.
     */
    public function getEfficiencyMetrics(): array
    {
        $plannedDuration = $this->estimated_duration;
        $actualDuration = $this->actual_duration ?? 0;

        $timeEfficiency = $plannedDuration > 0 ?
            round((1 - abs($actualDuration - $plannedDuration) / $plannedDuration) * 100, 1) : 0;

        $completionRate = $this->total_stops > 0 ?
            round(($this->completed_stops / $this->total_stops) * 100, 1) : 0;

        return [
            'time_efficiency' => $timeEfficiency,
            'completion_rate' => $completionRate,
            'on_schedule' => $this->isOnSchedule(),
            'progress_percentage' => $this->getProgressPercentage(),
        ];
    }

    /**
     * Scope for routes on specific date.
     */
    public function scopeOnDate($query, $date)
    {
        return $query->where('delivery_date', $date);
    }

    /**
     * Scope for active routes.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['planned', 'in_progress']);
    }

    /**
     * Scope for completed routes.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for routes by driver.
     */
    public function scopeByDriver($query, $driverId)
    {
        return $query->where('driver_id', $driverId);
    }
}
