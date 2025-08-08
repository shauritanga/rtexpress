<?php

namespace Tests\Feature\Customer;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomsManagementTest extends TestCase
{
    use RefreshDatabase;

    private $customer;

    private $customerUser;

    private $shipment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customerUser = $this->createCustomerUser([
            'email' => 'customer@test.com',
        ], [
            'email' => 'customer@test.com',
        ]);

        $this->customer = $this->customerUser->customer;

        $warehouses = Warehouse::factory()->count(2)->create();

        $this->shipment = Shipment::factory()->create([
            'customer_id' => $this->customer->id,
            'origin_warehouse_id' => $warehouses[0]->id,
            'destination_warehouse_id' => $warehouses[1]->id,
            'service_type' => 'international',
            'created_by' => $this->customerUser->id,
        ]);
    }

    public function test_customer_can_access_customs_management_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/customs');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Customer/Customs/Index')
            ->has('customer')
            ->has('customsStats')
            ->has('destinationCountry')
        );
    }

    public function test_customs_page_shows_customer_statistics()
    {
        // Create some international shipments for statistics
        Shipment::factory()->count(5)->create([
            'customer_id' => $this->customer->id,
            'service_type' => 'international',
            'created_by' => $this->customerUser->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/customs');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('customsStats.totalDocuments')
            ->has('customsStats.complianceRate')
            ->has('customsStats.averageDutyRate')
            ->has('customsStats.commonDestinations')
        );
    }

    public function test_customer_can_calculate_duty_and_tax()
    {
        $calculationData = [
            'item_value' => 100.00,
            'hs_code' => '6109',
            'destination_country' => 'CA',
            'origin_country' => 'US',
            'currency' => 'USD',
            'item_description' => 'Cotton T-shirt',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/calculate-duty-tax', $calculationData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'calculation' => [
                'itemValue',
                'dutyAmount',
                'taxAmount',
                'totalCharges',
                'totalCost',
                'breakdown' => [
                    'customsValue',
                    'dutyRate',
                    'taxRate',
                    'exemptions',
                    'tradeAgreements',
                ],
            ],
        ]);
    }

    public function test_duty_tax_calculation_validates_required_fields()
    {
        $invalidData = [
            'item_value' => -10, // Invalid negative value
            'hs_code' => '', // Missing HS code
            'destination_country' => 'INVALID', // Invalid country code
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/calculate-duty-tax', $invalidData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['item_value', 'hs_code', 'destination_country']);
    }

    public function test_customer_can_check_compliance()
    {
        $complianceData = [
            'item_description' => 'Electronic device with lithium battery',
            'item_category' => 'Electronics',
            'item_value' => 500.00,
            'destination_country' => 'CA',
            'origin_country' => 'US',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/check-compliance', $complianceData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'compliance' => [
                'status',
                'issues',
                'requiredDocuments',
                'additionalRequirements',
            ],
        ]);
    }

    public function test_compliance_check_detects_prohibited_items()
    {
        $prohibitedItemData = [
            'item_description' => 'Firearm for hunting',
            'destination_country' => 'CA',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/check-compliance', $prohibitedItemData);

        $response->assertStatus(200);

        $compliance = $response->json('compliance');
        $this->assertEquals('violation', $compliance['status']);
        $this->assertNotEmpty($compliance['issues']);

        // Check that at least one issue is about prohibited items
        $prohibitedIssues = array_filter($compliance['issues'], function ($issue) {
            return $issue['type'] === 'prohibited';
        });
        $this->assertNotEmpty($prohibitedIssues);
    }

    public function test_compliance_check_detects_restricted_items()
    {
        $restrictedItemData = [
            'item_description' => 'Lithium battery pack',
            'destination_country' => 'CA',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/check-compliance', $restrictedItemData);

        $response->assertStatus(200);

        $compliance = $response->json('compliance');
        $this->assertContains($compliance['status'], ['warning', 'violation']);
        $this->assertNotEmpty($compliance['issues']);
    }

    public function test_customer_can_save_customs_document()
    {
        $documentData = [
            'shipment_id' => $this->shipment->id,
            'document_type' => 'commercial_invoice',
            'document_data' => [
                'invoice_number' => 'INV-2024-001',
                'invoice_date' => '2024-01-15',
                'exporter_info' => [
                    'name' => 'Test Exporter',
                    'address' => '123 Export St, New York, NY',
                ],
                'importer_info' => [
                    'name' => 'Test Importer',
                    'address' => '456 Import Ave, Toronto, ON',
                ],
            ],
            'items' => [
                [
                    'description' => 'Cotton T-shirt',
                    'hs_code' => '6109',
                    'quantity' => 2,
                    'unit_value' => 25.00,
                    'total_value' => 50.00,
                ],
                [
                    'description' => 'Denim Jeans',
                    'hs_code' => '6203',
                    'quantity' => 1,
                    'unit_value' => 75.00,
                    'total_value' => 75.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/save-document', $documentData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Customs document saved successfully',
        ]);

        // Verify document was saved to shipment
        $this->shipment->refresh();
        $customsData = $this->shipment->customs_data;
        $this->assertNotNull($customsData);

        // Handle both array and JSON string cases
        if (is_string($customsData)) {
            $customsData = json_decode($customsData, true);
        }

        $this->assertIsArray($customsData);
        $this->assertCount(1, $customsData);
        $this->assertEquals('commercial_invoice', $customsData[0]['document_type']);
    }

    public function test_save_document_validates_required_fields()
    {
        $invalidData = [
            'shipment_id' => 999999, // Non-existent shipment
            'document_type' => 'invalid_type',
            'items' => [
                [
                    'description' => '', // Empty description
                    'hs_code' => '',
                    'quantity' => 0, // Invalid quantity
                    'unit_value' => -10, // Invalid value
                ],
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/save-document', $invalidData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'shipment_id',
            'document_type',
            'items.0.description',
            'items.0.hs_code',
            'items.0.quantity',
            'items.0.unit_value',
        ]);
    }

    public function test_customer_can_generate_document()
    {
        $documentData = [
            'document_type' => 'commercial_invoice',
            'document_data' => [
                'invoice_number' => 'INV-2024-001',
                'items' => [
                    [
                        'description' => 'Test Item',
                        'quantity' => 1,
                        'unit_value' => 50.00,
                    ],
                ],
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/generate-document', $documentData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Document generated successfully',
        ]);
        $response->assertJsonStructure(['document_url']);
    }

    public function test_customer_cannot_save_document_for_other_customers_shipment()
    {
        $otherCustomer = Customer::factory()->create();
        $otherShipment = Shipment::factory()->create([
            'customer_id' => $otherCustomer->id,
            'created_by' => $this->customerUser->id,
        ]);

        $documentData = [
            'shipment_id' => $otherShipment->id,
            'document_type' => 'commercial_invoice',
            'document_data' => ['test' => 'data'],
            'items' => [
                [
                    'description' => 'Test Item',
                    'hs_code' => '1234',
                    'quantity' => 1,
                    'unit_value' => 10.00,
                    'total_value' => 10.00,
                ],
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/save-document', $documentData);

        $response->assertStatus(500); // Should fail when trying to find shipment
    }

    public function test_duty_calculation_varies_by_country()
    {
        $baseData = [
            'item_value' => 100.00,
            'hs_code' => '6109',
            'origin_country' => 'US',
            'currency' => 'USD',
        ];

        // Test different destination countries
        $countries = ['CA', 'GB', 'AU'];
        $results = [];

        foreach ($countries as $country) {
            $response = $this->actingAs($this->customerUser)
                ->postJson('/api/customs/calculate-duty-tax', array_merge($baseData, [
                    'destination_country' => $country,
                ]));

            $response->assertStatus(200);
            $results[$country] = $response->json('calculation');
        }

        // Verify that different countries have different rates
        $this->assertNotEquals($results['CA']['dutyAmount'], $results['GB']['dutyAmount']);
    }

    public function test_hs_code_affects_duty_rates()
    {
        $baseData = [
            'item_value' => 100.00,
            'destination_country' => 'CA',
            'origin_country' => 'US',
            'currency' => 'TZS',
        ];

        // Test different HS codes
        $hsCodes = ['6109', '8517']; // Textiles vs Electronics
        $results = [];

        foreach ($hsCodes as $hsCode) {
            $response = $this->actingAs($this->customerUser)
                ->postJson('/api/customs/calculate-duty-tax', array_merge($baseData, [
                    'hs_code' => $hsCode,
                ]));

            $response->assertStatus(200);
            $results[$hsCode] = $response->json('calculation');
        }

        // Electronics (8517) should have lower duty than textiles (6109)
        $this->assertLessThan($results['6109']['dutyAmount'], $results['8517']['dutyAmount']);
    }

    public function test_high_value_items_require_additional_documents()
    {
        $highValueData = [
            'item_description' => 'Expensive electronics',
            'item_value' => 2000.00,
            'destination_country' => 'CA',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/check-compliance', $highValueData);

        $response->assertStatus(200);

        $compliance = $response->json('compliance');
        $this->assertContains('Insurance Certificate', $compliance['requiredDocuments']);
    }

    public function test_customs_page_with_specific_shipment()
    {
        $response = $this->actingAs($this->customerUser)
            ->get("/customer/customs?shipment_id={$this->shipment->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->has('currentShipment')
            ->where('currentShipment.id', $this->shipment->id)
        );
    }

    public function test_unauthenticated_user_cannot_access_customs_apis()
    {
        $response = $this->postJson('/api/customs/calculate-duty-tax', []);
        $response->assertStatus(401);

        $response = $this->postJson('/api/customs/check-compliance', []);
        $response->assertStatus(401);

        $response = $this->postJson('/api/customs/save-document', []);
        $response->assertStatus(401);

        $response = $this->postJson('/api/customs/generate-document', []);
        $response->assertStatus(401);
    }

    public function test_non_customer_user_cannot_access_customs_page()
    {
        $nonCustomerUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/customs');

        $response->assertRedirect('/login');
    }

    public function test_multiple_documents_can_be_saved_to_shipment()
    {
        // Save first document
        $firstDoc = [
            'shipment_id' => $this->shipment->id,
            'document_type' => 'commercial_invoice',
            'document_data' => ['invoice_number' => 'INV-001'],
            'items' => [
                [
                    'description' => 'Item 1',
                    'hs_code' => '1234',
                    'quantity' => 1,
                    'unit_value' => 10.00,
                    'total_value' => 10.00,
                ],
            ],
        ];

        $response1 = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/save-document', $firstDoc);
        $response1->assertStatus(200);

        // Save second document
        $secondDoc = [
            'shipment_id' => $this->shipment->id,
            'document_type' => 'packing_list',
            'document_data' => ['list_number' => 'PL-001'],
            'items' => [
                [
                    'description' => 'Item 2',
                    'hs_code' => '5678',
                    'quantity' => 2,
                    'unit_value' => 20.00,
                    'total_value' => 40.00,
                ],
            ],
        ];

        $response2 = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/save-document', $secondDoc);
        $response2->assertStatus(200);

        // Verify both documents are saved
        $this->shipment->refresh();
        $customsData = $this->shipment->customs_data;

        // Handle both array and JSON string cases
        if (is_string($customsData)) {
            $customsData = json_decode($customsData, true);
        }

        $this->assertCount(2, $customsData);
        $this->assertEquals('commercial_invoice', $customsData[0]['document_type']);
        $this->assertEquals('packing_list', $customsData[1]['document_type']);
    }

    public function test_compliance_check_handles_multiple_issues()
    {
        $complexItemData = [
            'item_description' => 'Medical device with lithium battery and food components',
            'item_value' => 1500.00,
            'destination_country' => 'CA',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/check-compliance', $complexItemData);

        $response->assertStatus(200);

        $compliance = $response->json('compliance');
        $this->assertGreaterThan(1, count($compliance['issues']));
        $this->assertNotEmpty($compliance['additionalRequirements']);
    }

    public function test_document_generation_supports_all_types()
    {
        $documentTypes = ['commercial_invoice', 'customs_declaration', 'certificate_origin', 'packing_list'];

        foreach ($documentTypes as $type) {
            $response = $this->actingAs($this->customerUser)
                ->postJson('/api/customs/generate-document', [
                    'document_type' => $type,
                    'document_data' => ['test' => 'data'],
                ]);

            $response->assertStatus(200);
            $response->assertJson(['success' => true]);
        }
    }

    public function test_customs_integration_workflow()
    {
        // Complete workflow: compliance check, duty calculation, document creation

        // Step 1: Check compliance
        $complianceResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/check-compliance', [
                'item_description' => 'Cotton clothing',
                'destination_country' => 'CA',
            ]);
        $complianceResponse->assertStatus(200);

        // Step 2: Calculate duty and tax
        $calculationResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/calculate-duty-tax', [
                'item_value' => 100.00,
                'hs_code' => '6109',
                'destination_country' => 'CA',
            ]);
        $calculationResponse->assertStatus(200);

        // Step 3: Save customs document
        $documentResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/save-document', [
                'shipment_id' => $this->shipment->id,
                'document_type' => 'commercial_invoice',
                'document_data' => ['invoice_number' => 'INV-WORKFLOW-001'],
                'items' => [
                    [
                        'description' => 'Cotton T-shirt',
                        'hs_code' => '6109',
                        'quantity' => 1,
                        'unit_value' => 100.00,
                        'total_value' => 100.00,
                    ],
                ],
            ]);
        $documentResponse->assertStatus(200);

        // Step 4: Generate document
        $generateResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/customs/generate-document', [
                'document_type' => 'commercial_invoice',
                'document_data' => ['invoice_number' => 'INV-WORKFLOW-001'],
            ]);
        $generateResponse->assertStatus(200);

        // Verify all steps completed successfully
        $this->assertTrue($complianceResponse->json('success'));
        $this->assertTrue($calculationResponse->json('success'));
        $this->assertTrue($documentResponse->json('success'));
        $this->assertTrue($generateResponse->json('success'));

        $this->assertTrue(true, 'Phase 7 customs management integration workflow completed successfully!');
    }
}
