<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplianceDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_number',
        'shipment_id',
        'customs_declaration_id',
        'document_type',
        'document_name',
        'description',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'issued_by',
        'issue_date',
        'expiry_date',
        'reference_number',
        'status',
        'rejection_reason',
        'is_required',
        'is_verified',
        'verified_at',
        'verified_by',
        'metadata',
        'uploaded_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'is_required' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($document) {
            if (empty($document->document_number)) {
                $document->document_number = static::generateDocumentNumber();
            }
        });
    }

    /**
     * Generate unique document number.
     */
    public static function generateDocumentNumber(): string
    {
        do {
            $number = 'DOC-' . date('Y') . '-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (static::where('document_number', $number)->exists());

        return $number;
    }

    /**
     * Get the shipment this document belongs to.
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * Get the customs declaration this document belongs to.
     */
    public function customsDeclaration(): BelongsTo
    {
        return $this->belongsTo(CustomsDeclaration::class);
    }

    /**
     * Get the user who uploaded this document.
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the user who verified this document.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Verify the document.
     */
    public function verify(User $user): void
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $user->id,
            'status' => 'approved',
        ]);
    }

    /**
     * Reject the document.
     */
    public function reject(string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'is_verified' => false,
        ]);
    }

    /**
     * Check if document is expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date < now();
    }

    /**
     * Check if document is expiring soon.
     */
    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->expiry_date && $this->expiry_date <= now()->addDays($days);
    }

    /**
     * Get file size in human readable format.
     */
    public function getFormattedFileSizeAttribute(): string
    {
        if (!$this->file_size) {
            return 'N/A';
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get document type label.
     */
    public function getDocumentTypeLabel(): string
    {
        $labels = [
            'commercial_invoice' => 'Commercial Invoice',
            'packing_list' => 'Packing List',
            'certificate_of_origin' => 'Certificate of Origin',
            'export_license' => 'Export License',
            'import_permit' => 'Import Permit',
            'dangerous_goods_declaration' => 'Dangerous Goods Declaration',
            'insurance_certificate' => 'Insurance Certificate',
            'bill_of_lading' => 'Bill of Lading',
            'airway_bill' => 'Airway Bill',
            'customs_declaration' => 'Customs Declaration',
            'phytosanitary_certificate' => 'Phytosanitary Certificate',
            'health_certificate' => 'Health Certificate',
            'other' => 'Other Document',
        ];

        return $labels[$this->document_type] ?? $this->document_type;
    }

    /**
     * Get status badge color.
     */
    public function getStatusColor(): string
    {
        $colors = [
            'draft' => 'gray',
            'pending_review' => 'yellow',
            'approved' => 'green',
            'rejected' => 'red',
            'expired' => 'red',
        ];

        if ($this->isExpired()) {
            return $colors['expired'];
        }

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get document validation status.
     */
    public function getValidationStatus(): array
    {
        $issues = [];
        $warnings = [];

        // Check if expired
        if ($this->isExpired()) {
            $issues[] = 'Document has expired';
        } elseif ($this->isExpiringSoon()) {
            $warnings[] = 'Document expires soon';
        }

        // Check if verified
        if ($this->is_required && !$this->is_verified) {
            $issues[] = 'Required document not verified';
        }

        // Check file existence
        if ($this->file_path && !file_exists(storage_path('app/' . $this->file_path))) {
            $issues[] = 'Document file not found';
        }

        return [
            'is_valid' => empty($issues),
            'issues' => $issues,
            'warnings' => $warnings,
        ];
    }

    /**
     * Scope for documents by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('document_type', $type);
    }

    /**
     * Scope for required documents.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope for verified documents.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope for expired documents.
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expiry_date')
                    ->where('expiry_date', '<', now());
    }

    /**
     * Scope for expiring documents.
     */
    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->whereNotNull('expiry_date')
                    ->where('expiry_date', '<=', now()->addDays($days))
                    ->where('expiry_date', '>=', now());
    }

    /**
     * Scope for documents by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
