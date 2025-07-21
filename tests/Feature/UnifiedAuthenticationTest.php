<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('customer registration creates user and redirects to customer dashboard', function () {
    $customerData = [
        'company_name' => 'Test Company Ltd',
        'contact_person' => 'John Doe',
        'email' => 'john@testcompany.com',
        'phone' => '+1234567890',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'address_line_1' => '123 Test Street',
        'address_line_2' => 'Suite 100',
        'city' => 'Test City',
        'state_province' => 'Test State',
        'postal_code' => '12345',
        'country' => 'Test Country',
        'terms' => true,
    ];

    $response = $this->post('/register', $customerData);

    $response->assertRedirect('/customer/dashboard');
    $this->assertAuthenticated();

    // Verify user was created with customer association
    $user = User::where('email', 'john@testcompany.com')->first();
    expect($user)->not->toBeNull();
    expect($user->customer_id)->not->toBeNull();
    expect($user->hasRole('customer'))->toBeTrue();
});

test('customer login redirects to customer dashboard', function () {
    // Create customer user
    $user = User::factory()->create([
        'email' => 'customer@test.com',
        'password' => Hash::make('password123'),
    ]);

    $customer = Customer::factory()->create([
        'email' => 'customer@test.com',
    ]);

    $user->update(['customer_id' => $customer->id]);

    // Login
    $response = $this->post('/login', [
        'email' => 'customer@test.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/customer/dashboard');
    $this->assertAuthenticatedAs($user);
});

test('admin login redirects to admin dashboard', function () {
    // Create admin user (no customer association)
    $user = User::factory()->create([
        'email' => 'admin@test.com',
        'password' => Hash::make('password123'),
    ]);

    // Login
    $response = $this->post('/login', [
        'email' => 'admin@test.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);
});

test('customer can access customer routes after login', function () {
    // Create and login customer
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $user->update(['customer_id' => $customer->id]);

    $this->actingAs($user);

    // Test customer routes
    $this->get('/customer/dashboard')->assertStatus(200);
    $this->get('/customer/profile')->assertStatus(200);
});

test('admin cannot access customer routes', function () {
    // Create and login admin user
    $user = User::factory()->create(); // No customer association

    $this->actingAs($user);

    // Test customer routes are protected
    $this->get('/customer/dashboard')->assertRedirect('/login');
    $this->get('/customer/profile')->assertRedirect('/login');
});
