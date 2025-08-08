<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tracking_number',
        'customer_id',
        'origin_warehouse_id',
        'destination_warehouse_id',
        'sender_name',
        'sender_phone',
        'sender_address',
        'recipient_name',
        'recipient_phone',
        'recipient_address',
        'recipient_country',
        'service_type',
        'package_type',
        'weight_kg',
        'dimensions_length_cm',
        'dimensions_width_cm',
        'dimensions_height_cm',
        'declared_value',
        'insurance_value',
        'special_instructions',
        'status',
        'estimated_delivery_date',
        'actual_delivery_date',
        'delivery_signature',
        'delivery_notes',
        'total_cost',
        'delivery_options',
        'customs_data',
        'created_by',
        'assigned_to',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight_kg' => 'decimal:2',
        'dimensions_length_cm' => 'decimal:2',
        'dimensions_width_cm' => 'decimal:2',
        'dimensions_height_cm' => 'decimal:2',
        'declared_value' => 'decimal:2',
        'insurance_value' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'delivery_options' => 'array',
        'customs_data' => 'array',
        'estimated_delivery_date' => 'datetime',
        'actual_delivery_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($shipment) {
            if (empty($shipment->tracking_number)) {
                try {
                    $shipment->tracking_number = static::generateTrackingNumber();
                } catch (\Exception $e) {
                    // Fallback if generation fails
                    $shipment->tracking_number = 'RT-'.date('Y').'-'.str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
                }
            }

            // Set default status if not provided
            if (empty($shipment->status)) {
                $shipment->status = 'pending';
            }
        });
    }

    /**
     * Get the customer that owns the shipment.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the origin warehouse.
     */
    public function originWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'origin_warehouse_id');
    }

    /**
     * Get the destination warehouse.
     */
    public function destinationWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'destination_warehouse_id');
    }

    /**
     * Get the user who created this shipment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user assigned to this shipment.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Alias for creator() method.
     */
    public function createdBy(): BelongsTo
    {
        return $this->creator();
    }

    /**
     * Alias for assignedUser() method.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->assignedUser();
    }

    /**
     * Get the shipment items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(ShipmentItem::class);
    }

    /**
     * Get the tracking history.
     */
    public function trackingHistory(): HasMany
    {
        return $this->hasMany(ShipmentTracking::class)->orderBy('occurred_at', 'desc');
    }

    /**
     * Get the customs declaration for this shipment.
     */
    public function customsDeclaration(): HasOne
    {
        return $this->hasOne(CustomsDeclaration::class);
    }

    /**
     * Check if shipment requires customs declaration.
     */
    public function requiresCustomsDeclaration(): bool
    {
        // International shipments require customs declaration
        if ($this->service_type === 'international') {
            return true;
        }

        // High-value shipments may require customs declaration
        if ($this->declared_value > 1000) {
            return true;
        }

        // Check if destination country is different from origin
        $originCountry = $this->getOriginCountry();
        $destinationCountry = $this->getDestinationCountry();

        return $originCountry !== $destinationCountry;
    }

    /**
     * Get origin country from sender address.
     */
    public function getOriginCountry(): string
    {
        // Extract country from sender address or use default
        return $this->extractCountryFromAddress($this->sender_address) ?? 'TZ';
    }

    /**
     * Get destination country from recipient address.
     */
    public function getDestinationCountry(): string
    {
        // Use recipient_country field if available, otherwise extract from address
        return $this->recipient_country ?? $this->extractCountryFromAddress($this->recipient_address) ?? 'TZ';
    }

    /**
     * Extract country code from address string.
     */
    private function extractCountryFromAddress(?string $address): ?string
    {
        if (! $address) {
            return null;
        }

        // Simple country extraction - in real app, would use more sophisticated parsing
        $countries = [
            'Tanzania' => 'TZ', 'Kenya' => 'KE', 'Uganda' => 'UG',
            'Canada' => 'CA', 'United States' => 'US', 'USA' => 'US',
            'United Kingdom' => 'GB', 'UK' => 'GB', 'Germany' => 'DE',
            'Australia' => 'AU', 'South Africa' => 'ZA',
        ];

        foreach ($countries as $country => $code) {
            if (stripos($address, $country) !== false) {
                return $code;
            }
        }

        return null;
    }

    /**
     * Get the invoice for this shipment.
     */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    // Note: CustomsDocument, ComplianceCheck, and SupportTicket relationships
    // will be added in later phases when those models and tables are created

    /**
     * Generate a unique tracking number.
     */
    public static function generateTrackingNumber(): string
    {
        $year = date('Y');
        $prefix = "RT-{$year}-";

        $lastShipment = static::where('tracking_number', 'like', $prefix.'%')
            ->orderBy('tracking_number', 'desc')
            ->first();

        if ($lastShipment) {
            $lastNumber = (int) substr($lastShipment->tracking_number, -6);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix.str_pad($newNumber, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate volumetric weight in kg.
     */
    public function getVolumetricWeight(): float
    {
        $volumeCm3 = $this->dimensions_length_cm * $this->dimensions_width_cm * $this->dimensions_height_cm;

        return $volumeCm3 / 5000; // Standard volumetric divisor
    }

    /**
     * Get billable weight (higher of actual or volumetric).
     */
    public function getBillableWeight(): float
    {
        return max($this->weight_kg, $this->getVolumetricWeight());
    }

    /**
     * Check if shipment is delivered.
     */
    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    /**
     * Check if shipment is in transit.
     */
    public function isInTransit(): bool
    {
        return in_array($this->status, ['picked_up', 'in_transit', 'out_for_delivery']);
    }

    /**
     * Check if shipment has exception.
     */
    public function hasException(): bool
    {
        return $this->status === 'exception';
    }

    /**
     * Check if shipment is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->estimated_delivery_date &&
               $this->estimated_delivery_date->isPast() &&
               ! $this->isDelivered();
    }

    /**
     * Add tracking update.
     */
    public function addTrackingUpdate(string $status, string $location, ?string $notes = null, ?User $user = null): void
    {
        $this->trackingHistory()->create([
            'status' => $status,
            'location' => $location,
            'notes' => $notes,
            'occurred_at' => now(),
            'recorded_by' => $user?->id,
        ]);

        // Update shipment status
        $this->update(['status' => $status]);
    }

    /**
     * Get status badge color for UI.
     */
    public function getStatusColor(): string
    {
        return match ($this->status) {
            'pending' => 'gray',
            'picked_up' => 'blue',
            'in_transit' => 'yellow',
            'out_for_delivery' => 'orange',
            'delivered' => 'green',
            'exception' => 'red',
            'cancelled' => 'red',
            default => 'gray',
        };
    }

    /**
     * Scope query to get shipments by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope query to get active shipments (not delivered or cancelled).
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['delivered', 'cancelled']);
    }

    /**
     * Scope query to search shipments.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('tracking_number', 'like', "%{$search}%")
                ->orWhere('sender_name', 'like', "%{$search}%")
                ->orWhere('recipient_name', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('company_name', 'like', "%{$search}%");
                });
        });
    }

    /**
     * Scope query to filter by service type.
     */
    public function scopeByServiceType($query, string $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    /**
     * Scope query to filter by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope query to get overdue shipments.
     */
    public function scopeOverdue($query)
    {
        return $query->where('estimated_delivery_date', '<', now())
            ->whereNotIn('status', ['delivered', 'cancelled']);
    }
}
