<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the customer's invoices.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Get customer's invoices with filtering
        $query = Invoice::where('customer_id', $customer->id);

        // Apply search filter
        if (request('search')) {
            $query->where('invoice_number', 'like', '%' . request('search') . '%');
        }

        // Apply status filter
        if (request('status')) {
            $query->where('status', request('status'));
        }

        // Apply date range filter
        if (request('date_from')) {
            $query->whereDate('issue_date', '>=', request('date_from'));
        }
        if (request('date_to')) {
            $query->whereDate('issue_date', '<=', request('date_to'));
        }

        $invoices = $query->orderBy('issue_date', 'desc')->paginate(20);

        // Calculate stats for the customer
        $stats = [
            'total' => Invoice::where('customer_id', $customer->id)->count(),
            'draft' => Invoice::where('customer_id', $customer->id)->where('status', 'draft')->count(),
            'sent' => Invoice::where('customer_id', $customer->id)->where('status', 'sent')->count(),
            'paid' => Invoice::where('customer_id', $customer->id)->where('status', 'paid')->count(),
            'overdue' => Invoice::where('customer_id', $customer->id)
                ->where('status', 'sent')
                ->where('due_date', '<', now())
                ->count(),
            'total_amount' => Invoice::where('customer_id', $customer->id)->sum('total_amount'),
            'paid_amount' => Invoice::where('customer_id', $customer->id)->sum('paid_amount'),
            'balance_due' => Invoice::where('customer_id', $customer->id)->sum('balance_due'),
        ];

        return Inertia::render('Customer/Invoices/Index', [
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => request()->only(['search', 'status', 'date_from', 'date_to']),
            'customer' => $customer,
        ]);
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer || $invoice->customer_id !== $customer->id) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Load related data
        $invoice->load(['customer', 'payments']);

        return Inertia::render('Customer/Invoices/Show', [
            'invoice' => $invoice,
            'customer' => $customer,
        ]);
    }

    /**
     * Download the invoice as PDF.
     */
    public function download(Invoice $invoice)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer || $invoice->customer_id !== $customer->id) {
            abort(403, 'Unauthorized access to invoice');
        }

        // For now, return a simple response
        // In a real implementation, you would generate a PDF here
        return response()->json([
            'message' => 'PDF download functionality will be implemented',
            'invoice_number' => $invoice->invoice_number,
        ]);
    }
}
