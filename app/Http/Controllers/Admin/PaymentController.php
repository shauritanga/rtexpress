<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected PaymentGatewayService $paymentService;

    public function __construct(PaymentGatewayService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display payment management page.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['invoice', 'customer', 'creator'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                  ->orWhereHas('invoice', function ($q) use ($search) {
                      $q->where('invoice_number', 'like', "%{$search}%");
                  })
                  ->orWhereHas('customer', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('gateway')) {
            $query->where('gateway', $request->gateway);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $payments = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total_payments' => Payment::count(),
            'completed_payments' => Payment::where('status', 'completed')->count(),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'failed_payments' => Payment::where('status', 'failed')->count(),
            'total_amount' => Payment::where('status', 'completed')->sum('amount'),
            'total_fees' => Payment::where('status', 'completed')->sum('fee_amount'),
        ];

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'gateway', 'date_from', 'date_to']),
            'gateways' => $this->paymentService->getAvailableGateways(),
        ]);
    }

    /**
     * Show payment details.
     */
    public function show(Payment $payment)
    {
        $payment->load(['invoice', 'customer', 'creator', 'refunds']);

        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Process payment for an invoice.
     */
    public function processPayment(Request $request, Invoice $invoice)
    {
        $request->validate([
            'gateway' => 'required|string|in:stripe,paypal,clickpesa',
            'method' => 'required|string',
            'amount' => 'required|numeric|min:0.01|max:' . $invoice->balance_due,
            'phone_number' => 'nullable|string',
            'reference' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $paymentData = [
                'gateway' => $request->gateway,
                'method' => $request->method,
                'amount' => $request->amount,
                'phone_number' => $request->phone_number,
                'reference' => $request->reference,
            ];

            $result = $this->paymentService->processPayment($invoice, $paymentData);

            if ($result['success']) {
                DB::commit();

                return redirect()
                    ->route('admin.invoices.show', $invoice)
                    ->with('success', 'Payment processed successfully');
            } else {
                DB::rollBack();

                return redirect()
                    ->back()
                    ->withErrors(['payment' => $result['error']])
                    ->withInput();
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment processing failed', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->withErrors(['payment' => 'Payment processing failed. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Create payment intent for online payment.
     */
    public function createPaymentIntent(Request $request, Invoice $invoice)
    {
        $request->validate([
            'gateway' => 'required|string|in:stripe,paypal,clickpesa',
        ]);

        try {
            $result = $this->paymentService->createPaymentIntent(
                $invoice,
                $request->gateway,
                $request->only(['return_url', 'cancel_url'])
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);

        } catch (\Exception $e) {
            Log::error('Payment intent creation failed', [
                'invoice_id' => $invoice->id,
                'gateway' => $request->gateway,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to create payment intent',
            ], 500);
        }
    }

    /**
     * Process refund for a payment.
     */
    public function processRefund(Request $request, Payment $payment)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $payment->amount,
            'reason' => 'nullable|string|max:255',
        ]);

        try {
            $result = $this->paymentService->processRefund(
                $payment,
                $request->amount,
                $request->reason
            );

            if ($result['success']) {
                return redirect()
                    ->route('admin.payments.show', $payment)
                    ->with('success', 'Refund processed successfully');
            } else {
                return redirect()
                    ->back()
                    ->withErrors(['refund' => $result['error']]);
            }

        } catch (\Exception $e) {
            Log::error('Refund processing failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()
                ->back()
                ->withErrors(['refund' => 'Refund processing failed. Please try again.']);
        }
    }

    /**
     * Handle webhook from payment gateway.
     */
    public function handleWebhook(Request $request, string $gateway)
    {
        try {
            $payload = $request->all();

            $result = $this->paymentService->handleWebhook($gateway, $payload);

            Log::info('Webhook processed', [
                'gateway' => $gateway,
                'result' => $result,
            ]);

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Webhook processing failed', [
                'gateway' => $gateway,
                'error' => $e->getMessage(),
                'payload' => $request->all(),
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Get payment methods for a gateway.
     */
    public function getPaymentMethods(Request $request, string $gateway)
    {
        try {
            $methods = $this->paymentService->getPaymentMethods($gateway);

            return response()->json([
                'success' => true,
                'methods' => $methods,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get payment methods',
            ], 500);
        }
    }

    /**
     * Calculate fees for payment.
     */
    public function calculateFees(Request $request)
    {
        $request->validate([
            'gateway' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
        ]);

        try {
            $fees = $this->paymentService->calculateFees(
                $request->gateway,
                $request->amount,
                $request->currency
            );

            return response()->json([
                'success' => true,
                'fees' => $fees,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to calculate fees',
            ], 500);
        }
    }
}
