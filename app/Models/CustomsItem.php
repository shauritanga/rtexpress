<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomsItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'customs_declaration_id',
        'description',
        'hs_code',
        'country_of_origin',
        'quantity',
        'unit_of_measure',
        'unit_weight',
        'unit_value',
        'total_value',
        'currency',
        'manufacturer',
        'brand',
        'model',
        'material',
        'purpose',
        'is_restricted',
        'requires_permit',
        'permit_number',
        'estimated_duty_rate',
        'estimated_duty_amount',
        'estimated_tax_rate',
        'estimated_tax_amount',
        'additional_details',
    ];

    protected $casts = [
        'unit_weight' => 'decimal:3',
        'unit_value' => 'decimal:2',
        'total_value' => 'decimal:2',
        'estimated_duty_rate' => 'decimal:2',
        'estimated_duty_amount' => 'decimal:2',
        'estimated_tax_rate' => 'decimal:2',
        'estimated_tax_amount' => 'decimal:2',
        'is_restricted' => 'boolean',
        'requires_permit' => 'boolean',
        'additional_details' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            // Calculate total value
            $item->total_value = $item->quantity * $item->unit_value;

            // Calculate estimated duties and taxes
            $item->calculateEstimatedCharges();
        });
    }

    /**
     * Get the customs declaration this item belongs to.
     */
    public function customsDeclaration(): BelongsTo
    {
        return $this->belongsTo(CustomsDeclaration::class);
    }

    /**
     * Calculate estimated duties and taxes.
     */
    public function calculateEstimatedCharges(): void
    {
        // Get applicable regulations
        $regulations = CustomsRegulation::where('country', $this->customsDeclaration->destination_country)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->where('hs_code', $this->hs_code)
                    ->orWhereNull('hs_code');
            })
            ->get();

        $dutyRate = 0;
        $taxRate = 0;

        foreach ($regulations as $regulation) {
            if ($regulation->duty_rate) {
                $dutyRate = max($dutyRate, $regulation->duty_rate);
            }
            if ($regulation->tax_rate) {
                $taxRate = max($taxRate, $regulation->tax_rate);
            }
        }

        $this->estimated_duty_rate = $dutyRate;
        $this->estimated_tax_rate = $taxRate;
        $this->estimated_duty_amount = ($this->total_value * $dutyRate) / 100;
        $this->estimated_tax_amount = ($this->total_value * $taxRate) / 100;
    }

    /**
     * Check if item is restricted.
     */
    public function checkRestrictions(): array
    {
        $restrictions = [];
        $warnings = [];

        // Check against regulations
        $regulations = CustomsRegulation::where('country', $this->customsDeclaration->destination_country)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->where('hs_code', $this->hs_code)
                    ->orWhere('product_category', $this->getProductCategory());
            })
            ->get();

        foreach ($regulations as $regulation) {
            if ($regulation->regulation_type === 'prohibition') {
                $restrictions[] = "Item is prohibited: {$regulation->description}";
            } elseif ($regulation->regulation_type === 'restriction') {
                $warnings[] = "Item has restrictions: {$regulation->description}";
            }

            if ($regulation->requires_permit && ! $this->permit_number) {
                $restrictions[] = "Permit required from {$regulation->permit_authority}";
            }
        }

        return [
            'is_restricted' => ! empty($restrictions),
            'restrictions' => $restrictions,
            'warnings' => $warnings,
        ];
    }

    /**
     * Get product category based on HS code.
     */
    public function getProductCategory(): string
    {
        if (! $this->hs_code) {
            return 'general';
        }

        $chapter = substr($this->hs_code, 0, 2);

        $categories = [
            '01-05' => 'live_animals_products',
            '06-14' => 'vegetable_products',
            '15' => 'fats_oils',
            '16-24' => 'food_beverages',
            '25-27' => 'mineral_products',
            '28-38' => 'chemicals',
            '39-40' => 'plastics_rubber',
            '41-43' => 'hides_skins',
            '44-46' => 'wood_products',
            '47-49' => 'paper_products',
            '50-63' => 'textiles',
            '64-67' => 'footwear_headgear',
            '68-70' => 'stone_glass',
            '71' => 'precious_metals',
            '72-83' => 'base_metals',
            '84-85' => 'machinery_electrical',
            '86-89' => 'transportation',
            '90-92' => 'precision_instruments',
            '93' => 'arms_ammunition',
            '94-96' => 'miscellaneous',
            '97' => 'art_antiques',
        ];

        foreach ($categories as $range => $category) {
            if (strpos($range, '-') !== false) {
                [$start, $end] = explode('-', $range);
                if ($chapter >= $start && $chapter <= $end) {
                    return $category;
                }
            } elseif ($chapter === $range) {
                return $category;
            }
        }

        return 'general';
    }

    /**
     * Get total weight for this item.
     */
    public function getTotalWeightAttribute(): float
    {
        return $this->quantity * $this->unit_weight;
    }

    /**
     * Get formatted HS code.
     */
    public function getFormattedHsCodeAttribute(): string
    {
        if (! $this->hs_code) {
            return 'N/A';
        }

        // Format as XX.XX.XX.XXXX
        $code = str_pad($this->hs_code, 10, '0', STR_PAD_RIGHT);

        return substr($code, 0, 2).'.'.substr($code, 2, 2).'.'.substr($code, 4, 2).'.'.substr($code, 6, 4);
    }

    /**
     * Scope for items by HS code.
     */
    public function scopeByHsCode($query, string $hsCode)
    {
        return $query->where('hs_code', $hsCode);
    }

    /**
     * Scope for restricted items.
     */
    public function scopeRestricted($query)
    {
        return $query->where('is_restricted', true);
    }

    /**
     * Scope for items requiring permits.
     */
    public function scopeRequiringPermit($query)
    {
        return $query->where('requires_permit', true);
    }

    /**
     * Scope for high-value items.
     */
    public function scopeHighValue($query, float $threshold = 1000)
    {
        return $query->where('total_value', '>', $threshold);
    }
}
