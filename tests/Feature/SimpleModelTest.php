<?php

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;

test('basic model creation works', function () {
    $user = User::factory()->create();
    expect($user)->toBeInstanceOf(User::class);

    $customer = Customer::factory()->create(['created_by' => $user->id]);
    expect($customer)->toBeInstanceOf(Customer::class);
    expect($customer->customer_code)->toMatch('/^CUS-\d{4}-\d{4}$/');

    $warehouse = Warehouse::factory()->create();
    expect($warehouse)->toBeInstanceOf(Warehouse::class);
    expect($warehouse->code)->toMatch('/^WAR-\d{3}$/');
});

test('shipment creation with dependencies works', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['created_by' => $user->id]);
    $warehouse = Warehouse::factory()->create();

    $shipment = Shipment::create([
        'customer_id' => $customer->id,
        'origin_warehouse_id' => $warehouse->id,
        'sender_name' => 'John Doe',
        'sender_phone' => '+255123456789',
        'sender_address' => '123 Main St',
        'recipient_name' => 'Jane Doe',
        'recipient_phone' => '+255987654321',
        'recipient_address' => '456 Oak Ave',
        'service_type' => 'standard',
        'package_type' => 'package',
        'weight_kg' => 5.0,
        'dimensions_length_cm' => 30,
        'dimensions_width_cm' => 20,
        'dimensions_height_cm' => 10,
        'declared_value' => 100.00,
        'created_by' => $user->id,
    ]);

    expect($shipment)->toBeInstanceOf(Shipment::class);
    expect($shipment->tracking_number)->toMatch('/^RT-\d{4}-\d{6}$/');
    expect($shipment->customer->id)->toBe($customer->id);
    expect($shipment->originWarehouse->id)->toBe($warehouse->id);
});
