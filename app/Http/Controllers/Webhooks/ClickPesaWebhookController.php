<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\ClickPesaChecksumService;
use App\Services\Gateways\ClickPesaGateway;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Exception;

class ClickPesaWebhookController extends Controller
{
    protected ClickPesaChecksumService $checksumService;
    protected ClickPesaGateway $gateway;

    public function __construct()
    {
        $this->checksumService = new ClickPesaChecksumService();
        $this->gateway = new ClickPesaGateway();
    }

    /**
     * Handle ClickPesa webhook notifications.
     */
    public function handle(Request $request): Response
    {
        try {
            // Log the incoming webhook for debugging
            Log::info('ClickPesa webhook received', [
                'headers' => $request->headers->all(),
                'payload' => $request->all(),
            ]);

            // Get the raw payload
            $payload = $request->all();
            
            // Verify webhook signature if provided
            $signature = $request->header('X-ClickPesa-Signature');
            if ($signature && !$this->verifyWebhookSignature($payload, $signature)) {
                Log::warning('ClickPesa webhook signature verification failed', [
                    'signature' => $signature,
                    'payload' => $payload,
                ]);
                
                return response('Unauthorized', 401);
            }

            // Process the webhook
            $result = $this->processWebhook($payload);
            
            if ($result['success']) {
                return response('OK', 200);
            } else {
                Log::error('ClickPesa webhook processing failed', [
                    'error' => $result['error'],
                    'payload' => $payload,
                ]);
                
                return response('Processing failed', 400);
            }

        } catch (Exception $e) {
            Log::error('ClickPesa webhook handling error', [
                'error' => $e->getMessage(),
                'payload' => $request->all(),
            ]);
            
            return response('Internal server error', 500);
        }
    }

    /**
     * Process the webhook payload.
     */
    protected function processWebhook(array $payload): array
    {
        try {
            // Extract payment information from webhook
            $orderReference = $payload['orderReference'] ?? null;
            $status = $payload['status'] ?? null;
            $transactionId = $payload['id'] ?? null;

            if (!$orderReference) {
                return [
                    'success' => false,
                    'error' => 'Missing order reference in webhook payload',
                ];
            }

            // Find the payment by order reference
            $payment = Payment::where('gateway_payment_id', $orderReference)
                             ->orWhere('gateway_transaction_id', $orderReference)
                             ->first();

            if (!$payment) {
                Log::warning('ClickPesa webhook: Payment not found', [
                    'order_reference' => $orderReference,
                    'payload' => $payload,
                ]);
                
                return [
                    'success' => true, // Return success to avoid retries
                    'message' => 'Payment not found',
                ];
            }

            // Update payment based on status
            $this->updatePaymentStatus($payment, $payload);

            return [
                'success' => true,
                'payment_id' => $payment->id,
                'status' => $status,
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update payment status based on webhook data.
     */
    protected function updatePaymentStatus(Payment $payment, array $webhookData): void
    {
        $status = strtoupper($webhookData['status'] ?? '');
        $transactionId = $webhookData['id'] ?? null;
        $amount = $webhookData['collectedAmount'] ?? null;
        $currency = $webhookData['collectedCurrency'] ?? null;

        // Update payment with webhook data
        $updateData = [
            'gateway_response' => array_merge($payment->gateway_response ?? [], $webhookData),
        ];

        if ($transactionId) {
            $updateData['gateway_transaction_id'] = $transactionId;
        }

        switch ($status) {
            case 'SUCCESS':
            case 'COMPLETED':
                $updateData['status'] = 'completed';
                $updateData['completed_at'] = now();
                
                // Update invoice if payment is completed
                if ($payment->invoice) {
                    $this->updateInvoicePayment($payment);
                }
                break;

            case 'FAILED':
            case 'CANCELLED':
                $updateData['status'] = 'failed';
                $updateData['failed_at'] = now();
                $updateData['failure_reason'] = $webhookData['errorMessage'] ?? 'Payment failed';
                break;

            case 'PROCESSING':
            case 'PENDING':
                $updateData['status'] = 'processing';
                break;

            default:
                Log::warning('Unknown ClickPesa payment status', [
                    'status' => $status,
                    'payment_id' => $payment->id,
                    'webhook_data' => $webhookData,
                ]);
                return;
        }

        $payment->update($updateData);

        Log::info('ClickPesa payment status updated', [
            'payment_id' => $payment->id,
            'old_status' => $payment->getOriginal('status'),
            'new_status' => $updateData['status'],
            'transaction_id' => $transactionId,
        ]);
    }

    /**
     * Update invoice payment status.
     */
    protected function updateInvoicePayment(Payment $payment): void
    {
        $invoice = $payment->invoice;
        
        if (!$invoice) {
            return;
        }

        // Update invoice paid amount and balance
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
     * Verify webhook signature.
     */
    protected function verifyWebhookSignature(array $payload, string $signature): bool
    {
        try {
            return $this->checksumService->verifyWebhookChecksum($payload, $signature);
        } catch (Exception $e) {
            Log::error('ClickPesa webhook signature verification error', [
                'error' => $e->getMessage(),
                'signature' => $signature,
            ]);
            
            return false;
        }
    }
}
