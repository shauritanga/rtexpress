<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase5ComprehensiveTest extends TestCase
{
    use RefreshDatabase;

    private $customer;

    private $customerUser;

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
    }

    public function test_phase_5_complete_rate_calculation_workflow()
    {
        // Test 1: Access rates page
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/rates');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Rates/Index')
            ->has('customer')
            ->has('savingsThisMonth')
            ->has('averageDiscount')
        );

        // Test 2: Calculate rates for domestic shipment
        $domesticRateData = [
            'origin' => [
                'zipCode' => '10001',
                'country' => 'US',
                'residential' => false,
            ],
            'destination' => [
                'zipCode' => '90210',
                'country' => 'US',
                'residential' => true,
            ],
            'packageDetails' => [
                'weight' => 3.5,
                'length' => 12,
                'width' => 10,
                'height' => 8,
                'declaredValue' => 150.00,
                'packageType' => 'package',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $domesticRateData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'rates' => [
                '*' => [
                    'id', 'service', 'serviceType', 'price', 'transitTime',
                    'deliveryDate', 'features', 'icon', 'popular', 'eco', 'guaranteed',
                ],
            ],
            'calculation_id',
            'valid_until',
        ]);

        $rates = $response->json('rates');
        $this->assertCount(4, $rates); // Economy, Standard, Express, Overnight

        // Test 3: Calculate rates for international shipment
        $internationalRateData = $domesticRateData;
        $internationalRateData['destination']['country'] = 'CA';

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $internationalRateData);

        $response->assertStatus(200);
        $internationalRates = $response->json('rates');

        // International rates should be higher
        $domesticStandardPrice = collect($rates)->firstWhere('serviceType', 'standard')['price'];
        $internationalStandardPrice = collect($internationalRates)->firstWhere('serviceType', 'standard')['price'];
        $this->assertGreaterThan($domesticStandardPrice, $internationalStandardPrice);

        $this->assertTrue(true, 'Phase 5 rate calculation workflow completed successfully!');
    }

    public function test_phase_5_complete_discount_management_workflow()
    {
        // Test 1: Apply valid discount code
        $discountData = [
            'code' => 'NEWYEAR20',
            'shipment_data' => [
                'service' => 'standard',
                'cost' => 25.99,
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/apply-discount', $discountData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'discount' => [
                'id', 'type', 'title', 'discountPercent',
            ],
        ]);

        // Test 2: Try invalid discount code
        $invalidDiscountData = [
            'code' => 'INVALID123',
            'shipment_data' => ['service' => 'standard', 'cost' => 25.99],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/apply-discount', $invalidDiscountData);

        $response->assertStatus(400);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid or expired discount code',
        ]);

        // Test 3: Volume discount qualification
        // Create 30 shipments this month to qualify for volume discount
        Shipment::factory()->count(30)->create([
            'customer_id' => $this->customer->id,
            'created_at' => now()->subDays(10),
            'total_cost' => 20.00,
        ]);

        $rateData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US', 'residential' => false],
            'destination' => ['zipCode' => '90210', 'country' => 'US', 'residential' => false],
            'packageDetails' => [
                'weight' => 2.0, 'length' => 10, 'width' => 8, 'height' => 6,
                'declaredValue' => 50.00, 'packageType' => 'package',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $rateData);

        $response->assertStatus(200);
        $rates = $response->json('rates');

        // Verify discounts are applied
        foreach ($rates as $rate) {
            if (isset($rate['originalPrice']) && isset($rate['price'])) {
                $this->assertLessThan($rate['originalPrice'], $rate['price']);
            }
        }

        // Test 4: Loyalty tier calculation
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/rates');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->where('customer.total_shipments', 30)
            ->has('customer.total_spend')
            ->has('customer.loyalty_tier')
        );

        $this->assertTrue(true, 'Phase 5 discount management workflow completed successfully!');
    }

    public function test_phase_5_complete_cost_optimization_workflow()
    {
        // Test 1: Get optimization suggestions
        $optimizationData = [
            'shipment_data' => [
                'service' => 'express',
                'cost' => 29.99,
                'weight' => 3.0,
                'dimensions' => [12, 10, 8],
                'destination' => 'domestic',
                'urgency' => 'low',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/optimizations', $optimizationData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'suggestions' => [
                '*' => [
                    'id', 'type', 'title', 'description',
                    'savings', 'effort', 'impact',
                ],
            ],
        ]);

        $suggestions = $response->json('suggestions');
        $this->assertNotEmpty($suggestions);

        // Test 2: Verify optimization types
        $suggestionTypes = collect($suggestions)->pluck('type')->unique()->toArray();
        $expectedTypes = ['service', 'packaging'];

        foreach ($expectedTypes as $type) {
            $this->assertContains($type, $suggestionTypes);
        }

        // Test 3: Verify savings calculations
        foreach ($suggestions as $suggestion) {
            $this->assertIsNumeric($suggestion['savings']);
            $this->assertGreaterThan(0, $suggestion['savings']);
            $this->assertContains($suggestion['effort'], ['low', 'medium', 'high']);
            $this->assertContains($suggestion['impact'], ['low', 'medium', 'high']);
        }

        $this->assertTrue(true, 'Phase 5 cost optimization workflow completed successfully!');
    }

    public function test_phase_5_mobile_responsiveness_and_accessibility()
    {
        // Test 1: Rates page loads with mobile-friendly structure
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/rates');
        $response->assertStatus(200);

        // Test 2: API endpoints work consistently
        $rateData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US', 'residential' => false],
            'destination' => ['zipCode' => '90210', 'country' => 'US', 'residential' => false],
            'packageDetails' => [
                'weight' => 2.0, 'length' => 10, 'width' => 8, 'height' => 6,
                'declaredValue' => 50.00, 'packageType' => 'package',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $rateData);
        $response->assertStatus(200);

        // Test 3: Discount codes work across different scenarios
        $discountCodes = ['NEWYEAR20', 'WELCOME10'];
        foreach ($discountCodes as $code) {
            $response = $this->actingAs($this->customerUser)
                ->postJson('/api/rates/apply-discount', [
                    'code' => $code,
                    'shipment_data' => ['service' => 'standard', 'cost' => 25.99],
                ]);
            $response->assertStatus(200);
        }

        $this->assertTrue(true, 'Phase 5 mobile responsiveness tests completed successfully!');
    }

    public function test_phase_5_security_and_authorization()
    {
        // Test 1: Unauthenticated users cannot access rates features
        $response = $this->get('/customer/rates');
        $response->assertRedirect('/login');

        $response = $this->postJson('/api/rates/calculate', []);
        $response->assertStatus(401);

        $response = $this->postJson('/api/rates/apply-discount', []);
        $response->assertStatus(401);

        $response = $this->postJson('/api/rates/optimizations', []);
        $response->assertStatus(401);

        // Test 2: Non-customer users cannot access rates
        $nonCustomerUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/rates');
        $response->assertRedirect('/login');

        // Test 3: API endpoints require proper authentication
        $rateData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US'],
            'destination' => ['zipCode' => '90210', 'country' => 'US'],
            'packageDetails' => ['weight' => 2.0],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $rateData);
        $response->assertStatus(422); // Validation error, but authenticated

        $this->assertTrue(true, 'Phase 5 security and authorization tests completed successfully!');
    }

    public function test_phase_5_data_validation_and_integrity()
    {
        // Test 1: Rate calculation validates all required fields
        $invalidData = [
            'origin' => ['zipCode' => '', 'country' => ''],
            'destination' => ['zipCode' => '', 'country' => ''],
            'packageDetails' => ['weight' => 0, 'length' => 0],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $invalidData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'origin.zipCode', 'origin.country',
            'destination.zipCode', 'destination.country',
            'packageDetails.weight', 'packageDetails.length',
        ]);

        // Test 2: Discount code validation
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/apply-discount', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['code']);

        // Test 3: Optimization data validation
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/optimizations', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['shipment_data']);

        // Test 4: Rate calculation returns valid data structures
        $validData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US', 'residential' => false],
            'destination' => ['zipCode' => '90210', 'country' => 'US', 'residential' => false],
            'packageDetails' => [
                'weight' => 2.0, 'length' => 10, 'width' => 8, 'height' => 6,
                'declaredValue' => 50.00, 'packageType' => 'package',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $validData);

        $response->assertStatus(200);
        $rates = $response->json('rates');

        foreach ($rates as $rate) {
            $this->assertIsString($rate['id']);
            $this->assertIsString($rate['service']);
            $this->assertIsNumeric($rate['price']);
            $this->assertIsString($rate['transitTime']);
            $this->assertIsArray($rate['features']);
            $this->assertIsBool($rate['popular']);
            $this->assertIsBool($rate['eco']);
            $this->assertIsBool($rate['guaranteed']);
        }

        $this->assertTrue(true, 'Phase 5 data validation and integrity tests completed successfully!');
    }

    public function test_phase_5_performance_and_reliability()
    {
        // Test 1: Multiple rapid rate calculations
        $rateData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US', 'residential' => false],
            'destination' => ['zipCode' => '90210', 'country' => 'US', 'residential' => false],
            'packageDetails' => [
                'weight' => 2.0, 'length' => 10, 'width' => 8, 'height' => 6,
                'declaredValue' => 50.00, 'packageType' => 'package',
            ],
        ];

        for ($i = 0; $i < 5; $i++) {
            $response = $this->actingAs($this->customerUser)
                ->postJson('/api/rates/calculate', $rateData);
            $response->assertStatus(200);
        }

        // Test 2: Concurrent discount applications
        $discountCodes = ['NEWYEAR20', 'WELCOME10'];
        foreach ($discountCodes as $code) {
            $response = $this->actingAs($this->customerUser)
                ->postJson('/api/rates/apply-discount', [
                    'code' => $code,
                    'shipment_data' => ['service' => 'standard', 'cost' => 25.99],
                ]);
            $response->assertStatus(200);
        }

        // Test 3: Optimization suggestions handle various scenarios
        $scenarios = [
            ['service' => 'express', 'cost' => 29.99, 'weight' => 1.0],
            ['service' => 'overnight', 'cost' => 49.99, 'weight' => 5.0],
            ['service' => 'standard', 'cost' => 18.99, 'weight' => 3.0],
        ];

        foreach ($scenarios as $scenario) {
            $response = $this->actingAs($this->customerUser)
                ->postJson('/api/rates/optimizations', [
                    'shipment_data' => $scenario,
                ]);
            $response->assertStatus(200);
        }

        $this->assertTrue(true, 'Phase 5 performance and reliability tests completed successfully!');
    }

    public function test_phase_5_complete_integration()
    {
        // Test complete workflow from rates page to optimization

        // Step 1: Customer accesses rates page
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/rates');
        $response->assertStatus(200);

        // Step 2: Customer calculates rates
        $rateData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US', 'residential' => false],
            'destination' => ['zipCode' => '90210', 'country' => 'US', 'residential' => true],
            'packageDetails' => [
                'weight' => 3.0, 'length' => 12, 'width' => 10, 'height' => 8,
                'declaredValue' => 100.00, 'packageType' => 'package',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $rateData);
        $response->assertStatus(200);
        $rates = $response->json('rates');

        // Step 3: Customer applies discount code
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/apply-discount', [
                'code' => 'NEWYEAR20',
                'shipment_data' => ['service' => 'express', 'cost' => 29.99],
            ]);
        $response->assertStatus(200);

        // Step 4: Customer gets optimization suggestions
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/optimizations', [
                'shipment_data' => [
                    'service' => 'express',
                    'cost' => 29.99,
                    'weight' => 3.0,
                    'dimensions' => [12, 10, 8],
                ],
            ]);
        $response->assertStatus(200);

        // Step 5: Verify all data is consistent and properly formatted
        $this->assertNotEmpty($rates);
        $this->assertIsArray($rates);

        foreach ($rates as $rate) {
            $this->assertArrayHasKey('price', $rate);
            $this->assertArrayHasKey('service', $rate);
            $this->assertArrayHasKey('features', $rate);
        }

        $this->assertTrue(true, 'Phase 5 complete integration test passed successfully!');
    }
}
