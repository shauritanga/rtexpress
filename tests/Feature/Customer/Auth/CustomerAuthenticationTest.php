<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('login page can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('register page can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('customer can register successfully', function () {
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

    // Check user was created
    $this->assertDatabaseHas('users', [
        'name' => 'John Doe',
        'email' => 'john@testcompany.com',
    ]);

    // Check customer was created
    $this->assertDatabaseHas('customers', [
        'company_name' => 'Test Company Ltd',
        'contact_person' => 'John Doe',
        'email' => 'john@testcompany.com',
    ]);

    // Check user is authenticated
    $this->assertAuthenticated();
});

test('customer registration requires all fields', function () {
    $response = $this->post('/register', []);

    $response->assertSessionHasErrors([
        'company_name',
        'contact_person',
        'email',
        'phone',
        'password',
        'address_line_1',
        'city',
        'state_province',
        'postal_code',
        'country',
        'terms',
    ]);
});

test('customer can login with valid credentials', function () {
    // Create customer role if it doesn't exist
    $customerRole = \App\Models\Role::firstOrCreate(
        ['name' => 'customer'],
        [
            'display_name' => 'Customer',
            'description' => 'Customer role with access to customer portal',
        ]
    );

    // Create a customer user
    $user = User::factory()->create([
        'email' => 'customer@test.com',
        'password' => Hash::make('password123'),
    ]);

    // Assign customer role
    $user->assignRole('customer');

    $customer = Customer::factory()->create([
        'email' => 'customer@test.com',
    ]);

    $user->update(['customer_id' => $customer->id]);

    // Attempt login
    $response = $this->post('/login', [
        'email' => 'customer@test.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/customer/dashboard');
    $this->assertAuthenticated();
});

test('customer cannot login with invalid credentials', function () {
    $response = $this->post('/login', [
        'email' => 'nonexistent@test.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
});

test('customer can logout', function () {
    // Create and authenticate customer user
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $user->update(['customer_id' => $customer->id]);

    $this->actingAs($user);

    $response = $this->post('/logout');

    $response->assertRedirect('/');
    $this->assertGuest();
});
