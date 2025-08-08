<?php

namespace App\Models;

use App\Traits\EncryptableAttributes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use EncryptableAttributes, HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_code',
        'company_name',
        'contact_person',
        'email',
        'phone',
        'address_line_1',
        'address_line_2',
        'city',
        'state_province',
        'postal_code',
        'country',
        'tax_number',
        'credit_limit',
        'payment_terms',
        'status',
        'notes',
        'delivery_preferences',
        'created_by',
    ];

    /**
     * The attributes that should be encrypted.
     *
     * @var array<int, string>
     */
    protected $encryptable = [
        'phone',
        'tax_number',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'credit_limit' => 'decimal:2',
        'delivery_preferences' => 'array',
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
        'name',
        'company',
        'address',
        'state',
        'total_spent',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($customer) {
            if (empty($customer->customer_code)) {
                try {
                    $customer->customer_code = static::generateCustomerCode();
                } catch (\Exception $e) {
                    // Fallback if generation fails
                    $customer->customer_code = 'CUS-'.date('Y').'-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                }
            }
        });
    }

    /**
     * Get the user who created this customer.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user account associated with this customer.
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    /**
     * Check if customer has a user account for portal access.
     */
    public function hasUserAccount(): bool
    {
        return $this->user()->exists();
    }

    /**
     * Get the shipments for this customer.
     */
    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    /**
     * Get the customer's invoices.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the customer's support tickets.
     */
    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    /**
     * Get the customer's display name.
     */
    public function getNameAttribute(): string
    {
        return $this->contact_person ?: $this->company_name ?: 'Unknown Customer';
    }

    /**
     * Get the customer's company name.
     */
    public function getCompanyAttribute(): ?string
    {
        return $this->company_name;
    }

    /**
     * Get the customer's full address.
     */
    public function getAddressAttribute(): string
    {
        $address = $this->address_line_1 ?? '';
        if ($this->address_line_2) {
            $address .= ', '.$this->address_line_2;
        }

        return $address ?: 'No address provided';
    }

    /**
     * Get the customer's state.
     */
    public function getStateAttribute(): string
    {
        return $this->state_province ?? '';
    }

    /**
     * Get the customer's total spent amount.
     */
    public function getTotalSpentAttribute(): float
    {
        // This would typically come from invoices or payments
        // For now, return a calculated value based on shipments
        return $this->shipments()->sum('declared_value') ?? 0;
    }

    /**
     * Generate a unique customer code.
     */
    public static function generateCustomerCode(): string
    {
        $year = date('Y');
        $prefix = "CUS-{$year}-";

        $lastCustomer = static::withTrashed()
            ->where('customer_code', 'like', $prefix.'%')
            ->orderBy('customer_code', 'desc')
            ->first();

        if ($lastCustomer) {
            $lastNumber = (int) substr($lastCustomer->customer_code, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix.str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Check if customer is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if customer is pending approval.
     * Note: We use 'inactive' status for customers awaiting approval.
     */
    public function isPendingApproval(): bool
    {
        return $this->status === 'inactive' && $this->created_at->diffInDays(now()) <= 30;
    }

    /**
     * Approve the customer.
     */
    public function approve(): bool
    {
        return $this->update(['status' => 'active']);
    }

    /**
     * Reject/suspend the customer.
     */
    public function reject(): bool
    {
        return $this->update(['status' => 'suspended']);
    }

    /**
     * Check if customer has exceeded credit limit.
     * Note: This will be implemented when Invoice model is created
     */
    public function hasExceededCreditLimit(): bool
    {
        // TODO: Implement when Invoice model is available
        return false;
    }

    /**
     * Get customer's outstanding balance.
     * Note: This will be implemented when Invoice model is created
     */
    public function getOutstandingBalance(): float
    {
        // TODO: Implement when Invoice model is available
        return 0.0;
    }

    /**
     * Get full address as string.
     */
    public function getFullAddressAttribute(): string
    {
        $address = $this->address_line_1;

        if ($this->address_line_2) {
            $address .= ', '.$this->address_line_2;
        }

        $address .= ', '.$this->city;
        $address .= ', '.$this->state_province;
        $address .= ' '.$this->postal_code;
        $address .= ', '.$this->country;

        return $address;
    }

    /**
     * Scope query to get active customers.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope query to get pending approval customers.
     * Note: We use 'inactive' status for customers awaiting approval.
     */
    public function scopePendingApproval($query)
    {
        return $query->where('status', 'inactive')
            ->where('created_at', '>=', now()->subDays(30));
    }

    /**
     * Scope query to search customers.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('customer_code', 'like', "%{$search}%")
                ->orWhere('company_name', 'like', "%{$search}%")
                ->orWhere('contact_person', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    /**
     * Scope query to filter by country.
     */
    public function scopeByCountry($query, string $country)
    {
        return $query->where('country', $country);
    }
}
