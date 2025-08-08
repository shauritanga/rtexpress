<?php

namespace Tests\Traits;

use App\Models\Customer;
use App\Models\Role;
use App\Models\User;

trait CreatesTestUsers
{
    /**
     * Create a customer user with proper role assignment.
     */
    protected function createCustomerUser(array $userAttributes = [], array $customerAttributes = []): User
    {
        $user = User::factory()->create($userAttributes);

        // Assign customer role
        $customerRole = Role::where('name', 'customer')->first();
        if ($customerRole) {
            $user->roles()->attach($customerRole);
        }

        return $user->fresh();
    }

    /**
     * Create an admin user with proper role assignment.
     */
    protected function createAdminUser(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);

        // Assign admin role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $user->roles()->attach($adminRole);
        }

        return $user->fresh();
    }

    /**
     * Create a customer with associated user.
     */
    protected function createCustomerWithUser(array $customerAttributes = [], array $userAttributes = []): Customer
    {
        $user = $this->createCustomerUser($userAttributes);

        $customer = Customer::factory()->create(array_merge([
            'created_by' => $user->id,
        ], $customerAttributes));

        // Link user to customer
        $user->update(['customer_id' => $customer->id]);

        return $customer->fresh();
    }

    /**
     * Create a warehouse staff user with proper role assignment.
     */
    protected function createWarehouseStaffUser(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);

        // Assign warehouse_staff role
        $role = Role::where('name', 'warehouse_staff')->first();
        if ($role) {
            $user->roles()->attach($role);
        }

        return $user->fresh();
    }

    /**
     * Create a billing admin user with proper role assignment.
     */
    protected function createBillingAdminUser(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);

        // Assign billing_admin role
        $role = Role::where('name', 'billing_admin')->first();
        if ($role) {
            $user->roles()->attach($role);
        }

        return $user->fresh();
    }

    /**
     * Create a customer support user with proper role assignment.
     */
    protected function createCustomerSupportUser(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);

        // Assign customer_support role
        $role = Role::where('name', 'customer_support')->first();
        if ($role) {
            $user->roles()->attach($role);
        }

        return $user->fresh();
    }
}
