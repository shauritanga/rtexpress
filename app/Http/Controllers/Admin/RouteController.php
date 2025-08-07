<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryRoute;
use App\Models\RouteStop;
use App\Models\Driver;
use App\Models\Warehouse;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RouteController extends Controller
{
    /**
     * Display route management dashboard.
     */
    public function index(Request $request)
    {
        $query = DeliveryRoute::with(['driver', 'warehouse', 'stops'])
            ->orderBy('delivery_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('route_number', 'like', "%{$search}%")
                  ->orWhereHas('driver', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        if ($request->filled('date')) {
            $query->where('delivery_date', $request->date);
        } else {
            // Default to today's routes
            $query->where('delivery_date', '>=', today()->subDays(7));
        }

        $routes = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total_routes' => DeliveryRoute::count(),
            'active_routes' => DeliveryRoute::whereIn('status', ['planned', 'in_progress'])->count(),
            'completed_today' => DeliveryRoute::where('delivery_date', today())
                ->where('status', 'completed')->count(),
            'overdue_stops' => RouteStop::overdue()->count(),
            'avg_completion_rate' => $this->getAverageCompletionRate(),
            'total_distance_today' => DeliveryRoute::where('delivery_date', today())
                ->sum('total_distance'),
        ];

        // Get drivers and warehouses for filtering
        $drivers = Driver::active()->select('id', 'name', 'driver_id')->get();
        $warehouses = Warehouse::select('id', 'name')->get();

        return Inertia::render('Admin/Routes/Index', [
            'routes' => $routes,
            'stats' => $stats,
            'drivers' => $drivers,
            'warehouses' => $warehouses,
            'filters' => $request->only(['search', 'status', 'driver_id', 'warehouse_id', 'date']),
        ]);
    }

    /**
     * Show route details.
     */
    public function show(DeliveryRoute $route)
    {
        $route->load([
            'driver',
            'warehouse',
            'createdBy',
            'stops' => function ($query) {
                $query->with(['shipment' => function ($q) {
                    $q->select('id', 'tracking_number', 'recipient_name', 'recipient_address');
                }])->orderBy('stop_order');
            }
        ]);

        // Transform stops data for the frontend
        $stops = $route->stops->map(function ($stop, $index) {
            return [
                'id' => $stop->id,
                'sequence' => $index + 1,
                'shipment' => [
                    'tracking_number' => $stop->shipment->tracking_number,
                    'recipient_name' => $stop->shipment->recipient_name,
                    'recipient_address' => $stop->shipment->recipient_address,
                ],
                'status' => $stop->status ?? 'pending',
                'estimated_arrival' => $stop->estimated_arrival ?? now()->addHours($index + 1)->toISOString(),
                'actual_arrival' => $stop->actual_arrival,
                'delivery_notes' => $stop->delivery_notes,
            ];
        });

        // Calculate route statistics
        $routeStats = [
            'on_time_percentage' => 92, // This would be calculated from historical data
            'avg_stop_duration' => 15, // Average minutes per stop
            'total_packages' => $route->stops->count(),
            'completed_deliveries' => $route->stops->where('status', 'delivered')->count(),
        ];

        return Inertia::render('Admin/Routes/Show', [
            'route' => $route,
            'stops' => $stops,
            'routeStats' => $routeStats,
        ]);
    }

    /**
     * Create new route.
     */
    public function create()
    {
        $drivers = Driver::available()->select('id', 'name', 'driver_id', 'vehicle_type', 'vehicle_capacity')->get();
        $warehouses = Warehouse::select('id', 'name', 'address_line_1', 'address_line_2', 'city', 'state_province')->get();

        // Get pending shipments for route planning
        $pendingShipments = Shipment::with(['customer', 'origin', 'destination'])
            ->whereIn('status', ['pending', 'picked_up'])
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Admin/Routes/Create', [
            'drivers' => $drivers,
            'warehouses' => $warehouses,
            'pendingShipments' => $pendingShipments,
        ]);
    }

    /**
     * Store new route.
     */
    public function store(Request $request)
    {
        $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'delivery_date' => 'required|date|after_or_equal:today',
            'planned_start_time' => 'required|date_format:H:i',
            'planned_end_time' => 'required|date_format:H:i|after:planned_start_time',
            'shipments' => 'required|array|min:1',
            'shipments.*.shipment_id' => 'required|exists:shipments,id',
            'shipments.*.type' => 'required|in:pickup,delivery',
            'shipments.*.priority' => 'required|in:low,medium,high,urgent',
        ]);

        DB::beginTransaction();

        try {
            // Create delivery route
            $route = DeliveryRoute::create([
                'driver_id' => $request->driver_id,
                'warehouse_id' => $request->warehouse_id,
                'delivery_date' => $request->delivery_date,
                'planned_start_time' => $request->planned_start_time,
                'planned_end_time' => $request->planned_end_time,
                'status' => 'planned',
                'created_by' => auth()->id(),
            ]);

            // Create route stops
            $totalDistance = 0;
            $totalWeight = 0;
            $stopOrder = 1;

            foreach ($request->shipments as $shipmentData) {
                $shipment = Shipment::find($shipmentData['shipment_id']);

                // Determine address based on type
                $address = $shipmentData['type'] === 'pickup' ?
                    $shipment->origin->address :
                    $shipment->destination->address;

                $customerName = $shipmentData['type'] === 'pickup' ?
                    $shipment->sender_name :
                    $shipment->recipient_name;

                // Create route stop
                RouteStop::create([
                    'delivery_route_id' => $route->id,
                    'shipment_id' => $shipment->id,
                    'stop_order' => $stopOrder++,
                    'type' => $shipmentData['type'],
                    'customer_name' => $customerName,
                    'address' => $address,
                    'latitude' => $shipmentData['type'] === 'pickup' ?
                        $shipment->origin->latitude :
                        $shipment->destination->latitude,
                    'longitude' => $shipmentData['type'] === 'pickup' ?
                        $shipment->origin->longitude :
                        $shipment->destination->longitude,
                    'contact_phone' => $shipmentData['type'] === 'pickup' ?
                        $shipment->sender_phone :
                        $shipment->recipient_phone,
                    'planned_arrival_time' => $this->calculatePlannedTime($stopOrder, $request->planned_start_time),
                    'planned_departure_time' => $this->calculatePlannedTime($stopOrder, $request->planned_start_time, 20),
                    'priority' => $shipmentData['priority'],
                    'requires_signature' => $shipment->requires_signature ?? false,
                    'is_fragile' => $shipment->is_fragile ?? false,
                    'delivery_instructions' => $shipment->delivery_instructions,
                ]);

                $totalWeight += $shipment->weight ?? 0;
            }

            // Update route totals
            $route->update([
                'total_stops' => count($request->shipments),
                'total_weight' => $totalWeight,
                'estimated_duration' => $this->calculateEstimatedDuration(count($request->shipments)),
            ]);

            // Update driver availability
            Driver::find($request->driver_id)->update(['is_available' => false]);

            DB::commit();

            return redirect()
                ->route('admin.routes.show', $route)
                ->with('success', 'Delivery route created successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to create delivery route'])
                ->withInput();
        }
    }

    /**
     * Start a route.
     */
    public function start(DeliveryRoute $route)
    {
        if ($route->status !== 'planned') {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Route cannot be started']);
        }

        $route->start();

        return redirect()
            ->route('admin.routes.show', $route)
            ->with('success', 'Route started successfully');
    }

    /**
     * Complete a route.
     */
    public function complete(DeliveryRoute $route)
    {
        if ($route->status !== 'in_progress') {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Route cannot be completed']);
        }

        $route->complete();

        return redirect()
            ->route('admin.routes.show', $route)
            ->with('success', 'Route completed successfully');
    }

    /**
     * Remove the specified route.
     */
    public function destroy(DeliveryRoute $route)
    {
        try {
            // Check if route is in progress or completed
            if (in_array($route->status, ['in_progress', 'completed'])) {
                return back()->withErrors([
                    'error' => "Cannot delete route {$route->route_number}. Routes that are in progress or completed cannot be deleted."
                ]);
            }

            $routeNumber = $route->route_number;

            // Make driver available again if route is planned
            if ($route->status === 'planned' && $route->driver) {
                $route->driver->update(['is_available' => true]);
            }

            // Delete route stops first
            $route->stops()->delete();

            // Delete the route
            $route->delete();

            return redirect()
                ->route('admin.routes.index')
                ->with('success', "Route {$routeNumber} deleted successfully!");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete route. Please try again.']);
        }
    }

    /**
     * Update stop status.
     */
    public function updateStop(Request $request, RouteStop $stop)
    {
        $request->validate([
            'status' => 'required|in:arrived,completed,failed',
            'notes' => 'nullable|string',
            'failure_reason' => 'required_if:status,failed|string',
        ]);

        switch ($request->status) {
            case 'arrived':
                $stop->markAsArrived();
                break;
            case 'completed':
                $stop->complete([
                    'notes' => $request->notes,
                ]);
                break;
            case 'failed':
                $stop->markAsFailed($request->failure_reason);
                break;
        }

        return redirect()
            ->route('admin.routes.show', $stop->delivery_route_id)
            ->with('success', 'Stop status updated successfully');
    }

    /**
     * Optimize route order.
     */
    public function optimize(DeliveryRoute $route)
    {
        if ($route->status !== 'planned') {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Only planned routes can be optimized']);
        }

        // Simple optimization: sort by priority and distance
        $stops = $route->stops()->get();
        $warehouse = $route->warehouse;

        $optimizedStops = $this->optimizeStopOrder($stops, $warehouse);

        DB::beginTransaction();

        try {
            foreach ($optimizedStops as $index => $stop) {
                $stop->update([
                    'stop_order' => $index + 1,
                    'planned_arrival_time' => $this->calculatePlannedTime($index + 1, $route->planned_start_time),
                    'planned_departure_time' => $this->calculatePlannedTime($index + 1, $route->planned_start_time, 20),
                ]);
            }

            DB::commit();

            return redirect()
                ->route('admin.routes.show', $route)
                ->with('success', 'Route optimized successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to optimize route']);
        }
    }

    /**
     * Get route tracking data.
     */
    public function tracking(DeliveryRoute $route)
    {
        $route->load([
            'driver.locations' => function ($query) {
                $query->where('recorded_at', '>=', today())
                      ->orderBy('recorded_at', 'desc')
                      ->limit(50);
            },
            'stops' => function ($query) {
                $query->orderBy('stop_order');
            }
        ]);

        return response()->json([
            'route' => $route,
            'current_location' => [
                'latitude' => $route->driver->current_latitude,
                'longitude' => $route->driver->current_longitude,
                'last_update' => $route->driver->last_location_update,
            ],
            'location_history' => $route->driver->locations,
        ]);
    }

    /**
     * Calculate planned time for stop.
     */
    private function calculatePlannedTime(int $stopOrder, string $startTime, int $additionalMinutes = 0): string
    {
        $baseTime = \Carbon\Carbon::createFromFormat('H:i', $startTime);
        $travelTime = ($stopOrder - 1) * 30; // 30 minutes between stops
        $serviceTime = ($stopOrder - 1) * 20; // 20 minutes per stop

        return $baseTime->addMinutes($travelTime + $serviceTime + $additionalMinutes)->format('H:i');
    }

    /**
     * Calculate estimated duration.
     */
    private function calculateEstimatedDuration(int $stopCount): float
    {
        $travelTime = $stopCount * 0.5; // 30 minutes travel per stop
        $serviceTime = $stopCount * 0.33; // 20 minutes service per stop

        return round($travelTime + $serviceTime, 2);
    }

    /**
     * Optimize stop order using simple algorithm.
     */
    private function optimizeStopOrder($stops, $warehouse)
    {
        // Simple nearest neighbor algorithm
        $optimized = [];
        $remaining = $stops->toArray();
        $currentLocation = ['latitude' => $warehouse->latitude, 'longitude' => $warehouse->longitude];

        // First, handle high priority stops
        $highPriority = array_filter($remaining, function ($stop) {
            return in_array($stop['priority'], ['urgent', 'high']);
        });

        foreach ($highPriority as $stop) {
            $optimized[] = $stop;
            $remaining = array_filter($remaining, function ($s) use ($stop) {
                return $s['id'] !== $stop['id'];
            });
        }

        // Then optimize remaining stops by distance
        while (!empty($remaining)) {
            $nearest = null;
            $minDistance = PHP_FLOAT_MAX;

            foreach ($remaining as $stop) {
                $distance = $this->calculateDistance(
                    $currentLocation['latitude'],
                    $currentLocation['longitude'],
                    $stop['latitude'],
                    $stop['longitude']
                );

                if ($distance < $minDistance) {
                    $minDistance = $distance;
                    $nearest = $stop;
                }
            }

            if ($nearest) {
                $optimized[] = $nearest;
                $currentLocation = ['latitude' => $nearest['latitude'], 'longitude' => $nearest['longitude']];
                $remaining = array_filter($remaining, function ($s) use ($nearest) {
                    return $s['id'] !== $nearest['id'];
                });
            }
        }

        return collect($optimized)->map(function ($stop) {
            return RouteStop::find($stop['id']);
        });
    }

    /**
     * Calculate distance between coordinates.
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Get average completion rate.
     */
    private function getAverageCompletionRate(): float
    {
        $completedRoutes = DeliveryRoute::where('status', 'completed')
            ->where('delivery_date', '>=', today()->subDays(30))
            ->get();

        if ($completedRoutes->isEmpty()) {
            return 0;
        }

        $totalRate = $completedRoutes->sum(function ($route) {
            return $route->total_stops > 0 ? ($route->completed_stops / $route->total_stops) * 100 : 0;
        });

        return round($totalRate / $completedRoutes->count(), 1);
    }
}
