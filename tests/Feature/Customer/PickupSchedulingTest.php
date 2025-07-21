<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Carbon\Carbon;

class PickupSchedulingTest extends TestCase
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

    public function test_customer_can_access_pickup_scheduling_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/pickups/schedule');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Pickups/Schedule')
                ->has('customer')
                ->has('shipmentIds')
        );
    }

    public function test_customer_can_schedule_pickup()
    {
        $pickupDate = Carbon::tomorrow()->toDateString();
        
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St, Test City, TS 12345',
            'special_instructions' => 'Ring doorbell twice',
            'package_count' => 3,
            'total_weight' => 15.5,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
            'residential_pickup' => false,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'pickup_id',
            'message',
            'pickup_data',
        ]);
    }

    public function test_pickup_scheduling_validates_required_fields()
    {
        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'pickup_date',
            'pickup_time_window',
            'contact_person',
            'contact_phone',
            'pickup_location',
            'package_count',
            'total_weight',
            'ready_time',
            'close_time',
        ]);
    }

    public function test_pickup_date_must_be_in_future()
    {
        $pastDate = Carbon::yesterday()->toDateString();
        
        $pickupData = [
            'pickup_date' => $pastDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St',
            'package_count' => 1,
            'total_weight' => 5.0,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['pickup_date']);
    }

    public function test_pickup_time_window_validation()
    {
        $pickupDate = Carbon::tomorrow()->toDateString();
        
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => 'invalid-window',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St',
            'package_count' => 1,
            'total_weight' => 5.0,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['pickup_time_window']);
    }

    public function test_package_count_must_be_positive()
    {
        $pickupDate = Carbon::tomorrow()->toDateString();
        
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St',
            'package_count' => 0,
            'total_weight' => 5.0,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['package_count']);
    }

    public function test_total_weight_cannot_be_negative()
    {
        $pickupDate = Carbon::tomorrow()->toDateString();
        
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St',
            'package_count' => 1,
            'total_weight' => -5.0,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['total_weight']);
    }

    public function test_customer_can_access_pickup_history()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/pickups');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Pickups/Index')
                ->has('customer')
                ->has('pickups')
        );
    }

    public function test_pickup_scheduling_with_shipment_ids()
    {
        $pickupDate = Carbon::tomorrow()->toDateString();
        $shipmentIds = [1, 2, 3];
        
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St',
            'package_count' => 3,
            'total_weight' => 15.0,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
            'shipment_ids' => $shipmentIds,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        
        $responseData = $response->json();
        $this->assertEquals($shipmentIds, $responseData['pickup_data']['shipment_ids']);
    }

    public function test_residential_pickup_flag()
    {
        $pickupDate = Carbon::tomorrow()->toDateString();
        
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Residential St',
            'package_count' => 1,
            'total_weight' => 5.0,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
            'residential_pickup' => true,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(200);
        
        $responseData = $response->json();
        $this->assertTrue($responseData['pickup_data']['residential_pickup']);
    }

    public function test_special_instructions_are_optional()
    {
        $pickupDate = Carbon::tomorrow()->toDateString();
        
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St',
            'package_count' => 1,
            'total_weight' => 5.0,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
            // No special_instructions provided
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_pickup_id_generation()
    {
        $pickupDate = Carbon::tomorrow()->toDateString();
        
        $pickupData = [
            'pickup_date' => $pickupDate,
            'pickup_time_window' => '8-17',
            'contact_person' => 'John Doe',
            'contact_phone' => '+1234567890',
            'pickup_location' => '123 Test St',
            'package_count' => 1,
            'total_weight' => 5.0,
            'ready_time' => '9:00 AM',
            'close_time' => '5:00 PM',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/pickups', $pickupData);

        $response->assertStatus(200);
        
        $responseData = $response->json();
        $this->assertStringStartsWith('PU', $responseData['pickup_id']);
        $this->assertEquals(10, strlen($responseData['pickup_id'])); // PU + 8 characters
    }

    public function test_non_customer_cannot_schedule_pickups()
    {
        $adminUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($adminUser)
            ->get('/customer/pickups/schedule');

        $response->assertRedirect('/login');
    }

    public function test_unauthenticated_user_redirected_from_pickup_scheduling()
    {
        $response = $this->get('/customer/pickups/schedule');

        $response->assertRedirect('/login');
    }
}
