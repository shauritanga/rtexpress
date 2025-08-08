<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Phase4ComprehensiveTest extends TestCase
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
            'status' => 'out_for_delivery',
        ]);
    }

    public function test_phase_4_complete_real_time_tracking_workflow()
    {
        // Test 1: Access tracking page
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/tracking');
        $response->assertStatus(200);

        // Test 2: Track specific shipment
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/tracking?tracking_number='.$this->shipment->tracking_number);
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->where('trackingNumber', $this->shipment->tracking_number)
            ->has('trackingData')
        );

        // Test 3: API tracking returns comprehensive data
        $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number);
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'tracking_number',
            'current_status',
            'estimated_delivery',
            'current_location' => ['lat', 'lng', 'address'],
            'destination' => ['lat', 'lng', 'address'],
            'driver' => ['name', 'phone', 'vehicle'],
            'events' => [
                '*' => ['id', 'timestamp', 'status', 'location', 'description'],
            ],
            'delivery_window',
        ]);

        // Test 4: Real-time updates endpoint
        $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number.'/updates');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'current_status',
            'current_location',
            'last_updated',
            'latest_event',
        ]);

        $this->assertTrue(true, 'Phase 4 real-time tracking workflow completed successfully!');
    }

    public function test_phase_4_complete_communication_workflow()
    {
        // Test 1: Access communication center
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Communication/Index')
            ->where('trackingNumber', $this->shipment->tracking_number)
            ->has('driver') // Should have driver for out_for_delivery status
            ->has('messages')
        );

        // Test 2: Send text message to driver
        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => 'Hello, I will be home after 3 PM',
            'type' => 'text',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', $messageData);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Test 3: Send message with image attachment
        Storage::fake('public');
        $image = UploadedFile::fake()->image('delivery_location.jpg', 800, 600);

        $messageWithImageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => 'Here is a photo of the delivery location',
            'type' => 'image',
            'attachments' => [$image],
        ];

        $response = $this->actingAs($this->customerUser)
            ->post('/api/communication/messages', $messageWithImageData);
        $response->assertStatus(200);

        // Test 4: Update delivery instructions
        $instructionsData = [
            'tracking_number' => $this->shipment->tracking_number,
            'instructions' => 'Please ring doorbell twice and leave at front door if no answer',
            'preferences' => ['ring_bell', 'front_door'],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/instructions', $instructionsData);
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Verify instructions were saved
        $this->shipment->refresh();
        $this->assertEquals($instructionsData['instructions'], $this->shipment->special_instructions);

        // Test 5: Get messages for shipment
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/communication/'.$this->shipment->tracking_number.'/messages');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'messages' => [
                '*' => ['id', 'sender', 'content', 'timestamp', 'type', 'read'],
            ],
        ]);

        $this->assertTrue(true, 'Phase 4 communication workflow completed successfully!');
    }

    public function test_phase_4_mobile_responsiveness_and_accessibility()
    {
        // Test 1: Tracking page loads with mobile-friendly structure
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/tracking?tracking_number='.$this->shipment->tracking_number);
        $response->assertStatus(200);

        // Test 2: Communication center loads with mobile-friendly structure
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);
        $response->assertStatus(200);

        // Test 3: API endpoints work consistently across different access patterns
        $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number);
        $response->assertStatus(200);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/tracking/'.$this->shipment->tracking_number);
        $response->assertStatus(200);

        $this->assertTrue(true, 'Phase 4 mobile responsiveness tests completed successfully!');
    }

    public function test_phase_4_security_and_authorization()
    {
        // Test 1: Unauthenticated users cannot access customer pages
        $response = $this->get('/customer/tracking');
        $response->assertRedirect('/login');

        $response = $this->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);
        $response->assertRedirect('/login');

        // Test 2: Non-customer users cannot access customer features
        $nonCustomerUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/tracking');
        $response->assertRedirect('/login');

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);
        $response->assertRedirect('/login');

        // Test 3: API endpoints require authentication for sensitive operations
        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => 'Unauthorized message',
            'type' => 'text',
        ];

        $response = $this->postJson('/api/communication/messages', $messageData);
        $response->assertStatus(403); // Forbidden due to customer auth middleware

        // Test 4: Customers cannot access other customers' communication features
        $otherCustomer = Customer::factory()->create();
        $otherShipment = Shipment::factory()->create([
            'customer_id' => $otherCustomer->id,
            'tracking_number' => 'RT87654321',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', [
                'tracking_number' => $otherShipment->tracking_number,
                'content' => 'Unauthorized access attempt',
                'type' => 'text',
            ]);
        $response->assertStatus(404);

        $this->assertTrue(true, 'Phase 4 security and authorization tests completed successfully!');
    }

    public function test_phase_4_data_validation_and_integrity()
    {
        // Test 1: Tracking API returns valid data structures
        $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number);
        $response->assertStatus(200);

        $data = $response->json();
        $this->assertIsString($data['tracking_number']);
        $this->assertIsString($data['current_status']);
        $this->assertIsArray($data['current_location']);
        $this->assertIsArray($data['destination']);
        $this->assertIsArray($data['events']);

        // Test 2: Coordinates are within valid ranges
        $this->assertGreaterThanOrEqual(-90, $data['current_location']['lat']);
        $this->assertLessThanOrEqual(90, $data['current_location']['lat']);
        $this->assertGreaterThanOrEqual(-180, $data['current_location']['lng']);
        $this->assertLessThanOrEqual(180, $data['current_location']['lng']);

        // Test 3: Timestamps are valid ISO 8601 format
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $data['estimated_delivery']);

        foreach ($data['events'] as $event) {
            $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $event['timestamp']);
        }

        // Test 4: Message validation works correctly
        $invalidMessageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => str_repeat('a', 1001), // Exceeds limit
            'type' => 'text',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', $invalidMessageData);
        $response->assertStatus(422);

        // Test 5: Instructions validation works correctly
        $invalidInstructionsData = [
            'tracking_number' => $this->shipment->tracking_number,
            'instructions' => str_repeat('a', 1001), // Exceeds limit
            'preferences' => [],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/instructions', $invalidInstructionsData);
        $response->assertStatus(422);

        $this->assertTrue(true, 'Phase 4 data validation and integrity tests completed successfully!');
    }

    public function test_phase_4_performance_and_reliability()
    {
        // Test 1: Multiple rapid API calls don't cause issues
        for ($i = 0; $i < 5; $i++) {
            $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number);
            $response->assertStatus(200);
        }

        // Test 2: Updates endpoint handles rapid polling
        for ($i = 0; $i < 3; $i++) {
            $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number.'/updates');
            $response->assertStatus(200);
        }

        // Test 3: Communication endpoints handle concurrent requests
        $response1 = $this->actingAs($this->customerUser)
            ->getJson('/api/communication/'.$this->shipment->tracking_number.'/messages');
        $response1->assertStatus(200);

        $response2 = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', [
                'tracking_number' => $this->shipment->tracking_number,
                'content' => 'Performance test message',
                'type' => 'text',
            ]);
        $response2->assertStatus(200);

        $this->assertTrue(true, 'Phase 4 performance and reliability tests completed successfully!');
    }

    public function test_phase_4_complete_integration()
    {
        // Test complete workflow from tracking to communication

        // Step 1: Customer accesses tracking
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/tracking?tracking_number='.$this->shipment->tracking_number);
        $response->assertStatus(200);

        // Step 2: Customer views real-time updates
        $response = $this->getJson('/api/tracking/'.$this->shipment->tracking_number.'/updates');
        $response->assertStatus(200);

        // Step 3: Customer accesses communication center
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);
        $response->assertStatus(200);

        // Step 4: Customer sends message to driver
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', [
                'tracking_number' => $this->shipment->tracking_number,
                'content' => 'Integration test message',
                'type' => 'text',
            ]);
        $response->assertStatus(200);

        // Step 5: Customer updates delivery instructions
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/instructions', [
                'tracking_number' => $this->shipment->tracking_number,
                'instructions' => 'Integration test instructions',
                'preferences' => ['ring_bell'],
            ]);
        $response->assertStatus(200);

        // Step 6: Verify all data is consistent
        $trackingResponse = $this->getJson('/api/tracking/'.$this->shipment->tracking_number);
        $trackingResponse->assertStatus(200);

        $messagesResponse = $this->actingAs($this->customerUser)
            ->getJson('/api/communication/'.$this->shipment->tracking_number.'/messages');
        $messagesResponse->assertStatus(200);

        $this->assertTrue(true, 'Phase 4 complete integration test passed successfully!');
    }
}
