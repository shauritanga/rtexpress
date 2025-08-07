<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\TrackingEvent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ScannerController extends Controller
{
    /**
     * Display the scanner page.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $customer = $user->customer ?? null;

        return Inertia::render('Customer/Scanner/Index', [
            'customer' => $customer,
        ]);
    }

    /**
     * Track package by scanning barcode/QR code
     */
    public function trackPackage(string $trackingNumber): JsonResponse
    {
        try {
            // Find shipment - customers can only track their own shipments or public ones
            $query = Shipment::with(['sender', 'recipient', 'origin_warehouse', 'destination_warehouse'])
                ->where('tracking_number', $trackingNumber);

            // If user is authenticated as customer, allow access to their shipments
            if (Auth::check() && Auth::user()->customer) {
                $customerId = Auth::user()->customer->id;
                $query->where(function ($q) use ($customerId) {
                    $q->where('sender_id', $customerId)
                      ->orWhere('recipient_id', $customerId)
                      ->orWhere('is_public_tracking', true);
                });
            } else {
                // For non-authenticated users, only allow public tracking
                $query->where('is_public_tracking', true);
            }

            $shipment = $query->first();

            if (!$shipment) {
                return response()->json([
                    'error' => 'Package not found',
                    'message' => "No package found with tracking number: {$trackingNumber}. Please check the number and try again."
                ], 404);
            }

            // Get tracking events
            $trackingEvents = TrackingEvent::where('shipment_id', $shipment->id)
                ->orderBy('occurred_at', 'desc')
                ->get()
                ->map(function ($event) {
                    return [
                        'status' => $event->status,
                        'location' => $event->location,
                        'description' => $event->description,
                        'timestamp' => $event->occurred_at->format('M d, Y g:i A'),
                        'notes' => $event->notes,
                    ];
                });

            // Get current location from latest event
            $latestEvent = $trackingEvents->first();
            $currentLocation = $latestEvent['location'] ?? 'Location not updated';

            // Calculate delivery progress
            $deliveryProgress = $this->calculateDeliveryProgress($shipment->status);

            return response()->json([
                'tracking_number' => $shipment->tracking_number,
                'status' => $shipment->status,
                'sender_name' => $shipment->sender->name ?? $shipment->sender_name,
                'recipient_name' => $shipment->recipient->name ?? $shipment->recipient_name,
                'origin' => $shipment->origin_warehouse->name ?? $shipment->origin_address,
                'destination' => $shipment->destination_warehouse->name ?? $shipment->destination_address,
                'estimated_delivery' => $shipment->estimated_delivery_date 
                    ? Carbon::parse($shipment->estimated_delivery_date)->format('M d, Y')
                    : 'Not specified',
                'actual_delivery' => $shipment->actual_delivery_date 
                    ? Carbon::parse($shipment->actual_delivery_date)->format('M d, Y g:i A')
                    : null,
                'current_location' => $currentLocation,
                'last_updated' => $shipment->updated_at->format('M d, Y g:i A'),
                'service_type' => $shipment->service_type,
                'delivery_progress' => $deliveryProgress,
                'tracking_events' => $trackingEvents,
                'package_info' => [
                    'weight' => $shipment->weight,
                    'dimensions' => [
                        'length' => $shipment->length,
                        'width' => $shipment->width,
                        'height' => $shipment->height,
                    ],
                    'service_type' => $shipment->service_type,
                ],
                'delivery_instructions' => $shipment->special_instructions,
                'is_delivered' => $shipment->status === 'delivered',
                'has_exception' => $shipment->status === 'exception',
            ]);

        } catch (\Exception $e) {
            Log::error('Customer scanner tracking error', [
                'tracking_number' => $trackingNumber,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'error' => 'Tracking failed',
                'message' => 'An error occurred while tracking your package. Please try again later.'
            ], 500);
        }
    }

    /**
     * Calculate delivery progress percentage
     */
    private function calculateDeliveryProgress(string $status): array
    {
        $statusSteps = [
            'pending' => ['step' => 1, 'percentage' => 10, 'label' => 'Order Placed'],
            'picked_up' => ['step' => 2, 'percentage' => 25, 'label' => 'Picked Up'],
            'in_transit' => ['step' => 3, 'percentage' => 60, 'label' => 'In Transit'],
            'out_for_delivery' => ['step' => 4, 'percentage' => 85, 'label' => 'Out for Delivery'],
            'delivered' => ['step' => 5, 'percentage' => 100, 'label' => 'Delivered'],
            'exception' => ['step' => 0, 'percentage' => 0, 'label' => 'Exception'],
        ];

        return $statusSteps[$status] ?? ['step' => 0, 'percentage' => 0, 'label' => 'Unknown'];
    }

    /**
     * Get estimated delivery time
     */
    public function getEstimatedDelivery(string $trackingNumber): JsonResponse
    {
        try {
            $shipment = Shipment::where('tracking_number', $trackingNumber)->first();

            if (!$shipment) {
                return response()->json([
                    'error' => 'Package not found'
                ], 404);
            }

            // Calculate estimated delivery based on service type and current status
            $estimatedDelivery = $this->calculateEstimatedDelivery($shipment);

            return response()->json([
                'tracking_number' => $trackingNumber,
                'estimated_delivery' => $estimatedDelivery,
                'service_type' => $shipment->service_type,
                'current_status' => $shipment->status,
            ]);

        } catch (\Exception $e) {
            Log::error('Estimated delivery calculation error', [
                'tracking_number' => $trackingNumber,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Unable to calculate estimated delivery'
            ], 500);
        }
    }

    /**
     * Calculate estimated delivery based on service type and current status
     */
    private function calculateEstimatedDelivery(Shipment $shipment): array
    {
        $now = Carbon::now();
        $serviceTypes = [
            'express' => 1, // 1 day
            'standard' => 3, // 3 days
            'economy' => 7, // 7 days
        ];

        $daysToAdd = $serviceTypes[$shipment->service_type] ?? 3;

        // Adjust based on current status
        switch ($shipment->status) {
            case 'pending':
                $estimatedDate = $now->addDays($daysToAdd);
                break;
            case 'picked_up':
                $estimatedDate = $now->addDays($daysToAdd - 1);
                break;
            case 'in_transit':
                $estimatedDate = $now->addDays(max(1, $daysToAdd - 2));
                break;
            case 'out_for_delivery':
                $estimatedDate = $now->addHours(8); // Same day delivery
                break;
            case 'delivered':
                $estimatedDate = $shipment->actual_delivery_date 
                    ? Carbon::parse($shipment->actual_delivery_date)
                    : $now;
                break;
            default:
                $estimatedDate = $now->addDays($daysToAdd);
        }

        return [
            'date' => $estimatedDate->format('Y-m-d'),
            'formatted_date' => $estimatedDate->format('M d, Y'),
            'time_range' => $this->getDeliveryTimeRange($shipment->service_type),
            'is_today' => $estimatedDate->isToday(),
            'is_tomorrow' => $estimatedDate->isTomorrow(),
            'days_remaining' => max(0, $now->diffInDays($estimatedDate, false)),
        ];
    }

    /**
     * Get delivery time range based on service type
     */
    private function getDeliveryTimeRange(string $serviceType): string
    {
        $timeRanges = [
            'express' => '9:00 AM - 12:00 PM',
            'standard' => '9:00 AM - 6:00 PM',
            'economy' => '9:00 AM - 8:00 PM',
        ];

        return $timeRanges[$serviceType] ?? '9:00 AM - 6:00 PM';
    }

    /**
     * Report delivery issue via scanner
     */
    public function reportIssue(Request $request, string $trackingNumber): JsonResponse
    {
        $request->validate([
            'issue_type' => 'required|string|in:damaged,missing,wrong_address,delivery_failed,other',
            'description' => 'required|string|max:1000',
            'contact_phone' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
        ]);

        try {
            $shipment = Shipment::where('tracking_number', $trackingNumber)->first();

            if (!$shipment) {
                return response()->json([
                    'error' => 'Package not found'
                ], 404);
            }

            // Create tracking event for the issue
            TrackingEvent::create([
                'shipment_id' => $shipment->id,
                'status' => 'exception',
                'location' => 'Customer Report',
                'description' => "Issue reported: {$request->issue_type}",
                'notes' => $request->description,
                'occurred_at' => now(),
                'created_by' => Auth::id(),
            ]);

            // Update shipment status if not already exception
            if ($shipment->status !== 'exception') {
                $shipment->status = 'exception';
                $shipment->save();
            }

            // Log the issue report
            Log::info('Delivery issue reported via scanner', [
                'tracking_number' => $trackingNumber,
                'issue_type' => $request->issue_type,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Issue reported successfully. Our team will investigate and contact you soon.',
                'reference_number' => 'ISS-' . strtoupper(substr(md5($trackingNumber . time()), 0, 8))
            ]);

        } catch (\Exception $e) {
            Log::error('Issue report error', [
                'tracking_number' => $trackingNumber,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'error' => 'Failed to report issue',
                'message' => 'An error occurred while reporting the issue. Please try again.'
            ], 500);
        }
    }
}
