<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class Phase3FinalTest extends TestCase
{
    use RefreshDatabase;

    public function test_phase_3_complete_workflow()
    {
        // Setup
        $customer = Customer::factory()->create([
            'email' => 'customer@test.com',
        ]);
        
        $customerUser = User::factory()->create([
            'email' => 'customer@test.com',
            'customer_id' => $customer->id,
        ]);

        Warehouse::factory()->count(2)->create();

        // Test 1: Shipment Creation Workflow
        $this->actingAs($customerUser);
        
        // Access shipment creation page
        $response = $this->get('/customer/shipments/create');
        $response->assertStatus(200);

        // Create a shipment
        $shipmentData = [
            'recipient' => [
                'contact_person' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '+1234567890',
                'address_line_1' => '123 Test St',
                'city' => 'Test City',
                'state_province' => 'TS',
                'postal_code' => '12345',
                'country' => 'US',
            ],
            'packageDetails' => [
                'weight' => 5.5,
                'length' => 10,
                'width' => 8,
                'height' => 6,
                'declared_value' => 100.00,
                'contents_description' => 'Test package contents',
            ],
            'serviceType' => [
                'id' => 'standard',
            ],
            'totalCost' => 25.99,
        ];

        $response = $this->postJson('/customer/shipments', $shipmentData);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $shipment = Shipment::latest()->first();
        $this->assertNotNull($shipment);
        $this->assertEquals($customer->id, $shipment->customer_id);

        // Test 2: View shipment details
        $response = $this->get("/customer/shipments/{$shipment->id}");
        $response->assertStatus(200);

        // Test 3: Generate shipping label
        $response = $this->postJson("/customer/shipments/{$shipment->id}/label", [
            'format' => '4x6',
            'options' => ['qr_code'],
        ]);
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');

        // Test 4: Pickup Scheduling Workflow
        $response = $this->get('/customer/pickups/schedule');
        $response->assertStatus(200);

        $pickupDate = Carbon::tomorrow()->toDateString();
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St, Test City, TS 12345',
            'package_count' => 1,
            'total_weight' => 5.5,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
            'residential_pickup' => false,
        ];

        $response = $this->postJson('/customer/pickups', $pickupData);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Test 5: Returns Management Workflow
        $response = $this->get('/customer/returns');
        $response->assertStatus(200);

        $returnData = [
            'original_tracking_number' => $shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
            'special_instructions' => 'Handle with care',
        ];

        $response = $this->postJson('/customer/returns', $returnData);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Test 6: Return label generation
        $returnId = 'RET12345678';
        $response = $this->postJson("/customer/returns/{$returnId}/label");
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');

        // Test 7: Authorization tests
        // Test unauthenticated access
        $this->app['auth']->logout();
        
        $response = $this->get('/customer/shipments/create');
        $response->assertRedirect('/login');

        $response = $this->get('/customer/pickups/schedule');
        $response->assertRedirect('/login');

        $response = $this->get('/customer/returns');
        $response->assertRedirect('/login');

        // Test non-customer access
        $nonCustomerUser = User::factory()->create(['customer_id' => null]);
        $this->actingAs($nonCustomerUser);

        $response = $this->get('/customer/shipments/create');
        $response->assertRedirect('/login');

        $response = $this->get('/customer/pickups/schedule');
        $response->assertRedirect('/login');

        $response = $this->get('/customer/returns');
        $response->assertRedirect('/login');

        // Test 8: Validation works
        $this->actingAs($customerUser);

        // Test shipment validation
        $response = $this->postJson('/customer/shipments', []);
        $response->assertStatus(422);

        // Test pickup validation
        $response = $this->postJson('/customer/pickups', []);
        $response->assertStatus(422);

        // Test return validation
        $response = $this->postJson('/customer/returns', []);
        $response->assertStatus(422);

        $this->assertTrue(true, 'Phase 3 complete workflow test passed successfully!');
    }

    public function test_all_phase_3_pages_accessible()
    {
        $customer = Customer::factory()->create();
        $customerUser = User::factory()->create(['customer_id' => $customer->id]);

        $this->actingAs($customerUser);

        $pages = [
            '/customer/shipments/create',
            '/customer/pickups/schedule',
            '/customer/pickups',
            '/customer/returns',
        ];

        foreach ($pages as $page) {
            $response = $this->get($page);
            $response->assertStatus(200);
        }

        $this->assertTrue(true, 'All Phase 3 pages are accessible');
    }

    public function test_database_integrity()
    {
        $customer = Customer::factory()->create();
        $customerUser = User::factory()->create(['customer_id' => $customer->id]);
        $warehouses = Warehouse::factory()->count(2)->create();

        $this->actingAs($customerUser);

        // Create shipment and verify database integrity
        $shipmentData = [
            'recipient' => [
                'contact_person' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '+1234567890',
                'address_line_1' => '123 Test St',
                'city' => 'Test City',
                'state_province' => 'TS',
                'postal_code' => '12345',
                'country' => 'US',
            ],
            'packageDetails' => [
                'weight' => 5.5,
                'length' => 10,
                'width' => 8,
                'height' => 6,
                'declared_value' => 100.00,
                'contents_description' => 'Test package contents',
            ],
            'serviceType' => [
                'id' => 'standard',
            ],
            'totalCost' => 25.99,
        ];

        $response = $this->postJson('/customer/shipments', $shipmentData);
        $response->assertStatus(200);

        // Verify shipment was created with correct data
        $this->assertDatabaseHas('shipments', [
            'customer_id' => $customer->id,
            'recipient_name' => 'John Doe',
            'service_type' => 'standard',
            'declared_value' => 100.00,
            'created_by' => $customerUser->id,
        ]);

        // Verify tracking number is unique
        $shipment = Shipment::latest()->first();
        $this->assertStringStartsWith('RT', $shipment->tracking_number);
        $this->assertEquals(10, strlen($shipment->tracking_number));

        $this->assertTrue(true, 'Database integrity test passed');
    }
}
