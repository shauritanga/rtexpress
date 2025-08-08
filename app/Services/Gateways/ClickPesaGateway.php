<?php

namespace App\Services\Gateways;

use App\Models\Payment;
use App\Services\ClickPesaAuthService;
use App\Services\ClickPesaChecksumService;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClickPesaGateway implements PaymentGatewayInterface
{
    protected array $config;

    protected ClickPesaAuthService $authService;

    protected ClickPesaChecksumService $checksumService;

    protected string $baseUrl;

    public function __construct()
    {
        $this->config = config('payment.gateways.clickpesa', []);
        $this->baseUrl = $this->config['api_url'] ?? 'https://api.clickpesa.com/third-parties';

        // Only initialize services if properly configured
        if ($this->isConfigured()) {
            $this->authService = new ClickPesaAuthService;
            $this->checksumService = new ClickPesaChecksumService;
        }
    }

    /**
     * Process a payment using ClickPesa Mobile Money API.
     */
    public function processPayment(Payment $payment, array $paymentData): array
    {
        try {
            if (! $this->isConfigured()) {
                throw new Exception('ClickPesa gateway not configured. Please check your environment variables.');
            }

            // Validate payment data
            $validationErrors = $this->validatePaymentData($paymentData);
            if (! empty($validationErrors)) {
                throw new Exception('Validation failed: '.implode(', ', $validationErrors));
            }

            // Generate order reference
            $orderReference = $this->checksumService->generateOrderReference('PAY');

            // Prepare payment request data
            $requestData = [
                'amount' => (string) $payment->amount,
                'currency' => $payment->currency,
                'orderReference' => $orderReference,
                'phoneNumber' => $this->formatPhoneNumber($paymentData['phone_number']),
            ];

            // Generate checksum
            $requestData['checksum'] = $this->checksumService->generatePaymentChecksum($requestData);

            // Step 1: Preview the payment request
            $previewResult = $this->previewPayment($requestData);

            if (! $previewResult['success']) {
                throw new Exception('Payment preview failed: '.$previewResult['error']);
            }

            // Step 2: Initiate the USSD push request
            $initiateResult = $this->initiatePayment($requestData);

            if (! $initiateResult['success']) {
                throw new Exception('Payment initiation failed: '.$initiateResult['error']);
            }

            // Calculate fees
            $fees = $this->calculateFees($payment->amount, $payment->currency);

            return [
                'status' => 'processing', // ClickPesa payments are async
                'transaction_id' => $initiateResult['data']['id'] ?? $orderReference,
                'payment_id' => $orderReference,
                'order_reference' => $orderReference,
                'fee_amount' => $fees['fee_amount'],
                'net_amount' => $fees['net_amount'],
                'gateway_response' => $initiateResult['data'],
                'ussd_code' => $previewResult['ussd_code'] ?? null,
            ];

        } catch (Exception $e) {
            Log::error('ClickPesa payment failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'payment_data' => $paymentData,
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
                throw new Exception('ClickPesa gateway not configured');
            }

            // Generate order reference
            $orderReference = $this->checksumService->generateOrderReference('INT');

            // Prepare payment request data
            $requestData = [
                'amount' => (string) $paymentData['amount'],
                'currency' => $paymentData['currency'],
                'orderReference' => $orderReference,
            ];

            // Generate checksum
            $requestData['checksum'] = $this->checksumService->generatePaymentChecksum($requestData);

            // Preview the payment to get available methods
            $previewResult = $this->previewPayment($requestData);

            if (! $previewResult['success']) {
                throw new Exception('Payment preview failed: '.$previewResult['error']);
            }

            return [
                'success' => true,
                'order_reference' => $orderReference,
                'amount' => $paymentData['amount'],
                'currency' => $paymentData['currency'],
                'available_methods' => $previewResult['data']['activeMethods'] ?? [],
                'ussd_code' => $previewResult['ussd_code'] ?? '*150*00#',
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
     * Preview payment request to validate and get available methods.
     */
    protected function previewPayment(array $requestData): array
    {
        try {
            $token = $this->authService->getAuthToken();

            $response = Http::withHeaders([
                'Authorization' => $token,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl.'/payments/preview-ussd-push-request', $requestData);

            if (! $response->successful()) {
                Log::error('ClickPesa preview payment failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'request_data' => $requestData,
                ]);

                return [
                    'success' => false,
                    'error' => 'Preview request failed: '.$response->body(),
                ];
            }

            $data = $response->json();

            return [
                'success' => true,
                'data' => $data,
                'ussd_code' => '*150*00#', // Default M-Pesa USSD code
            ];

        } catch (Exception $e) {
            Log::error('ClickPesa preview payment error', [
                'error' => $e->getMessage(),
                'request_data' => $requestData,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Initiate USSD push payment request.
     */
    protected function initiatePayment(array $requestData): array
    {
        try {
            $token = $this->authService->getAuthToken();

            $response = Http::withHeaders([
                'Authorization' => $token,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl.'/payments/initiate-ussd-push-request', $requestData);

            if (! $response->successful()) {
                Log::error('ClickPesa initiate payment failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'request_data' => $requestData,
                ]);

                return [
                    'success' => false,
                    'error' => 'Payment initiation failed: '.$response->body(),
                ];
            }

            $data = $response->json();

            return [
                'success' => true,
                'data' => $data,
            ];

        } catch (Exception $e) {
            Log::error('ClickPesa initiate payment error', [
                'error' => $e->getMessage(),
                'request_data' => $requestData,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
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
    public function processRefund(Payment $payment, float $amount, ?string $reason = null): array
    {
        try {
            if (! $this->isConfigured()) {
                throw new Exception('ClickPesa gateway not configured');
            }

            // Note: ClickPesa/M-Pesa refunds may require manual processing
            $refundId = 'REFUND-'.strtoupper(uniqid());

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
        return ! empty($this->config['client_id']) &&
               ! empty($this->config['api_key']) &&
               ! empty($this->config['checksum_secret']);
    }

    /**
     * Format phone number for ClickPesa API.
     * ClickPesa expects phone numbers with country code but without the + sign.
     */
    protected function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove any spaces, dashes, or other characters
        $phone = preg_replace('/[^\d+]/', '', $phoneNumber);

        // If it starts with +255, remove the +
        if (str_starts_with($phone, '+255')) {
            return substr($phone, 1); // Remove the + sign
        }

        // If it starts with 0, replace with 255
        if (str_starts_with($phone, '0')) {
            return '255'.substr($phone, 1);
        }

        // If it already starts with 255, return as is
        if (str_starts_with($phone, '255')) {
            return $phone;
        }

        // Default: assume it's a local number and add 255
        return '255'.$phone;
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

        if (! in_array($paymentData['currency'], $this->getSupportedCurrencies())) {
            $errors[] = 'Currency not supported by ClickPesa';
        }

        // Validate phone number for mobile money
        if (in_array($paymentData['payment_method'] ?? '', ['mpesa', 'tigopesa', 'airtelmoney', 'halopesa'])) {
            if (empty($paymentData['phone_number'])) {
                $errors[] = 'Phone number is required for mobile money payments';
            } elseif (! preg_match('/^(\+255|0)[67]\d{8}$/', $paymentData['phone_number'])) {
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

    /**
     * Query payment status from ClickPesa API.
     */
    public function queryPaymentStatus(string $orderReference): array
    {
        try {
            $token = $this->authService->getAuthToken();

            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->get($this->baseUrl.'/payments/querying-for-payments', [
                'orderReference' => $orderReference,
            ]);

            if (! $response->successful()) {
                Log::error('ClickPesa payment status query failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'order_reference' => $orderReference,
                ]);

                return [
                    'success' => false,
                    'error' => 'Status query failed: '.$response->body(),
                ];
            }

            $data = $response->json();

            return [
                'success' => true,
                'data' => $data,
            ];

        } catch (Exception $e) {
            Log::error('ClickPesa payment status query error', [
                'error' => $e->getMessage(),
                'order_reference' => $orderReference,
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
