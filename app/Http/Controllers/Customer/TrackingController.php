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
        $user = Auth::user();
        $customer = $user->customer ?? null;

        $trackingData = $this->getTrackingData($trackingNumber, $customer);

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
        // First, try to find the shipment in the database
        $shipment = Shipment::where('tracking_number', $trackingNumber)->first();

        if ($shipment) {
            // If customer is provided and has access, return real data
            if (!$customer || $shipment->customer_id === $customer->id) {
                return $this->formatShipmentTrackingData($shipment);
            }
            // If customer doesn't have access, fall through to mock data
        }

        // If not found in database and tracking number doesn't look valid, return null
        if (!preg_match('/^RT\d{8}$/', $trackingNumber)) {
            return null;
        }

        // For valid-looking tracking numbers not in database, return mock data for demonstration
        return $this->getMockTrackingData($trackingNumber);
    }

    /**
     * Format shipment data for tracking response.
     */
    private function formatShipmentTrackingData(Shipment $shipment): array
    {
        // Generate mock tracking events based on shipment status
        $events = $this->generateTrackingEvents($shipment);

        return [
            'tracking_number' => $shipment->tracking_number,
            'current_status' => $shipment->status,
            'estimated_delivery' => $shipment->estimated_delivery_date,
            'current_location' => [
                'lat' => 40.7128 + (rand(-100, 100) / 1000), // Mock coordinates
                'lng' => -74.0060 + (rand(-100, 100) / 1000),
                'address' => $this->getCurrentLocationAddress($shipment->status),
            ],
            'destination' => [
                'lat' => 40.7589,
                'lng' => -73.9851,
                'address' => $shipment->recipient_address,
            ],
            'driver' => $this->getDriverInfo($shipment),
            'events' => $events,
            'delivery_window' => $this->getDeliveryWindow($shipment),
            'special_instructions' => $shipment->special_instructions,
        ];
    }

    /**
     * Generate tracking events based on shipment status.
     */
    private function generateTrackingEvents(Shipment $shipment): array
    {
        $events = [];
        $baseTime = $shipment->created_at;

        // Always include creation event
        $events[] = [
            'id' => '1',
            'timestamp' => $baseTime->toISOString(),
            'status' => 'pending',
            'location' => 'RT Express Facility',
            'description' => 'Shipment created and ready for pickup',
            'details' => 'Package has been processed and is ready for collection.',
        ];

        // Add events based on current status
        $statusOrder = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
        $currentIndex = array_search($shipment->status, $statusOrder);

        if ($currentIndex >= 1) {
            $events[] = [
                'id' => '2',
                'timestamp' => $baseTime->addHours(4)->toISOString(),
                'status' => 'picked_up',
                'location' => 'Customer Location',
                'description' => 'Package picked up from sender',
                'driver' => [
                    'name' => 'Sarah Wilson',
                    'phone' => '+1 (555) 987-6543',
                ],
                'details' => 'Package successfully collected from sender location.',
            ];
        }

        if ($currentIndex >= 2) {
            $events[] = [
                'id' => '3',
                'timestamp' => $baseTime->addHours(8)->toISOString(),
                'status' => 'in_transit',
                'location' => 'Distribution Center',
                'description' => 'Package in transit',
                'details' => 'Package is being transported to destination.',
            ];
        }

        if ($currentIndex >= 3) {
            $events[] = [
                'id' => '4',
                'timestamp' => $baseTime->addDay()->toISOString(),
                'status' => 'out_for_delivery',
                'location' => 'Local Delivery Hub',
                'description' => 'Out for delivery',
                'driver' => [
                    'name' => 'Mike Johnson',
                    'phone' => '+1 (555) 123-4567',
                ],
                'details' => 'Package is on the delivery vehicle.',
            ];
        }

        if ($currentIndex >= 4) {
            $events[] = [
                'id' => '5',
                'timestamp' => $baseTime->addDay()->addHours(6)->toISOString(),
                'status' => 'delivered',
                'location' => $shipment->recipient_address,
                'description' => 'Package delivered successfully',
                'details' => 'Package has been delivered to the recipient.',
            ];
        }

        return array_reverse($events); // Most recent first
    }

    /**
     * Get mock tracking data for demonstration.
     */
    private function getMockTrackingData(string $trackingNumber): array
    {
        // Return mock data for demonstration purposes
        return [
            'tracking_number' => $trackingNumber,
            'current_status' => 'in_transit',
            'estimated_delivery' => now()->addDays(2)->toISOString(),
            'current_location' => [
                'lat' => 40.7128,
                'lng' => -74.0060,
                'address' => 'New York Distribution Center, 123 Logistics Ave, New York, NY 10001',
            ],
            'destination' => [
                'lat' => 40.7589,
                'lng' => -73.9851,
                'address' => '456 Business St, New York, NY 10019',
            ],
            'driver' => [
                'name' => 'Mike Johnson',
                'phone' => '+1 (555) 123-4567',
                'vehicle' => 'Truck #RT-2024',
            ],
            'events' => [
                [
                    'id' => '1',
                    'timestamp' => now()->subDays(2)->toISOString(),
                    'status' => 'pending',
                    'location' => 'RT Express Facility',
                    'description' => 'Shipment created and ready for pickup',
                ],
                [
                    'id' => '2',
                    'timestamp' => now()->subDays(1)->toISOString(),
                    'status' => 'picked_up',
                    'location' => 'Customer Location',
                    'description' => 'Package picked up from sender',
                ],
                [
                    'id' => '3',
                    'timestamp' => now()->subHours(8)->toISOString(),
                    'status' => 'in_transit',
                    'location' => 'Distribution Center',
                    'description' => 'Package in transit',
                ],
            ],
            'delivery_window' => '2:00 PM - 6:00 PM',
        ];
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
        if (in_array($shipment->status, ['out_for_delivery', 'delivered'])) {
            return '2:00 PM - 6:00 PM';
        }

        return null;
    }
}
