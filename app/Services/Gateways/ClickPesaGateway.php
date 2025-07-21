<?php

namespace App\Services\Gateways;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Exception;

class ClickPesaGateway implements PaymentGatewayInterface
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('payment.gateways.clickpesa', []);
    }

    /**
     * Process a payment.
     */
    public function processPayment(Payment $payment, array $paymentData): array
    {
        try {
            if (!$this->isConfigured()) {
                throw new Exception('ClickPesa gateway not configured');
            }

            // Simulate ClickPesa payment processing
            $transactionId = 'cp_' . uniqid();
            $paymentId = 'CPAY-' . strtoupper(uniqid());

            // Simulate processing delay
            usleep(1000000); // 1 second

            // Calculate fees (ClickPesa: 3.5% for M-Pesa)
            $fees = $this->calculateFees($payment->amount, $payment->currency);

            return [
                'status' => 'completed',
                'transaction_id' => $transactionId,
                'payment_id' => $paymentId,
                'fee_amount' => $fees['fee_amount'],
                'net_amount' => $fees['net_amount'],
                'gateway_response' => [
                    'id' => $paymentId,
                    'status' => 'SUCCESS',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'payment_method' => $paymentData['payment_method'] ?? 'mpesa',
                    'phone_number' => $paymentData['phone_number'] ?? null,
                    'reference' => $paymentData['reference'] ?? null,
                    'timestamp' => now()->toISOString(),
                ],
            ];

        } catch (Exception $e) {
            Log::error('ClickPesa payment failed', [
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
            if (!$this->isConfigured()) {
                throw new Exception('ClickPesa gateway not configured');
            }

            // Simulate ClickPesa payment request
            $requestId = 'REQ-' . strtoupper(uniqid());
            $checkoutUrl = "https://api.clickpesa.com/checkout/{$requestId}";

            return [
                'success' => true,
                'request_id' => $requestId,
                'checkout_url' => $checkoutUrl,
                'amount' => $paymentData['amount'],
                'currency' => $paymentData['currency'],
                'payment_url' => $checkoutUrl,
                'ussd_code' => '*150*00#', // Example USSD code for M-Pesa
            ];

        } catch (Exception $e) {
            Log::error('ClickPesa payment request failed', [
                'error' => $e->getMessage(),
                'payment_data' => $paymentData,
            ]);

            throw $e;
        }
    }

    /**
     * Handle webhook from ClickPesa.
     */
    public function handleWebhook(array $payload): array
    {
        try {
            // Verify webhook signature in production
            $status = $payload['status'] ?? 'unknown';
            $transaction = $payload['transaction'] ?? [];

            switch ($status) {
                case 'SUCCESS':
                case 'COMPLETED':
                    return $this->handlePaymentSuccess($transaction);
                
                case 'FAILED':
                case 'CANCELLED':
                    return $this->handlePaymentFailure($transaction);
                
                default:
                    return ['status' => 'ignored', 'transaction_status' => $status];
            }

        } catch (Exception $e) {
            Log::error('ClickPesa webhook handling failed', [
                'error' => $e->getMessage(),
                'payload' => $payload,
            ]);

            throw $e;
        }
    }

    /**
     * Process refund for a payment.
     */
    public function processRefund(Payment $payment, float $amount, string $reason = null): array
    {
        try {
            if (!$this->isConfigured()) {
                throw new Exception('ClickPesa gateway not configured');
            }

            // Note: ClickPesa/M-Pesa refunds may require manual processing
            $refundId = 'REFUND-' . strtoupper(uniqid());

            return [
                'status' => 'PENDING', // M-Pesa refunds are often manual
                'refund_id' => $refundId,
                'amount' => $amount,
                'reason' => $reason,
                'gateway_response' => [
                    'id' => $refundId,
                    'status' => 'PENDING',
                    'amount' => $amount,
                    'currency' => $payment->currency,
                    'reason' => $reason,
                    'note' => 'Refund request submitted. Manual processing may be required.',
                    'timestamp' => now()->toISOString(),
                ],
            ];

        } catch (Exception $e) {
            Log::error('ClickPesa refund failed', [
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
            'mpesa' => 'M-Pesa',
            'tigopesa' => 'Tigo Pesa',
            'airtelmoney' => 'Airtel Money',
            'halopesa' => 'Halo Pesa',
            'bank_transfer' => 'Bank Transfer',
        ];
    }

    /**
     * Check if gateway is properly configured.
     */
    public function isConfigured(): bool
    {
        return !empty($this->config['api_key']) && 
               !empty($this->config['secret_key']) &&
               !empty($this->config['merchant_id']);
    }

    /**
     * Calculate fees for amount.
     */
    public function calculateFees(float $amount, string $currency = 'TZS'): array
    {
        // ClickPesa/M-Pesa fees vary by amount and method
        $percentage = 3.5; // Default 3.5%
        $fixed = 0;

        // Different fee structure for different amounts in TZS
        if ($currency === 'TZS') {
            if ($amount <= 1000) {
                $fixed = 0; // No fee for small amounts
                $percentage = 0;
            } elseif ($amount <= 10000) {
                $percentage = 2.0;
            } elseif ($amount <= 50000) {
                $percentage = 3.0;
            } else {
                $percentage = 3.5;
            }
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
        return 'clickpesa';
    }

    /**
     * Get gateway display name.
     */
    public function getDisplayName(): string
    {
        return 'ClickPesa';
    }

    /**
     * Get supported currencies.
     */
    public function getSupportedCurrencies(): array
    {
        return ['TZS', 'USD', 'EUR'];
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

        if (!in_array($paymentData['currency'], $this->getSupportedCurrencies())) {
            $errors[] = 'Currency not supported by ClickPesa';
        }

        // Validate phone number for mobile money
        if (in_array($paymentData['payment_method'] ?? '', ['mpesa', 'tigopesa', 'airtelmoney', 'halopesa'])) {
            if (empty($paymentData['phone_number'])) {
                $errors[] = 'Phone number is required for mobile money payments';
            } elseif (!preg_match('/^(\+255|0)[67]\d{8}$/', $paymentData['phone_number'])) {
                $errors[] = 'Invalid Tanzanian phone number format';
            }
        }

        return $errors;
    }

    /**
     * Handle successful payment webhook.
     */
    private function handlePaymentSuccess(array $transaction): array
    {
        // Find payment by gateway payment ID
        $payment = Payment::where('gateway_payment_id', $transaction['id'])->first();

        if ($payment) {
            $payment->update([
                'status' => 'completed',
                'completed_at' => now(),
                'gateway_response' => array_merge($payment->gateway_response ?? [], $transaction),
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
    private function handlePaymentFailure(array $transaction): array
    {
        // Find payment by gateway payment ID
        $payment = Payment::where('gateway_payment_id', $transaction['id'])->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'failure_reason' => $transaction['error_message'] ?? 'Payment failed',
                'failed_at' => now(),
                'gateway_response' => array_merge($payment->gateway_response ?? [], $transaction),
            ]);
        }

        return [
            'status' => 'processed',
            'payment_id' => $payment?->id,
            'action' => 'payment_failed',
        ];
    }
}
