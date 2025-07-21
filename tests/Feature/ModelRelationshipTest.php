<?php

use App\Models\Customer;
use App\Models\Setting;
use App\Models\Shipment;
use App\Models\ShipmentItem;
use App\Models\ShipmentTracking;
use App\Models\User;
use App\Models\Warehouse;

test('customer model generates unique customer code', function () {
    $customer1 = Customer::factory()->create();
    $customer2 = Customer::factory()->create();

    expect($customer1->customer_code)->toMatch('/^CUS-\d{4}-\d{4}$/');
    expect($customer2->customer_code)->toMatch('/^CUS-\d{4}-\d{4}$/');
    expect($customer1->customer_code)->not->toBe($customer2->customer_code);
});

test('customer has relationships with shipments', function () {
    $customer = Customer::factory()->create();
    $shipment = Shipment::factory()->create(['customer_id' => $customer->id]);

    expect($customer->shipments)->toHaveCount(1);
    expect($customer->shipments->first()->id)->toBe($shipment->id);
});

test('customer can check if active', function () {
    $activeCustomer = Customer::factory()->create(['status' => 'active']);
    $inactiveCustomer = Customer::factory()->create(['status' => 'inactive']);

    expect($activeCustomer->isActive())->toBeTrue();
    expect($inactiveCustomer->isActive())->toBeFalse();
});

test('customer can get full address', function () {
    $customer = Customer::factory()->create([
        'address_line_1' => '123 Main St',
        'address_line_2' => 'Suite 100',
        'city' => 'Dar es Salaam',
        'state_province' => 'Dar es Salaam',
        'postal_code' => '12345',
        'country' => 'Tanzania',
    ]);

    $expectedAddress = '123 Main St, Suite 100, Dar es Salaam, Dar es Salaam 12345, Tanzania';
    expect($customer->full_address)->toBe($expectedAddress);
});

test('warehouse model has location-based functionality', function () {
    $warehouse1 = Warehouse::factory()->create([
        'latitude' => -6.7924,
        'longitude' => 39.2083,
    ]);

    $warehouse2 = Warehouse::factory()->create([
        'latitude' => -3.3869,
        'longitude' => 36.6830,
    ]);

    $distance = $warehouse1->distanceTo($warehouse2);
    expect($distance)->toBeGreaterThan(0);
    expect($distance)->toBeLessThan(1000); // Should be less than 1000km within Tanzania
});

test('warehouse can check operational status', function () {
    $warehouse = Warehouse::factory()->create([
        'status' => 'active',
        'operating_hours' => [
            'monday' => '08:00-17:00',
            'tuesday' => '08:00-17:00',
            'wednesday' => '08:00-17:00',
            'thursday' => '08:00-17:00',
            'friday' => '08:00-17:00',
            'saturday' => '08:00-12:00',
            'sunday' => 'closed',
        ],
    ]);

    // Test during business hours (Monday 10:00)
    $businessHours = new DateTime('2024-01-01 10:00:00'); // Monday
    expect($warehouse->isOperational($businessHours))->toBeTrue();

    // Test outside business hours (Sunday)
    $closedDay = new DateTime('2024-01-07 10:00:00'); // Sunday
    expect($warehouse->isOperational($closedDay))->toBeFalse();
});

test('shipment model generates unique tracking number', function () {
    $shipment1 = Shipment::factory()->create();
    $shipment2 = Shipment::factory()->create();

    expect($shipment1->tracking_number)->toMatch('/^RT-\d{4}-\d{6}$/');
    expect($shipment2->tracking_number)->toMatch('/^RT-\d{4}-\d{6}$/');
    expect($shipment1->tracking_number)->not->toBe($shipment2->tracking_number);
});

test('shipment has relationships with customer and warehouses', function () {
    $customer = Customer::factory()->create();
    $originWarehouse = Warehouse::factory()->create();
    $destinationWarehouse = Warehouse::factory()->create();

    $shipment = Shipment::factory()->create([
        'customer_id' => $customer->id,
        'origin_warehouse_id' => $originWarehouse->id,
        'destination_warehouse_id' => $destinationWarehouse->id,
    ]);

    expect($shipment->customer->id)->toBe($customer->id);
    expect($shipment->originWarehouse->id)->toBe($originWarehouse->id);
    expect($shipment->destinationWarehouse->id)->toBe($destinationWarehouse->id);
});

