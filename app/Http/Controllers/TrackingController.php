<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
    /**
     * Display the public tracking page.
     */
    public function index(): Response
    {
        return Inertia::render('Marketing/Track', [
            'recentSearches' => session('recent_tracking_searches', []),
        ]);
    }

    /**
     * Track a shipment by tracking number.
     */
    public function track(Request $request)
    {
        $validated = $request->validate([
            'tracking_number' => 'required|string|max:50',
        ]);

        $trackingNumber = strtoupper(trim($validated['tracking_number']));

        // Find the shipment
        $shipment = Shipment::where('tracking_number', $trackingNumber)
            ->with(['customer', 'originWarehouse', 'destinationWarehouse'])
            ->first();

        if (!$shipment) {
            return redirect()->back()->withErrors([
                'tracking_number' => 'Tracking number not found. Please check your tracking number and try again.'
            ])->withInput();
        }

        // Store in recent searches (limit to 5)
        $recentSearches = session('recent_tracking_searches', []);
        $recentSearches = array_filter($recentSearches, fn($search) => $search !== $trackingNumber);
        array_unshift($recentSearches, $trackingNumber);
        $recentSearches = array_slice($recentSearches, 0, 5);
        session(['recent_tracking_searches' => $recentSearches]);

        // Generate tracking timeline
        $timeline = $this->generateTrackingTimeline($shipment);

        // Calculate delivery progress
        $progress = $this->calculateDeliveryProgress($shipment->status);

        return Inertia::render('Marketing/TrackingResult', [
            'shipment' => [
                'tracking_number' => $shipment->tracking_number,
                'status' => $shipment->status,
                'service_type' => $shipment->service_type,
                'estimated_delivery_date' => $shipment->estimated_delivery_date,
                'actual_delivery_date' => $shipment->actual_delivery_date,
                'sender_name' => $shipment->sender_name,
                'recipient_name' => $shipment->recipient_name,
                'recipient_address' => $shipment->recipient_address,
                'origin_warehouse' => $shipment->originWarehouse ? [
                    'name' => $shipment->originWarehouse->name,
                    'city' => $shipment->originWarehouse->city,
                    'country' => $shipment->originWarehouse->country,
                ] : null,
                'destination_warehouse' => $shipment->destinationWarehouse ? [
                    'name' => $shipment->destinationWarehouse->name,
                    'city' => $shipment->destinationWarehouse->city,
                    'country' => $shipment->destinationWarehouse->country,
                ] : null,
                'created_at' => $shipment->created_at,
                'updated_at' => $shipment->updated_at,
            ],
            'timeline' => $timeline,
            'progress' => $progress,
            'recentSearches' => $recentSearches,
        ]);
    }

    /**
     * Generate tracking timeline based on shipment status.
     */
    private function generateTrackingTimeline(Shipment $shipment): array
    {
        $timeline = [];

        // Order Created
        $timeline[] = [
            'title' => 'Order Created',
            'description' => 'Your shipment has been created and is being prepared for pickup.',
            'date' => $shipment->created_at,
            'status' => 'completed',
            'icon' => 'Package',
        ];

        // Picked Up
        if (in_array($shipment->status, ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'])) {
            $timeline[] = [
                'title' => 'Picked Up',
                'description' => 'Package has been collected from the sender.',
                'date' => $shipment->created_at->addHours(2), // Mock timing
                'status' => 'completed',
                'icon' => 'Truck',
            ];
        } else {
            $timeline[] = [
                'title' => 'Pickup Scheduled',
                'description' => 'Package is scheduled for pickup.',
                'date' => null,
                'status' => 'pending',
                'icon' => 'Clock',
            ];
        }

        // In Transit
        if (in_array($shipment->status, ['in_transit', 'out_for_delivery', 'delivered'])) {
            $timeline[] = [
                'title' => 'In Transit',
                'description' => 'Package is on its way to the destination.',
                'date' => $shipment->created_at->addHours(6), // Mock timing
                'status' => 'completed',
                'icon' => 'MapPin',
            ];
        } else if ($shipment->status === 'picked_up') {
            $timeline[] = [
                'title' => 'In Transit',
                'description' => 'Package will be in transit soon.',
                'date' => null,
                'status' => 'pending',
                'icon' => 'MapPin',
            ];
        }

        // Out for Delivery
        if (in_array($shipment->status, ['out_for_delivery', 'delivered'])) {
            $timeline[] = [
                'title' => 'Out for Delivery',
                'description' => 'Package is out for delivery and will arrive today.',
                'date' => $shipment->actual_delivery_date ? 
                    $shipment->actual_delivery_date->subHours(2) : 
                    $shipment->estimated_delivery_date,
                'status' => 'completed',
                'icon' => 'Truck',
            ];
        } else if (in_array($shipment->status, ['picked_up', 'in_transit'])) {
            $timeline[] = [
                'title' => 'Out for Delivery',
                'description' => 'Package will be out for delivery soon.',
                'date' => null,
                'status' => 'pending',
                'icon' => 'Truck',
            ];
        }

        // Delivered
        if ($shipment->status === 'delivered') {
            $timeline[] = [
                'title' => 'Delivered',
                'description' => 'Package has been successfully delivered.',
                'date' => $shipment->actual_delivery_date,
                'status' => 'completed',
                'icon' => 'CheckCircle',
            ];
        } else {
            $timeline[] = [
                'title' => 'Delivery',
                'description' => 'Package will be delivered soon.',
                'date' => $shipment->estimated_delivery_date,
                'status' => 'pending',
                'icon' => 'CheckCircle',
            ];
        }

        return $timeline;
    }

    /**
     * Calculate delivery progress percentage.
     */
    private function calculateDeliveryProgress(string $status): int
    {
        return match ($status) {
            'pending' => 10,
            'picked_up' => 30,
            'in_transit' => 60,
            'out_for_delivery' => 85,
            'delivered' => 100,
            default => 0,
        };
    }
}
