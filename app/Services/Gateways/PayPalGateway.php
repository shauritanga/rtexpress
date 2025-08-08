<?php

namespace App\Services\Gateways;

use App\Models\Payment;
use Exception;
use Illuminate\Support\Facades\Log;

class PayPalGateway implements PaymentGatewayInterface
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('payment.gateways.paypal', []);
    }

    /**
     * Process a payment.
     */
    public function processPayment(Payment $payment, array $paymentData): array
    {
        try {
            if (! $this->isConfigured()) {
                throw new Exception('PayPal gateway not configured');
            }

            // Simulate PayPal payment processing
            $transactionId = 'paypal_'.uniqid();
            $paymentId = 'PAYID-'.strtoupper(uniqid());

            // Simulate processing delay
            usleep(750000); // 0.75 seconds

            // Calculate fees (PayPal: 2.9% + $0.30 for domestic)
            $fees = $this->calculateFees($payment->amount, $payment->currency);

            return [
                'status' => 'completed',
                'transaction_id' => $transactionId,
                'payment_id' => $paymentId,
                'fee_amount' => $fees['fee_amount'],
                'net_amount' => $fees['net_amount'],
                'gateway_response' => [
                    'id' => $paymentId,
                    'intent' => 'CAPTURE',
                    'status' => 'COMPLETED',
                    'amount' => [
                        'currency_code' => $payment->currency,
                        'value' => number_format($payment->amount, 2, '.', ''),
                    ],
                    'create_time' => now()->toISOString(),
                    'payment_method' => $paymentData['payment_method'] ?? 'paypal',
                ],
            ];

        } catch (Exception $e) {
            Log::error('PayPal payment failed', [
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
                throw new Exception('PayPal gateway not configured');
            }

            // Simulate PayPal Order creation
            $orderId = 'ORDER-'.strtoupper(uniqid());
            $approvalUrl = "https://www.sandbox.paypal.com/checkoutnow?token={$orderId}";

            return [
                'success' => true,
                'order_id' => $orderId,
                'approval_url' => $approvalUrl,
                'amount' => $paymentData['amount'],
                'currency' => $paymentData['currency'],
                'payment_url' => $approvalUrl,
            ];

        } catch (Exception $e) {
            Log::error('PayPal order creation failed', [
                'error' => $e->getMessage(),
                'payment_data' => $paymentData,
            ]);

            throw $e;
        }
    }

    /**
     * Handle webhook from PayPal.
     */
    public function handleWebhook(array $payload): array
    {
        try {
            // Verify webhook signature in production
            $eventType = $payload['event_type'] ?? 'unknown';
            $resource = $payload['resource'] ?? [];

            switch ($eventType) {
                case 'PAYMENT.CAPTURE.COMPLETED':
                    return $this->handlePaymentSuccess($resource);

                case 'PAYMENT.CAPTURE.DENIED':
                case 'PAYMENT.CAPTURE.DECLINED':
                    return $this->handlePaymentFailure($resource);

                default:
                    return ['status' => 'ignored', 'event_type' => $eventType];
            }

        } catch (Exception $e) {
            Log::error('PayPal webhook handling failed', [
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
                throw new Exception('PayPal gateway not configured');
            }

            // Simulate PayPal refund
            $refundId = 'REFUND-'.strtoupper(uniqid());

            return [
                'status' => 'COMPLETED',
                'refund_id' => $refundId,
                'amount' => $amount,
                'reason' => $reason,
                'gateway_response' => [
                    'id' => $refundId,
                    'status' => 'COMPLETED',
                    'amount' => [
                        'currency_code' => $payment->currency,
                        'value' => number_format($amount, 2, '.', ''),
                    ],
                    'reason' => $reason,
                    'create_time' => now()->toISOString(),
                ],
            ];

        } catch (Exception $e) {
            Log::error('PayPal refund failed', [
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
            'paypal' => 'PayPal Account',
            'card' => 'Credit/Debit Card',
            'bank' => 'Bank Account',
        ];
    }

    /**
     * Check if gateway is properly configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->config['client_id']) &&
               ! empty($this->config['client_secret']);
    }

    /**
     * Calculate fees for amount.
     */
    public function calculateFees(float $amount, string $currency = 'USD'): array
    {
        // PayPal fees: 2.9% + $0.30 for domestic transactions
        $percentage = 2.9;
        $fixed = 0.30;

        // International fees are higher
        if ($currency !== 'USD') {
            $percentage = 4.4;
            $fixed = 0.30;
        }

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
        return 'paypal';
    }

    /**
     * Get gateway display name.
     */
    public function getDisplayName(): string
    {
        return 'PayPal';
    }

    /**
     * Get supported currencies.
     */
    public function getSupportedCurrencies(): array
    {
        return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'];
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
            $errors[] = 'Currency not supported by PayPal';
        }

        return $errors;
    }

    /**
     * Handle successful payment webhook.
     */
    private function handlePaymentSuccess(array $resource): array
    {
        // Find payment by gateway payment ID
        $payment = Payment::where('gateway_payment_id', $resource['id'])->first();

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
    private function handlePaymentFailure(array $resource): array
    {
        // Find payment by gateway payment ID
        $payment = Payment::where('gateway_payment_id', $resource['id'])->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $resource['reason_code'] ?? 'Payment failed',
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
