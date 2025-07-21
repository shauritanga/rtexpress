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
            ->with(['payments'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            if ($request->status === 'unpaid') {
                // For payments page, show only invoices that need payment
                $query->whereIn('status', ['sent', 'overdue'])
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
            }

            $paymentData = [
                'gateway' => $gateway,
                'method' => $method,
                'amount' => $validated['amount'],
                'payment_method_id' => $validated['payment_method_id'],
            ];

            $result = $this->paymentService->processPayment($invoice, $paymentData);

            if ($result['success']) {
                DB::commit();

                return response()->json([
                    'success' => true,
                    'payment' => $result['payment'],
                    'message' => 'Payment processed successfully',
                ]);
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
}
