<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class BillingController extends Controller
{
    /**
     * Display billing dashboard with overview statistics.
     */
    public function index(Request $request)
    {
        // Get billing statistics
        $stats = $this->getBillingStats();

        // Get recent invoices
        $recentInvoices = Invoice::with(['customer', 'shipment'])
            ->latest()
            ->limit(10)
            ->get();

        // Get recent payments
        $recentPayments = Payment::with(['invoice.customer', 'customer'])
            ->latest()
            ->limit(10)
            ->get();

        // Get overdue invoices
        $overdueInvoices = Invoice::with(['customer'])
            ->where('status', '!=', 'paid')
            ->where('status', '!=', 'cancelled')
            ->where('due_date', '<', now())
            ->orderBy('due_date')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Billing/Index', [
            'stats' => $stats,
            'recentInvoices' => $recentInvoices,
            'recentPayments' => $recentPayments,
            'overdueInvoices' => $overdueInvoices,
        ]);
    }

    /**
     * Display invoice management page.
     */
    public function invoices(Request $request)
    {
        $query = Invoice::with(['customer', 'shipment', 'creator'])
            ->withCount('payments')
            ->latest();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('customer', function ($customerQuery) use ($request) {
                      $customerQuery->where('name', 'like', '%' . $request->search . '%')
                                  ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        $invoices = $query->paginate(15)->withQueryString();

        // Get filter options
        $customers = Customer::select('id', 'company_name', 'contact_person', 'address_line_1', 'address_line_2', 'city', 'state_province', 'customer_code')->orderBy('company_name')->get();
        $stats = $this->getInvoiceStats();

        return Inertia::render('Admin/Billing/Invoices/Index', [
            'invoices' => $invoices,
            'customers' => $customers,
            'filters' => $request->only(['search', 'status', 'customer_id', 'date_from', 'date_to']),
            'stats' => $stats,
        ]);
    }

    /**
     * Display payment management page.
     */
    public function payments(Request $request)
    {
        $query = Payment::with(['invoice', 'customer', 'processor'])
            ->latest();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('payment_number', 'like', '%' . $request->search . '%')
                  ->orWhere('reference_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('customer', function ($customerQuery) use ($request) {
                      $customerQuery->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('method')) {
            $query->where('method', $request->method);
        }

        if ($request->filled('gateway')) {
            $query->where('gateway', $request->gateway);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        $payments = $query->paginate(15)->withQueryString();
        $stats = $this->getPaymentStats();

        return Inertia::render('Admin/Billing/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status', 'method', 'gateway', 'date_from', 'date_to']),
            'stats' => $stats,
        ]);
    }

    /**
     * Get billing dashboard statistics.
     */
    private function getBillingStats(): array
    {
        $currentMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        return [
            'total_revenue' => [
                'current' => Payment::where('status', 'completed')
                    ->whereDate('payment_date', '>=', $currentMonth)
                    ->sum('amount'),
                'previous' => Payment::where('status', 'completed')
                    ->whereDate('payment_date', '>=', $lastMonth)
                    ->whereDate('payment_date', '<', $currentMonth)
                    ->sum('amount'),
            ],
            'outstanding_amount' => Invoice::where('status', '!=', 'paid')
                ->where('status', '!=', 'cancelled')
                ->sum('balance_due'),
            'total_invoices' => [
                'current' => Invoice::whereDate('created_at', '>=', $currentMonth)->count(),
                'previous' => Invoice::whereDate('created_at', '>=', $lastMonth)
                    ->whereDate('created_at', '<', $currentMonth)->count(),
            ],
            'overdue_invoices' => Invoice::where('status', '!=', 'paid')
                ->where('status', '!=', 'cancelled')
                ->where('due_date', '<', now())
                ->count(),
            'pending_payments' => Payment::whereIn('status', ['pending', 'processing'])->count(),
            'payment_success_rate' => $this->calculatePaymentSuccessRate(),
        ];
    }

    /**
     * Get invoice statistics.
     */
    private function getInvoiceStats(): array
    {
        return [
            'total' => Invoice::count(),
            'draft' => Invoice::where('status', 'draft')->count(),
            'sent' => Invoice::where('status', 'sent')->count(),
            'viewed' => Invoice::where('status', 'viewed')->count(),
            'paid' => Invoice::where('status', 'paid')->count(),
            'overdue' => Invoice::where('status', '!=', 'paid')
                ->where('status', '!=', 'cancelled')
                ->where('due_date', '<', now())
                ->count(),
            'cancelled' => Invoice::where('status', 'cancelled')->count(),
            'total_amount' => Invoice::sum('total_amount'),
            'paid_amount' => Invoice::sum('paid_amount'),
            'outstanding_amount' => Invoice::sum('balance_due'),
        ];
    }

    /**
     * Get payment statistics.
     */
    private function getPaymentStats(): array
    {
        return [
            'total' => Payment::count(),
            'completed' => Payment::where('status', 'completed')->count(),
            'pending' => Payment::where('status', 'pending')->count(),
            'processing' => Payment::where('status', 'processing')->count(),
            'failed' => Payment::where('status', 'failed')->count(),
            'refunded' => Payment::where('status', 'refunded')->count(),
            'total_amount' => Payment::where('status', 'completed')->sum('amount'),
            'total_fees' => Payment::where('status', 'completed')->sum('fee_amount'),
            'net_amount' => Payment::where('status', 'completed')->sum('net_amount'),
        ];
    }

    /**
     * Calculate payment success rate.
     */
    private function calculatePaymentSuccessRate(): float
    {
        $totalPayments = Payment::count();

        if ($totalPayments === 0) {
            return 0;
        }

        $successfulPayments = Payment::where('status', 'completed')->count();

        return round(($successfulPayments / $totalPayments) * 100, 2);
    }
}
