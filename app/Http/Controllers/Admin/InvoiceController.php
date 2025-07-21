<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Customer;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load([
            'customer',
            'shipment',
            'items',
            'payments.processor',
            'creator',
            'sender'
        ]);

        // Mark as viewed if not already viewed
        if (!$invoice->viewed_at && $invoice->status === 'sent') {
            $invoice->markAsViewed();
        }

        return Inertia::render('Admin/Billing/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for creating a new invoice.
     */
    public function create(Request $request)
    {
        $customers = Customer::select('id', 'name', 'email', 'phone', 'address')
            ->orderBy('name')
            ->get();

        $shipments = [];

        // If customer is selected, get their shipments
        if ($request->filled('customer_id')) {
            $shipments = Shipment::where('customer_id', $request->customer_id)
                ->whereDoesntHave('invoice')
                ->select('id', 'tracking_number', 'recipient_name', 'total_amount')
                ->latest()
                ->get();
        }

        // If shipment is pre-selected
        $selectedShipment = null;
        if ($request->filled('shipment_id')) {
            $selectedShipment = Shipment::with('customer')
                ->find($request->shipment_id);
        }

        return Inertia::render('Admin/Billing/Invoices/Create', [
            'customers' => $customers,
            'shipments' => $shipments,
            'selectedShipment' => $selectedShipment,
            'preselected' => $request->only(['customer_id', 'shipment_id']),
        ]);
    }

    /**
     * Store a newly created invoice.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'shipment_id' => 'nullable|exists:shipments,id',
            'type' => ['required', Rule::in(['standard', 'recurring', 'credit_note', 'proforma'])],
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'currency' => 'required|string|size:3',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'tax_type' => 'nullable|string|max:50',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'terms_conditions' => 'nullable|string|max:2000',
            'payment_terms' => 'nullable|string|max:100',
            'payment_methods' => 'nullable|array',
            'billing_address' => 'required|array',
            'billing_address.name' => 'required|string|max:255',
            'billing_address.address' => 'required|string|max:500',
            'billing_address.city' => 'required|string|max:100',
            'billing_address.country' => 'required|string|max:100',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.unit' => 'nullable|string|max:20',
            'items.*.item_code' => 'nullable|string|max:50',
            'items.*.type' => ['required', Rule::in(['service', 'product', 'shipping', 'tax', 'discount'])],
            'items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.notes' => 'nullable|string|max:500',
        ]);

        try {
            // Create invoice
            $invoice = Invoice::create([
                'customer_id' => $validated['customer_id'],
                'shipment_id' => $validated['shipment_id'] ?? null,
                'status' => 'draft',
                'type' => $validated['type'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'currency' => $validated['currency'],
                'tax_rate' => $validated['tax_rate'] ?? 0,
                'tax_type' => $validated['tax_type'],
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'notes' => $validated['notes'],
                'terms_conditions' => $validated['terms_conditions'],
                'payment_terms' => $validated['payment_terms'],
                'payment_methods' => $validated['payment_methods'] ?? [],
                'billing_address' => $validated['billing_address'],
                'company_address' => $this->getCompanyAddress(),
                'created_by' => auth()->id(),
                'subtotal' => 0,
                'tax_amount' => 0,
                'total_amount' => 0,
                'paid_amount' => 0,
                'balance_due' => 0,
            ]);

            // Create invoice items
            foreach ($validated['items'] as $index => $itemData) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $itemData['description'],
                    'item_code' => $itemData['item_code'] ?? null,
                    'type' => $itemData['type'],
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['unit'] ?? 'pcs',
                    'unit_price' => $itemData['unit_price'],
                    'discount_percentage' => $itemData['discount_percentage'] ?? 0,
                    'tax_rate' => $itemData['tax_rate'] ?? $validated['tax_rate'] ?? 0,
                    'notes' => $itemData['notes'] ?? null,
                    'sort_order' => $index,
                ]);
            }

            // Calculate totals (this will be done automatically by the model)
            $invoice->refresh();

            return redirect()->route('admin.invoices.show', $invoice)
                ->with('success', 'Invoice created successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create invoice: ' . $e->getMessage()]);
        }
    }

    /**
     * Send invoice to customer.
     */
    public function send(Invoice $invoice)
    {
        try {
            if ($invoice->status === 'draft') {
                $invoice->markAsSent(auth()->user());

                // TODO: Send email notification to customer

                return back()->with('success', 'Invoice sent successfully.');
            }

            return back()->withErrors(['error' => 'Invoice has already been sent.']);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to send invoice: ' . $e->getMessage()]);
        }
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $amount = $validated['amount'] ?? $invoice->balance_due;

            $invoice->markAsPaid($amount);

            // Create payment record
            $invoice->payments()->create([
                'payment_number' => \App\Models\Payment::generatePaymentNumber(),
                'customer_id' => $invoice->customer_id,
                'status' => 'completed',
                'type' => $amount >= $invoice->total_amount ? 'full' : 'partial',
                'method' => 'manual',
                'currency' => $invoice->currency,
                'amount' => $amount,
                'net_amount' => $amount,
                'payment_date' => $validated['payment_date'] ?? now(),
                'processed_at' => now(),
                'notes' => $validated['notes'],
                'created_by' => auth()->id(),
                'processed_by' => auth()->id(),
            ]);

            return back()->with('success', 'Invoice marked as paid successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to mark invoice as paid: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancel invoice.
     */
    public function cancel(Invoice $invoice)
    {
        try {
            if (in_array($invoice->status, ['draft', 'sent', 'viewed'])) {
                $invoice->update(['status' => 'cancelled']);

                return back()->with('success', 'Invoice cancelled successfully.');
            }

            return back()->withErrors(['error' => 'Cannot cancel a paid invoice.']);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to cancel invoice: ' . $e->getMessage()]);
        }
    }

    /**
     * Get company address for invoices.
     */
    private function getCompanyAddress(): array
    {
        return [
            'name' => 'RT Express Cargo',
            'address' => '123 Business Street',
            'city' => 'Dar es Salaam',
            'country' => 'Tanzania',
            'postal_code' => '12345',
            'phone' => '+255 123 456 789',
            'email' => 'billing@rtexpress.com',
            'tax_id' => 'TIN-123456789',
        ];
    }
}
