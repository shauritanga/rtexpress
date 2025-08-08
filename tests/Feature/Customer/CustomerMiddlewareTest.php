<?php

use App\Models\Customer;
use App\Models\User;

test('unauthenticated users are redirected to login', function () {
    $response = $this->get('/customer/dashboard');

    $response->assertRedirect('/login');
});

test('authenticated users without customer association are redirected', function () {
    // Create regular user without customer association
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->get('/customer/dashboard');

    $response->assertRedirect('/login');
});

test('authenticated customer users can access customer routes', function () {
    // Create customer role if it doesn't exist
    $customerRole = \App\Models\Role::firstOrCreate(
        ['name' => 'customer'],
        [
            'display_name' => 'Customer',
            'description' => 'Customer role with access to customer portal',
        ]
    );

    // Create customer user
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $user->update(['customer_id' => $customer->id]);

    // Assign customer role
    $user->assignRole('customer');

    $this->actingAs($user);

    $response = $this->get('/customer/dashboard');

    $response->assertStatus(200);
});

test('customer middleware protects all customer routes', function () {
    $protectedRoutes = [
        '/customer/dashboard',
        '/customer/profile',
        '/customer/profile/edit',
    ];

    foreach ($protectedRoutes as $route) {
        $response = $this->get($route);
        $response->assertRedirect('/login');
    }
});
