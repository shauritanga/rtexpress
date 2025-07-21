<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Carbon\Carbon;

class AnalyticsTest extends TestCase
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

    public function test_customer_can_access_analytics_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Analytics/Index')
                ->has('customer')
                ->has('volumeData')
                ->has('costData')
                ->has('performanceMetrics')
                ->has('totalShipments')
                ->has('averageMonthlyGrowth')
                ->has('totalSpent')
                ->has('averageCostPerShipment')
                ->has('totalSavings')
        );
    }

    public function test_analytics_includes_volume_data()
    {
        $warehouses = Warehouse::factory()->count(2)->create();
        
        // Create shipments across different months
        Shipment::factory()->count(10)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_at' => Carbon::now()->subMonth(),
            'service_type' => 'express',
        ]);

        Shipment::factory()->count(15)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_at' => Carbon::now(),
            'service_type' => 'standard',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('volumeData')
                ->has('volumeData.0', fn ($data) => 
                    $data->has('period')
                        ->has('shipments')
                        ->has('growth_rate')
                        ->has('service_breakdown', fn ($breakdown) => 
                            $breakdown->has('express')
                                ->has('standard')
                                ->has('overnight')
                                ->has('international')
                        )
                )
        );
    }

    public function test_analytics_includes_cost_data()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('costData')
                ->has('costData.0', fn ($data) => 
                    $data->has('period')
                        ->has('total_cost')
                        ->has('cost_per_shipment')
                        ->has('savings_from_discounts')
                        ->has('service_costs', fn ($costs) => 
                            $costs->has('express')
                                ->has('standard')
                                ->has('overnight')
                                ->has('international')
                        )
                        ->has('cost_breakdown', fn ($breakdown) => 
                            $breakdown->has('shipping')
                                ->has('fuel_surcharge')
                                ->has('insurance')
                                ->has('customs')
                                ->has('other')
                        )
                )
        );
    }

    public function test_analytics_calculates_totals_correctly()
    {
        $warehouses = Warehouse::factory()->count(2)->create();
        
        Shipment::factory()->count(20)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'total_cost' => 100.00,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('totalShipments', 20)
                ->whereType('averageMonthlyGrowth', 'double')
                ->whereType('totalSpent', 'double')
                ->whereType('averageCostPerShipment', 'double')
                ->whereType('totalSavings', 'double')
        );
    }

    public function test_analytics_includes_performance_metrics()
    {
        $warehouses = Warehouse::factory()->count(2)->create();
        
        // Create delivered shipments
        Shipment::factory()->count(5)->create([
            'customer_id' => $this->customer->id,
            'status' => 'delivered',
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_at' => Carbon::now()->startOfMonth(),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('performanceMetrics', fn ($metrics) => 
                $metrics->has('on_time_delivery_rate')
                    ->has('average_delivery_time')
                    ->has('total_deliveries_this_month')
                    ->has('early_deliveries')
                    ->has('on_time_deliveries')
                    ->has('late_deliveries')
                    ->has('performance_trend')
                    ->has('customer_satisfaction_score')
            )
        );
    }

    public function test_non_customer_cannot_access_analytics()
    {
        $adminUser = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($adminUser)
            ->get('/customer/analytics');

        $response->assertRedirect('/admin/dashboard');
    }

    public function test_unauthenticated_user_redirected_from_analytics()
    {
        $response = $this->get('/customer/analytics');

        $response->assertRedirect('/login');
    }

    public function test_analytics_handles_no_shipments_gracefully()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('totalShipments', 0)
                ->where('averageMonthlyGrowth', 0)
                ->where('totalSpent', 0)
                ->where('averageCostPerShipment', 0)
                ->where('totalSavings', 0)
                ->has('volumeData')
                ->has('costData')
        );
    }

    public function test_volume_data_includes_service_breakdown()
    {
        $warehouses = Warehouse::factory()->count(2)->create();
        
        // Create shipments with different service types
        Shipment::factory()->count(5)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'service_type' => 'express',
            'created_at' => Carbon::now(),
        ]);

        Shipment::factory()->count(10)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'service_type' => 'standard',
            'created_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        
        // Find current month data
        $volumeData = $response->viewData('page')['props']['volumeData'];
        $currentMonthData = collect($volumeData)->last();
        
        $this->assertEquals(5, $currentMonthData['service_breakdown']['express']);
        $this->assertEquals(10, $currentMonthData['service_breakdown']['standard']);
    }

    public function test_cost_data_includes_proper_breakdown()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        
        $costData = $response->viewData('page')['props']['costData'];
        $this->assertNotEmpty($costData);
        
        foreach ($costData as $monthData) {
            $this->assertArrayHasKey('cost_breakdown', $monthData);
            $breakdown = $monthData['cost_breakdown'];
            
            $this->assertArrayHasKey('shipping', $breakdown);
            $this->assertArrayHasKey('fuel_surcharge', $breakdown);
            $this->assertArrayHasKey('insurance', $breakdown);
            $this->assertArrayHasKey('customs', $breakdown);
            $this->assertArrayHasKey('other', $breakdown);
            
            // Verify breakdown adds up to total cost
            $breakdownTotal = array_sum($breakdown);
            $this->assertEquals($monthData['total_cost'], $breakdownTotal, '', 0.01);
        }
    }

    public function test_growth_rate_calculation()
    {
        $warehouses = Warehouse::factory()->count(2)->create();
        
        // Create shipments for two consecutive months
        Shipment::factory()->count(10)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_at' => Carbon::now()->subMonth(),
        ]);

        Shipment::factory()->count(15)->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'created_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/analytics');

        $response->assertStatus(200);
        
        $volumeData = $response->viewData('page')['props']['volumeData'];
        $currentMonthData = collect($volumeData)->last();
        
        // Growth should be positive (15 vs 10 = 50% growth)
        $this->assertGreaterThan(0, $currentMonthData['growth_rate']);
    }
}
