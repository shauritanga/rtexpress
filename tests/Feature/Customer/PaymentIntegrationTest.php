<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Warehouse;
use App\Services\PaymentGatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Mockery;

class PaymentIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private $customer;
    private $customerUser;
    private $invoice;
    private $paymentServiceMock;

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

        // Create invoice manually to avoid factory issues
        $this->invoice = new Invoice([
            'invoice_number' => 'INV-TEST-001',
            'customer_id' => $this->customer->id,
            'status' => 'sent',
            'currency' => 'USD',
            'subtotal' => 150.00,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 150.00,
            'paid_amount' => 0,
            'balance_due' => 150.00,
            'issue_date' => now(),
            'due_date' => now()->addDays(30),
            'payment_terms' => 'Net 30',
        ]);
        $this->invoice->save();

        // Mock the payment service
        $this->paymentServiceMock = Mockery::mock(PaymentGatewayService::class);
        $this->app->instance(PaymentGatewayService::class, $this->paymentServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_customer_can_access_payments_page()
    {
        $response = $this->actingAs($this->customerUser)
            ->get('/customer/payments');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Customer/Payments/Index')
                ->has('customer')
                ->has('paymentStats')
                ->has('recentInvoices')
                ->has('paymentMethods')
        );
    }

    public function test_payments_page_shows_customer_statistics()
    {
        // Create some payments for statistics manually
        for ($i = 0; $i < 5; $i++) {
            Payment::create([
                'payment_number' => 'PAY-TEST-' . ($i + 1),
                'invoice_id' => $this->invoice->id,
                'customer_id' => $this->customer->id,
                'status' => 'completed',
                'type' => 'full',
                'method' => 'card',
                'currency' => 'USD',
                'amount' => 100.00,
                'fee_amount' => 3.20,
                'net_amount' => 96.80,
                'gateway' => 'stripe',
                'payment_date' => now(),
            ]);
        }

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/payments');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('paymentStats.totalPayments')
                ->has('paymentStats.totalAmount')
                ->has('paymentStats.successRate')
                ->has('paymentStats.averagePayment')
        );
    }

    public function test_customer_can_get_payment_methods()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/methods');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'payment_methods' => [
                '*' => [
                    'id',
                    'type',
                    'gateway',
                    'name',
                    'details',
                    'is_default',
                    'is_verified',
                    'created_at',
                ]
            ],
        ]);
    }

    public function test_customer_can_add_payment_method()
    {
        $paymentMethodData = [
            'gateway' => 'stripe',
            'method_type' => 'card',
            'details' => [
                'last4' => '4242',
                'brand' => 'visa',
                'expiry' => '12/25',
            ],
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/payments/methods', $paymentMethodData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'payment_method' => [
                'id',
                'type',
                'gateway',
                'name',
                'details',
                'is_default',
                'is_verified',
                'created_at',
            ],
            'message',
        ]);
    }

    public function test_add_payment_method_validates_required_fields()
    {
        $invalidData = [
            'gateway' => 'invalid_gateway',
            'method_type' => '',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/payments/methods', $invalidData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gateway', 'method_type']);
    }

    public function test_customer_can_remove_payment_method()
    {
        $methodId = 'pm_test_123';

        $response = $this->actingAs($this->customerUser)
            ->deleteJson("/api/payments/methods/{$methodId}");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Payment method removed successfully',
        ]);
    }

    public function test_customer_can_set_default_payment_method()
    {
        $methodId = 'pm_test_123';

        $response = $this->actingAs($this->customerUser)
            ->putJson("/api/payments/methods/{$methodId}/default");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Default payment method updated successfully',
        ]);
    }

    public function test_customer_can_get_invoices()
    {
        // Create additional invoices manually
        for ($i = 0; $i < 3; $i++) {
            Invoice::create([
                'invoice_number' => 'INV-TEST-' . ($i + 2),
                'customer_id' => $this->customer->id,
                'status' => 'sent',
                'currency' => 'USD',
                'subtotal' => 100.00,
                'tax_amount' => 10.00,
                'discount_amount' => 0,
                'total_amount' => 110.00,
                'paid_amount' => 0,
                'balance_due' => 110.00,
                'issue_date' => now(),
                'due_date' => now()->addDays(30),
                'payment_terms' => 'Net 30',
            ]);
        }

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/invoices');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'invoices' => [
                'data' => [
                    '*' => [
                        'id',
                        'invoice_number',
                        'status',
                        'total_amount',
                        'balance_due',
                        'issue_date',
                        'due_date',
                    ]
                ],
                'meta',
                'links',
            ],
        ]);
    }

    public function test_customer_can_filter_invoices()
    {
        // Create invoices with different statuses
        Invoice::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'paid',
        ]);
        Invoice::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'overdue',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/invoices?status=paid');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        
        $invoices = $response->json('invoices.data');
        foreach ($invoices as $invoice) {
            $this->assertEquals('paid', $invoice['status']);
        }
    }

    public function test_customer_can_search_invoices()
    {
        $searchableInvoice = Invoice::factory()->create([
            'customer_id' => $this->customer->id,
            'invoice_number' => 'INV-SEARCH-123',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/invoices?search=SEARCH');

        $response->assertStatus(200);
        $invoices = $response->json('invoices.data');
        
        $this->assertCount(1, $invoices);
        $this->assertEquals('INV-SEARCH-123', $invoices[0]['invoice_number']);
    }

    public function test_customer_can_get_payment_history()
    {
        // Create payment history
        Payment::factory()->count(5)->create([
            'customer_id' => $this->customer->id,
            'invoice_id' => $this->invoice->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/history');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'payments' => [
                'data' => [
                    '*' => [
                        'id',
                        'payment_number',
                        'amount',
                        'status',
                        'method',
                        'gateway',
                        'payment_date',
                    ]
                ],
                'meta',
                'links',
            ],
        ]);
    }

    public function test_customer_can_filter_payment_history()
    {
        // Create payments with different statuses
        Payment::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'completed',
            'method' => 'card',
        ]);
        Payment::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'failed',
            'method' => 'paypal',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/history?status=completed&method=card');

        $response->assertStatus(200);
        $payments = $response->json('payments.data');
        
        foreach ($payments as $payment) {
            $this->assertEquals('completed', $payment['status']);
            $this->assertEquals('card', $payment['method']);
        }
    }

    public function test_customer_can_process_payment_for_invoice()
    {
        $this->paymentServiceMock
            ->shouldReceive('processPayment')
            ->once()
            ->andReturn([
                'success' => true,
                'payment' => Payment::factory()->make([
                    'status' => 'completed',
                    'amount' => 150.00,
                ]),
            ]);

        $paymentData = [
            'payment_method_id' => 'pm_test_123',
            'amount' => 150.00,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$this->invoice->id}/pay", $paymentData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Payment processed successfully',
        ]);
    }

    public function test_payment_processing_validates_amount()
    {
        $paymentData = [
            'payment_method_id' => 'pm_test_123',
            'amount' => 200.00, // More than balance due
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$this->invoice->id}/pay", $paymentData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['amount']);
    }

    public function test_customer_cannot_pay_other_customers_invoice()
    {
        $otherCustomer = Customer::factory()->create();
        $otherInvoice = Invoice::factory()->create([
            'customer_id' => $otherCustomer->id,
        ]);

        $paymentData = [
            'payment_method_id' => 'pm_test_123',
            'amount' => 50.00,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$otherInvoice->id}/pay", $paymentData);

        $response->assertStatus(403);
    }

    public function test_customer_can_create_payment_intent()
    {
        $this->paymentServiceMock
            ->shouldReceive('createPaymentIntent')
            ->once()
            ->andReturn([
                'payment_url' => 'https://checkout.stripe.com/pay/test_123',
                'payment_intent_id' => 'pi_test_123',
            ]);

        $intentData = [
            'gateway' => 'stripe',
            'return_url' => 'https://example.com/success',
            'cancel_url' => 'https://example.com/cancel',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$this->invoice->id}/payment-intent", $intentData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'payment_url',
                'payment_intent_id',
            ],
        ]);
    }

    public function test_payment_intent_validates_gateway()
    {
        $intentData = [
            'gateway' => 'invalid_gateway',
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$this->invoice->id}/payment-intent", $intentData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gateway']);
    }

    public function test_payment_processing_handles_failures()
    {
        $this->paymentServiceMock
            ->shouldReceive('processPayment')
            ->once()
            ->andReturn([
                'success' => false,
                'error' => 'Payment declined by bank',
            ]);

        $paymentData = [
            'payment_method_id' => 'pm_test_123',
            'amount' => 150.00,
        ];

        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$this->invoice->id}/pay", $paymentData);

        $response->assertStatus(400);
        $response->assertJson([
            'success' => false,
            'message' => 'Payment declined by bank',
        ]);
    }

    public function test_unauthenticated_user_cannot_access_payment_apis()
    {
        $response = $this->getJson('/api/payments/methods');
        $response->assertStatus(401);

        $response = $this->postJson('/api/payments/methods', []);
        $response->assertStatus(401);

        $response = $this->getJson('/api/payments/invoices');
        $response->assertStatus(401);

        $response = $this->getJson('/api/payments/history');
        $response->assertStatus(401);

        $response = $this->postJson("/api/payments/invoices/{$this->invoice->id}/pay", []);
        $response->assertStatus(401);
    }

    public function test_non_customer_user_cannot_access_payments_page()
    {
        $nonCustomerUser = User::factory()->create(['customer_id' => null]);

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/payments');

        $response->assertRedirect('/login');
    }

    public function test_payment_statistics_calculation()
    {
        // Create various payments for statistics
        Payment::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'completed',
            'amount' => 100.00,
        ]);
        Payment::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'completed',
            'amount' => 200.00,
        ]);
        Payment::factory()->create([
            'customer_id' => $this->customer->id,
            'status' => 'failed',
            'amount' => 50.00,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/payments');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('paymentStats.totalPayments', 3)
                ->where('paymentStats.totalAmount', 300.00)
                ->where('paymentStats.successRate', 66.7)
                ->where('paymentStats.averagePayment', 150.00)
        );
    }

    public function test_payment_method_supports_all_gateways()
    {
        $gateways = ['stripe', 'paypal', 'clickpesa'];
        $methodTypes = ['card', 'mobile', 'bank', 'digital_wallet'];

        foreach ($gateways as $gateway) {
            foreach ($methodTypes as $methodType) {
                // Skip invalid combinations
                if ($gateway === 'paypal' && in_array($methodType, ['mobile', 'bank'])) {
                    continue;
                }
                if ($gateway === 'clickpesa' && in_array($methodType, ['card', 'digital_wallet'])) {
                    continue;
                }

                $response = $this->actingAs($this->customerUser)
                    ->postJson('/api/payments/methods', [
                        'gateway' => $gateway,
                        'method_type' => $methodType,
                    ]);

                $response->assertStatus(200);
                $response->assertJson(['success' => true]);
            }
        }
    }

    public function test_invoice_date_filtering()
    {
        // Create invoices with different dates
        $oldInvoice = Invoice::factory()->create([
            'customer_id' => $this->customer->id,
            'issue_date' => now()->subDays(60),
        ]);
        $recentInvoice = Invoice::factory()->create([
            'customer_id' => $this->customer->id,
            'issue_date' => now()->subDays(10),
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/invoices?date_from=' . now()->subDays(30)->format('Y-m-d'));

        $response->assertStatus(200);
        $invoices = $response->json('invoices.data');
        
        // Should only include recent invoice
        $invoiceIds = array_column($invoices, 'id');
        $this->assertContains($recentInvoice->id, $invoiceIds);
        $this->assertNotContains($oldInvoice->id, $invoiceIds);
    }

    public function test_payment_history_search_functionality()
    {
        $searchablePayment = Payment::factory()->create([
            'customer_id' => $this->customer->id,
            'payment_number' => 'PAY-SEARCH-123',
            'gateway_transaction_id' => 'txn_search_456',
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/history?search=SEARCH');

        $response->assertStatus(200);
        $payments = $response->json('payments.data');
        
        $this->assertCount(1, $payments);
        $this->assertEquals('PAY-SEARCH-123', $payments[0]['payment_number']);
    }

    public function test_payment_integration_workflow()
    {
        // Complete workflow: add payment method, create invoice, process payment
        
        // Step 1: Add payment method
        $methodResponse = $this->actingAs($this->customerUser)
            ->postJson('/api/payments/methods', [
                'gateway' => 'stripe',
                'method_type' => 'card',
            ]);
        $methodResponse->assertStatus(200);
        
        // Step 2: Get invoices
        $invoicesResponse = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/invoices');
        $invoicesResponse->assertStatus(200);
        
        // Step 3: Mock successful payment processing
        $this->paymentServiceMock
            ->shouldReceive('processPayment')
            ->once()
            ->andReturn([
                'success' => true,
                'payment' => Payment::factory()->make([
                    'status' => 'completed',
                    'amount' => 150.00,
                ]),
            ]);
        
        // Step 4: Process payment
        $paymentResponse = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$this->invoice->id}/pay", [
                'payment_method_id' => 'pm_test_123',
                'amount' => 150.00,
            ]);
        $paymentResponse->assertStatus(200);
        
        // Step 5: Check payment history
        $historyResponse = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/history');
        $historyResponse->assertStatus(200);
        
        // Verify all steps completed successfully
        $this->assertTrue($methodResponse->json('success'));
        $this->assertTrue($invoicesResponse->json('success'));
        $this->assertTrue($paymentResponse->json('success'));
        $this->assertTrue($historyResponse->json('success'));
        
        $this->assertTrue(true, 'Phase 8 payment integration workflow completed successfully!');
    }

    public function test_payment_security_and_validation()
    {
        // Test various security scenarios
        
        // 1. Cannot process payment with negative amount
        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$this->invoice->id}/pay", [
                'payment_method_id' => 'pm_test_123',
                'amount' => -50.00,
            ]);
        $response->assertStatus(422);
        
        // 2. Cannot process payment without payment method
        $response = $this->actingAs($this->customerUser)
            ->postJson("/api/payments/invoices/{$this->invoice->id}/pay", [
                'amount' => 50.00,
            ]);
        $response->assertStatus(422);
        
        // 3. Cannot add payment method with invalid gateway
        $response = $this->actingAs($this->customerUser)
            ->postJson('/api/payments/methods', [
                'gateway' => 'malicious_gateway',
                'method_type' => 'card',
            ]);
        $response->assertStatus(422);
        
        $this->assertTrue(true, 'Payment security validations working correctly!');
    }
}
