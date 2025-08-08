<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Gateways\ClickPesaGateway;
use App\Services\Gateways\PayPalGateway;
use App\Services\Gateways\StripeGateway;
use Exception;
use Illuminate\Support\Facades\Log;

class PaymentGatewayService
{
    protected array $gateways = [];

    public function __construct()
    {
        $this->initializeGateways();
    }

    /**
     * Initialize available payment gateways.
     */
    private function initializeGateways(): void
    {
        $this->gateways = [
            'stripe' => new StripeGateway,
            'paypal' => new PayPalGateway,
            'clickpesa' => new ClickPesaGateway,
        ];
    }

    /**
     * Get available payment gateways.
     */
    public function getAvailableGateways(): array
    {
        return array_keys($this->gateways);
    }

    /**
     * Get gateway instance.
     */
    public function getGateway(string $gateway): mixed
    {
        if (! isset($this->gateways[$gateway])) {
            throw new Exception("Payment gateway '{$gateway}' not found");
        }

        return $this->gateways[$gateway];
    }

    /**
     * Process payment for an invoice.
     */
    public function processPayment(Invoice $invoice, array $paymentData): array
    {
        try {
            $gateway = $this->getGateway($paymentData['gateway']);

            // Create payment record
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'customer_id' => $invoice->customer_id,
                'status' => 'pending',
                'type' => $paymentData['amount'] >= $invoice->balance_due ? 'full' : 'partial',
                'method' => $paymentData['method'],
                'gateway' => $paymentData['gateway'],
                'currency' => $invoice->currency,
                'amount' => $paymentData['amount'],
                'payment_date' => now(),
                'created_by' => auth()->id(),
            ]);

            // Process payment through gateway
            $result = $gateway->processPayment($payment, $paymentData);

            // Update payment with gateway response
            $payment->update([
                'gateway_transaction_id' => $result['transaction_id'] ?? null,
                'gateway_payment_id' => $result['payment_id'] ?? null,
                'gateway_response' => $result,
                'status' => $result['status'] ?? 'failed',
                'fee_amount' => $result['fee_amount'] ?? 0,
                'net_amount' => $payment->amount - ($result['fee_amount'] ?? 0),
            ]);

            // Update invoice if payment successful
            if ($result['status'] === 'completed') {
                $this->updateInvoicePayment($invoice, $payment);
            }

            return [
                'success' => true,
                'payment' => $payment,
                'gateway_response' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Payment processing failed', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
                'payment_data' => $paymentData,
            ]);

            // Update payment status if payment record exists
            if (isset($payment)) {
                $payment->update([
                    'status' => 'failed',
                    'failure_reason' => $e->getMessage(),
                    'failed_at' => now(),
                ]);
            }

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'payment' => $payment ?? null,
            ];
        }
    }

    /**
     * Create payment intent for online payments.
     */
    public function createPaymentIntent(Invoice $invoice, string $gateway, array $options = []): array
    {
        try {
            $gatewayInstance = $this->getGateway($gateway);

            $paymentData = [
                'amount' => $invoice->balance_due,
                'currency' => $invoice->currency,
                'description' => "Payment for Invoice {$invoice->invoice_number}",
                'customer_email' => $invoice->customer->email,
                'customer_name' => $invoice->customer->name,
                'invoice_id' => $invoice->id,
                'return_url' => route('admin.invoices.show', $invoice),
                'cancel_url' => route('admin.invoices.show', $invoice),
                ...$options,
            ];

            return $gatewayInstance->createPaymentIntent($paymentData);

        } catch (Exception $e) {
            Log::error('Payment intent creation failed', [
                'invoice_id' => $invoice->id,
                'gateway' => $gateway,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle webhook from payment gateway.
     */
    public function handleWebhook(string $gateway, array $payload): array
    {
        try {
            $gatewayInstance = $this->getGateway($gateway);

            return $gatewayInstance->handleWebhook($payload);

        } catch (Exception $e) {
            Log::error('Webhook handling failed', [
                'gateway' => $gateway,
                'error' => $e->getMessage(),
                'payload' => $payload,
            ]);

            throw $e;
        }
    }

    /**
     * Process refund for a payment.
     */
    public function processRefund(Payment $payment, float $amount, ?string $reason = null): array
    {
        try {
            $gateway = $this->getGateway($payment->gateway);

            $result = $gateway->processRefund($payment, $amount, $reason);

            // Create refund payment record
            $refund = $payment->processRefund($amount, $reason);

            return [
                'success' => true,
                'refund' => $refund,
                'gateway_response' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Refund processing failed', [
                'payment_id' => $payment->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update invoice payment status.
     */
    private function updateInvoicePayment(Invoice $invoice, Payment $payment): void
    {
        $invoice->increment('paid_amount', $payment->amount);
        $invoice->decrement('balance_due', $payment->amount);

        // Mark invoice as paid if balance is zero or negative
        if ($invoice->balance_due <= 0) {
            $invoice->update([
                'status' => 'paid',
                'paid_date' => now(),
            ]);
        }
    }

    /**
     * Get payment methods for a gateway.
     */
    public function getPaymentMethods(string $gateway): array
    {
        try {
            $gatewayInstance = $this->getGateway($gateway);

            return $gatewayInstance->getPaymentMethods();

        } catch (Exception $e) {
            Log::error('Failed to get payment methods', [
                'gateway' => $gateway,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Validate gateway configuration.
     */
    public function validateGatewayConfig(string $gateway): bool
    {
        try {
            $gatewayInstance = $this->getGateway($gateway);

            return $gatewayInstance->isConfigured();

        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get gateway fees for amount.
     */
    public function calculateFees(string $gateway, float $amount, string $currency = 'USD'): array
    {
        try {
            $gatewayInstance = $this->getGateway($gateway);

            return $gatewayInstance->calculateFees($amount, $currency);

        } catch (Exception $e) {
            return [
                'fee_amount' => 0,
                'net_amount' => $amount,
                'fee_percentage' => 0,
            ];
        }
    }
}
