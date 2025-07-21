<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers with filtering and search.
     */
    public function index(Request $request)
    {
        $query = Customer::with(['creator'])
            ->withCount(['shipments'])
            ->latest();

        // Apply filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('country')) {
            $query->byCountry($request->country);
        }

        if ($request->filled('payment_terms')) {
            $query->where('payment_terms', $request->payment_terms);
        }

        $customers = $query->paginate(15)->withQueryString();

        // Get filter options
        $countries = Customer::distinct()->pluck('country')->filter()->sort()->values();

        // Get summary statistics
        $stats = $this->getCustomerStats();

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'countries' => $countries,
            'filters' => $request->only(['search', 'status', 'country', 'payment_terms']),
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create()
    {
        return Inertia::render('Admin/Customers/Create');
    }

    /**
     * Store a newly created customer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'tax_number' => 'nullable|string|max:50',
            'credit_limit' => 'required|numeric|min:0|max:10000000',
            'payment_terms' => ['required', Rule::in(['net_15', 'net_30', 'net_60', 'net_90', 'cash_on_delivery'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $customer = Customer::create(array_merge($validated, [
                'created_by' => Auth::id(),
            ]));

            return redirect()
                ->route('admin.customers.show', $customer)
                ->with('success', "Customer {$customer->customer_code} created successfully!");

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create customer. Please try again.']);
        }
    }

    /**
     * Display the specified customer with shipment history.
     */
    public function show(Customer $customer)
    {
        $customer->load([
            'creator',
            'shipments' => function ($query) {
                $query->with(['originWarehouse', 'destinationWarehouse'])
                      ->latest()
                      ->limit(10);
            }
        ]);

        // Get customer statistics
        $customerStats = [
            'total_shipments' => $customer->shipments()->count(),
            'active_shipments' => $customer->shipments()->active()->count(),
            'delivered_shipments' => $customer->shipments()->byStatus('delivered')->count(),
            'total_spent' => 0, // TODO: Calculate when billing is implemented
            'outstanding_balance' => $customer->getOutstandingBalance(),
        ];

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer,
            'customerStats' => $customerStats,
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Customer $customer)
    {
        return Inertia::render('Admin/Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('customers', 'email')->ignore($customer->id)],
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'tax_number' => 'nullable|string|max:50',
            'credit_limit' => 'required|numeric|min:0|max:10000000',
            'payment_terms' => ['required', Rule::in(['net_15', 'net_30', 'net_60', 'net_90', 'cash_on_delivery'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $customer->update($validated);

            return redirect()
                ->route('admin.customers.show', $customer)
                ->with('success', "Customer {$customer->customer_code} updated successfully!");

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update customer. Please try again.']);
        }
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer)
    {
        try {
            // Check if customer has active shipments
            if ($customer->shipments()->active()->exists()) {
                return back()->withErrors(['error' => 'Cannot delete customer with active shipments.']);
            }

            $customerCode = $customer->customer_code;
            $customer->delete();

            return redirect()
                ->route('admin.customers.index')
                ->with('success', "Customer {$customerCode} deleted successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete customer. Please try again.']);
        }
    }

    /**
     * Toggle customer status (activate/deactivate).
     */
    public function toggleStatus(Customer $customer)
    {
        try {
            $newStatus = $customer->status === 'active' ? 'inactive' : 'active';
            $customer->update(['status' => $newStatus]);

            $statusText = $newStatus === 'active' ? 'activated' : 'deactivated';

            return back()->with('success', "Customer {$customer->customer_code} {$statusText} successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update customer status. Please try again.']);
        }
    }

    /**
     * Get customer statistics for dashboard.
     */
    private function getCustomerStats(): array
    {
        $totalCustomers = Customer::count();
        $activeCustomers = Customer::where('status', 'active')->count();
        $inactiveCustomers = Customer::where('status', 'inactive')->count();
        $newThisMonth = Customer::whereMonth('created_at', now()->month)->count();

        // Calculate total revenue from shipments
        $totalRevenue = Customer::join('shipments', 'customers.id', '=', 'shipments.customer_id')
            ->sum('shipments.declared_value') ?? 0;

        // Calculate average order value
        $totalShipments = \App\Models\Shipment::count();
        $avgOrderValue = $totalShipments > 0 ? $totalRevenue / $totalShipments : 0;

        return [
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'inactive_customers' => $inactiveCustomers,
            'new_this_month' => $newThisMonth,
            'total_revenue' => $totalRevenue,
            'avg_order_value' => $avgOrderValue,
        ];
    }

    /**
     * Export customers to CSV.
     */
    public function export(Request $request)
    {
        $query = Customer::with(['creator']);

        // Apply same filters as index
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('country')) {
            $query->byCountry($request->country);
        }

        $customers = $query->get();

        $filename = 'customers_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($customers) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Customer Code',
                'Company Name',
                'Contact Person',
                'Email',
                'Phone',
                'City',
                'Country',
                'Status',
                'Credit Limit',
                'Payment Terms',
                'Created Date',
                'Total Shipments',
            ]);

            // CSV data
            foreach ($customers as $customer) {
                fputcsv($file, [
                    $customer->customer_code,
                    $customer->company_name,
                    $customer->contact_person,
                    $customer->email,
                    $customer->phone,
                    $customer->city,
                    $customer->country,
                    ucfirst($customer->status),
                    $customer->credit_limit,
                    str_replace('_', ' ', ucwords($customer->payment_terms, '_')),
                    $customer->created_at->format('Y-m-d H:i:s'),
                    $customer->shipments_count ?? 0,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
