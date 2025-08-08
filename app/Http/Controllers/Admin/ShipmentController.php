<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    /**
     * Display a listing of shipments with filtering and search.
     */
    public function index(Request $request)
    {
        $query = Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse', 'creator', 'assignedUser'])
            ->latest();

        // Apply filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('service_type')) {
            $query->byServiceType($request->service_type);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Get overdue shipments if requested
        if ($request->boolean('overdue_only')) {
            $query->overdue();
        }

        $shipments = $query->paginate(15)->withQueryString();

        // Get filter options
        $customers = Customer::active()->select('id', 'customer_code', 'company_name')->get();
        $warehouses = Warehouse::active()->select('id', 'code', 'name')->get();

        // Get summary statistics
        $stats = $this->getShipmentStats();

        return Inertia::render('Admin/Shipments/Index', [
            'shipments' => $shipments,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'filters' => $request->only(['search', 'status', 'service_type', 'customer_id', 'date_from', 'date_to', 'overdue_only']),
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new shipment.
     */
    public function create()
    {
        $customers = Customer::active()->select('id', 'customer_code', 'company_name', 'email', 'phone')->get();
        $warehouses = Warehouse::active()->select('id', 'code', 'name', 'city')->get();
        $users = User::active()->withRole(['admin', 'warehouse_staff'])->select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Shipments/Create', [
            'customers' => $customers,
            'warehouses' => $warehouses,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created shipment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'origin_warehouse_id' => 'nullable|exists:warehouses,id',
            'destination_warehouse_id' => 'nullable|exists:warehouses,id',
            'origin_address' => 'required|string',
            'destination_address' => 'required|string',
            'sender_name' => 'required|string|max:255',
            'sender_phone' => 'required|string|max:20',
            'sender_address' => 'required|string',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'recipient_address' => 'required|string',
            'service_type' => ['required', Rule::in(['standard', 'express', 'overnight', 'economy', 'international'])],
            'package_type' => ['nullable', Rule::in(['document', 'package', 'pallet', 'container'])],
            'weight_kg' => 'required|numeric|min:0.01|max:10000',
            'dimensions_length_cm' => 'nullable|numeric|min:0|max:1000',
            'dimensions_width_cm' => 'nullable|numeric|min:0|max:1000',
            'dimensions_height_cm' => 'nullable|numeric|min:0|max:1000',
            'declared_value' => 'required|numeric|min:0|max:1000000',
            'insurance_value' => 'nullable|numeric|min:0|max:100000',
            'special_instructions' => 'nullable|string|max:1000',
            'estimated_delivery_date' => 'nullable|date|after_or_equal:today',
            'assigned_to' => 'nullable|exists:users,id',
            'items' => 'nullable|array',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.weight' => 'required_with:items|numeric|min:0',
            'items.*.value' => 'required_with:items|numeric|min:0',
            'items.*.dimensions' => 'nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $shipment = Shipment::create(array_merge($validated, [
                'created_by' => Auth::id(),
                'status' => 'pending',
            ]));

            // Add initial tracking entry
            $shipment->addTrackingUpdate(
                'pending',
                $shipment->originWarehouse->city ?? 'Origin',
                'Shipment created and pending pickup',
                Auth::user()
            );

            DB::commit();

            return redirect()
                ->route('admin.shipments.show', $shipment)
                ->with('success', "Shipment {$shipment->tracking_number} created successfully!");

        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create shipment. Please try again.']);
        }
    }

    /**
     * Display the specified shipment with full details.
     */
    public function show(Shipment $shipment)
    {
        $shipment->load([
            'customer',
            'originWarehouse',
            'destinationWarehouse',
            'creator',
            'assignedUser',
            'items',
            'trackingHistory.recordedBy',
        ]);

        return Inertia::render('Admin/Shipments/Show', [
            'shipment' => $shipment,
        ]);
    }

    /**
     * Show the form for editing the specified shipment.
     */
    public function edit(Shipment $shipment)
    {
        $customers = Customer::active()->select('id', 'customer_code', 'company_name')->get();
        $warehouses = Warehouse::active()->select('id', 'code', 'name', 'city')->get();
        $users = User::active()->withRole(['admin', 'warehouse_staff'])->select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Shipments/Edit', [
            'shipment' => $shipment,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified shipment.
     */
    public function update(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'origin_warehouse_id' => 'required|exists:warehouses,id',
            'destination_warehouse_id' => 'nullable|exists:warehouses,id',
            'sender_name' => 'required|string|max:255',
            'sender_phone' => 'required|string|max:20',
            'sender_address' => 'required|string',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:20',
            'recipient_address' => 'required|string',
            'service_type' => ['required', Rule::in(['standard', 'express', 'overnight', 'international'])],
            'package_type' => ['required', Rule::in(['document', 'package', 'pallet', 'container'])],
            'status' => ['required', Rule::in(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'cancelled'])],
            'weight_kg' => 'required|numeric|min:0.01|max:10000',
            'dimensions_length_cm' => 'required|numeric|min:1|max:1000',
            'dimensions_width_cm' => 'required|numeric|min:1|max:1000',
            'dimensions_height_cm' => 'required|numeric|min:1|max:1000',
            'declared_value' => 'required|numeric|min:0|max:1000000',
            'insurance_value' => 'nullable|numeric|min:0|max:100000',
            'special_instructions' => 'nullable|string|max:1000',
            'estimated_delivery_date' => 'nullable|date|after:today',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        try {
            $oldStatus = $shipment->status;
            $shipment->update($validated);

            // If status changed, send email notification and add tracking update
            if ($oldStatus !== $validated['status']) {
                // Add tracking update for status change
                $shipment->addTrackingUpdate(
                    $validated['status'],
                    $shipment->originWarehouse->city ?? 'Location Updated',
                    'Status updated via shipment edit form',
                    Auth::user()
                );

                // Update delivery date if delivered
                if ($validated['status'] === 'delivered') {
                    $shipment->update(['actual_delivery_date' => now()]);
                }

                // Send notification to customer using new global channel system
                try {
                    $notificationService = new NotificationService;
                    $notificationService->sendShipmentStatusUpdate($shipment, $validated['status']);
                } catch (\Exception $e) {
                    // Log the error but don't fail the update
                    \Log::error('Failed to send shipment update notification: '.$e->getMessage());
                }
            }

            return redirect()
                ->route('admin.shipments.show', $shipment)
                ->with('success', "Shipment {$shipment->tracking_number} updated successfully!".
                    ($oldStatus !== $validated['status'] ? ' Customer has been notified via email.' : ''));

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update shipment. Please try again.']);
        }
    }

    /**
     * Remove the specified shipment.
     */
    public function destroy(Shipment $shipment)
    {
        try {
            // Only allow deletion of pending shipments
            if ($shipment->status !== 'pending') {
                return back()->withErrors(['error' => 'Only pending shipments can be deleted.']);
            }

            $trackingNumber = $shipment->tracking_number;
            $shipment->delete();

            return redirect()
                ->route('admin.shipments.index')
                ->with('success', "Shipment {$trackingNumber} deleted successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete shipment. Please try again.']);
        }
    }

    /**
     * Update shipment status with tracking information.
     */
    public function updateStatus(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'cancelled'])],
            'location' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $oldStatus = $shipment->status;

            $shipment->addTrackingUpdate(
                $validated['status'],
                $validated['location'],
                $validated['notes'] ?? null,
                Auth::user()
            );

            // Update delivery date if delivered
            if ($validated['status'] === 'delivered') {
                $shipment->update(['actual_delivery_date' => now()]);
            }

            // Send email notification to customer
            try {
                $notificationService = new NotificationService;
                $notificationService->sendShipmentUpdate($shipment, $validated['status']);
            } catch (\Exception $e) {
                // Log the error but don't fail the status update
                \Log::error('Failed to send shipment update notification: '.$e->getMessage());
            }

            return back()->with('success', 'Shipment status updated successfully! Customer has been notified via email.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update status. Please try again.']);
        }
    }

    /**
     * Assign shipment to a user.
     */
    public function assign(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        try {
            $shipment->update($validated);

            $assignedUser = User::find($validated['assigned_to']);

            return back()->with('success', "Shipment assigned to {$assignedUser->name} successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to assign shipment. Please try again.']);
        }
    }

    /**
     * Get shipment statistics for dashboard.
     */
    private function getShipmentStats(): array
    {
        return [
            'total' => Shipment::count(),
            'pending' => Shipment::byStatus('pending')->count(),
            'in_transit' => Shipment::byStatus('in_transit')->count(),
            'delivered' => Shipment::byStatus('delivered')->count(),
            'overdue' => Shipment::overdue()->count(),
            'today' => Shipment::whereDate('created_at', today())->count(),
        ];
    }

    /**
     * Export shipments to CSV.
     */
    public function export(Request $request)
    {
        $query = Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse']);

        // Apply same filters as index
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $shipments = $query->get();

        $filename = 'shipments_'.now()->format('Y-m-d_H-i-s').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($shipments) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Tracking Number',
                'Customer',
                'Status',
                'Service Type',
                'Origin',
                'Destination',
                'Weight (kg)',
                'Declared Value',
                'Created Date',
                'Estimated Delivery',
                'Actual Delivery',
            ]);

            // CSV data
            foreach ($shipments as $shipment) {
                fputcsv($file, [
                    $shipment->tracking_number,
                    $shipment->customer->company_name ?? 'N/A',
                    ucfirst(str_replace('_', ' ', $shipment->status)),
                    ucfirst($shipment->service_type),
                    $shipment->originWarehouse->name ?? 'N/A',
                    $shipment->destinationWarehouse->name ?? 'Direct Delivery',
                    $shipment->weight_kg,
                    $shipment->declared_value,
                    $shipment->created_at->format('Y-m-d H:i:s'),
                    $shipment->estimated_delivery_date?->format('Y-m-d H:i:s') ?? 'N/A',
                    $shipment->actual_delivery_date?->format('Y-m-d H:i:s') ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
