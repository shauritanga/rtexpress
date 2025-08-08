<?php

namespace App\Services\Gateways;

use App\Models\Payment;
use Exception;
use Illuminate\Support\Facades\Log;

class StripeGateway implements PaymentGatewayInterface
{
    protected $stripe;

    protected array $config;

    public function __construct()
    {
        $this->config = config('payment.gateways.stripe', []);

        if ($this->isConfigured()) {
            // Initialize Stripe SDK when available
            // \Stripe\Stripe::setApiKey($this->config['secret_key']);
        }
    }

    /**
     * Process a payment.
     */
    public function processPayment(Payment $payment, array $paymentData): array
    {
        try {
            // For demo purposes, simulate successful payment
            // In production, integrate with actual Stripe API

            if (! $this->isConfigured()) {
                throw new Exception('Stripe gateway not configured');
            }

            // Simulate Stripe payment processing
            $transactionId = 'stripe_'.uniqid();
            $paymentId = 'pi_'.uniqid();

            // Simulate processing delay
            usleep(500000); // 0.5 seconds

            // Calculate fees (Stripe: 2.9% + $0.30)
            $fees = $this->calculateFees($payment->amount, $payment->currency);

            return [
                'status' => 'completed',
                'transaction_id' => $transactionId,
                'payment_id' => $paymentId,
                'fee_amount' => $fees['fee_amount'],
                'net_amount' => $fees['net_amount'],
                'gateway_response' => [
                    'id' => $paymentId,
                    'amount' => $payment->amount * 100, // Stripe uses cents
                    'currency' => strtolower($payment->currency),
                    'status' => 'succeeded',
                    'created' => time(),
                    'payment_method' => $paymentData['payment_method'] ?? 'card',
                ],
            ];

        } catch (Exception $e) {
            Log::error('Stripe payment failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'status' => 'failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create payment intent for online payments.
     */
    public function createPaymentIntent(array $paymentData): array
    {
        try {
            if (! $this->isConfigured()) {
                throw new Exception('Stripe gateway not configured');
            }

            // Simulate Stripe PaymentIntent creation
            $intentId = 'pi_'.uniqid();
            $clientSecret = $intentId.'_secret_'.uniqid();

            return [
                'success' => true,
                'payment_intent_id' => $intentId,
                'client_secret' => $clientSecret,
                'amount' => $paymentData['amount'] * 100, // Convert to cents
                'currency' => strtolower($paymentData['currency']),
                'payment_url' => "https://checkout.stripe.com/pay/{$clientSecret}",
            ];

        } catch (Exception $e) {
            Log::error('Stripe payment intent creation failed', [
                'error' => $e->getMessage(),
                'payment_data' => $paymentData,
            ]);

            throw $e;
        }
    }

    /**
     * Handle webhook from Stripe.
     */
    public function handleWebhook(array $payload): array
    {
        try {
            // Verify webhook signature in production
            // $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
            // $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $this->config['webhook_secret']);

            $eventType = $payload['type'] ?? 'unknown';
            $paymentIntent = $payload['data']['object'] ?? [];

            switch ($eventType) {
                case 'payment_intent.succeeded':
                    return $this->handlePaymentSuccess($paymentIntent);

                case 'payment_intent.payment_failed':
                    return $this->handlePaymentFailure($paymentIntent);

                default:
                    return ['status' => 'ignored', 'event_type' => $eventType];
            }

        } catch (Exception $e) {
            Log::error('Stripe webhook handling failed', [
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
            if (! $this->isConfigured()) {
                throw new Exception('Stripe gateway not configured');
            }

            // Simulate Stripe refund
            $refundId = 're_'.uniqid();

            return [
                'status' => 'succeeded',
                'refund_id' => $refundId,
                'amount' => $amount,
                'reason' => $reason,
                'gateway_response' => [
                    'id' => $refundId,
                    'amount' => $amount * 100,
                    'currency' => strtolower($payment->currency),
                    'status' => 'succeeded',
                    'reason' => $reason,
                ],
            ];

        } catch (Exception $e) {
            Log::error('Stripe refund failed', [
                'payment_id' => $payment->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Get available payment methods.
     */
    public function getPaymentMethods(): array
    {
        return [
            'card' => 'Credit/Debit Card',
            'bank_transfer' => 'Bank Transfer',
            'apple_pay' => 'Apple Pay',
            'google_pay' => 'Google Pay',
        ];
    }

    /**
     * Check if gateway is properly configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->config['public_key']) &&
               ! empty($this->config['secret_key']);
    }

    /**
     * Calculate fees for amount.
     */
    public function calculateFees(float $amount, string $currency = 'USD'): array
    {
        // Stripe fees: 2.9% + $0.30 for US cards
        $percentage = 2.9;
        $fixed = 0.30;

        $feeAmount = ($amount * $percentage / 100) + $fixed;
        $netAmount = $amount - $feeAmount;

        return [
            'fee_amount' => round($feeAmount, 2),
            'net_amount' => round($netAmount, 2),
            'fee_percentage' => $percentage,
            'fixed_fee' => $fixed,
        ];
    }

    /**
     * Get gateway name.
     */
    public function getName(): string
    {
        return 'stripe';
    }

    /**
     * Get gateway display name.
     */
    public function getDisplayName(): string
    {
        return 'Stripe';
    }

    /**
     * Get supported currencies.
     */
    public function getSupportedCurrencies(): array
    {
        return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
    }

    /**
     * Validate payment data.
     */
    public function validatePaymentData(array $paymentData): array
    {
        $errors = [];

        if (empty($paymentData['amount']) || $paymentData['amount'] <= 0) {
            $errors[] = 'Amount must be greater than zero';
        }

        if (empty($paymentData['currency'])) {
            $errors[] = 'Currency is required';
        }

        if (! in_array($paymentData['currency'], $this->getSupportedCurrencies())) {
            $errors[] = 'Currency not supported by Stripe';
        }

        return $errors;
    }

    /**
     * Handle successful payment webhook.
     */
    private function handlePaymentSuccess(array $paymentIntent): array
    {
        // Find payment by gateway payment ID
        $payment = Payment::where('gateway_payment_id', $paymentIntent['id'])->first();

        if ($payment) {
            $payment->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Update invoice payment status
            if ($payment->invoice) {
                $payment->invoice->increment('paid_amount', $payment->amount);
                $payment->invoice->decrement('balance_due', $payment->amount);

                if ($payment->invoice->balance_due <= 0) {
                    $payment->invoice->update([
                        'status' => 'paid',
                        'paid_date' => now(),
                    ]);
                }
            }
        }

        return [
            'status' => 'processed',
            'payment_id' => $payment?->id,
            'action' => 'payment_completed',
        ];
    }

    /**
     * Handle failed payment webhook.
     */
    private function handlePaymentFailure(array $paymentIntent): array
    {
        // Find payment by gateway payment ID
        $payment = Payment::where('gateway_payment_id', $paymentIntent['id'])->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $paymentIntent['last_payment_error']['message'] ?? 'Payment failed',
                'failed_at' => now(),
            ]);
        }

        return [
            'status' => 'processed',
            'payment_id' => $payment?->id,
            'action' => 'payment_failed',
        ];
    }
}
