<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    /**
     * Display a listing of warehouses.
     */
    public function index(Request $request)
    {
        $query = Warehouse::withCount(['originShipments', 'destinationShipments'])
            ->latest();

        // Apply filters
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        $warehouses = $query->paginate(15)->withQueryString();

        // Get filter options
        $cities = Warehouse::distinct()->pluck('city')->filter()->sort()->values();

        // Get summary statistics
        $stats = $this->getWarehouseStats();

        return Inertia::render('Admin/Warehouses/Index', [
            'warehouses' => $warehouses,
            'cities' => $cities,
            'filters' => $request->only(['search', 'status', 'city']),
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new warehouse.
     */
    public function create()
    {
        return Inertia::render('Admin/Warehouses/Create');
    }

    /**
     * Store a newly created warehouse.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:10|unique:warehouses,code',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:warehouses,email',
            'contact_person' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'capacity_cubic_meters' => 'nullable|numeric|min:0|max:1000000',
            'operating_hours' => 'required|array',
            'operating_hours.monday' => 'required|array',
            'operating_hours.monday.open' => 'required_if:operating_hours.monday.closed,false|date_format:H:i',
            'operating_hours.monday.close' => 'required_if:operating_hours.monday.closed,false|date_format:H:i',
            'operating_hours.monday.closed' => 'required|boolean',
            'operating_hours.tuesday' => 'required|array',
            'operating_hours.tuesday.open' => 'required_if:operating_hours.tuesday.closed,false|date_format:H:i',
            'operating_hours.tuesday.close' => 'required_if:operating_hours.tuesday.closed,false|date_format:H:i',
            'operating_hours.tuesday.closed' => 'required|boolean',
            'operating_hours.wednesday' => 'required|array',
            'operating_hours.wednesday.open' => 'required_if:operating_hours.wednesday.closed,false|date_format:H:i',
            'operating_hours.wednesday.close' => 'required_if:operating_hours.wednesday.closed,false|date_format:H:i',
            'operating_hours.wednesday.closed' => 'required|boolean',
            'operating_hours.thursday' => 'required|array',
            'operating_hours.thursday.open' => 'required_if:operating_hours.thursday.closed,false|date_format:H:i',
            'operating_hours.thursday.close' => 'required_if:operating_hours.thursday.closed,false|date_format:H:i',
            'operating_hours.thursday.closed' => 'required|boolean',
            'operating_hours.friday' => 'required|array',
            'operating_hours.friday.open' => 'required_if:operating_hours.friday.closed,false|date_format:H:i',
            'operating_hours.friday.close' => 'required_if:operating_hours.friday.closed,false|date_format:H:i',
            'operating_hours.friday.closed' => 'required|boolean',
            'operating_hours.saturday' => 'required|array',
            'operating_hours.saturday.open' => 'required_if:operating_hours.saturday.closed,false|date_format:H:i',
            'operating_hours.saturday.close' => 'required_if:operating_hours.saturday.closed,false|date_format:H:i',
            'operating_hours.saturday.closed' => 'required|boolean',
            'operating_hours.sunday' => 'required|array',
            'operating_hours.sunday.open' => 'required_if:operating_hours.sunday.closed,false|date_format:H:i',
            'operating_hours.sunday.close' => 'required_if:operating_hours.sunday.closed,false|date_format:H:i',
            'operating_hours.sunday.closed' => 'required|boolean',
            'status' => 'required|string|in:active,inactive,maintenance',
        ]);

        try {
            // Generate warehouse code if not provided
            if (empty($validated['code'])) {
                $validated['code'] = $this->generateWarehouseCode($validated['city']);
            }

            // Convert empty strings to null for decimal fields
            if (empty($validated['latitude'])) {
                $validated['latitude'] = null;
            }
            if (empty($validated['longitude'])) {
                $validated['longitude'] = null;
            }
            if (empty($validated['capacity_cubic_meters'])) {
                $validated['capacity_cubic_meters'] = null;
            }

            // Convert operating hours to the format expected by the database
            $operatingHours = [];
            foreach ($validated['operating_hours'] as $day => $hours) {
                if ($hours['closed']) {
                    $operatingHours[$day] = 'closed';
                } else {
                    $operatingHours[$day] = $hours['open'].'-'.$hours['close'];
                }
            }
            $validated['operating_hours'] = $operatingHours;

            $warehouse = Warehouse::create($validated);

            return redirect()
                ->route('admin.warehouses.show', $warehouse)
                ->with('success', "Warehouse {$warehouse->code} created successfully!");

        } catch (\Exception $e) {
            \Log::error('Warehouse creation failed: '.$e->getMessage(), [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create warehouse. Please try again.']);
        }
    }

    /**
     * Display the specified warehouse with shipment statistics.
     */
    public function show(Warehouse $warehouse)
    {
        $warehouse->load([
            'originShipments' => function ($query) {
                $query->with(['customer', 'destinationWarehouse'])
                    ->latest()
                    ->limit(10);
            },
        ]);

        // Get warehouse statistics
        $stats = [
            'total_shipments' => $warehouse->originShipments()->count() + $warehouse->destinationShipments()->count(),
            'active_shipments' => $warehouse->originShipments()->active()->count(),
            'monthly_throughput' => $warehouse->originShipments()->whereMonth('created_at', now()->month)->count(),
            'avg_processing_time' => 2.4, // This would be calculated from actual data
            'staff_count' => 15, // This would come from a staff/users table
            'utilization_rate' => min(100, $warehouse->getCapacityUtilization()),
        ];

        // Get recent activity (this would come from an activity log table)
        $recentActivity = [
            [
                'id' => 1,
                'type' => 'shipment_received',
                'description' => 'New shipment processed and stored',
                'timestamp' => now()->subHours(2)->toISOString(),
                'user' => 'John Smith',
            ],
            [
                'id' => 2,
                'type' => 'inventory_update',
                'description' => 'Inventory levels updated for storage section',
                'timestamp' => now()->subHours(4)->toISOString(),
                'user' => 'Sarah Johnson',
            ],
            [
                'id' => 3,
                'type' => 'maintenance',
                'description' => 'Scheduled maintenance completed on loading dock',
                'timestamp' => now()->subHours(6)->toISOString(),
                'user' => 'Mike Wilson',
            ],
        ];

        // Get nearby warehouses (within reasonable distance)
        $nearbyWarehouses = Warehouse::where('id', '!=', $warehouse->id)
            ->where('status', 'active')
            ->limit(5)
            ->get(['id', 'name', 'code', 'city', 'state_province', 'status']);

        return Inertia::render('Admin/Warehouses/Show', [
            'warehouse' => $warehouse,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'nearbyWarehouses' => $nearbyWarehouses,
        ]);
    }

    /**
     * Show the form for editing the specified warehouse.
     */
    public function edit(Warehouse $warehouse)
    {
        return Inertia::render('Admin/Warehouses/Edit', [
            'warehouse' => $warehouse,
        ]);
    }

    /**
     * Update the specified warehouse.
     */
    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:10', Rule::unique('warehouses', 'code')->ignore($warehouse->id)],
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => ['required', 'email', Rule::unique('warehouses', 'email')->ignore($warehouse->id)],
            'contact_person' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'capacity_cubic_meters' => 'nullable|numeric|min:0|max:1000000',
            'operating_hours' => 'required|array',
            'operating_hours.monday' => 'required|array',
            'operating_hours.monday.open' => 'required_if:operating_hours.monday.closed,false|date_format:H:i',
            'operating_hours.monday.close' => 'required_if:operating_hours.monday.closed,false|date_format:H:i',
            'operating_hours.monday.closed' => 'required|boolean',
            'operating_hours.tuesday' => 'required|array',
            'operating_hours.tuesday.open' => 'required_if:operating_hours.tuesday.closed,false|date_format:H:i',
            'operating_hours.tuesday.close' => 'required_if:operating_hours.tuesday.closed,false|date_format:H:i',
            'operating_hours.tuesday.closed' => 'required|boolean',
            'operating_hours.wednesday' => 'required|array',
            'operating_hours.wednesday.open' => 'required_if:operating_hours.wednesday.closed,false|date_format:H:i',
            'operating_hours.wednesday.close' => 'required_if:operating_hours.wednesday.closed,false|date_format:H:i',
            'operating_hours.wednesday.closed' => 'required|boolean',
            'operating_hours.thursday' => 'required|array',
            'operating_hours.thursday.open' => 'required_if:operating_hours.thursday.closed,false|date_format:H:i',
            'operating_hours.thursday.close' => 'required_if:operating_hours.thursday.closed,false|date_format:H:i',
            'operating_hours.thursday.closed' => 'required|boolean',
            'operating_hours.friday' => 'required|array',
            'operating_hours.friday.open' => 'required_if:operating_hours.friday.closed,false|date_format:H:i',
            'operating_hours.friday.close' => 'required_if:operating_hours.friday.closed,false|date_format:H:i',
            'operating_hours.friday.closed' => 'required|boolean',
            'operating_hours.saturday' => 'required|array',
            'operating_hours.saturday.open' => 'required_if:operating_hours.saturday.closed,false|date_format:H:i',
            'operating_hours.saturday.close' => 'required_if:operating_hours.saturday.closed,false|date_format:H:i',
            'operating_hours.saturday.closed' => 'required|boolean',
            'operating_hours.sunday' => 'required|array',
            'operating_hours.sunday.open' => 'required_if:operating_hours.sunday.closed,false|date_format:H:i',
            'operating_hours.sunday.close' => 'required_if:operating_hours.sunday.closed,false|date_format:H:i',
            'operating_hours.sunday.closed' => 'required|boolean',
            'status' => 'required|string|in:active,inactive,maintenance',
        ]);

        try {
            // Convert empty strings to null for decimal fields
            if (empty($validated['latitude'])) {
                $validated['latitude'] = null;
            }
            if (empty($validated['longitude'])) {
                $validated['longitude'] = null;
            }
            if (empty($validated['capacity_cubic_meters'])) {
                $validated['capacity_cubic_meters'] = null;
            }

            // Convert operating hours to the format expected by the database
            $operatingHours = [];
            foreach ($validated['operating_hours'] as $day => $hours) {
                if ($hours['closed']) {
                    $operatingHours[$day] = 'closed';
                } else {
                    $operatingHours[$day] = $hours['open'].'-'.$hours['close'];
                }
            }
            $validated['operating_hours'] = $operatingHours;

            $warehouse->update($validated);

            return redirect()
                ->route('admin.warehouses.show', $warehouse)
                ->with('success', "Warehouse {$warehouse->code} updated successfully!");

        } catch (\Exception $e) {
            \Log::error('Warehouse update failed: '.$e->getMessage(), [
                'warehouse_id' => $warehouse->id,
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update warehouse. Please try again.']);
        }
    }

    /**
     * Remove the specified warehouse.
     */
    public function destroy(Warehouse $warehouse)
    {
        try {
            // Check if warehouse has active shipments
            if ($warehouse->originShipments()->active()->exists() ||
                $warehouse->destinationShipments()->active()->exists()) {
                return back()->withErrors(['error' => 'Cannot delete warehouse with active shipments.']);
            }

            $warehouseCode = $warehouse->code;
            $warehouse->delete();

            return redirect()
                ->route('admin.warehouses.index')
                ->with('success', "Warehouse {$warehouseCode} deleted successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete warehouse. Please try again.']);
        }
    }

    /**
     * Toggle warehouse status.
     */
    public function toggleStatus(Warehouse $warehouse)
    {
        try {
            $newStatus = $warehouse->status === 'active' ? 'inactive' : 'active';
            $warehouse->update(['status' => $newStatus]);

            $statusText = $newStatus === 'active' ? 'activated' : 'deactivated';

            return back()->with('success', "Warehouse {$warehouse->code} {$statusText} successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update warehouse status. Please try again.']);
        }
    }

    /**
     * Get warehouse statistics for dashboard.
     */
    private function getWarehouseStats(): array
    {
        $totalWarehouses = Warehouse::count();
        $activeWarehouses = Warehouse::where('status', 'active')->count();
        $totalCapacity = Warehouse::sum('capacity_cubic_meters') ?? 0;

        // Mock utilization calculation
        $avgUtilization = $totalWarehouses > 0 ? rand(60, 85) : 0;

        // Mock inventory and shipments counts
        $totalInventory = $totalWarehouses * rand(500, 2000);
        $totalShipments = \App\Models\Shipment::count();

        return [
            'total_warehouses' => $totalWarehouses,
            'active_warehouses' => $activeWarehouses,
            'total_capacity' => $totalCapacity,
            'avg_utilization' => $avgUtilization,
            'total_inventory' => $totalInventory,
            'total_shipments' => $totalShipments,
        ];
    }

    /**
     * Calculate distance between two warehouses.
     */
    public function calculateDistance(Request $request)
    {
        $validated = $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_warehouse_id' => 'required|exists:warehouses,id',
        ]);

        try {
            $fromWarehouse = Warehouse::findOrFail($validated['from_warehouse_id']);
            $toWarehouse = Warehouse::findOrFail($validated['to_warehouse_id']);

            $distance = $fromWarehouse->distanceTo($toWarehouse);

            return response()->json([
                'distance_km' => $distance,
                'from' => [
                    'name' => $fromWarehouse->name,
                    'code' => $fromWarehouse->code,
                ],
                'to' => [
                    'name' => $toWarehouse->name,
                    'code' => $toWarehouse->code,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to calculate distance.'], 500);
        }
    }

    /**
     * Generate a unique warehouse code based on city.
     */
    private function generateWarehouseCode(string $city): string
    {
        // Get first 3 letters of city, uppercase
        $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $city), 0, 3));

        // If city is too short, pad with 'X'
        $prefix = str_pad($prefix, 3, 'X');

        // Find the next available number
        $counter = 1;
        do {
            $code = $prefix.str_pad($counter, 3, '0', STR_PAD_LEFT);
            $exists = Warehouse::where('code', $code)->exists();
            $counter++;
        } while ($exists && $counter <= 999);

        return $code;
    }
}
