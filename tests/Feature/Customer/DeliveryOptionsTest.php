<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeliveryOptionsTest extends TestCase
{
    use RefreshDatabase;

    private $customer;

    private $customerUser;

    private $shipment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = Customer::factory()->create([
            'email' => 'customer@test.com',
        ]);

        $this->customerUser = User::factory()->create([
            'email' => 'customer@test.com',
            'customer_id' => $this->customer->id,
        ]);

        $warehouses = Warehouse::factory()->count(2)->create();

        $this->shipment = Shipment::factory()->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_by' => $this->customerUser->id,
        ]);
    }

    public function test_customer_can_access_delivery_options_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/delivery');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Delivery/Index')
            ->has('customer')
            ->has('deliveryStats')
        );
    }

    public function test_delivery_page_shows_customer_statistics()
    {
        // Create some delivered shipments for statistics
        Shipment::factory()->count(5)->create([
            'customer_id' => $this->customer->id,
            'status' => 'delivered',
            'created_by' => $this->customerUser->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/delivery');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('deliveryStats.onTimeDeliveries')
            ->has('deliveryStats.totalDeliveries')
            ->has('deliveryStats.averageDeliveryTime')
            ->has('deliveryStats.preferredTimeSlot')
        );
    }

    public function test_customer_can_get_time_slots_for_date()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');

        $response = $this->actingAs($this->customerUser)
            ->getJson("/api/delivery/time-slots?date={$tomorrow}&service_type=standard");

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'slots' => [
                '*' => [
                    'id',
                    'startTime',
                    'endTime',
                    'type',
                    'price',
                    'available',
                    'capacity',
                    'remaining',
                ],
            ],
            'date',
        ]);
    }

    public function test_time_slots_validation_requires_future_date()
    {
        $yesterday = now()->subDay()->format('Y-m-d');

        $response = $this->actingAs($this->customerUser)
            ->getJson("/api/delivery/time-slots?date={$yesterday}");

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['date']);
    }

    public function test_customer_can_get_pickup_locations()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/delivery/pickup-locations?address=123 Main St, New York, NY&radius=10');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'locations' => [
                '*' => [
                    'id',
                    'name',
                    'type',
                    'address',
                    'distance',
                    'walkingTime',
                    'drivingTime',
                    'hours',
                    'rating',
                    'available',
                ],
            ],
        ]);
    }

    public function test_pickup_locations_validation_requires_address()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/delivery/pickup-locations');

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['address']);
    }

    public function test_customer_can_save_delivery_preferences()
    {
        $preferences = [
            'delivery_preferences' => [
                ['id' => 'contactless', 'enabled' => true],
                ['id' => 'photo_confirmation', 'enabled' => true],
            ],
            'contact_preferences' => [
                ['method' => 'sms', 'enabled' => true, 'value' => '+1234567890'],
                ['method' => 'email', 'enabled' => true, 'value' => 'test@example.com'],
            ],
            'special_instructions' => 'Leave at front door',
            'delivery_location' => 'front_door',
            'access_code' => '1234',
            'emergency_contact' => [
                'name' => 'John Doe',
                'phone' => '+1234567890',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/delivery/preferences', $preferences);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Delivery preferences saved successfully',
        ]);

        // Verify preferences were saved
        $this->customer->refresh();
        $savedPreferences = json_decode($this->customer->delivery_preferences, true);
        $this->assertEquals($preferences['special_instructions'], $savedPreferences['special_instructions']);
    }

    public function test_delivery_preferences_validation()
    {
        $invalidPreferences = [
            'special_instructions' => str_repeat('a', 501), // Too long
            'emergency_contact' => [
                'name' => str_repeat('a', 101), // Too long
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/delivery/preferences', $invalidPreferences);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['special_instructions', 'emergency_contact.name']);
    }

    public function test_customer_can_apply_delivery_options_to_shipment()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');

        $deliveryOptions = [
            'shipment_id' => $this->shipment->id,
            'delivery_date' => $tomorrow,
            'time_slot_id' => 'morning',
            'pickup_location_id' => 'loc-1',
            'preferences' => [
                'contactless' => true,
                'photo_confirmation' => true,
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/delivery/apply-options', $deliveryOptions);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Delivery options applied successfully',
        ]);

        // Verify options were applied to shipment
        $this->shipment->refresh();
        $savedOptions = json_decode($this->shipment->delivery_options, true);
        $this->assertEquals($tomorrow, $savedOptions['delivery_date']);
        $this->assertEquals('morning', $savedOptions['time_slot_id']);
    }

    public function test_apply_delivery_options_validation()
    {
        $invalidOptions = [
            'shipment_id' => 999999, // Non-existent shipment
            'delivery_date' => now()->subDay()->format('Y-m-d'), // Past date
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/delivery/apply-options', $invalidOptions);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['shipment_id']);
    }

    public function test_customer_cannot_apply_options_to_other_customers_shipment()
    {
        $otherCustomer = Customer::factory()->create();
        $otherShipment = Shipment::factory()->create([
            'customer_id' => $otherCustomer->id,
            'created_by' => $this->customerUser->id,
        ]);

        $deliveryOptions = [
            'shipment_id' => $otherShipment->id,
            'delivery_date' => now()->addDay()->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/delivery/apply-options', $deliveryOptions);

        $response->assertStatus(500); // Should fail when trying to find shipment
    }

    public function test_time_slots_include_different_types()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');

        $response = $this->actingAs($this->customerUser)
            ->getJson("/api/delivery/time-slots?date={$tomorrow}");

        $response->assertStatus(200);

        $slots = $response->json('slots');
        $slotTypes = collect($slots)->pluck('type')->unique()->toArray();

        $this->assertContains('standard', $slotTypes);
        $this->assertContains('express', $slotTypes);
        $this->assertContains('premium', $slotTypes);
    }

    public function test_pickup_locations_include_different_types()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/delivery/pickup-locations?address=123 Main St, New York, NY');

        $response->assertStatus(200);

        $locations = $response->json('locations');
        $this->assertNotEmpty($locations);

        foreach ($locations as $location) {
            $this->assertContains($location['type'], ['pickup_point', 'locker', 'store', 'post_office']);
            $this->assertArrayHasKey('distance', $location);
            $this->assertArrayHasKey('available', $location);
            $this->assertArrayHasKey('fees', $location);
        }
    }

    public function test_pickup_locations_can_be_filtered_by_type()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/delivery/pickup-locations?address=123 Main St, New York, NY&type=locker');

        $response->assertStatus(200);

        $locations = $response->json('locations');
        foreach ($locations as $location) {
            $this->assertEquals('locker', $location['type']);
        }
    }

    public function test_weekend_time_slots_have_different_options()
    {
        // Find next Saturday
        $saturday = now()->next('Saturday')->format('Y-m-d');

        $response = $this->actingAs($this->customerUser)
            ->getJson("/api/delivery/time-slots?date={$saturday}");

        $response->assertStatus(200);

        $slots = $response->json('slots');
        $this->assertNotEmpty($slots);

        // Weekend should have special slots
        $weekendSlots = collect($slots)->where('id', 'weekend_special');
        $this->assertNotEmpty($weekendSlots);
    }

    public function test_delivery_options_page_with_specific_shipment()
    {
        $response = $this->actingAs($this->customerUser)
            ->get("/customer/delivery?shipment_id={$this->shipment->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('currentShipment')
            ->where('currentShipment.id', $this->shipment->id)
        );
    }

    public function test_unauthenticated_user_cannot_access_delivery_apis()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');

        $response = $this->getJson("/api/delivery/time-slots?date={$tomorrow}");
        $response->assertStatus(401);

        $response = $this->getJson('/api/delivery/pickup-locations?address=123 Main St');
        $response->assertStatus(401);

        $response = $this->postJson('/api/delivery/preferences', []);
        $response->assertStatus(401);

        $response = $this->postJson('/api/delivery/apply-options', []);
        $response->assertStatus(401);
    }

    public function test_non_customer_user_cannot_access_delivery_page()
    {
        $nonCustomerUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/delivery');

        $response->assertRedirect('/login');
    }

    public function test_delivery_stats_calculation()
    {
        // Create mix of on-time and late deliveries
        Shipment::factory()->count(3)->create([
            'customer_id' => $this->customer->id,
            'status' => 'delivered',
            'estimated_delivery_date' => now()->subDays(2),
            'actual_delivery_date' => now()->subDays(3), // On time
            'created_by' => $this->customerUser->id,
        ]);

        Shipment::factory()->count(2)->create([
            'customer_id' => $this->customer->id,
            'status' => 'delivered',
            'estimated_delivery_date' => now()->subDays(2),
            'actual_delivery_date' => now()->subDay(), // Late
            'created_by' => $this->customerUser->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/delivery');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('deliveryStats.totalDeliveries')
            ->has('deliveryStats.onTimeDeliveries')
        );
    }

    public function test_time_slots_pricing_structure()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');

        $response = $this->actingAs($this->customerUser)
            ->getJson("/api/delivery/time-slots?date={$tomorrow}");

        $response->assertStatus(200);

        $slots = $response->json('slots');

        // Standard slots should be free
        $standardSlots = collect($slots)->where('type', 'standard');
        foreach ($standardSlots as $slot) {
            $this->assertEquals(0, $slot['price']);
        }

        // Premium slots should have fees
        $premiumSlots = collect($slots)->where('type', 'premium');
        foreach ($premiumSlots as $slot) {
            $this->assertGreaterThan(0, $slot['price']);
        }
    }

    public function test_pickup_locations_have_required_information()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/delivery/pickup-locations?address=123 Main St, New York, NY');

        $response->assertStatus(200);

        $locations = $response->json('locations');

        foreach ($locations as $location) {
            $this->assertArrayHasKey('id', $location);
            $this->assertArrayHasKey('name', $location);
            $this->assertArrayHasKey('address', $location);
            $this->assertArrayHasKey('distance', $location);
            $this->assertArrayHasKey('hours', $location);
            $this->assertArrayHasKey('rating', $location);
            $this->assertArrayHasKey('available', $location);
            $this->assertArrayHasKey('fees', $location);

            // Verify hours structure
            $this->assertArrayHasKey('weekdays', $location['hours']);
            $this->assertArrayHasKey('saturday', $location['hours']);
            $this->assertArrayHasKey('sunday', $location['hours']);

            // Verify fees structure
            $this->assertArrayHasKey('pickup', $location['fees']);
            $this->assertArrayHasKey('storage', $location['fees']);
        }
    }

    public function test_delivery_preferences_support_all_options()
    {
        $comprehensivePreferences = [
            'delivery_preferences' => [
                ['id' => 'contactless', 'enabled' => true],
                ['id' => 'signature_required', 'enabled' => false],
                ['id' => 'photo_confirmation', 'enabled' => true],
                ['id' => 'secure_location', 'enabled' => true],
                ['id' => 'adult_signature', 'enabled' => false],
                ['id' => 'weekend_delivery', 'enabled' => true],
            ],
            'contact_preferences' => [
                ['method' => 'sms', 'enabled' => true, 'value' => '+1234567890'],
                ['method' => 'email', 'enabled' => true, 'value' => 'test@example.com'],
                ['method' => 'phone', 'enabled' => false],
                ['method' => 'app', 'enabled' => true],
            ],
            'special_instructions' => 'Ring doorbell twice, leave with neighbor if not home',
            'delivery_location' => 'front_door',
            'access_code' => 'GATE123',
            'emergency_contact' => [
                'name' => 'Emergency Contact',
                'phone' => '+1987654321',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/delivery/preferences', $comprehensivePreferences);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Verify all preferences were saved
        $this->customer->refresh();
        $savedPreferences = json_decode($this->customer->delivery_preferences, true);

        $this->assertEquals(6, count($savedPreferences['delivery_preferences']));
        $this->assertEquals(4, count($savedPreferences['contact_preferences']));
        $this->assertEquals('Ring doorbell twice, leave with neighbor if not home', $savedPreferences['special_instructions']);
        $this->assertEquals('GATE123', $savedPreferences['access_code']);
    }

    public function test_delivery_options_integration_workflow()
    {
        // Complete workflow: get time slots, select location, save preferences, apply to shipment

        $tomorrow = now()->addDay()->format('Y-m-d');

        // Step 1: Get time slots
        $slotsResponse = $this->actingAs($this->customerUser)
            ->getJson("/api/delivery/time-slots?date={$tomorrow}");
        $slotsResponse->assertStatus(200);
        $slots = $slotsResponse->json('slots');
        $this->assertNotEmpty($slots);

        // Step 2: Get pickup locations
        $locationsResponse = $this->actingAs($this->customerUser)
            ->getJson('/api/delivery/pickup-locations?address=123 Main St, New York, NY');
        $locationsResponse->assertStatus(200);
        $locations = $locationsResponse->json('locations');
        $this->assertNotEmpty($locations);

        // Step 3: Save preferences
        $preferences = [
            'delivery_preferences' => [['id' => 'contactless', 'enabled' => true]],
            'special_instructions' => 'Test integration workflow',
        ];
        $prefsResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/delivery/preferences', $preferences);
        $prefsResponse->assertStatus(200);

        // Step 4: Apply options to shipment
        $deliveryOptions = [
            'shipment_id' => $this->shipment->id,
            'delivery_date' => $tomorrow,
            'time_slot_id' => $slots[0]['id'],
            'pickup_location_id' => $locations[0]['id'],
            'preferences' => ['contactless' => true],
        ];
        $applyResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/delivery/apply-options', $deliveryOptions);
        $applyResponse->assertStatus(200);

        // Verify everything was saved correctly
        $this->shipment->refresh();
        $this->customer->refresh();

        $shipmentOptions = json_decode($this->shipment->delivery_options, true);
        $customerPrefs = json_decode($this->customer->delivery_preferences, true);

        $this->assertEquals($tomorrow, $shipmentOptions['delivery_date']);
        $this->assertEquals($slots[0]['id'], $shipmentOptions['time_slot_id']);
        $this->assertEquals($locations[0]['id'], $shipmentOptions['pickup_location_id']);
        $this->assertEquals('Test integration workflow', $customerPrefs['special_instructions']);

        $this->assertTrue(true, 'Phase 6 delivery options integration workflow completed successfully!');
    }
}
