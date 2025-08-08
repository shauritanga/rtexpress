<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\TrackingEvent;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ScannerController extends Controller
{
    /**
     * Display the admin scanner page.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Scanner/Index');
    }

    /**
     * Lookup shipment information by tracking number
     */
    public function lookupShipment(string $trackingNumber): JsonResponse
    {
        try {
            $shipment = Shipment::with(['sender', 'recipient', 'origin_warehouse', 'destination_warehouse'])
                ->where('tracking_number', $trackingNumber)
                ->first();

            if (! $shipment) {
                return response()->json([
                    'error' => 'Shipment not found',
                    'message' => "No shipment found with tracking number: {$trackingNumber}",
                ], 404);
            }

            // Get the latest tracking event
            $latestEvent = TrackingEvent::where('shipment_id', $shipment->id)
                ->orderBy('created_at', 'desc')
                ->first();

            return response()->json([
                'tracking_number' => $shipment->tracking_number,
                'status' => $shipment->status,
                'sender_name' => $shipment->sender->name ?? 'Unknown Sender',
                'recipient_name' => $shipment->recipient->name ?? 'Unknown Recipient',
                'origin' => $shipment->origin_warehouse->name ?? $shipment->origin_address,
                'destination' => $shipment->destination_warehouse->name ?? $shipment->destination_address,
                'estimated_delivery' => $shipment->estimated_delivery_date
                    ? Carbon::parse($shipment->estimated_delivery_date)->format('M d, Y')
                    : 'Not specified',
                'current_location' => $latestEvent->location ?? 'Location not updated',
                'last_updated' => $shipment->updated_at->format('M d, Y g:i A'),
                'service_type' => $shipment->service_type,
                'weight' => $shipment->weight,
                'dimensions' => [
                    'length' => $shipment->length,
                    'width' => $shipment->width,
                    'height' => $shipment->height,
                ],
                'declared_value' => $shipment->declared_value,
                'special_instructions' => $shipment->special_instructions,
            ]);

        } catch (\Exception $e) {
            Log::error('Scanner lookup error', [
                'tracking_number' => $trackingNumber,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'error' => 'Lookup failed',
                'message' => 'An error occurred while looking up the shipment',
            ], 500);
        }
    }

    /**
     * Update shipment status via scanner
     */
    public function updateStatus(Request $request, string $trackingNumber): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,picked_up,in_transit,out_for_delivery,delivered,exception',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'scanned_at' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            $shipment = Shipment::where('tracking_number', $trackingNumber)->first();

            if (! $shipment) {
                return response()->json([
                    'error' => 'Shipment not found',
                    'message' => "No shipment found with tracking number: {$trackingNumber}",
                ], 404);
            }

            // Update shipment status
            $oldStatus = $shipment->status;
            $shipment->status = $request->status;
            $shipment->updated_at = now();
            $shipment->save();

            // Create tracking event
            $trackingEvent = TrackingEvent::create([
                'shipment_id' => $shipment->id,
                'status' => $request->status,
                'location' => $request->location ?? 'Scanned Location',
                'description' => $this->getStatusDescription($request->status),
                'notes' => $request->notes,
                'occurred_at' => $request->scanned_at ? Carbon::parse($request->scanned_at) : now(),
                'created_by' => Auth::id(),
            ]);

            // Update estimated delivery if status is delivered
            if ($request->status === 'delivered' && ! $shipment->actual_delivery_date) {
                $shipment->actual_delivery_date = now();
                $shipment->save();
            }

            // Log the status update
            Log::info('Shipment status updated via scanner', [
                'tracking_number' => $trackingNumber,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'location' => $request->location,
                'user_id' => Auth::id(),
                'event_id' => $trackingEvent->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'shipment' => [
                    'tracking_number' => $shipment->tracking_number,
                    'status' => $shipment->status,
                    'updated_at' => $shipment->updated_at->format('M d, Y g:i A'),
                ],
                'tracking_event' => [
                    'id' => $trackingEvent->id,
                    'status' => $trackingEvent->status,
                    'location' => $trackingEvent->location,
                    'description' => $trackingEvent->description,
                    'occurred_at' => $trackingEvent->occurred_at->format('M d, Y g:i A'),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Scanner status update error', [
                'tracking_number' => $trackingNumber,
                'status' => $request->status,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'error' => 'Update failed',
                'message' => 'An error occurred while updating the shipment status',
            ], 500);
        }
    }

    /**
     * Get status description for tracking events
     */
    private function getStatusDescription(string $status): string
    {
        $descriptions = [
            'pending' => 'Shipment created and awaiting pickup',
            'picked_up' => 'Package has been picked up from sender',
            'in_transit' => 'Package is in transit to destination',
            'out_for_delivery' => 'Package is out for delivery',
            'delivered' => 'Package has been successfully delivered',
            'exception' => 'Delivery exception - requires attention',
        ];

        return $descriptions[$status] ?? 'Status updated';
    }

    /**
     * Get scanner statistics for admin dashboard
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $today = Carbon::today();
            $thisWeek = Carbon::now()->startOfWeek();
            $thisMonth = Carbon::now()->startOfMonth();

            $stats = [
                'scans_today' => TrackingEvent::whereDate('created_at', $today)
                    ->whereNotNull('created_by')
                    ->count(),
                'scans_this_week' => TrackingEvent::where('created_at', '>=', $thisWeek)
                    ->whereNotNull('created_by')
                    ->count(),
                'scans_this_month' => TrackingEvent::where('created_at', '>=', $thisMonth)
                    ->whereNotNull('created_by')
                    ->count(),
                'active_scanners' => TrackingEvent::whereDate('created_at', $today)
                    ->whereNotNull('created_by')
                    ->distinct('created_by')
                    ->count(),
                'recent_scans' => TrackingEvent::with(['shipment', 'creator'])
                    ->whereNotNull('created_by')
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get()
                    ->map(function ($event) {
                        return [
                            'tracking_number' => $event->shipment->tracking_number,
                            'status' => $event->status,
                            'location' => $event->location,
                            'scanned_by' => $event->creator->name ?? 'Unknown',
                            'scanned_at' => $event->created_at->format('M d, Y g:i A'),
                        ];
                    }),
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('Scanner statistics error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'error' => 'Statistics unavailable',
                'message' => 'Unable to retrieve scanner statistics',
            ], 500);
        }
    }
}
