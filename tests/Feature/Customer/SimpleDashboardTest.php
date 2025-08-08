<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimpleDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_dashboard_loads_successfully()
    {
        // Create customer and user following the existing pattern
        $customer = Customer::factory()->create([
            'email' => 'customer@test.com',
        ]);

        $user = User::factory()->create([
            'email' => 'customer@test.com',
            'customer_id' => $customer->id,
        ]);

        $response = $this->actingAs($user)
            ->get('/customer/dashboard');

        $response->assertStatus(200);
    }

    public function test_analytics_page_loads_successfully()
    {
        // Create customer and user following the existing pattern
        $customer = Customer::factory()->create([
            'email' => 'customer@test.com',
        ]);

        $user = User::factory()->create([
            'email' => 'customer@test.com',
            'customer_id' => $customer->id,
        ]);

        $response = $this->actingAs($user)
            ->get('/customer/analytics');

        $response->assertStatus(200);
    }

    public function test_notifications_page_loads_successfully()
    {
        // Create customer and user following the existing pattern
        $customer = Customer::factory()->create([
            'email' => 'customer@test.com',
        ]);

        $user = User::factory()->create([
            'email' => 'customer@test.com',
            'customer_id' => $customer->id,
        ]);

        $response = $this->actingAs($user)
            ->get('/customer/notifications');

        $response->assertStatus(200);
    }
}
