<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\ShipmentTracking;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
    /**
     * Display the admin tracking dashboard.
     */
    public function dashboard(): Response
    {
        $stats = [
            'total_active_shipments' => Shipment::whereNotIn('status', ['delivered', 'cancelled'])->count(),
            'in_transit_shipments' => Shipment::where('status', 'in_transit')->count(),
            'out_for_delivery_shipments' => Shipment::where('status', 'out_for_delivery')->count(),
            'exception_shipments' => Shipment::where('status', 'exception')->count(),
            'delivered_today' => Shipment::where('status', 'delivered')
                ->whereDate('actual_delivery_date', today())
                ->count(),
            'overdue_shipments' => Shipment::where('estimated_delivery_date', '<', now())
                ->whereNotIn('status', ['delivered', 'cancelled'])
                ->count(),
        ];

        // Recent tracking updates
        $recentUpdates = ShipmentTracking::with(['shipment', 'recordedBy'])
            ->latest('occurred_at')
            ->limit(10)
            ->get()
            ->map(function ($tracking) {
                return [
                    'id' => $tracking->id,
                    'shipment_tracking_number' => $tracking->shipment->tracking_number,
                    'status' => $tracking->status,
                    'location' => $tracking->location,
                    'notes' => $tracking->notes,
                    'occurred_at' => $tracking->occurred_at->toISOString(),
                    'recorded_by' => $tracking->recordedBy?->name,
                ];
            });

        // Active shipments by status
        $shipmentsByStatus = Shipment::select('status', DB::raw('count(*) as count'))
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        return Inertia::render('Admin/Tracking/Dashboard', [
            'stats' => $stats,
            'recentUpdates' => $recentUpdates,
            'shipmentsByStatus' => $shipmentsByStatus,
        ]);
    }

    /**
     * Display live tracking page.
     */
    public function live(): Response
    {
        // Get active shipments with latest tracking
        $activeShipments = Shipment::with(['trackingHistory' => function ($query) {
                $query->latest('occurred_at')->limit(1);
            }, 'customer', 'originWarehouse', 'destinationWarehouse'])
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->orderBy('updated_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($shipment) {
                $latestTracking = $shipment->trackingHistory->first();
                return [
                    'id' => $shipment->id,
                    'tracking_number' => $shipment->tracking_number,
                    'status' => $shipment->status,
                    'customer_name' => $shipment->customer->company_name ?? 'N/A',
                    'origin' => $shipment->originWarehouse?->city ?? 'Unknown',
                    'destination' => $shipment->destinationWarehouse?->city ?? 'Unknown',
                    'estimated_delivery' => $shipment->estimated_delivery_date?->toISOString(),
                    'last_location' => $latestTracking?->location ?? 'Unknown',
                    'last_update' => $latestTracking?->occurred_at?->toISOString() ?? $shipment->updated_at->toISOString(),
                    'service_type' => $shipment->service_type,
                    'progress_percentage' => $this->calculateProgress($shipment),
                ];
            });

        return Inertia::render('Admin/Tracking/Live', [
            'activeShipments' => $activeShipments,
        ]);
    }

    /**
     * Update shipment tracking status.
     */
    public function updateStatus(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'cancelled'])],
            'location' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'coordinates' => 'nullable|array',
            'coordinates.lat' => 'nullable|numeric|between:-90,90',
            'coordinates.lng' => 'nullable|numeric|between:-180,180',
        ]);

        try {
            DB::beginTransaction();

            // Add tracking update
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

            // Send notification to customer using new global channel system
            try {
                $notificationService = new NotificationService();
                $notificationService->sendShipmentStatusUpdate($shipment, $validated['status']);
            } catch (\Exception $e) {
                // Log the error but don't fail the status update
                \Log::error("Failed to send shipment update notification: " . $e->getMessage());
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tracking status updated successfully. Customer has been notified via email.',
                'shipment' => [
                    'id' => $shipment->id,
                    'tracking_number' => $shipment->tracking_number,
                    'status' => $shipment->status,
                    'updated_at' => $shipment->updated_at->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update tracking status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk update multiple shipments.
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'shipment_ids' => 'required|array|min:1',
            'shipment_ids.*' => 'exists:shipments,id',
            'status' => ['required', Rule::in(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'cancelled'])],
            'location' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            $updatedShipments = [];
            
            foreach ($validated['shipment_ids'] as $shipmentId) {
                $shipment = Shipment::findOrFail($shipmentId);
                
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

                // Send notification to customer using new global channel system
                try {
                    $notificationService = new NotificationService();
                    $notificationService->sendShipmentStatusUpdate($shipment, $validated['status']);
                } catch (\Exception $e) {
                    // Log the error but don't fail the bulk update
                    \Log::error("Failed to send shipment update notification for {$shipment->tracking_number}: " . $e->getMessage());
                }

                $updatedShipments[] = [
                    'id' => $shipment->id,
                    'tracking_number' => $shipment->tracking_number,
                    'status' => $shipment->status,
                ];
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($updatedShipments) . ' shipments updated successfully. Customers have been notified via email.',
                'updated_shipments' => $updatedShipments,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update shipments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get tracking history for a shipment.
     */
    public function history(Shipment $shipment)
    {
        $history = $shipment->trackingHistory()
            ->with('recordedBy')
            ->orderBy('occurred_at', 'desc')
            ->get()
            ->map(function ($tracking) {
                return [
                    'id' => $tracking->id,
                    'status' => $tracking->status,
                    'location' => $tracking->location,
                    'notes' => $tracking->notes,
                    'occurred_at' => $tracking->occurred_at->toISOString(),
                    'recorded_by' => $tracking->recordedBy?->name,
                    'recorded_by_id' => $tracking->recorded_by,
                ];
            });

        return response()->json([
            'tracking_number' => $shipment->tracking_number,
            'current_status' => $shipment->status,
            'history' => $history,
        ]);
    }

    /**
     * Search shipments for tracking.
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:1',
            'status' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse'])
            ->where(function ($q) use ($validated) {
                $q->where('tracking_number', 'like', '%' . $validated['query'] . '%')
                  ->orWhereHas('customer', function ($customerQuery) use ($validated) {
                      $customerQuery->where('company_name', 'like', '%' . $validated['query'] . '%');
                  })
                  ->orWhere('recipient_name', 'like', '%' . $validated['query'] . '%')
                  ->orWhere('sender_name', 'like', '%' . $validated['query'] . '%');
            });

        if (!empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        $shipments = $query->limit($validated['limit'] ?? 20)
            ->get()
            ->map(function ($shipment) {
                return [
                    'id' => $shipment->id,
                    'tracking_number' => $shipment->tracking_number,
                    'status' => $shipment->status,
                    'customer_name' => $shipment->customer->company_name ?? 'N/A',
                    'sender_name' => $shipment->sender_name,
                    'recipient_name' => $shipment->recipient_name,
                    'origin' => $shipment->originWarehouse?->city ?? 'Unknown',
                    'destination' => $shipment->destinationWarehouse?->city ?? 'Unknown',
                    'estimated_delivery' => $shipment->estimated_delivery_date?->toISOString(),
                    'created_at' => $shipment->created_at->toISOString(),
                ];
            });

        return response()->json([
            'shipments' => $shipments,
            'total' => $shipments->count(),
        ]);
    }

    /**
     * Calculate shipment progress percentage based on status.
     */
    private function calculateProgress(Shipment $shipment): int
    {
        return match($shipment->status) {
            'pending' => 5,
            'picked_up' => 25,
            'in_transit' => 60,
            'out_for_delivery' => 90,
            'delivered' => 100,
            'exception' => 50,
            default => 10,
        };
    }
}
