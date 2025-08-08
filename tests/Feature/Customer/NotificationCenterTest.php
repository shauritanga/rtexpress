<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class NotificationCenterTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $customerUser;

    protected $customer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user first for created_by field
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);

        $this->customer = Customer::create([
            'company_name' => 'Test Company',
            'customer_code' => 'TEST001',
            'contact_person' => 'John Doe',
            'email' => 'customer@test.com',
            'phone' => '+1234567890',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state_province' => 'TS',
            'postal_code' => '12345',
            'country' => 'US',
            'status' => 'active',
            'created_by' => $adminUser->id,
        ]);

        $this->customerUser = User::create([
            'name' => 'Customer User',
            'email' => 'customer.user@test.com',
            'password' => bcrypt('password'),
            'customer_id' => $this->customer->id,
        ]);
    }

    /** @test */
    public function customer_can_access_notification_center()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Notifications/Index')
            ->has('customer')
            ->has('summary')
        );
    }

    /** @test */
    public function customer_can_get_notification_preferences()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/customer/api/notifications/preferences');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'preferences' => [
                'customer_id',
                'email_enabled',
                'sms_enabled',
                'push_enabled',
                'in_app_enabled',
                'preferences',
                'quiet_hours',
                'language',
                'frequency',
            ],
        ]);
    }

    /** @test */
    public function customer_can_update_notification_preferences()
    {
        $preferences = [
            'email_enabled' => true,
            'sms_enabled' => false,
            'push_enabled' => true,
            'in_app_enabled' => true,
            'email_address' => 'updated@test.com',
            'phone_number' => '+9876543210',
            'preferences' => [
                'shipment_created' => ['email' => true, 'sms' => false, 'push' => true, 'in_app' => true],
                'shipment_delivered' => ['email' => true, 'sms' => true, 'push' => true, 'in_app' => true],
            ],
            'quiet_hours' => [
                'enabled' => true,
                'start' => '23:00',
                'end' => '07:00',
                'timezone' => 'America/Los_Angeles',
            ],
            'language' => 'es',
            'frequency' => [
                'digest' => 'weekly',
                'summary' => 'monthly',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/api/notifications/preferences', $preferences);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Check that preferences were updated in database
        $this->assertDatabaseHas('notification_preferences', [
            'user_type' => 'customer',
            'user_id' => $this->customer->id,
            'notification_type' => 'shipment_created',
            'email_enabled' => true,
            'sms_enabled' => false,
            'push_enabled' => true,
            'in_app_enabled' => true,
        ]);

        $this->assertDatabaseHas('notification_preferences', [
            'user_type' => 'customer',
            'user_id' => $this->customer->id,
            'notification_type' => 'shipment_delivered',
            'email_enabled' => true,
            'sms_enabled' => true,
            'push_enabled' => true,
            'in_app_enabled' => true,
        ]);
    }

    /** @test */
    public function customer_can_get_notification_history()
    {
        // Create some test notifications
        $firstNotification = Notification::create([
            'notification_id' => 'NOTIF-TEST-001',
            'type' => 'shipment_update',
            'channel' => 'email',
            'recipient_type' => 'customer',
            'recipient_id' => $this->customer->id,
            'recipient_email' => $this->customer->email,
            'title' => 'Test Notification 1',
            'message' => 'This is a test notification',
            'priority' => 'medium',
            'status' => 'delivered',
            'sent_at' => now()->subMinute(),
            'delivered_at' => now()->subMinute(),
            'created_at' => now()->subMinute(),
        ]);

        // Create second notification slightly later to ensure proper ordering
        sleep(1);

        $secondNotification = Notification::create([
            'notification_id' => 'NOTIF-TEST-002',
            'type' => 'payment_reminder',
            'channel' => 'email',
            'recipient_type' => 'customer',
            'recipient_id' => $this->customer->id,
            'recipient_email' => $this->customer->email,
            'title' => 'Test Notification 2',
            'message' => 'This is another test notification',
            'priority' => 'high',
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
            'read_at' => now(),
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/customer/api/notifications/history');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'notifications',
            'pagination',
            'stats',
        ]);

        $notifications = $response->json('notifications');

        // Debug: Check what we actually got
        if (empty($notifications)) {
            $this->fail('No notifications returned. Response: '.json_encode($response->json()));
        }

        $this->assertCount(2, $notifications);
        $this->assertEquals('Test Notification 2', $notifications[0]['title']); // Should be ordered by created_at desc
    }

    /** @test */
    public function customer_can_filter_notification_history()
    {
        // Create notifications with different types
        Notification::create([
            'notification_id' => 'NOTIF-SHIP-001',
            'type' => 'shipment_update',
            'channel' => 'email',
            'recipient_type' => 'customer',
            'recipient_id' => $this->customer->id,
            'recipient_email' => $this->customer->email,
            'title' => 'Shipment Notification',
            'message' => 'Shipment update',
            'priority' => 'medium',
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
        ]);

        Notification::create([
            'notification_id' => 'NOTIF-PAY-001',
            'type' => 'payment_reminder',
            'channel' => 'email',
            'recipient_type' => 'customer',
            'recipient_id' => $this->customer->id,
            'recipient_email' => $this->customer->email,
            'title' => 'Payment Notification',
            'message' => 'Payment update',
            'priority' => 'high',
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
            'read_at' => now(),
        ]);

        // Filter by type
        $response = $this->actingAs($this->customerUser)
            ->getJson('/customer/api/notifications/history?type=shipment');

        $response->assertStatus(200);
        $notifications = $response->json('notifications');
        $this->assertCount(1, $notifications);
        $this->assertEquals('shipment_update', $notifications[0]['type']);

        // Filter by status
        $response = $this->actingAs($this->customerUser)
            ->getJson('/customer/api/notifications/history?status=unread');

        $response->assertStatus(200);
        $notifications = $response->json('notifications');
        $this->assertCount(1, $notifications);
        $this->assertFalse($notifications[0]['read']);
    }

    /** @test */
    public function customer_can_search_notification_history()
    {
        Notification::create([
            'notification_id' => 'RT-2024-001',
            'type' => 'delivery_confirmation',
            'channel' => 'email',
            'recipient_type' => 'customer',
            'recipient_id' => $this->customer->id,
            'recipient_email' => $this->customer->email,
            'title' => 'Shipment Delivered',
            'message' => 'Your package has been delivered successfully',
            'priority' => 'medium',
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
        ]);

        Notification::create([
            'notification_id' => 'NOTIF-PAY-002',
            'type' => 'payment_confirmation',
            'channel' => 'email',
            'recipient_type' => 'customer',
            'recipient_id' => $this->customer->id,
            'recipient_email' => $this->customer->email,
            'title' => 'Payment Received',
            'message' => 'Payment has been processed',
            'priority' => 'low',
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
        ]);

        // Search by title
        $response = $this->actingAs($this->customerUser)
            ->getJson('/customer/api/notifications/history?search=delivered');

        $response->assertStatus(200);
        $notifications = $response->json('notifications');
        $this->assertCount(1, $notifications);
        $this->assertStringContainsString('Delivered', $notifications[0]['title']);

        // Search by notification ID
        $response = $this->actingAs($this->customerUser)
            ->getJson('/customer/api/notifications/history?search=RT-2024-001');

        $response->assertStatus(200);
        $notifications = $response->json('notifications');
        $this->assertCount(1, $notifications);
        $this->assertEquals('RT-2024-001', $notifications[0]['notification_id']);
    }

    /** @test */
    public function customer_can_mark_notification_as_read()
    {
        $notification = Notification::create([
            'notification_id' => 'NOTIF-READ-TEST',
            'type' => 'shipment_update',
            'channel' => 'email',
            'recipient_type' => 'customer',
            'recipient_id' => $this->customer->id,
            'recipient_email' => $this->customer->email,
            'title' => 'Test Notification',
            'message' => 'This is a test notification',
            'priority' => 'medium',
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->postJson("/customer/api/notifications/{$notification->id}/read");

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $notification->refresh();
        $this->assertNotNull($notification->read_at);
    }

    /** @test */
    public function update_preferences_validates_required_fields()
    {
        $response = $this->actingAs($this->customerUser)
            ->postJson('/customer/api/notifications/preferences', [
                'email_address' => 'invalid-email',
                'language' => 'invalid-language',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email_address', 'language']);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_notification_apis()
    {
        $response = $this->getJson('/customer/api/notifications/preferences');
        $response->assertStatus(401); // Unauthorized

        $response = $this->getJson('/customer/api/notifications/history');
        $response->assertStatus(401); // Unauthorized
    }

    /** @test */
    public function non_customer_user_cannot_access_notification_center()
    {
        $regularUser = User::create([
            'name' => 'Regular User',
            'email' => 'regular@test.com',
            'password' => bcrypt('password'),
            // No customer_id
        ]);

        $response = $this->actingAs($regularUser)
            ->get('/customer/notifications');

        // Should redirect to login since user doesn't have customer access
        $response->assertRedirect('/login');
    }

    /** @test */
    public function notification_preferences_are_created_with_defaults()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/customer/api/notifications/preferences');

        $response->assertStatus(200);

        $preferences = $response->json('preferences');
        $this->assertEquals($this->customer->id, $preferences['customer_id']);
        $this->assertTrue($preferences['email_enabled']);
        $this->assertFalse($preferences['sms_enabled']);
        $this->assertFalse($preferences['push_enabled']);
        $this->assertTrue($preferences['in_app_enabled']);
        $this->assertEquals('en', $preferences['language']);

        // Check that preferences were created in database
        $this->assertDatabaseHas('notification_preferences', [
            'user_type' => 'customer',
            'user_id' => $this->customer->id,
            'notification_type' => 'shipment_created',
            'email_enabled' => true,
        ]);
    }
}
