<?php

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;

test('customer dashboard requires authentication', function () {
    $response = $this->get('/customer/dashboard');

    $response->assertRedirect('/login');
});

test('customer dashboard can be accessed by authenticated customer', function () {
    // Create customer user
    $user = $this->createCustomerUser();

    $this->actingAs($user);

    $response = $this->get('/customer/dashboard');

    $response->assertStatus(200);
});

test('customer dashboard displays correct statistics', function () {
    // Create customer user
    $user = $this->createCustomerUser();
    $customer = $user->customer;

    // Create some shipments for the customer
    Shipment::factory()->count(5)->create([
        'customer_id' => $customer->id,
        'status' => 'delivered',
    ]);

    Shipment::factory()->count(3)->create([
        'customer_id' => $customer->id,
        'status' => 'pending',
    ]);

    Shipment::factory()->count(2)->create([
        'customer_id' => $customer->id,
        'status' => 'in_transit',
    ]);

    $this->actingAs($user);

    $response = $this->get('/customer/dashboard');

    $response->assertStatus(200);

    // Check that statistics are passed to the view
    $response->assertInertia(fn ($page) => $page->has('stats')
        ->where('stats.total_shipments', 10)
        ->where('stats.delivered_shipments', 5)
        ->where('stats.pending_shipments', 3)
        ->where('stats.active_shipments', 5) // pending + in_transit
    );
});

test('non_customer_user_cannot_access_dashboard', function () {
    // Create regular user without customer association
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->get('/customer/dashboard');

    $response->assertRedirect('/login');
});

test('customer dashboard shows recent shipments', function () {
    // Create customer user
    $user = $this->createCustomerUser();
    $customer = $user->customer;

    // Create recent shipments
    $shipments = Shipment::factory()->count(3)->create([
        'customer_id' => $customer->id,
    ]);

    $this->actingAs($user);

    $response = $this->get('/customer/dashboard');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->has('recentShipments')
        ->where('recentShipments', function ($shipments) {
            return count($shipments) <= 5; // Should limit to 5 recent shipments
        })
    );
});
