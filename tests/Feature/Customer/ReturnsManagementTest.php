<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ReturnsManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $customerUser;

    private Customer $customer;

    private Shipment $shipment;

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

    public function test_customer_can_access_returns_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/returns');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Returns/Index')
            ->has('customer')
            ->has('returns')
        );
    }

    public function test_customer_can_create_return_request()
    {
        $returnData = [
            'original_tracking_number' => $this->shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
            'special_instructions' => 'Handle with care',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'return_tracking_number',
            'message',
            'return_data',
        ]);
    }

    public function test_return_creation_validates_required_fields()
    {
        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'original_tracking_number',
            'return_reason',
            'return_type',
            'return_value',
        ]);
    }

    public function test_return_type_validation()
    {
        $returnData = [
            'original_tracking_number' => $this->shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'invalid_type',
            'return_value' => 99.99,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['return_type']);
    }

    public function test_return_value_must_be_positive()
    {
        $returnData = [
            'original_tracking_number' => $this->shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => -10.00,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['return_value']);
    }

    public function test_cannot_create_return_for_non_existent_shipment()
    {
        $returnData = [
            'original_tracking_number' => 'NONEXISTENT123',
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(404);
        $response->assertJson([
            'success' => false,
            'message' => 'Original shipment not found or does not belong to your account',
        ]);
    }

    public function test_cannot_create_return_for_other_customers_shipment()
    {
        $otherCustomer = Customer::factory()->create();
        $warehouses = Warehouse::factory()->count(2)->create();

        $otherShipment = Shipment::factory()->create([
            'customer_id' => $otherCustomer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        $returnData = [
            'original_tracking_number' => $otherShipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(404);
        $response->assertJson([
            'success' => false,
            'message' => 'Original shipment not found or does not belong to your account',
        ]);
    }

    public function test_return_tracking_number_generation()
    {
        $returnData = [
            'original_tracking_number' => $this->shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(200);

        $responseData = $response->json();
        $this->assertStringStartsWith('RET', $responseData['return_tracking_number']);
        $this->assertEquals(11, strlen($responseData['return_tracking_number'])); // RET + 8 characters
    }

    public function test_return_data_includes_correct_addresses()
    {
        $returnData = [
            'original_tracking_number' => $this->shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(200);

        $responseData = $response->json();

        // Return sender should be original recipient
        $this->assertEquals($this->shipment->recipient_name, $responseData['return_data']['sender_name']);
        $this->assertEquals($this->shipment->recipient_address, $responseData['return_data']['sender_address']);

        // Return recipient should be original sender
        $this->assertEquals($this->shipment->sender_name, $responseData['return_data']['recipient_name']);
        $this->assertEquals($this->shipment->sender_address, $responseData['return_data']['recipient_address']);
    }

    public function test_special_instructions_are_optional()
    {
        $returnData = [
            'original_tracking_number' => $this->shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
            // No special_instructions provided
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_return_types_validation()
    {
        $validTypes = ['refund', 'exchange', 'repair'];

        foreach ($validTypes as $type) {
            $returnData = [
                'original_tracking_number' => $this->shipment->tracking_number,
                'return_reason' => 'defective',
                'return_type' => $type,
                'return_value' => 99.99,
            ];

            $response = $this->actingAs($this->customerUser)
                ->postJson('/customer/returns', $returnData);

            $response->assertStatus(200);

            $responseData = $response->json();
            $this->assertEquals($type, $responseData['return_data']['return_type']);
        }
    }

    public function test_customer_can_generate_return_label()
    {
        $returnId = 'RET12345678';

        $response = $this->actingAs($this->customerUser)
            ->postJson("/customer/returns/{$returnId}/label");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', "attachment; filename=\"return-label-{$returnId}.pdf\"");
    }

    public function test_return_status_defaults_to_pending()
    {
        $returnData = [
            'original_tracking_number' => $this->shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(200);

        $responseData = $response->json();
        $this->assertEquals('pending', $responseData['return_data']['status']);
    }

    public function test_return_includes_original_shipment_reference()
    {
        $returnData = [
            'original_tracking_number' => $this->shipment->tracking_number,
            'return_reason' => 'defective',
            'return_type' => 'refund',
            'return_value' => 99.99,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/returns', $returnData);

        $response->assertStatus(200);

        $responseData = $response->json();
        $this->assertEquals($this->shipment->id, $responseData['return_data']['original_shipment_id']);
        $this->assertEquals($this->shipment->tracking_number, $responseData['return_data']['original_tracking_number']);
    }

    public function test_non_customer_cannot_access_returns()
    {
        // Create a user without customer_id (non-customer)
        $adminUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($adminUser)
            ->get('/customer/returns');

        $response->assertRedirect('/login');
    }

    public function test_unauthenticated_user_redirected_from_returns()
    {
        $response = $this->get('/customer/returns');

        $response->assertRedirect('/login');
    }

    public function test_returns_page_includes_mock_data()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/returns');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Returns/Index')
            ->has('returns')
            ->where('returns', fn ($returns) => count($returns) > 0)
        );
    }
}
