<?php

namespace Tests\Feature\Customer;

use App\Models\User;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentGatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Mockery;

class PaymentBasicTest extends TestCase
{
    use RefreshDatabase;

    private $customer;
    private $customerUser;
    private $invoice;

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
            'name' => 'Test Customer User',
            'email' => 'customer@test.com',
            'password' => bcrypt('password'),
            'customer_id' => $this->customer->id,
        ]);

        $this->invoice = Invoice::create([
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
            'billing_address' => '123 Test St, Test City, TS 12345',
            'company_address' => 'RT Express, 456 Company Ave, Business City, BC 67890',
            'created_by' => $adminUser->id,
        ]);
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
            'payment_methods',
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
            'payment_method',
            'message',
        ]);
    }

    public function test_customer_can_get_invoices()
    {
        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/invoices');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'invoices',
        ]);
    }

    public function test_customer_can_get_payment_history()
    {
        // Create a payment manually
        Payment::create([
            'payment_number' => 'PAY-TEST-001',
            'invoice_id' => $this->invoice->id,
            'customer_id' => $this->customer->id,
            'status' => 'completed',
            'type' => 'full',
            'method' => 'credit_card',
            'currency' => 'USD',
            'exchange_rate' => 1.0,
            'amount' => 100.00,
            'fee_amount' => 3.20,
            'net_amount' => 96.80,
            'gateway' => 'stripe',
            'payment_date' => now(),
            'created_by' => $this->customerUser->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/history');

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $response->assertJsonStructure([
            'success',
            'payments',
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
    }

    public function test_non_customer_user_cannot_access_payments_page()
    {
        $nonCustomerUser = User::create([
            'name' => 'Non Customer User',
            'email' => 'noncustomer@test.com',
            'password' => bcrypt('password'),
            'customer_id' => null,
        ]);

        $response = $this->actingAs($nonCustomerUser)
            ->get('/customer/payments');

        $response->assertRedirect('/login');
    }

    public function test_payment_statistics_are_calculated()
    {
        // Create some payments for statistics
        Payment::create([
            'payment_number' => 'PAY-TEST-001',
            'invoice_id' => $this->invoice->id,
            'customer_id' => $this->customer->id,
            'status' => 'completed',
            'type' => 'full',
            'method' => 'credit_card',
            'currency' => 'USD',
            'exchange_rate' => 1.0,
            'amount' => 100.00,
            'fee_amount' => 3.20,
            'net_amount' => 96.80,
            'gateway' => 'stripe',
            'payment_date' => now(),
            'created_by' => $this->customerUser->id,
        ]);

        $response = $this->actingAs($this->customerUser)
            ->get('/customer/payments');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->has('paymentStats.totalPayments')
                ->has('paymentStats.totalAmount')
                ->has('paymentStats.successRate')
        );
    }

    public function test_payment_integration_basic_workflow()
    {
        // Complete basic workflow: access page, get methods, get invoices, get history
        
        // Step 1: Access payments page
        $pageResponse = $this->actingAs($this->customerUser)
            ->get('/customer/payments');
        $pageResponse->assertStatus(200);
        
        // Step 2: Get payment methods
        $methodsResponse = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/methods');
        $methodsResponse->assertStatus(200);
        
        // Step 3: Get invoices
        $invoicesResponse = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/invoices');
        $invoicesResponse->assertStatus(200);
        
        // Step 4: Get payment history
        $historyResponse = $this->actingAs($this->customerUser)
            ->getJson('/api/payments/history');
        $historyResponse->assertStatus(200);
        
        // Verify all steps completed successfully
        $this->assertTrue($methodsResponse->json('success'));
        $this->assertTrue($invoicesResponse->json('success'));
        $this->assertTrue($historyResponse->json('success'));
        
        $this->assertTrue(true, 'Phase 8 basic payment integration workflow completed successfully!');
    }
}
