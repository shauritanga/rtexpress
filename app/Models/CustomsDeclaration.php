<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomsDeclaration extends Model
{
    use HasFactory;

    protected $fillable = [
        'declaration_number',
        'shipment_id',
        'origin_country',
        'destination_country',
        'declaration_type',
        'shipment_type',
        'incoterms',
        'currency',
        'total_value',
        'insurance_value',
        'freight_charges',
        'estimated_duties',
        'estimated_taxes',
        'description_of_goods',
        'reason_for_export',
        'contains_batteries',
        'contains_liquids',
        'contains_dangerous_goods',
        'dangerous_goods_details',
        'exporter_reference',
        'importer_reference',
        'exporter_details',
        'importer_details',
        'consignee_details',
        'status',
        'submitted_at',
        'approved_at',
        'cleared_at',
        'rejection_reason',
        'customs_response',
        'customs_reference',
        'created_by',
    ];

    protected $casts = [
        'total_value' => 'decimal:2',
        'insurance_value' => 'decimal:2',
        'freight_charges' => 'decimal:2',
        'estimated_duties' => 'decimal:2',
        'estimated_taxes' => 'decimal:2',
        'contains_batteries' => 'boolean',
        'contains_liquids' => 'boolean',
        'contains_dangerous_goods' => 'boolean',
        'dangerous_goods_details' => 'array',
        'exporter_details' => 'array',
        'importer_details' => 'array',
        'consignee_details' => 'array',
        'customs_response' => 'array',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'cleared_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($declaration) {
            if (empty($declaration->declaration_number)) {
                $declaration->declaration_number = static::generateDeclarationNumber();
            }
        });
    }

    /**
     * Generate unique declaration number.
     */
    public static function generateDeclarationNumber(): string
    {
        do {
            $number = 'CD-'.date('Y').'-'.str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (static::where('declaration_number', $number)->exists());

        return $number;
    }

    /**
     * Get the shipment this declaration belongs to.
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * Get the user who created this declaration.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the customs items for this declaration.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CustomsItem::class);
    }

    /**
     * Get the compliance documents for this declaration.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ComplianceDocument::class);
    }

    /**
     * Alias for documents relationship.
     */
    public function complianceDocuments(): HasMany
    {
        return $this->documents();
    }

    /**
     * Submit declaration for processing.
     */
    public function submit(): void
    {
        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }

    /**
     * Approve declaration.
     */
    public function approve(array $customsResponse = []): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'customs_response' => $customsResponse,
        ]);
    }

    /**
     * Reject declaration.
     */
    public function reject(string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Clear declaration through customs.
     */
    public function clear(?string $customsReference = null): void
    {
        $this->update([
            'status' => 'cleared',
            'cleared_at' => now(),
            'customs_reference' => $customsReference,
        ]);

        // Update shipment status
        $this->shipment->update(['customs_status' => 'cleared']);
    }

    /**
     * Calculate total estimated duties and taxes.
     */
    public function calculateEstimatedCharges(): array
    {
        $totalDuties = 0;
        $totalTaxes = 0;

        foreach ($this->items as $item) {
            $totalDuties += $item->estimated_duty_amount;
            $totalTaxes += $item->estimated_tax_amount;
        }

        $this->update([
            'estimated_duties' => $totalDuties,
            'estimated_taxes' => $totalTaxes,
        ]);

        return [
            'duties' => $totalDuties,
            'taxes' => $totalTaxes,
            'total' => $totalDuties + $totalTaxes,
        ];
    }

    /**
     * Check if declaration is complete.
     */
    public function isComplete(): bool
    {
        // Check required fields
        $requiredFields = [
            'origin_country',
            'destination_country',
            'declaration_type',
            'total_value',
            'description_of_goods',
            'exporter_details',
            'importer_details',
        ];

        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }

        // Check if has items
        if ($this->items()->count() === 0) {
            return false;
        }

        // Check required documents
        $requiredDocs = $this->getRequiredDocuments();
        foreach ($requiredDocs as $docType) {
            if (! $this->documents()->where('document_type', $docType)->where('status', 'approved')->exists()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get required documents based on shipment details.
     */
    public function getRequiredDocuments(): array
    {
        $required = ['commercial_invoice', 'packing_list'];

        if ($this->total_value > 2500) {
            $required[] = 'certificate_of_origin';
        }

        if ($this->contains_dangerous_goods) {
            $required[] = 'dangerous_goods_declaration';
        }

        if ($this->shipment_type === 'commercial' && $this->total_value > 1000) {
            $required[] = 'export_license';
        }

        return $required;
    }

    /**
     * Get compliance status.
     */
    public function getComplianceStatus(): array
    {
        $issues = [];
        $warnings = [];

        // Check value thresholds
        if ($this->total_value > 10000 && ! $this->documents()->where('document_type', 'export_license')->exists()) {
            $issues[] = 'Export license required for shipments over $10,000';
        }

        // Check dangerous goods
        if ($this->contains_dangerous_goods && ! $this->documents()->where('document_type', 'dangerous_goods_declaration')->exists()) {
            $issues[] = 'Dangerous goods declaration required';
        }

        // Check document expiry
        $expiredDocs = $this->documents()
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', now())
            ->get();

        foreach ($expiredDocs as $doc) {
            $warnings[] = "Document '{$doc->document_name}' has expired";
        }

        return [
            'is_compliant' => empty($issues),
            'issues' => $issues,
            'warnings' => $warnings,
        ];
    }

    /**
     * Scope for declarations by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for declarations by country.
     */
    public function scopeByCountry($query, string $country, string $direction = 'destination')
    {
        $field = $direction === 'origin' ? 'origin_country' : 'destination_country';

        return $query->where($field, $country);
    }

    /**
     * Scope for pending declarations.
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['draft', 'submitted', 'processing']);
    }

    /**
     * Scope for high-value declarations.
     */
    public function scopeHighValue($query, float $threshold = 10000)
    {
        return $query->where('total_value', '>', $threshold);
    }
}
