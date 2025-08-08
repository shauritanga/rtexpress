<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrackingTest extends TestCase
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

        Warehouse::factory()->count(2)->create();

        $this->shipment = Shipment::factory()->create([
            'customer_id' => $this->customer->id,
            'tracking_number' => 'RT12345678',
            'status' => 'in_transit',
        ]);
    }

    public function test_customer_can_access_tracking_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/tracking');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Tracking/Index')
            ->has('customer')
        );
    }

    public function test_customer_can_track_shipment_with_tracking_number()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/tracking?tracking_number='.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Tracking/Index')
            ->where('trackingNumber', $this->shipment->tracking_number)
            ->has('trackingData')
        );
    }

    public function test_api_tracking_returns_shipment_data()
    {
        $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'tracking_number',
            'current_status',
            'estimated_delivery',
            'current_location' => [
                'lat',
                'lng',
                'address',
            ],
            'destination' => [
                'lat',
                'lng',
                'address',
            ],
            'events',
        ]);
    }

    public function test_api_tracking_returns_404_for_invalid_tracking_number()
    {
        $response = $this->getJson('/api/tracking/INVALID123');

        $response->assertStatus(404);
        $response->assertJson([
            'error' => 'Tracking information not found',
        ]);
    }

    public function test_tracking_updates_endpoint_returns_latest_data()
    {
        $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number.'/updates');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'current_status',
            'current_location',
            'last_updated',
            'latest_event',
        ]);
    }

    public function test_customer_can_track_any_valid_tracking_number()
    {
        // Create another customer's shipment
        $otherCustomer = Customer::factory()->create();
        $otherShipment = Shipment::factory()->create([
            'customer_id' => $otherCustomer->id,
            'tracking_number' => 'RT87654321',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/tracking/'.$otherShipment->tracking_number);

        // Should return mock data since tracking is public
        $response->assertStatus(200);
        $response->assertJsonPath('tracking_number', $otherShipment->tracking_number);
    }

    public function test_unauthenticated_user_can_access_public_tracking()
    {
        $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'tracking_number',
            'current_status',
        ]);
    }

    public function test_tracking_page_redirects_unauthenticated_users()
    {
        $response = $this->get('/customer/tracking');

        $response->assertRedirect('/login');
    }

    public function test_tracking_events_are_generated_correctly()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/tracking/'.$this->shipment->tracking_number);

        $response->assertStatus(200);

        $events = $response->json('events');
        $this->assertIsArray($events);
        $this->assertNotEmpty($events);

        // Check that events have required structure
        foreach ($events as $event) {
            $this->assertArrayHasKey('id', $event);
            $this->assertArrayHasKey('timestamp', $event);
            $this->assertArrayHasKey('status', $event);
            $this->assertArrayHasKey('location', $event);
            $this->assertArrayHasKey('description', $event);
        }
    }

    public function test_tracking_data_includes_driver_info_for_out_for_delivery()
    {
        $this->shipment->update(['status' => 'out_for_delivery']);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/tracking/'.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'driver' => [
                'name',
                'phone',
                'vehicle',
            ],
            'delivery_window',
        ]);
    }

    public function test_tracking_data_excludes_driver_info_for_early_statuses()
    {
        $this->shipment->update(['status' => 'pending']);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/tracking/'.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertJsonMissing(['driver']);
    }

    public function test_tracking_number_validation()
    {
        // Test with empty tracking number
        $response = $this->getJson('/api/tracking/');
        $response->assertStatus(404);

        // Test with very short tracking number
        $response = $this->getJson('/api/tracking/123');
        $response->assertStatus(404);
    }

    public function test_tracking_page_handles_missing_tracking_number_gracefully()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/tracking');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Tracking/Index')
            ->where('trackingNumber', null)
            ->where('trackingData', null)
        );
    }

    public function test_tracking_coordinates_are_realistic()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/tracking/'.$this->shipment->tracking_number);

        $response->assertStatus(200);

        $currentLocation = $response->json('current_location');
        $destination = $response->json('destination');

        // Check latitude and longitude are within realistic ranges
        $this->assertGreaterThanOrEqual(-90, $currentLocation['lat']);
        $this->assertLessThanOrEqual(90, $currentLocation['lat']);
        $this->assertGreaterThanOrEqual(-180, $currentLocation['lng']);
        $this->assertLessThanOrEqual(180, $currentLocation['lng']);

        $this->assertGreaterThanOrEqual(-90, $destination['lat']);
        $this->assertLessThanOrEqual(90, $destination['lat']);
        $this->assertGreaterThanOrEqual(-180, $destination['lng']);
        $this->assertLessThanOrEqual(180, $destination['lng']);
    }

    public function test_tracking_timestamps_are_valid()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/tracking/'.$this->shipment->tracking_number);

        $response->assertStatus(200);

        $estimatedDelivery = $response->json('estimated_delivery');
        $this->assertNotNull($estimatedDelivery);

        // Check that estimated delivery is a valid ISO 8601 timestamp
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $estimatedDelivery);

        $events = $response->json('events');
        foreach ($events as $event) {
            $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $event['timestamp']);
        }
    }

    public function test_tracking_status_progression_is_logical()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/tracking/'.$this->shipment->tracking_number);

        $response->assertStatus(200);

        $events = $response->json('events');
        $statusOrder = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

        // Events are in reverse chronological order (most recent first)
        // So status progression should be decreasing
        $previousStatusIndex = 999; // Start with high number
        foreach ($events as $event) {
            $currentStatusIndex = array_search($event['status'], $statusOrder);
            if ($currentStatusIndex !== false) {
                $this->assertLessThanOrEqual($previousStatusIndex, $currentStatusIndex);
                $previousStatusIndex = $currentStatusIndex;
            }
        }
    }
}
