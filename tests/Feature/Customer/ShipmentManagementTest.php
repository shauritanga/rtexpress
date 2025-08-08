<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ShipmentManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

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

    public function test_customer_can_access_shipment_creation_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/shipments/create');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Shipments/Create')
            ->has('customer')
            ->has('serviceTypes')
            ->has('savedAddresses')
        );
    }

    public function test_customer_can_create_shipment()
    {
        Warehouse::factory()->count(2)->create();

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
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('shipments', [
            'customer_id' => $this->customer->id,
            'recipient_name' => 'John Doe',
            'service_type' => 'standard',
            'declared_value' => 100.00,
        ]);
    }

    public function test_shipment_creation_validates_required_fields()
    {
        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/shipments', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'recipient',
            'packageDetails',
            'serviceType',
            'totalCost',
        ]);
    }

    public function test_customer_can_view_shipment_details()
    {
        $warehouses = Warehouse::factory()->count(2)->create();

        $shipment = Shipment::factory()->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get("/customer/shipments/{$shipment->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Shipments/Show')
            ->has('shipment')
            ->has('customer')
            ->where('shipment.id', $shipment->id)
        );
    }

    public function test_customer_cannot_view_other_customers_shipments()
    {
        $otherCustomer = Customer::factory()->create();
        $warehouses = Warehouse::factory()->count(2)->create();

        $shipment = Shipment::factory()->create([
            'customer_id' => $otherCustomer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get("/customer/shipments/{$shipment->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Dashboard/NoAccess')
        );
    }

    public function test_customer_can_generate_shipping_label()
    {
        $warehouses = Warehouse::factory()->count(2)->create();

        $shipment = Shipment::factory()->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->postJson("/customer/shipments/{$shipment->id}/label", [
                'format' => '4x6',
                'options' => ['qr_code'],
            ]);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_label_generation_validates_format()
    {
        $warehouses = Warehouse::factory()->count(2)->create();

        $shipment = Shipment::factory()->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->postJson("/customer/shipments/{$shipment->id}/label", [
                'format' => 'invalid_format',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['format']);
    }

    public function test_tracking_number_is_unique()
    {
        Warehouse::factory()->count(2)->create();

        // Create multiple shipments and ensure tracking numbers are unique
        $trackingNumbers = [];

        for ($i = 0; $i < 5; $i++) {
            $shipmentData = [
                'recipient' => [
                    'contact_person' => "Customer {$i}",
                    'email' => "customer{$i}@example.com",
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

            $shipment = Shipment::latest()->first();
            $this->assertNotContains($shipment->tracking_number, $trackingNumbers);
            $trackingNumbers[] = $shipment->tracking_number;
        }
    }

    public function test_estimated_delivery_date_calculation()
    {
        Warehouse::factory()->count(2)->create();

        $serviceTypes = [
            'overnight' => 1,
            'express' => 2,
            'standard' => 4,
            'international' => 7,
        ];

        foreach ($serviceTypes as $serviceType => $expectedDays) {
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
                    'id' => $serviceType,
                ],
                'totalCost' => 25.99,
            ];

            $response = $this->actingAs($this->customerUser)
                ->postJson('/customer/shipments', $shipmentData);

            $response->assertStatus(200);

            $shipment = Shipment::latest()->first();
            $estimatedDate = \Carbon\Carbon::parse($shipment->estimated_delivery_date);
            $today = \Carbon\Carbon::now();

            // Calculate business days difference
            $businessDays = 0;
            $currentDate = $today->copy();

            while ($businessDays < $expectedDays) {
                $currentDate->addDay();
                if ($currentDate->isWeekday()) {
                    $businessDays++;
                }
            }

            $this->assertEquals($currentDate->toDateString(), $estimatedDate->toDateString());
        }
    }

    public function test_non_customer_cannot_create_shipments()
    {
        $adminUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($adminUser)
            ->get('/customer/shipments/create');

        $response->assertRedirect('/login');
    }

    public function test_unauthenticated_user_redirected_from_shipment_creation()
    {
        $response = $this->get('/customer/shipments/create');

        $response->assertRedirect('/login');
    }
}
