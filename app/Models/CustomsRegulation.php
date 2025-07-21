<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomsRegulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'regulation_code',
        'country',
        'regulation_type',
        'hs_code',
        'product_category',
        'title',
        'description',
        'duty_rate',
        'minimum_duty',
        'maximum_duty',
        'tax_rate',
        'threshold_value',
        'restrictions',
        'required_documents',
        'prohibited_items',
        'requires_permit',
        'permit_authority',
        'compliance_notes',
        'effective_date',
        'expiry_date',
        'is_active',
        'source',
        'reference_url',
        'last_updated_at',
        'updated_by',
    ];

    protected $casts = [
        'duty_rate' => 'decimal:2',
        'minimum_duty' => 'decimal:2',
        'maximum_duty' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'threshold_value' => 'decimal:2',
        'restrictions' => 'array',
        'required_documents' => 'array',
        'prohibited_items' => 'array',
        'requires_permit' => 'boolean',
        'effective_date' => 'date',
        'expiry_date' => 'date',
        'is_active' => 'boolean',
        'last_updated_at' => 'datetime',
    ];

    /**
     * Get the user who last updated this regulation.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if regulation is currently effective.
     */
    public function isEffective(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->effective_date > $now) {
            return false;
        }

        if ($this->expiry_date && $this->expiry_date < $now) {
            return false;
        }

        return true;
    }

    /**
     * Get applicable duty rate for a given value.
     */
    public function getApplicableDutyRate(float $value): float
    {
        if (!$this->duty_rate) {
            return 0;
        }

        // Check threshold
        if ($this->threshold_value && $value < $this->threshold_value) {
            return 0;
        }

        return $this->duty_rate;
    }

    /**
     * Calculate duty amount for a given value.
     */
    public function calculateDuty(float $value): float
    {
        $rate = $this->getApplicableDutyRate($value);
        $duty = ($value * $rate) / 100;

        // Apply minimum/maximum duty if set
        if ($this->minimum_duty && $duty < $this->minimum_duty) {
            $duty = $this->minimum_duty;
        }

        if ($this->maximum_duty && $duty > $this->maximum_duty) {
            $duty = $this->maximum_duty;
        }

        return $duty;
    }

    /**
     * Calculate tax amount for a given value.
     */
    public function calculateTax(float $value): float
    {
        if (!$this->tax_rate) {
            return 0;
        }

        return ($value * $this->tax_rate) / 100;
    }

    /**
     * Scope for active regulations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for effective regulations.
     */
    public function scopeEffective($query)
    {
        return $query->active()
                    ->where('effective_date', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('expiry_date')
                          ->orWhere('expiry_date', '>', now());
                    });
    }

    /**
     * Scope for regulations by country.
     */
    public function scopeByCountry($query, string $country)
    {
        return $query->where('country', $country);
    }

    /**
     * Scope for regulations by HS code.
     */
    public function scopeByHsCode($query, string $hsCode)
    {
        return $query->where('hs_code', $hsCode);
    }

    /**
     * Scope for regulations by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('regulation_type', $type);
    }
}