test('shipment can calculate volumetric and billable weight', function () {
    $shipment = Shipment::factory()->create([
        'weight_kg' => 5.0,
        'dimensions_length_cm' => 30,
        'dimensions_width_cm' => 20,
        'dimensions_height_cm' => 10,
    ]);

    $volumetricWeight = $shipment->getVolumetricWeight();
    $billableWeight = $shipment->getBillableWeight();

    expect($volumetricWeight)->toBe(1.2); // (30*20*10)/5000
    expect($billableWeight)->toBe(5.0); // Higher of actual (5.0) or volumetric (1.2)
});

test('shipment can check status conditions', function () {
    $pendingShipment = Shipment::factory()->create(['status' => 'pending']);
    $deliveredShipment = Shipment::factory()->create(['status' => 'delivered']);
    $inTransitShipment = Shipment::factory()->create(['status' => 'in_transit']);
    $exceptionShipment = Shipment::factory()->create(['status' => 'exception']);

    expect($pendingShipment->isDelivered())->toBeFalse();
    expect($deliveredShipment->isDelivered())->toBeTrue();
    expect($inTransitShipment->isInTransit())->toBeTrue();
    expect($exceptionShipment->hasException())->toBeTrue();
});

test('shipment can add tracking updates', function () {
    $customer = Customer::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $user = User::factory()->create();

    $shipment = Shipment::factory()->create([
        'status' => 'pending',
        'customer_id' => $customer->id,
        'origin_warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
    ]);

    $shipment->addTrackingUpdate('picked_up', 'Warehouse A', 'Package collected', $user);

    expect($shipment->fresh()->status)->toBe('picked_up');
    expect($shipment->trackingHistory)->toHaveCount(1);
    expect($shipment->trackingHistory->first()->status)->toBe('picked_up');
    expect($shipment->trackingHistory->first()->location)->toBe('Warehouse A');
    expect($shipment->trackingHistory->first()->recorded_by)->toBe($user->id);
});

test('shipment tracking has proper relationships', function () {
    $customer = Customer::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $user = User::factory()->create();

    $shipment = Shipment::factory()->create([
        'customer_id' => $customer->id,
        'origin_warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
    ]);

    $tracking = ShipmentTracking::create([
        'shipment_id' => $shipment->id,
        'status' => 'in_transit',
        'location' => 'Hub A',
        'notes' => 'Package in transit',
        'occurred_at' => now(),
        'recorded_by' => $user->id,
    ]);

    expect($tracking->shipment->id)->toBe($shipment->id);
    expect($tracking->recordedBy->id)->toBe($user->id);
    expect($tracking->getStatusDisplayName())->toBe('In Transit');
    expect($tracking->getStatusIcon())->toBe('plane');
});

test('shipment items have proper relationships', function () {
    $customer = Customer::factory()->create();
    $warehouse = Warehouse::factory()->create();
    $user = User::factory()->create();

    $shipment = Shipment::factory()->create([
        'customer_id' => $customer->id,
        'origin_warehouse_id' => $warehouse->id,
        'created_by' => $user->id,
    ]);

    $item = ShipmentItem::create([
        'shipment_id' => $shipment->id,
        'description' => 'Test Item',
        'quantity' => 2,
        'weight_kg' => 1.5,
        'value' => 100.00,
    ]);

    expect($item->shipment->id)->toBe($shipment->id);
    expect($item->getTotalValue())->toBe(200.00); // 2 * 100
    expect($item->getTotalWeight())->toBe(3.0); // 2 * 1.5
});

test('settings model can store and retrieve values', function () {
    Setting::set('test.setting', 'test_value', 'Test setting', true);

    $value = Setting::get('test.setting');
    expect($value)->toBe('test_value');

    $defaultValue = Setting::get('non.existent', 'default');
    expect($defaultValue)->toBe('default');
});

test('settings model can handle public settings', function () {
    Setting::set('public.setting', 'public_value', 'Public setting', true);
    Setting::set('private.setting', 'private_value', 'Private setting', false);

    $publicSettings = Setting::getPublic();

    expect($publicSettings)->toHaveKey('public.setting');
    expect($publicSettings)->not->toHaveKey('private.setting');
    expect($publicSettings['public.setting'])->toBe('public_value');
});

test('settings model can group settings by category', function () {
    Setting::set('app.name', 'RT Express', 'App name', true);
    Setting::set('app.version', '1.0.0', 'App version', true);
    Setting::set('billing.currency', 'TZS', 'Default currency', false);

    $grouped = Setting::getGrouped();

    expect($grouped)->toHaveKey('app');
    expect($grouped)->toHaveKey('billing');
    expect($grouped['app'])->toHaveKey('app.name');
    expect($grouped['app'])->toHaveKey('app.version');
    expect($grouped['billing'])->toHaveKey('billing.currency');
});
