<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class Phase3IntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $customerUser;
    private Customer $customer;

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
    }

    public function test_complete_shipment_workflow()
    {
        // Create warehouses
        Warehouse::factory()->count(2)->create();

        // 1. Test shipment creation page access
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/shipments/create');
        $response->assertStatus(200);

        // 2. Test shipment creation
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

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/shipments', $shipmentData);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $shipment = Shipment::latest()->first();
        $this->assertNotNull($shipment);

        // 3. Test shipment details page
        $response = $this->actingAs($this->customerUser)
            ->get("/customer/shipments/{$shipment->id}");
        $response->assertStatus(200);

        // 4. Test shipping label generation
        $response = $this->actingAs($this->customerUser)
            ->postJson("/customer/shipments/{$shipment->id}/label", [
                'format' => '4x6',
                'options' => ['qr_code'],
            ]);
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');

        $this->assertTrue(true, 'Complete shipment workflow test passed');
    }

    public function test_pickup_scheduling_workflow()
    {
        // 1. Test pickup scheduling page access
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/pickups/schedule');
        $response->assertStatus(200);

        // 2. Test pickup scheduling
        $pickupDate = Carbon::tomorrow()->toDateString();
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St, Test City, TS 12345',
            'package_count' => 3,
            'total_weight' => 15.5,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
            'residential_pickup' => false,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // 3. Test pickup history page
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/pickups');
        $response->assertStatus(200);

        $this->assertTrue(true, 'Pickup scheduling workflow test passed');
    }

    public function test_returns_management_workflow()
    {
        // Create a shipment first
        $warehouses = Warehouse::factory()->count(2)->create();
        $shipment = Shipment::factory()->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_by' => $this->customerUser->id,
        ]);

        // 1. Test returns page access
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/returns');
        $response->assertStatus(200);

        // 2. Test return request creation
        $returnData = [
            'original_tracking_number' => $shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
            'special_instructions' => 'Handle with care',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // 3. Test return label generation
        $returnId = 'RET12345678';
        $response = $this->actingAs($this->customerUser)
            ->postJson("/customer/returns/{$returnId}/label");
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');

        $this->assertTrue(true, 'Returns management workflow test passed');
    }

    public function test_all_customer_pages_accessible()
    {
        // Test all main customer pages are accessible
        $pages = [
            '/customer/shipments/create',
            '/customer/pickups/schedule',
            '/customer/pickups',
            '/customer/returns',
        ];

        foreach ($pages as $page) {
            $response = $this->actingAs($this->customerUser)->get($page);
            $response->assertStatus(200);
        }

        $this->assertTrue(true, 'All customer pages are accessible');
    }

    public function test_validation_works_across_features()
    {
        // Test shipment validation
        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/shipments', []);
        $response->assertStatus(422);

        // Test pickup validation
        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', []);
        $response->assertStatus(422);

        // Test return validation
        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', []);
        $response->assertStatus(422);

        $this->assertTrue(true, 'Validation works across all features');
    }

    public function test_unauthorized_access_blocked()
    {
        // Test unauthenticated access
        $response = $this->get('/customer/shipments/create');
        $response->assertRedirect('/login');

        $response = $this->get('/customer/pickups/schedule');
        $response->assertRedirect('/login');

        $response = $this->get('/customer/returns');
        $response->assertRedirect('/login');

        // Test non-customer user access
        $adminUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($adminUser)->get('/customer/shipments/create');
        $response->assertRedirect('/login');

        $this->assertTrue(true, 'Unauthorized access is properly blocked');
    }
}
