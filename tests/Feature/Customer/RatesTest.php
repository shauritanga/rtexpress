<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RatesTest extends TestCase
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

    public function test_customer_can_access_rates_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/rates');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Rates/Index')
            ->has('customer')
            ->has('savingsThisMonth')
            ->has('averageDiscount')
        );
    }

    public function test_rates_page_shows_customer_statistics()
    {
        // Create some shipments for statistics
        Shipment::factory()->count(5)->create([
            'customer_id' => $this->customer->id,
            'total_cost' => 25.99,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/rates');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->where('customer.total_shipments', 5)
            ->where('customer.total_spend', 129.95)
            ->has('customer.loyalty_tier')
        );
    }

    public function test_customer_can_calculate_rates()
    {
        $rateData = [
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
                'weight' => 5.0,
                'length' => 12,
                'width' => 10,
                'height' => 8,
                'declaredValue' => 100.00,
                'packageType' => 'package',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $rateData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'rates' => [
                '*' => [
                    'id',
                    'service',
                    'serviceType',
                    'price',
                    'transitTime',
                    'deliveryDate',
                    'features',
                    'icon',
                ],
            ],
            'calculation_id',
            'valid_until',
        ]);
    }

    public function test_rate_calculation_validates_required_fields()
    {
        $invalidData = [
            'origin' => [
                'zipCode' => '', // Missing required field
                'country' => 'US',
            ],
            'destination' => [
                'zipCode' => '90210',
                'country' => 'US',
            ],
            'packageDetails' => [
                'weight' => 0, // Invalid weight
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $invalidData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['origin.zipCode', 'packageDetails.weight']);
    }

    public function test_rates_include_customer_discounts()
    {
        // Create shipments to qualify for volume discount
        Shipment::factory()->count(30)->create([
            'customer_id' => $this->customer->id,
            'created_at' => now()->subDays(15), // This month
        ]);

        $rateData = [
            'origin' => [
                'zipCode' => '10001',
                'country' => 'US',
                'residential' => false,
            ],
            'destination' => [
                'zipCode' => '90210',
                'country' => 'US',
                'residential' => false,
            ],
            'packageDetails' => [
                'weight' => 2.0,
                'length' => 10,
                'width' => 8,
                'height' => 6,
                'declaredValue' => 50.00,
                'packageType' => 'package',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $rateData);

        $response->assertStatus(200);

        $rates = $response->json('rates');
        $this->assertNotEmpty($rates);

        // Check that discounts are applied
        foreach ($rates as $rate) {
            if (isset($rate['originalPrice']) && isset($rate['price'])) {
                $this->assertLessThan($rate['originalPrice'], $rate['price']);
            }
        }
    }

    public function test_international_rates_have_higher_costs()
    {
        $domesticData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US', 'residential' => false],
            'destination' => ['zipCode' => '90210', 'country' => 'US', 'residential' => false],
            'packageDetails' => [
                'weight' => 2.0, 'length' => 10, 'width' => 8, 'height' => 6,
                'declaredValue' => 50.00, 'packageType' => 'package',
            ],
        ];

        $internationalData = $domesticData;
        $internationalData['destination']['country'] = 'CA';

        $domesticResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $domesticData);

        $internationalResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $internationalData);

        $domesticResponse->assertStatus(200);
        $internationalResponse->assertStatus(200);

        $domesticRates = $domesticResponse->json('rates');
        $internationalRates = $internationalResponse->json('rates');

        // International rates should be higher
        $domesticStandardPrice = collect($domesticRates)->firstWhere('serviceType', 'standard')['price'];
        $internationalStandardPrice = collect($internationalRates)->firstWhere('serviceType', 'standard')['price'];

        $this->assertGreaterThan($domesticStandardPrice, $internationalStandardPrice);
    }

    public function test_customer_can_apply_discount_code()
    {
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
        $response->assertJson([
            'success' => true,
            'message' => 'Discount applied successfully',
        ]);
        $response->assertJsonStructure([
            'discount' => [
                'id',
                'type',
                'title',
                'discountPercent',
            ],
        ]);
    }

    public function test_invalid_discount_code_returns_error()
    {
        $discountData = [
            'code' => 'INVALID123',
            'shipment_data' => [
                'service' => 'standard',
                'cost' => 25.99,
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/apply-discount', $discountData);

        $response->assertStatus(400);
        $response->assertJson([
            'success' => false,
            'message' => 'Invalid or expired discount code',
        ]);
    }

    public function test_customer_can_get_optimization_suggestions()
    {
        $optimizationData = [
            'shipment_data' => [
                'service' => 'express',
                'cost' => 29.99,
                'weight' => 3.0,
                'dimensions' => [12, 10, 8],
                'destination' => 'domestic',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/optimizations', $optimizationData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'suggestions' => [
                '*' => [
                    'id',
                    'type',
                    'title',
                    'description',
                    'savings',
                    'effort',
                    'impact',
                ],
            ],
        ]);
    }

    public function test_loyalty_tier_calculation()
    {
        // Test different spend levels
        $testCases = [
            ['spend' => 500, 'expected_tier' => 'bronze'],
            ['spend' => 1500, 'expected_tier' => 'silver'],
            ['spend' => 3000, 'expected_tier' => 'gold'],
            ['spend' => 6000, 'expected_tier' => 'platinum'],
        ];

        foreach ($testCases as $case) {
            // Create shipments with specific total cost
            Shipment::where('customer_id', $this->customer->id)->delete(); // Clear previous shipments

            $shipmentCount = ceil($case['spend'] / 25); // $25 per shipment
            for ($i = 0; $i < $shipmentCount; $i++) {
                Shipment::factory()->create([
                    'customer_id' => $this->customer->id,
                    'total_cost' => 25.00,
                    'tracking_number' => 'RT-TEST-'.uniqid().'-'.$i,
                ]);
            }

            $response = $this->actingAs($this->customerUser)
                ->get('/customer/rates');

            $response->assertStatus(200);
            $response->assertInertia(fn ($page) => $page->where('customer.loyalty_tier', $case['expected_tier'])
            );
        }
    }

    public function test_residential_surcharge_applied()
    {
        $businessData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US', 'residential' => false],
            'destination' => ['zipCode' => '90210', 'country' => 'US', 'residential' => false],
            'packageDetails' => [
                'weight' => 2.0, 'length' => 10, 'width' => 8, 'height' => 6,
                'declaredValue' => 50.00, 'packageType' => 'package',
            ],
        ];

        $residentialData = $businessData;
        $residentialData['destination']['residential'] = true;

        $businessResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $businessData);

        $residentialResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/calculate', $residentialData);

        $businessResponse->assertStatus(200);
        $residentialResponse->assertStatus(200);

        $businessRates = $businessResponse->json('rates');
        $residentialRates = $residentialResponse->json('rates');

        // Residential rates should be higher due to surcharge
        $businessStandardPrice = collect($businessRates)->firstWhere('serviceType', 'standard')['price'];
        $residentialStandardPrice = collect($residentialRates)->firstWhere('serviceType', 'standard')['price'];

        $this->assertGreaterThan($businessStandardPrice, $residentialStandardPrice);
    }

    public function test_unauthenticated_user_cannot_access_rates_api()
    {
        $rateData = [
            'origin' => ['zipCode' => '10001', 'country' => 'US'],
            'destination' => ['zipCode' => '90210', 'country' => 'US'],
            'packageDetails' => ['weight' => 2.0, 'length' => 10, 'width' => 8, 'height' => 6],
        ];

        $response = $this->postJson('/api/rates/calculate', $rateData);
        $response->assertStatus(401);

        $response = $this->postJson('/api/rates/apply-discount', ['code' => 'TEST']);
        $response->assertStatus(401);

        $response = $this->postJson('/api/rates/optimizations', ['shipment_data' => []]);
        $response->assertStatus(401);
    }

    public function test_non_customer_user_cannot_access_rates()
    {
        $nonCustomerUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/rates');

        $response->assertRedirect('/login');
    }

    public function test_rate_calculation_includes_all_service_types()
    {
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
        $serviceTypes = collect($rates)->pluck('serviceType')->toArray();

        $expectedServices = ['economy', 'standard', 'express', 'overnight'];
        foreach ($expectedServices as $service) {
            $this->assertContains($service, $serviceTypes);
        }
    }

    public function test_rates_have_proper_pricing_order()
    {
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

        $rates = collect($response->json('rates'));

        $economyPrice = $rates->firstWhere('serviceType', 'economy')['price'];
        $standardPrice = $rates->firstWhere('serviceType', 'standard')['price'];
        $expressPrice = $rates->firstWhere('serviceType', 'express')['price'];
        $overnightPrice = $rates->firstWhere('serviceType', 'overnight')['price'];

        // Prices should increase with service level
        $this->assertLessThan($standardPrice, $economyPrice);
        $this->assertLessThan($expressPrice, $standardPrice);
        $this->assertLessThan($overnightPrice, $expressPrice);
    }

    public function test_rate_features_are_service_appropriate()
    {
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

        $rates = collect($response->json('rates'));

        // Check that overnight service has appropriate features
        $overnightRate = $rates->firstWhere('serviceType', 'overnight');
        $this->assertContains('Next day delivery', $overnightRate['features']);
        $this->assertTrue($overnightRate['guaranteed']);

        // Check that economy service has eco-friendly badge
        $economyRate = $rates->firstWhere('serviceType', 'economy');
        $this->assertTrue($economyRate['eco']);

        // Check that standard service is marked as popular
        $standardRate = $rates->firstWhere('serviceType', 'standard');
        $this->assertTrue($standardRate['popular']);
    }

    public function test_discount_validation_requires_code()
    {
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/apply-discount', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['code']);
    }

    public function test_optimization_validation_requires_shipment_data()
    {
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/rates/optimizations', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['shipment_data']);
    }
}
