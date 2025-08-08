<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $customerUser;

    private Customer $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customerUser = User::factory()->create([
            'role' => 'customer',
        ]);

        $this->customer = Customer::factory()->create([
            'user_id' => $this->customerUser->id,
        ]);
    }

    public function test_customer_can_access_notifications_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Notifications/Index')
            ->has('customer')
            ->has('notifications')
            ->has('unreadCount')
            ->has('notificationSettings')
        );
    }

    public function test_notifications_page_includes_mock_notifications()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('notifications')
            ->has('notifications.0', fn ($notification) => $notification->has('id')
                ->has('type')
                ->has('title')
                ->has('message')
                ->has('timestamp')
                ->has('is_read')
                ->has('priority')
                ->hasAll(['metadata'])
            )
        );
    }

    public function test_notifications_include_different_types()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];
        $types = collect($notifications)->pluck('type')->unique();

        $expectedTypes = ['shipment_update', 'delivery', 'exception', 'promotion', 'system'];

        foreach ($expectedTypes as $type) {
            $this->assertTrue($types->contains($type), "Missing notification type: {$type}");
        }
    }

    public function test_notifications_have_proper_priorities()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];
        $priorities = collect($notifications)->pluck('priority')->unique();

        $expectedPriorities = ['high', 'medium', 'low'];

        foreach ($expectedPriorities as $priority) {
            $this->assertTrue($priorities->contains($priority), "Missing priority level: {$priority}");
        }
    }

    public function test_unread_count_is_calculated_correctly()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];
        $unreadCount = $response->viewData('page')['props']['unreadCount'];

        $actualUnreadCount = collect($notifications)->where('is_read', false)->count();

        $this->assertEquals($actualUnreadCount, $unreadCount);
    }

    public function test_notification_settings_are_included()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('notificationSettings', fn ($settings) => $settings->has('email_notifications')
            ->has('sms_notifications')
            ->has('push_notifications')
            ->has('shipment_updates')
            ->has('delivery_notifications')
            ->has('exception_alerts')
            ->has('promotional_offers')
            ->has('system_maintenance')
        )
        );
    }

    public function test_shipment_notifications_include_tracking_metadata()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];
        $shipmentNotifications = collect($notifications)->whereIn('type', [
            'shipment_update', 'delivery', 'exception',
        ]);

        foreach ($shipmentNotifications as $notification) {
            if (! empty($notification['metadata'])) {
                $this->assertArrayHasKey('tracking_number', $notification['metadata']);
                $this->assertArrayHasKey('shipment_id', $notification['metadata']);
            }
        }
    }

    public function test_promotion_notifications_include_discount_codes()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];
        $promotionNotifications = collect($notifications)->where('type', 'promotion');

        foreach ($promotionNotifications as $notification) {
            if (! empty($notification['metadata'])) {
                $this->assertArrayHasKey('discount_code', $notification['metadata']);
                $this->assertStringStartsWith('SAVE', $notification['metadata']['discount_code']);
            }
        }
    }

    public function test_notifications_are_sorted_by_timestamp()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];
        $timestamps = collect($notifications)->pluck('timestamp');

        // Verify notifications are sorted by timestamp (newest first)
        $sortedTimestamps = $timestamps->sort()->reverse()->values();
        $this->assertEquals($sortedTimestamps->toArray(), $timestamps->toArray());
    }

    public function test_non_customer_cannot_access_notifications()
    {
        $adminUser = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($adminUser)
            ->get('/customer/notifications');

        $response->assertRedirect('/admin/dashboard');
    }

    public function test_unauthenticated_user_redirected_from_notifications()
    {
        $response = $this->get('/customer/notifications');

        $response->assertRedirect('/login');
    }

    public function test_customer_without_customer_record_sees_no_access()
    {
        $userWithoutCustomer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($userWithoutCustomer)
            ->get('/customer/notifications');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Dashboard/NoAccess')
        );
    }

    public function test_notifications_have_realistic_timestamps()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];

        foreach ($notifications as $notification) {
            $timestamp = strtotime($notification['timestamp']);
            $now = time();
            $oneWeekAgo = $now - (7 * 24 * 60 * 60);

            // All notifications should be within the last week
            $this->assertGreaterThanOrEqual($oneWeekAgo, $timestamp);
            $this->assertLessThanOrEqual($now, $timestamp);
        }
    }

    public function test_notification_titles_and_messages_are_appropriate()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];

        foreach ($notifications as $notification) {
            $this->assertNotEmpty($notification['title']);
            $this->assertNotEmpty($notification['message']);
            $this->assertIsString($notification['title']);
            $this->assertIsString($notification['message']);

            // Verify title and message are appropriate for the notification type
            switch ($notification['type']) {
                case 'shipment_update':
                    $this->assertStringContainsStringIgnoringCase('shipment', $notification['title'].' '.$notification['message']);
                    break;
                case 'delivery':
                    $this->assertStringContainsStringIgnoringCase('deliver', $notification['title'].' '.$notification['message']);
                    break;
                case 'exception':
                    $this->assertStringContainsStringIgnoringCase('exception', $notification['title'].' '.$notification['message']);
                    break;
                case 'promotion':
                    $this->assertStringContainsStringIgnoringCase('discount', $notification['title'].' '.$notification['message']);
                    break;
                case 'system':
                    $this->assertStringContainsStringIgnoringCase('system', $notification['title'].' '.$notification['message']);
                    break;
            }
        }
    }

    public function test_notification_generation_creates_expected_count()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/notifications');

        $response->assertStatus(200);

        $notifications = $response->viewData('page')['props']['notifications'];

        // Should generate 25 notifications as per the controller
        $this->assertCount(25, $notifications);
    }
}
