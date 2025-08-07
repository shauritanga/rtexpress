<?php

use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('customer registration screen can be rendered', function () {
    $response = $this->get('/register/customer');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('auth/CustomerRegisterSimple')
        ->has('countries')
    );
});

test('customer registration form validation works', function () {
    $response = $this->post('/register/customer', []);

    $response->assertSessionHasErrors([
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'company_name',
        'address_line_1',
        'city',
        'state_province',
        'postal_code',
        'country',
        'terms_accepted',
    ]);
});

test('customer registration with valid data creates user and customer', function () {
    // Ensure roles exist
    Role::firstOrCreate([
        'name' => 'customer',
        'display_name' => 'Customer',
        'description' => 'Customer role for registered customers'
    ]);

    $customerData = [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'password' => 'MyVerySecureP@ssw0rd2024!',
        'password_confirmation' => 'MyVerySecureP@ssw0rd2024!',
        'phone' => '+1234567890',
        'company_name' => 'Test Company Ltd',
        'address_line_1' => '123 Test Street',
        'address_line_2' => 'Suite 100',
        'city' => 'Test City',
        'state_province' => 'Test State',
        'postal_code' => '12345',
        'country' => 'US',
        'terms_accepted' => true,
    ];

    $response = $this->post('/register/customer', $customerData);

    // Check user was created
    $user = User::where('email', 'john@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->name)->toBe('John Doe');
    expect($user->hasRole('customer'))->toBeTrue();

    // Check customer was created
    $customer = Customer::where('email', 'john@example.com')->first();
    expect($customer)->not->toBeNull();
    expect($customer->company_name)->toBe('Test Company Ltd');
    expect($customer->contact_person)->toBe('John Doe');
    expect($customer->phone)->toBe('+1234567890');
    expect($customer->address_line_1)->toBe('123 Test Street');
    expect($customer->city)->toBe('Test City');
    expect($customer->country)->toBe('US');
    expect($customer->status)->toBe('pending_approval'); // Updated for security enhancement

    // Check user is linked to customer
    expect($user->customer_id)->toBe($customer->id);

    // With security enhancements, users are not auto-authenticated
    $this->assertGuest();

    // Check redirect to email verification
    $response->assertRedirect(route('verification.notice'));
});

test('customer registration generates unique customer code', function () {
    // Ensure roles exist
    Role::firstOrCreate([
        'name' => 'customer',
        'display_name' => 'Customer',
        'description' => 'Customer role for registered customers'
    ]);

    $customerData = [
        'first_name' => 'Jane',
        'last_name' => 'Smith',
        'email' => 'jane@example.com',
        'password' => 'MyVerySecureP@ssw0rd2024!',
        'password_confirmation' => 'MyVerySecureP@ssw0rd2024!',
        'phone' => '+1234567891',
        'company_name' => 'Another Test Company',
        'address_line_1' => '456 Another Street',
        'city' => 'Another City',
        'state_province' => 'Another State',
        'postal_code' => '67890',
        'country' => 'CA',
        'terms_accepted' => true,
    ];

    $response = $this->post('/register/customer', $customerData);

    $customer = Customer::where('email', 'jane@example.com')->first();
    expect($customer)->not->toBeNull();
    expect($customer->customer_code)->not->toBeNull();
    expect($customer->customer_code)->toMatch('/^[A-Z]{4}\d{3}$/');
});

test('customer registration fails with duplicate email', function () {
    // Create existing user
    User::factory()->create(['email' => 'existing@example.com']);

    $customerData = [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '+1234567892',
        'company_name' => 'Test Company',
        'address_line_1' => '789 Test Street',
        'city' => 'Test City',
        'state_province' => 'Test State',
        'postal_code' => '11111',
        'country' => 'US',
        'terms_accepted' => true,
    ];

    $response = $this->post('/register/customer', $customerData);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
});

test('customer registration fails without terms acceptance', function () {
    $customerData = [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '+1234567893',
        'company_name' => 'Test Company',
        'address_line_1' => '789 Test Street',
        'city' => 'Test City',
        'state_province' => 'Test State',
        'postal_code' => '11111',
        'country' => 'US',
        'terms_accepted' => false,
    ];

    $response = $this->post('/register/customer', $customerData);

    $response->assertSessionHasErrors(['terms_accepted']);
    $this->assertGuest();
});
