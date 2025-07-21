<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_route_id',
        'shipment_id',
        'stop_order',
        'type',
        'status',
        'customer_name',
        'address',
        'latitude',
        'longitude',
        'contact_phone',
        'planned_arrival_time',
        'planned_departure_time',
        'actual_arrival_time',
        'actual_departure_time',
        'estimated_duration',
        'actual_duration',
        'distance_from_previous',
        'delivery_instructions',
        'priority',
        'requires_signature',
        'is_fragile',
        'delivery_proof',
        'delivery_notes',
        'failure_reason',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'planned_arrival_time' => 'datetime:H:i',
        'planned_departure_time' => 'datetime:H:i',
        'actual_arrival_time' => 'datetime',
        'actual_departure_time' => 'datetime',
        'distance_from_previous' => 'decimal:2',
        'requires_signature' => 'boolean',
        'is_fragile' => 'boolean',
        'delivery_proof' => 'array',
    ];

    /**
     * Get the delivery route this stop belongs to.
     */
    public function deliveryRoute(): BelongsTo
    {
        return $this->belongsTo(DeliveryRoute::class);
    }

    /**
     * Get the shipment for this stop.
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * Mark stop as arrived.
     */
    public function markAsArrived(): void
    {
        $this->update([
            'status' => 'arrived',
            'actual_arrival_time' => now(),
        ]);
    }

    /**
     * Complete the stop.
     */
    public function complete(array $deliveryData = []): void
    {
        $this->update([
            'status' => 'completed',
            'actual_departure_time' => now(),
            'actual_duration' => $this->actual_arrival_time ?
                $this->actual_arrival_time->diffInMinutes(now()) : null,
            'delivery_proof' => $deliveryData['proof'] ?? null,
            'delivery_notes' => $deliveryData['notes'] ?? null,
        ]);

        // Update shipment status
        if ($this->type === 'delivery') {
            $this->shipment->update(['status' => 'delivered']);
        }

        // Update route progress
        $route = $this->deliveryRoute;
        $route->update([
            'completed_stops' => $route->stops()->where('status', 'completed')->count(),
        ]);

        // Check if this was the last stop
        $remainingStops = $route->stops()->whereNotIn('status', ['completed', 'failed'])->count();
        if ($remainingStops === 0) {
            $route->complete();
        } else {
            // Update next stop to in_transit
            $nextStop = $route->stops()
                ->where('stop_order', '>', $this->stop_order)
                ->where('status', 'pending')
                ->orderBy('stop_order')
                ->first();

            if ($nextStop) {
                $nextStop->update(['status' => 'in_transit']);
            }
        }
    }

    /**
     * Mark stop as failed.
     */
    public function markAsFailed(string $reason): void
    {
        $this->update([
            'status' => 'failed',
            'failure_reason' => $reason,
            'actual_departure_time' => now(),
        ]);

        // Update shipment status
        if ($this->type === 'delivery') {
            $this->shipment->update(['status' => 'delivery_failed']);
        }
    }

    /**
     * Check if stop is overdue.
     */
    public function isOverdue(): bool
    {
        if (in_array($this->status, ['completed', 'failed'])) {
            return false;
        }

        $plannedTime = $this->deliveryRoute->delivery_date
            ->setTimeFromTimeString($this->planned_arrival_time)
            ->addMinutes(15); // 15 minutes tolerance

        return now() > $plannedTime;
    }

    /**
     * Get estimated arrival time based on current progress.
     */
    public function getEstimatedArrivalTime()
    {
        if ($this->actual_arrival_time) {
            return $this->actual_arrival_time;
        }

        if ($this->status === 'completed') {
            return $this->actual_departure_time;
        }

        // Calculate based on previous stops and current location
        $route = $this->deliveryRoute;
        $driver = $route->driver;

        if (!$driver->current_latitude || !$driver->current_longitude) {
            return $this->deliveryRoute->delivery_date
                ->setTimeFromTimeString($this->planned_arrival_time);
        }

        // Simple estimation based on distance and average speed
        $distance = $driver->distanceTo($this->latitude, $this->longitude);
        $avgSpeed = 40; // km/h average speed in city
        $travelTime = ($distance / $avgSpeed) * 60; // minutes

        return now()->addMinutes($travelTime);
    }

    /**
     * Get delivery time window.
     */
    public function getDeliveryWindow(): array
    {
        $plannedArrival = $this->deliveryRoute->delivery_date
            ->setTimeFromTimeString($this->planned_arrival_time);

        $plannedDeparture = $this->deliveryRoute->delivery_date
            ->setTimeFromTimeString($this->planned_departure_time);

        return [
            'start' => $plannedArrival,
            'end' => $plannedDeparture,
            'duration' => $plannedArrival->diffInMinutes($plannedDeparture),
        ];
    }

    /**
     * Get stop performance metrics.
     */
    public function getPerformanceMetrics(): array
    {
        $plannedDuration = $this->estimated_duration;
        $actualDuration = $this->actual_duration ?? 0;

        $timeEfficiency = $plannedDuration > 0 ?
            round((1 - abs($actualDuration - $plannedDuration) / $plannedDuration) * 100, 1) : 0;

        $isOnTime = !$this->isOverdue();
        $isCompleted = $this->status === 'completed';

        return [
            'time_efficiency' => $timeEfficiency,
            'on_time' => $isOnTime,
            'completed' => $isCompleted,
            'overdue' => $this->isOverdue(),
        ];
    }

    /**
     * Scope for stops by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for stops by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for overdue stops.
     */
    public function scopeOverdue($query)
    {
        return $query->whereNotIn('status', ['completed', 'failed'])
                    ->whereHas('deliveryRoute', function ($q) {
                        $q->where('delivery_date', '<=', today());
                    });
    }

    /**
     * Scope for high priority stops.
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }
}
