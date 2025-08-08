<?php

namespace Tests;

use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Create a customer user with proper role assignment.
     */
    protected function createCustomerUser(array $userAttributes = [], array $customerAttributes = []): User
    {
        // Create customer role if it doesn't exist
        $customerRole = Role::firstOrCreate(
            ['name' => 'customer'],
            [
                'display_name' => 'Customer',
                'description' => 'Customer role with access to customer portal',
            ]
        );

        // Create user
        $user = User::factory()->create($userAttributes);

        // Create customer
        $customer = Customer::factory()->create($customerAttributes);

        // Link user to customer
        $user->update(['customer_id' => $customer->id]);

        // Assign customer role
        $user->assignRole('customer');

        return $user;
    }
}
