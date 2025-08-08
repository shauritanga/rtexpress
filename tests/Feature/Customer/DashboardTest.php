<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $customerUser;

    private Customer $customer;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a customer user
        $this->customerUser = User::factory()->create([
            'role' => 'customer',
        ]);

        $this->customer = Customer::factory()->create([
            'user_id' => $this->customerUser->id,
        ]);
    }

    public function test_customer_can_access_dashboard()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Dashboard/Index')
            ->has('customer')
            ->has('stats')
            ->has('recentShipments')
            ->has('activeShipments')
            ->has('recentActivity')
            ->has('performanceMetrics')
            ->has('upcomingDeliveries')
        );
    }

    public function test_dashboard_displays_correct_statistics()
    {
        // Create test shipments
        $warehouses = Warehouse::factory()->count(2)->create();

        Shipment::factory()->count(5)->create([
            'customer_id' => $this->customer->id,
            'status' => 'delivered',
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        Shipment::factory()->count(3)->create([
            'customer_id' => $this->customer->id,
            'status' => 'in_transit',
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        Shipment::factory()->count(2)->create([
            'customer_id' => $this->customer->id,
            'status' => 'pending',
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('stats', fn ($stats) => $stats->where('total_shipments', 10)
            ->where('active_shipments', 5) // in_transit + pending
            ->where('delivered_shipments', 5)
            ->where('pending_shipments', 2)
        )
        );
    }

    public function test_dashboard_shows_recent_shipments()
    {
        $warehouses = Warehouse::factory()->count(2)->create();

        $recentShipments = Shipment::factory()->count(3)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_at' => Carbon::now()->subHours(2),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('recentShipments', 3)
            ->has('recentShipments.0', fn ($shipment) => $shipment->has('tracking_number')
                ->has('status')
                ->has('recipient_name')
                ->has('created_at')
            )
        );
    }

    public function test_dashboard_includes_recent_activity_timeline()
    {
        $warehouses = Warehouse::factory()->count(2)->create();

        Shipment::factory()->count(5)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('recentActivity')
            ->has('recentActivity.0', fn ($event) => $event->has('id')
                ->has('tracking_number')
                ->has('event_type')
                ->has('status')
                ->has('description')
                ->has('timestamp')
                ->has('recipient_name')
                ->has('service_type')
            )
        );
    }

    public function test_dashboard_includes_performance_metrics()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('performanceMetrics', fn ($metrics) => $metrics->has('on_time_delivery_rate')
            ->has('average_delivery_time')
            ->has('total_deliveries_this_month')
            ->has('total_deliveries_last_month')
            ->has('early_deliveries')
            ->has('on_time_deliveries')
            ->has('late_deliveries')
            ->has('performance_trend')
        )
        );
    }

    public function test_dashboard_includes_upcoming_deliveries()
    {
        $warehouses = Warehouse::factory()->count(2)->create();

        // Create shipments with future delivery dates
        Shipment::factory()->count(3)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'status' => 'in_transit',
            'estimated_delivery_date' => Carbon::now()->addDays(2),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('upcomingDeliveries')
            ->has('upcomingDeliveries.0', fn ($delivery) => $delivery->has('tracking_number')
                ->has('recipient_name')
                ->has('estimated_delivery_date')
                ->has('priority')
                ->has('service_type')
            )
        );
    }

    public function test_non_customer_user_cannot_access_dashboard()
    {
        $adminUser = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($adminUser)
            ->get('/customer/dashboard');

        $response->assertRedirect('/admin/dashboard');
    }

    public function test_unauthenticated_user_redirected_to_login()
    {
        $response = $this->get('/customer/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_customer_without_customer_record_sees_no_access()
    {
        $userWithoutCustomer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($userWithoutCustomer)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Dashboard/NoAccess')
        );
    }

    public function test_dashboard_performance_metrics_calculation()
    {
        $warehouses = Warehouse::factory()->count(2)->create();

        // Create delivered shipments for current month
        Shipment::factory()->count(10)->create([
            'customer_id' => $this->customer->id,
            'status' => 'delivered',
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_at' => Carbon::now()->startOfMonth()->addDays(5),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('performanceMetrics', fn ($metrics) => $metrics->where('total_deliveries_this_month', 10)
            ->whereType('on_time_delivery_rate', 'double')
            ->whereType('average_delivery_time', 'integer')
            ->whereIn('performance_trend', ['up', 'down', 'stable'])
        )
        );
    }

    public function test_dashboard_handles_empty_data_gracefully()
    {
        // Customer with no shipments
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('stats', fn ($stats) => $stats->where('total_shipments', 0)
            ->where('active_shipments', 0)
            ->where('delivered_shipments', 0)
            ->where('pending_shipments', 0)
        )
            ->has('recentShipments', 0)
            ->has('activeShipments', 0)
            ->has('recentActivity')
            ->has('upcomingDeliveries', 0)
        );
    }
}
