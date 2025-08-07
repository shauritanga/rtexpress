<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Invoice;
use App\Services\PaymentGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use App\Models\User;
use App\Notifications\PaymentSuccessNotification;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentGatewayService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display the payments management page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return redirect()->route('customer.dashboard')
                ->with('error', 'Customer account required');
        }

        // Get payment statistics
        $paymentStats = $this->getPaymentStats($customer);

        // Get recent invoices
        $recentInvoices = Invoice::where('customer_id', $customer->id)
            ->with(['payments'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get payment methods (mock data for now)
        $paymentMethods = $this->getCustomerPaymentMethods($customer);

        return Inertia::render('Customer/Payments/Index', [
            'customer' => $customer->toArray(),
            'paymentStats' => $paymentStats,
            'recentInvoices' => $recentInvoices,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Get customer payment methods.
     */
    public function getPaymentMethods(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Customer account required'], 403);
        }

        $paymentMethods = $this->getCustomerPaymentMethods($customer);

        return response()->json([
            'success' => true,
            'payment_methods' => $paymentMethods,
        ]);
    }

    /**
     * Add a new payment method.
     */
    public function addPaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'gateway' => 'required|string|in:stripe,paypal,clickpesa',
            'method_type' => 'required|string|in:card,mobile,bank,digital_wallet',
            'details' => 'array',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['error' => 'Customer account required'], 403);
            }

            // In a real implementation, this would integrate with the payment gateway
            // to securely store payment method details
            $paymentMethod = [
                'id' => 'pm_' . uniqid(),
                'type' => $validated['method_type'],
                'gateway' => $validated['gateway'],
                'name' => $this->generatePaymentMethodName($validated['gateway'], $validated['method_type']),
                'details' => $validated['details'] ?? [],
                'is_default' => false,
                'is_verified' => false,
                'created_at' => now()->toISOString(),
            ];

            // Log the payment method addition
            Log::info('Payment method added', [
                'customer_id' => $customer->id,
                'gateway' => $validated['gateway'],
                'method_type' => $validated['method_type'],
            ]);

            return response()->json([
                'success' => true,
                'payment_method' => $paymentMethod,
                'message' => 'Payment method added successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to add payment method', [
                'customer_id' => $customer->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add payment method',
            ], 500);
        }
    }

    /**
     * Remove a payment method.
     */
    public function removePaymentMethod(Request $request, $methodId)
    {
        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['error' => 'Customer account required'], 403);
            }

            // In a real implementation, this would remove the payment method from the gateway
            Log::info('Payment method removed', [
                'customer_id' => $customer->id,
                'method_id' => $methodId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment method removed successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to remove payment method', [
                'method_id' => $methodId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to remove payment method',
            ], 500);
        }
    }

    /**
     * Set default payment method.
     */
    public function setDefaultPaymentMethod(Request $request, $methodId)
    {
        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer) {
                return response()->json(['error' => 'Customer account required'], 403);
            }

            // In a real implementation, this would update the default payment method
            Log::info('Default payment method updated', [
                'customer_id' => $customer->id,
                'method_id' => $methodId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Default payment method updated successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to set default payment method', [
                'method_id' => $methodId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update default payment method',
            ], 500);
        }
    }

    /**
     * Get customer invoices.
     */
    public function getInvoices(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Customer account required'], 403);
        }

        $query = Invoice::where('customer_id', $customer->id)
            ->whereIn('status', ['sent', 'viewed', 'paid', 'overdue']) // Show sent, viewed, paid, and overdue invoices
            ->with(['payments'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            if ($request->status === 'unpaid') {
                // For payments page, show only invoices that need payment
                $query->whereIn('status', ['sent', 'viewed', 'overdue'])
                      ->where('balance_due', '>', 0);
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        $invoices = $query->paginate(15)->withQueryString();

        return response()->json([
            'success' => true,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Get payment history.
     */
    public function getPaymentHistory(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Customer account required'], 403);
        }

        $query = Payment::where('customer_id', $customer->id)
            ->with(['invoice'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('method')) {
            $query->where('method', $request->method);
        }

        if ($request->filled('gateway')) {
            $query->where('gateway', $request->gateway);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                  ->orWhere('gateway_transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('invoice', function ($q) use ($search) {
                      $q->where('invoice_number', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        $payments = $query->paginate(15)->withQueryString();

        return response()->json([
            'success' => true,
            'payments' => $payments,
        ]);
    }

    /**
     * Process payment for an invoice.
     */
    public function processPayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'payment_method_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01|max:' . $invoice->balance_due,
            'phone_number' => 'nullable|regex:/^(\+255|0)[67][0-9]{8}$/',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer || $invoice->customer_id !== $customer->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            DB::beginTransaction();

            // Determine gateway and method from payment_method_id
            $gateway = 'stripe'; // Default
            $method = 'credit_card'; // Default

            // Parse payment method ID to determine gateway and method
            if (str_contains($validated['payment_method_id'], 'stripe')) {
                $gateway = 'stripe';
                $method = 'credit_card';
            } elseif (str_contains($validated['payment_method_id'], 'paypal')) {
                $gateway = 'paypal';
                $method = 'credit_card';
            } elseif (str_contains($validated['payment_method_id'], 'clickpesa')) {
                $gateway = 'clickpesa';
                $method = 'mobile_money';

                // Phone number is required for ClickPesa
                if (empty($validated['phone_number'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Phone number is required for mobile money payments',
                    ], 400);
                }
            }

            $paymentData = [
                'gateway' => $gateway,
                'method' => $method,
                'amount' => $validated['amount'],
                'payment_method_id' => $validated['payment_method_id'],
                'phone_number' => $validated['phone_number'] ?? null,
            ];

            $result = $this->paymentService->processPayment($invoice, $paymentData);

            if ($result['success']) {
                DB::commit();

                $response = [
                    'success' => true,
                    'payment' => $result['payment'],
                    'message' => 'Payment processed successfully',
                ];

                // Add ClickPesa-specific response data
                if ($gateway === 'clickpesa') {
                    $response['order_reference'] = $result['gateway_response']['order_reference'] ?? null;
                    $response['message'] = 'Payment initiated successfully. Please check your phone for USSD prompt.';
                }

                return response()->json($response);
            } else {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => $result['error'] ?? 'Payment processing failed',
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Payment processing failed', [
                'invoice_id' => $invoice->id,
                'customer_id' => $customer->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment processing failed',
            ], 500);
        }
    }

    /**
     * Create payment intent for online payment.
     */
    public function createPaymentIntent(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'gateway' => 'required|string|in:stripe,paypal,clickpesa',
            'return_url' => 'nullable|url',
            'cancel_url' => 'nullable|url',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            if (!$customer || $invoice->customer_id !== $customer->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $result = $this->paymentService->createPaymentIntent(
                $invoice,
                $validated['gateway'],
                [
                    'return_url' => $validated['return_url'] ?? route('customer.payments.index'),
                    'cancel_url' => $validated['cancel_url'] ?? route('customer.payments.index'),
                ]
            );

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);

        } catch (\Exception $e) {
            Log::error('Payment intent creation failed', [
                'invoice_id' => $invoice->id,
                'gateway' => $validated['gateway'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to create payment intent',
            ], 500);
        }
    }

    /**
     * Get payment statistics for customer.
     */
    private function getPaymentStats(Customer $customer): array
    {
        $payments = Payment::where('customer_id', $customer->id);
        $invoices = Invoice::where('customer_id', $customer->id);

        $totalPayments = $payments->count();
        $totalAmount = $payments->where('status', 'completed')->sum('amount');
        $pendingAmount = $invoices->where('status', '!=', 'paid')->sum('balance_due');
        $overdueAmount = $invoices->where('status', 'overdue')->sum('balance_due');

        $completedPayments = $payments->where('status', 'completed')->count();
        $successRate = $totalPayments > 0 ? ($completedPayments / $totalPayments) * 100 : 0;

        $averagePayment = $completedPayments > 0 ? $totalAmount / $completedPayments : 0;

        $lastPayment = $payments->where('status', 'completed')
            ->orderBy('payment_date', 'desc')
            ->first();

        return [
            'totalPayments' => $totalPayments,
            'totalAmount' => $totalAmount,
            'pendingAmount' => $pendingAmount,
            'overdueAmount' => $overdueAmount,
            'successRate' => round($successRate, 1),
            'averagePayment' => $averagePayment,
            'preferredMethod' => 'card', // Would calculate from actual data
            'lastPaymentDate' => $lastPayment?->payment_date ?? now()->subDays(30)->toISOString(),
        ];
    }

    /**
     * Get customer payment methods (mock implementation).
     */
    private function getCustomerPaymentMethods(Customer $customer): array
    {
        // In a real implementation, this would fetch from payment gateway APIs
        return [
            [
                'id' => 'pm_1',
                'type' => 'card',
                'gateway' => 'stripe',
                'name' => 'Visa ending in 4242',
                'details' => [
                    'last4' => '4242',
                    'brand' => 'visa',
                    'expiry' => '12/25',
                ],
                'is_default' => true,
                'is_verified' => true,
                'created_at' => now()->subDays(30)->toISOString(),
                'last_used' => now()->subDays(5)->toISOString(),
            ],
        ];
    }

    /**
     * Generate payment method name.
     */
    private function generatePaymentMethodName(string $gateway, string $methodType): string
    {
        $names = [
            'stripe' => [
                'card' => 'Credit/Debit Card',
                'bank' => 'Bank Transfer',
            ],
            'paypal' => [
                'digital_wallet' => 'PayPal Account',
                'card' => 'PayPal Card',
            ],
            'clickpesa' => [
                'mobile' => 'Mobile Money',
                'bank' => 'Bank Transfer',
            ],
        ];

        return $names[$gateway][$methodType] ?? ucfirst($methodType);
    }

    /**
     * Process ClickPesa payment for invoice
     */
    public function processInvoicePayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'payment_method' => 'required|in:clickpesa,card',
            'phone_number' => 'required_if:payment_method,clickpesa|string|min:10|max:13',
            'amount' => 'required|numeric|min:0.01',
        ]);

        // Additional phone number validation for ClickPesa
        if ($validated['payment_method'] === 'clickpesa' && !empty($validated['phone_number'])) {
            $phone = $validated['phone_number'];
            if (!preg_match('/^(\+255|0)[67][0-9]{8}$/', $phone)) {
                return redirect()->back()
                    ->withErrors(['phone_number' => 'Invalid phone number format. Please use +255XXXXXXXXX or 0XXXXXXXXX format.'])
                    ->withInput();
            }
        }

        $user = Auth::user();
        $customer = $user->customer;
        $invoice = Invoice::findOrFail($validated['invoice_id']);

        // Verify the invoice belongs to the customer
        if ($invoice->customer_id !== $customer->id) {
            return redirect()->route('customer.invoices.index')
                ->with('error', 'Unauthorized access to invoice.');
        }

        // Verify the amount matches the balance due
        if ($validated['amount'] != $invoice->balance_due) {
            return response()->json(['error' => 'Payment amount does not match invoice balance.'], 400);
        }

        try {
            if ($validated['payment_method'] === 'clickpesa') {
                $paymentData = [
                    'gateway' => 'clickpesa',
                    'method' => 'mobile_money',
                    'amount' => $validated['amount'],
                    'currency' => $invoice->currency,
                    'phone_number' => $validated['phone_number'],
                ];

                // Check ClickPesa configuration first
                $clickpesaConfig = config('payment.gateways.clickpesa');
                Log::info('ClickPesa configuration check', [
                    'client_id_set' => !empty($clickpesaConfig['client_id']),
                    'api_key_set' => !empty($clickpesaConfig['api_key']),
                    'checksum_secret_set' => !empty($clickpesaConfig['checksum_secret']),
                    'enabled' => $clickpesaConfig['enabled'] ?? false,
                ]);

                Log::info('Processing ClickPesa payment', [
                    'invoice_id' => $invoice->id,
                    'customer_id' => $customer->id,
                    'payment_data' => $paymentData,
                ]);

                // Check if ClickPesa is properly configured
                if (!$this->paymentService->validateGatewayConfig('clickpesa')) {
                    Log::error('ClickPesa not configured', [
                        'invoice_id' => $invoice->id,
                        'config' => $clickpesaConfig,
                    ]);

                    return redirect()->back()
                        ->withErrors(['payment' => 'ClickPesa payment gateway is not properly configured. Please contact support.'])
                        ->withInput();
                }

                $result = $this->paymentService->processPayment($invoice, $paymentData);

                Log::info('ClickPesa payment result', [
                    'invoice_id' => $invoice->id,
                    'result' => $result,
                ]);

                if ($result['success']) {
                    return redirect()->route('customer.invoices.index')
                        ->with('success', 'Payment initiated successfully. Please check your phone for USSD prompt.');
                } else {
                    Log::error('ClickPesa payment failed', [
                        'invoice_id' => $invoice->id,
                        'error' => $result['error'] ?? 'Unknown error',
                        'result' => $result,
                    ]);

                    return redirect()->back()
                        ->withErrors(['payment' => $result['error'] ?? 'Payment processing failed'])
                        ->withInput();
                }
            } else {
                // Card payment not implemented yet
                return redirect()->back()
                    ->withErrors(['payment' => 'Card payment is not available yet. Please use ClickPesa mobile money.'])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'invoice_id' => $invoice->id,
                'customer_id' => $customer->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()
                ->withErrors(['payment' => 'Payment processing failed. Please try again.'])
                ->withInput();
        }
    }



    /**
     * Handle successful payment callback
     */
    public function paymentSuccess(Request $request)
    {
        $transactionId = $request->get('vendor_order_id');
        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            return redirect()->route('customer.invoices.index')
                           ->with('error', 'Payment record not found.');
        }

        // Update payment status
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'gateway_response' => json_encode($request->all())
        ]);

        // Update invoice
        $invoice = $payment->invoice;
        $invoice->update([
            'paid_amount' => $invoice->paid_amount + $payment->amount,
            'balance_due' => $invoice->total_amount - ($invoice->paid_amount + $payment->amount),
            'status' => 'paid'
        ]);

        // Notify admins of successful payment
        $this->notifyAdminsOfPayment($payment);

        return redirect()->route('customer.invoices.index')
                       ->with('success', 'Payment completed successfully!');
    }

    /**
     * Handle failed payment callback
     */
    public function paymentFailed(Request $request)
    {
        $transactionId = $request->get('vendor_order_id');
        $payment = Payment::where('transaction_id', $transactionId)->first();

        if ($payment) {
            $payment->update([
                'status' => 'failed',
                'gateway_response' => json_encode($request->all())
            ]);
        }

        return redirect()->route('customer.invoices.index')
                       ->with('error', 'Payment failed. Please try again.');
    }

    /**
     * Notify admins of successful payment
     */
    private function notifyAdminsOfPayment($payment)
    {
        // Get all admin users
        $admins = User::where('role', 'admin')->get();

        // Send notification to all admins
        Notification::send($admins, new PaymentSuccessNotification($payment));

        Log::info('Payment completed - Admin notification sent', [
            'payment_id' => $payment->id,
            'invoice_id' => $payment->invoice_id,
            'amount' => $payment->amount,
            'customer_id' => $payment->customer_id
        ]);
    }
}
