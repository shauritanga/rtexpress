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

class CommunicationTest extends TestCase
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

    public function test_customer_can_access_communication_center()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Communication/Index')
            ->where('trackingNumber', $this->shipment->tracking_number)
            ->has('customer')
            ->has('messages')
        );
    }

    public function test_communication_center_redirects_without_tracking_number()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication');

        $response->assertRedirect('/customer/tracking');
    }

    public function test_communication_center_redirects_for_invalid_shipment()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication?tracking_number=INVALID123');

        $response->assertRedirect('/customer/tracking');
        $response->assertSessionHas('error', 'Shipment not found');
    }

    public function test_customer_can_send_text_message()
    {
        Storage::fake('public');

        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => 'Hello, when will you arrive?',
            'type' => 'text',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', $messageData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Message sent successfully',
        ]);

        $response->assertJsonStructure([
            'data' => [
                'id',
                'sender',
                'content',
                'timestamp',
                'type',
                'read',
            ],
        ]);
    }

    public function test_customer_can_send_message_with_image_attachments()
    {
        Storage::fake('public');

        $image = UploadedFile::fake()->image('test.jpg', 800, 600);

        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => 'Here is a photo of the delivery location',
            'type' => 'image',
            'attachments' => [$image],
        ];

        $response = $this->actingAs($this->customerUser)
            ->post('/api/communication/messages', $messageData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $responseData = $response->json('data');
        $this->assertArrayHasKey('attachments', $responseData);
        $this->assertNotEmpty($responseData['attachments']);
        $this->assertEquals('image', $responseData['attachments'][0]['type']);

        // Verify file was stored
        Storage::disk('public')->assertExists('communication/attachments/'.$image->hashName());
    }

    public function test_message_validation_requires_content_or_attachments()
    {
        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => '',
            'type' => 'text',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', $messageData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['content']);
    }

    public function test_message_validation_limits_content_length()
    {
        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => str_repeat('a', 1001), // Exceeds 1000 character limit
            'type' => 'text',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', $messageData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['content']);
    }

    public function test_message_validation_limits_image_size()
    {
        Storage::fake('public');

        // Create a large fake image (over 5MB)
        $largeImage = UploadedFile::fake()->create('large.jpg', 6000); // 6MB

        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => 'Large image test',
            'type' => 'image',
            'attachments' => [$largeImage],
        ];

        $response = $this->actingAs($this->customerUser)
            ->post('/api/communication/messages', $messageData);

        $response->assertStatus(302); // Redirect due to validation error
        $response->assertSessionHasErrors(['attachments.0']);
    }

    public function test_customer_cannot_send_message_for_other_customer_shipment()
    {
        // Create another customer's shipment
        $otherCustomer = Customer::factory()->create();
        $otherShipment = Shipment::factory()->create([
            'customer_id' => $otherCustomer->id,
            'tracking_number' => 'RT87654321',
        ]);

        $messageData = [
            'tracking_number' => $otherShipment->tracking_number,
            'content' => 'Unauthorized message',
            'type' => 'text',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', $messageData);

        $response->assertStatus(404);
        $response->assertJson([
            'error' => 'Shipment not found',
        ]);
    }

    public function test_customer_can_update_delivery_instructions()
    {
        $instructionsData = [
            'tracking_number' => $this->shipment->tracking_number,
            'instructions' => 'Please ring doorbell twice and leave at front door',
            'preferences' => ['ring_bell', 'front_door'],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/instructions', $instructionsData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Delivery instructions updated successfully',
        ]);

        // Verify instructions were saved to shipment
        $this->shipment->refresh();
        $this->assertEquals($instructionsData['instructions'], $this->shipment->special_instructions);
    }

    public function test_delivery_instructions_validation_limits_length()
    {
        $instructionsData = [
            'tracking_number' => $this->shipment->tracking_number,
            'instructions' => str_repeat('a', 1001), // Exceeds 1000 character limit
            'preferences' => [],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/instructions', $instructionsData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['instructions']);
    }

    public function test_customer_can_get_messages_for_shipment()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/communication/'.$this->shipment->tracking_number.'/messages');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $response->assertJsonStructure([
            'messages' => [
                '*' => [
                    'id',
                    'sender',
                    'content',
                    'timestamp',
                    'type',
                    'read',
                ],
            ],
        ]);
    }

    public function test_customer_cannot_get_messages_for_other_customer_shipment()
    {
        // Create another customer's shipment
        $otherCustomer = Customer::factory()->create();
        $otherShipment = Shipment::factory()->create([
            'customer_id' => $otherCustomer->id,
            'tracking_number' => 'RT87654321',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/communication/'.$otherShipment->tracking_number.'/messages');

        $response->assertStatus(404);
        $response->assertJson([
            'error' => 'Shipment not found',
        ]);
    }

    public function test_unauthenticated_user_cannot_access_communication_api()
    {
        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => 'Unauthorized message',
            'type' => 'text',
        ];

        $response = $this->postJson('/api/communication/messages', $messageData);

        $response->assertStatus(401);
    }

    public function test_communication_center_shows_driver_info_for_out_for_delivery()
    {
        $this->shipment->update(['status' => 'out_for_delivery']);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('driver')
            ->where('driver.name', 'Mike Johnson')
            ->where('driver.status', 'online')
        );
    }

    public function test_communication_center_hides_driver_info_for_early_statuses()
    {
        $this->shipment->update(['status' => 'pending']);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->where('driver', null)
        );
    }

    public function test_communication_center_shows_delivery_photos_for_delivered_status()
    {
        $this->shipment->update(['status' => 'delivered']);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->where('deliveryStatus', 'delivered')
            ->has('deliveryPhotos')
            ->has('deliveryTimestamp')
        );
    }

    public function test_communication_center_requires_authentication()
    {
        $response = $this->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);

        $response->assertRedirect('/login');
    }

    public function test_non_customer_user_cannot_access_communication_center()
    {
        $nonCustomerUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/communication?tracking_number='.$this->shipment->tracking_number);

        $response->assertRedirect('/login');
    }

    public function test_message_timestamps_are_valid_iso_format()
    {
        $messageData = [
            'tracking_number' => $this->shipment->tracking_number,
            'content' => 'Test message',
            'type' => 'text',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/communication/messages', $messageData);

        $response->assertStatus(200);

        $timestamp = $response->json('data.timestamp');
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $timestamp);
    }
}
