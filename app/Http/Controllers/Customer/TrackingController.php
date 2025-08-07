<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
    /**
     * Display the tracking page.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $customer = $user->customer ?? null;

        $trackingNumber = $request->get('tracking_number');
        $trackingData = null;

        if ($trackingNumber) {
            $trackingData = $this->getTrackingData($trackingNumber, $customer);
        }

        return Inertia::render('Customer/Tracking/Index', [
            'customer' => $customer,
            'trackingNumber' => $trackingNumber,
            'trackingData' => $trackingData,
        ]);
    }

    /**
     * Get tracking data for a specific tracking number.
     */
    public function track(Request $request, string $trackingNumber)
    {
        // Public tracking - no authentication required
        $trackingData = $this->getTrackingData($trackingNumber, null);

        if (!$trackingData) {
            return response()->json([
                'error' => 'Tracking information not found',
                'message' => 'The tracking number you entered could not be found in our system.',
            ], 404);
        }

        return response()->json($trackingData);
    }

    /**
     * Get real-time tracking updates.
     */
    public function updates(Request $request, string $trackingNumber)
    {
        $user = Auth::user();
        $customer = $user->customer ?? null;

        $trackingData = $this->getTrackingData($trackingNumber, $customer);

        if (!$trackingData) {
            return response()->json([
                'error' => 'Tracking information not found',
            ], 404);
        }

        // Return only the latest updates (for real-time polling)
        return response()->json([
            'current_status' => $trackingData['current_status'],
            'current_location' => $trackingData['current_location'],
            'last_updated' => now()->toISOString(),
            'latest_event' => $trackingData['events'][0] ?? null,
        ]);
    }

    /**
     * Get comprehensive tracking data.
     */
    private function getTrackingData(string $trackingNumber, $customer = null): ?array
    {
        // Find the shipment in the database - ONLY REAL DATA
        $shipment = Shipment::where('tracking_number', $trackingNumber)->first();

        if ($shipment) {
            // Return real data from database
            return $this->formatShipmentTrackingData($shipment);
        }

        // If shipment not found, return null (no mock data)
        return null;
    }

    /**
     * Format shipment data for tracking response.
     */
    private function formatShipmentTrackingData(Shipment $shipment): array
    {
        // Get real tracking events from database
        $events = $shipment->trackingHistory()
            ->orderBy('occurred_at', 'desc')
            ->with('recordedBy')
            ->get()
            ->map(function ($tracking) {
                return [
                    'id' => (string) $tracking->id,
                    'timestamp' => $tracking->occurred_at->toISOString(),
                    'status' => $tracking->status,
                    'location' => $tracking->location,
                    'description' => $tracking->notes ?? $this->getStatusDescription($tracking->status),
                    'recorded_by' => $tracking->recordedBy?->name,
                    'coordinates' => $this->getLocationCoordinates($tracking->location),
                ];
            });

        // Get current location from latest tracking event
        $latestTracking = $shipment->trackingHistory()->latest('occurred_at')->first();
        $currentLocation = $latestTracking ? [
            'lat' => $this->getLocationCoordinates($latestTracking->location)['lat'] ?? null,
            'lng' => $this->getLocationCoordinates($latestTracking->location)['lng'] ?? null,
            'address' => $latestTracking->location,
            'type' => 'current'
        ] : [
            'lat' => null,
            'lng' => null,
            'address' => $shipment->originWarehouse?->address ?? 'Origin Location',
            'type' => 'current'
        ];

        return [
            'tracking_number' => $shipment->tracking_number,
            'current_status' => $shipment->status,
            'estimated_delivery' => $shipment->estimated_delivery_date?->toISOString(),
            'actual_delivery' => $shipment->actual_delivery_date?->toISOString(),
            'current_location' => $currentLocation,
            'origin' => [
                'address' => $shipment->sender_address,
                'warehouse' => $shipment->originWarehouse?->name,
            ],
            'destination' => [
                'lat' => $this->getLocationCoordinates($shipment->recipient_address)['lat'] ?? -6.7924,
                'lng' => $this->getLocationCoordinates($shipment->recipient_address)['lng'] ?? 39.2083,
                'address' => $shipment->recipient_address,
                'warehouse' => $shipment->destinationWarehouse?->name,
            ],
            'shipment_details' => [
                'weight' => $shipment->weight_kg,
                'dimensions' => [
                    'length' => $shipment->dimensions_length_cm,
                    'width' => $shipment->dimensions_width_cm,
                    'height' => $shipment->dimensions_height_cm,
                ],
                'declared_value' => $shipment->declared_value,
                'service_type' => $shipment->service_type,
                'package_type' => $shipment->package_type,
            ],
            'customer_info' => [
                'sender_name' => $shipment->sender_name,
                'sender_phone' => $shipment->sender_phone,
                'recipient_name' => $shipment->recipient_name,
                'recipient_phone' => $shipment->recipient_phone,
            ],
            'events' => $events,
            'delivery_window' => $this->getDeliveryWindow($shipment),
            'special_instructions' => $shipment->special_instructions,
            'insurance_value' => $shipment->insurance_value,
            'created_at' => $shipment->created_at->toISOString(),
            'updated_at' => $shipment->updated_at->toISOString(),
        ];
    }

    /**
     * Get real tracking events from database.
     */
    private function generateTrackingEvents(Shipment $shipment): array
    {
        // Get real tracking history from database
        $trackingHistory = $shipment->trackingHistory()
            ->with('recordedBy')
            ->orderBy('occurred_at', 'desc')
            ->get();

        $events = [];

        // If no tracking history exists, create a default creation event
        if ($trackingHistory->isEmpty()) {
            $events[] = [
                'id' => 'created',
                'timestamp' => $shipment->created_at->toISOString(),
                'status' => 'pending',
                'location' => $shipment->originWarehouse?->name ?? 'RT Express Facility',
                'description' => 'Shipment created and ready for pickup',
                'details' => 'Package has been processed and is ready for collection.',
            ];
        } else {
            // Use real tracking history
            foreach ($trackingHistory as $index => $tracking) {
                $events[] = [
                    'id' => (string) $tracking->id,
                    'timestamp' => $tracking->occurred_at->toISOString(),
                    'status' => $tracking->status,
                    'location' => $tracking->location,
                    'description' => $this->getStatusDescription($tracking->status),
                    'details' => $tracking->notes ?? $this->getStatusDescription($tracking->status),
                    'recorded_by' => $tracking->recordedBy?->name,
                ];
            }
        }

        return $events; // Already ordered by occurred_at desc
    }

    /**
     * Get human-readable description for status.
     */
    private function getStatusDescription(string $status): string
    {
        return match($status) {
            'pending' => 'Shipment created and ready for pickup',
            'picked_up' => 'Package picked up from sender',
            'in_transit' => 'Package in transit',
            'out_for_delivery' => 'Out for delivery',
            'delivered' => 'Package delivered successfully',
            'exception' => 'Delivery exception occurred',
            'cancelled' => 'Shipment cancelled',
            default => 'Status updated',
        };
    }



    /**
     * Get current location address based on status.
     */
    private function getCurrentLocationAddress(string $status): string
    {
        $addresses = [
            'pending' => 'RT Express Facility, Processing Center',
            'picked_up' => 'Local Collection Hub',
            'in_transit' => 'Distribution Center, En Route',
            'out_for_delivery' => 'Local Delivery Hub',
            'delivered' => 'Delivered to Recipient',
        ];

        return $addresses[$status] ?? 'Unknown Location';
    }

    /**
     * Get driver information for shipment.
     */
    private function getDriverInfo(Shipment $shipment): ?array
    {
        if (in_array($shipment->status, ['out_for_delivery', 'delivered'])) {
            return [
                'name' => 'Mike Johnson',
                'phone' => '+1 (555) 123-4567',
                'vehicle' => 'Truck #RT-' . substr($shipment->tracking_number, -4),
            ];
        }

        return null;
    }

    /**
     * Get delivery window for shipment.
     */
    private function getDeliveryWindow(Shipment $shipment): ?string
    {
        if (!$shipment->estimated_delivery_date) {
            return null;
        }

        // Delivery window based on service type
        return match($shipment->service_type ?? 'standard') {
            'express' => '9:00 AM - 1:00 PM',
            'overnight' => '8:00 AM - 12:00 PM',
            'same_day' => '2:00 PM - 6:00 PM',
            default => '9:00 AM - 6:00 PM',
        };
    }

    /**
     * Get location coordinates for a given address/location.
     */
    private function getLocationCoordinates(string $location): array
    {
        // Tanzania major cities and locations
        $coordinates = [
            // Major cities
            'Dar es Salaam' => ['lat' => -6.7924, 'lng' => 39.2083],
            'Dodoma' => ['lat' => -6.1630, 'lng' => 35.7516],
            'Mwanza' => ['lat' => -2.5164, 'lng' => 32.9175],
            'Arusha' => ['lat' => -3.3869, 'lng' => 36.6830],
            'Mbeya' => ['lat' => -8.9094, 'lng' => 33.4607],
            'Morogoro' => ['lat' => -6.8235, 'lng' => 37.6614],
            'Tanga' => ['lat' => -5.0692, 'lng' => 39.0962],
            'Tabora' => ['lat' => -5.0165, 'lng' => 32.8033],
            'Kigoma' => ['lat' => -4.8765, 'lng' => 29.6269],
            'Mtwara' => ['lat' => -10.2692, 'lng' => 40.1806],

            // RT Express facilities
            'RT Express Facility' => ['lat' => -6.7924, 'lng' => 39.2083],
            'Dar es Salaam Distribution Center' => ['lat' => -6.8000, 'lng' => 39.2500],
            'Dodoma Distribution Center' => ['lat' => -6.1630, 'lng' => 35.7516],
            'Mwanza Distribution Center' => ['lat' => -2.5164, 'lng' => 32.9175],
            'Arusha Distribution Center' => ['lat' => -3.3869, 'lng' => 36.6830],

            // Common locations
            'Customer Location' => ['lat' => -6.7924, 'lng' => 39.2083],
            'Distribution Center' => ['lat' => -6.8000, 'lng' => 39.2500],
            'Local Delivery Hub' => ['lat' => -6.7800, 'lng' => 39.2200],
        ];

        // Check for exact match first
        foreach ($coordinates as $place => $coords) {
            if (stripos($location, $place) !== false) {
                return $coords;
            }
        }

        // Default to Dar es Salaam if no match found
        return ['lat' => -6.7924, 'lng' => 39.2083];
    }


}
