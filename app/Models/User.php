<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'status',
        'last_login_at',
        'last_activity',
        'otp_enabled',
        'customer_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'last_activity' => 'datetime',
            'otp_enabled' => 'boolean',
        ];
    }

    /**
     * Get the roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)
            ->withPivot('assigned_at', 'assigned_by')
            ->withTimestamps();
    }

    /**
     * Get shipments created by this user.
     */
    public function createdShipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'created_by');
    }

    /**
     * Get shipments assigned to this user.
     */
    public function assignedShipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'assigned_to');
    }

    /**
     * Get all shipments related to this user (created or assigned).
     */
    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'created_by')
            ->orWhere('assigned_to', $this->id);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        // For customer role, check if user has customer_id
        if ($role === 'customer') {
            return !is_null($this->customer_id);
        }

        // For admin roles, check if user is not a customer
        if (in_array($role, ['admin', 'warehouse_staff', 'manager'])) {
            return is_null($this->customer_id);
        }

        // For other roles, use the roles relationship if it exists
        if (method_exists($this, 'roles')) {
            return $this->roles()->where('name', $role)->exists();
        }

        // Default: false for unknown roles
        return false;
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }



    /**
     * Check if user has all of the given roles.
     */
    public function hasAllRoles(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->count() === count($roles);
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists();
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissions) {
                $query->whereIn('name', $permissions);
            })
            ->exists();
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        $userPermissions = $this->getAllPermissions();
        return count(array_intersect($permissions, $userPermissions)) === count($permissions);
    }

    /**
     * Get all permissions for the user through their roles.
     */
    public function getAllPermissions(): array
    {
        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Assign role to user.
     */
    public function assignRole(Role|string $role, ?User $assignedBy = null): self
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $pivotData = ['assigned_at' => now()];
        if ($assignedBy) {
            $pivotData['assigned_by'] = $assignedBy->id;
        }

        $this->roles()->syncWithoutDetaching([$role->id => $pivotData]);

        return $this;
    }

    /**
     * Remove role from user.
     */
    public function removeRole(Role|string $role): self
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);

        return $this;
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Get the customer associated with this user.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Check if user is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Update last login timestamp.
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }

    /**
     * Scope query to get active users.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope query to get users by role(s).
     */
    public function scopeWithRole($query, string|array $roles)
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }

        return $query->whereHas('roles', function ($q) use ($roles) {
            $q->whereIn('name', $roles);
        });
    }

    /**
     * Get the user's OTPs.
     */
    public function otps(): HasMany
    {
        return $this->hasMany(UserOtp::class);
    }

    /**
     * Update user's last activity timestamp.
     */
    public function updateLastActivity(): void
    {
        $this->update(['last_activity' => now()]);
    }

    /**
     * Check if user has been inactive for more than specified minutes.
     */
    public function isInactive(int $minutes = 10): bool
    {
        if (!$this->last_activity) {
            return false;
        }

        return $this->last_activity->diffInMinutes(now()) >= $minutes;
    }

    /**
     * Generate and send OTP for user.
     */
    public function generateOtp(string $type = 'login'): UserOtp
    {
        return UserOtp::createForUser($this, $type, $this->phone);
    }
}
