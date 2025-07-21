<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DeliveryController extends Controller
{
    /**
     * Display the flexible delivery options page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return redirect()->route('customer.dashboard')
                ->with('error', 'Customer account required');
        }

        // Get delivery statistics
        $deliveryStats = $this->getDeliveryStats($customer);

        // Get current shipment if specified
        $currentShipment = null;
        if ($request->has('shipment_id')) {
            $currentShipment = Shipment::where('customer_id', $customer->id)
                ->where('id', $request->shipment_id)
                ->first();
        }

        return Inertia::render('Customer/Delivery/Index', [
            'customer' => $customer->toArray(),
            'deliveryStats' => $deliveryStats,
            'currentShipment' => $currentShipment,
        ]);
    }

    /**
     * Get available time slots for a specific date.
     */
    public function getTimeSlots(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|after:today',
            'service_type' => 'string|in:standard,express,overnight,international',
            'destination_address' => 'string',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            $timeSlots = $this->generateTimeSlots(
                $validated['date'],
                $validated['service_type'] ?? 'standard',
                $customer
            );

            return response()->json([
                'success' => true,
                'slots' => $timeSlots,
                'date' => $validated['date'],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load time slots: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get nearby pickup locations.
     */
    public function getPickupLocations(Request $request)
    {
        $validated = $request->validate([
            'address' => 'required|string',
            'radius' => 'integer|min:1|max:50',
            'type' => 'string|in:pickup_point,locker,store,post_office',
        ]);

        try {
            $locations = $this->findNearbyLocations(
                $validated['address'],
                $validated['radius'] ?? 10,
                $validated['type'] ?? null
            );

            return response()->json([
                'success' => true,
                'locations' => $locations,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load pickup locations: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save delivery preferences.
     */
    public function savePreferences(Request $request)
    {
        $validated = $request->validate([
            'delivery_preferences' => 'array',
            'contact_preferences' => 'array',
            'special_instructions' => 'string|max:500',
            'delivery_location' => 'string',
            'access_code' => 'string|max:50',
            'emergency_contact' => 'array',
            'emergency_contact.name' => 'string|max:100',
            'emergency_contact.phone' => 'string|max:20',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            // In a real app, this would save to a delivery_preferences table
            // For now, we'll simulate saving to customer settings
            $customer->update([
                'delivery_preferences' => json_encode($validated),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Delivery preferences saved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save preferences: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Apply delivery options to a shipment.
     */
    public function applyDeliveryOptions(Request $request)
    {
        $validated = $request->validate([
            'shipment_id' => 'required|exists:shipments,id',
            'delivery_date' => 'date|after:today',
            'time_slot_id' => 'string',
            'pickup_location_id' => 'string',
            'preferences' => 'array',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            $shipment = Shipment::where('customer_id', $customer->id)
                ->where('id', $validated['shipment_id'])
                ->firstOrFail();

            // Update shipment with delivery options
            $deliveryOptions = [
                'delivery_date' => $validated['delivery_date'] ?? null,
                'time_slot_id' => $validated['time_slot_id'] ?? null,
                'pickup_location_id' => $validated['pickup_location_id'] ?? null,
                'preferences' => $validated['preferences'] ?? [],
            ];

            $shipment->update([
                'delivery_options' => json_encode($deliveryOptions),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Delivery options applied successfully',
                'shipment' => $shipment->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply delivery options: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get delivery statistics for customer.
     */
    private function getDeliveryStats(Customer $customer): array
    {
        $totalDeliveries = Shipment::where('customer_id', $customer->id)
            ->where('status', 'delivered')
            ->count();

        $onTimeDeliveries = Shipment::where('customer_id', $customer->id)
            ->where('status', 'delivered')
            ->whereRaw('actual_delivery_date <= estimated_delivery_date')
            ->count();

        // Mock data for now - in real app, would calculate from actual data
        return [
            'onTimeDeliveries' => $onTimeDeliveries ?: 47,
            'totalDeliveries' => $totalDeliveries ?: 52,
            'averageDeliveryTime' => '2.3 days',
            'preferredTimeSlot' => '12:00 PM - 5:00 PM',
            'mostUsedLocation' => 'Front Door',
        ];
    }

    /**
     * Generate available time slots for a date.
     */
    private function generateTimeSlots(string $date, string $serviceType, ?Customer $customer): array
    {
        $dateObj = new \DateTime($date);
        $isWeekend = $dateObj->format('N') >= 6; // Saturday or Sunday

        $baseSlots = [
            [
                'id' => 'morning',
                'startTime' => '08:00',
                'endTime' => '12:00',
                'type' => 'standard',
                'price' => 0,
                'available' => true,
                'capacity' => 10,
                'remaining' => rand(3, 8),
                'popular' => true,
            ],
            [
                'id' => 'afternoon',
                'startTime' => '12:00',
                'endTime' => '17:00',
                'type' => 'standard',
                'price' => 0,
                'available' => true,
                'capacity' => 10,
                'remaining' => rand(2, 7),
            ],
            [
                'id' => 'evening',
                'startTime' => '17:00',
                'endTime' => '20:00',
                'type' => 'express',
                'price' => 5.99,
                'originalPrice' => 8.99,
                'discount' => 33.3,
                'available' => true,
                'capacity' => 8,
                'remaining' => rand(1, 5),
            ],
            [
                'id' => 'premium_morning',
                'startTime' => '09:00',
                'endTime' => '11:00',
                'type' => 'premium',
                'price' => 12.99,
                'available' => true,
                'capacity' => 5,
                'remaining' => rand(0, 3),
            ],
        ];

        // Add weekend slots
        if ($isWeekend) {
            $baseSlots[] = [
                'id' => 'weekend_special',
                'startTime' => '10:00',
                'endTime' => '14:00',
                'type' => 'express',
                'price' => 7.99,
                'available' => true,
                'capacity' => 6,
                'remaining' => rand(1, 4),
            ];
        }

        return $baseSlots;
    }

    /**
     * Find nearby pickup locations.
     */
    private function findNearbyLocations(string $address, int $radius, ?string $type): array
    {
        // Mock data - in real app, would query location database/API
        $allLocations = [
            [
                'id' => 'loc-1',
                'name' => 'RT Express Pickup Point - Manhattan',
                'type' => 'pickup_point',
                'address' => '456 Broadway, New York, NY 10013',
                'distance' => 0.8,
                'walkingTime' => 12,
                'drivingTime' => 5,
                'hours' => [
                    'weekdays' => '8:00 AM - 8:00 PM',
                    'saturday' => '9:00 AM - 6:00 PM',
                    'sunday' => '10:00 AM - 4:00 PM',
                ],
                'phone' => '(212) 555-0123',
                'rating' => 4.8,
                'reviewCount' => 245,
                'features' => ['24/7 Access', 'Secure Storage', 'Package Tracking'],
                'available' => true,
                'capacity' => 95,
                'fees' => ['pickup' => 0, 'storage' => 0],
                'coordinates' => ['lat' => 40.7589, 'lng' => -73.9851],
            ],
            [
                'id' => 'loc-2',
                'name' => 'Smart Locker - Times Square',
                'type' => 'locker',
                'address' => '789 7th Ave, New York, NY 10019',
                'distance' => 0.3,
                'walkingTime' => 4,
                'drivingTime' => 2,
                'hours' => [
                    'weekdays' => '24/7',
                    'saturday' => '24/7',
                    'sunday' => '24/7',
                ],
                'rating' => 4.6,
                'reviewCount' => 189,
                'features' => ['24/7 Access', 'Contactless Pickup', 'Climate Controlled'],
                'available' => true,
                'capacity' => 78,
                'fees' => ['pickup' => 2.99, 'storage' => 1.00],
                'coordinates' => ['lat' => 40.7580, 'lng' => -73.9855],
            ],
        ];

        // Filter by type if specified
        if ($type) {
            $allLocations = array_filter($allLocations, function($location) use ($type) {
                return $location['type'] === $type;
            });
        }

        // Filter by radius (mock - in real app would use geospatial queries)
        return array_filter($allLocations, function($location) use ($radius) {
            return $location['distance'] <= $radius;
        });
    }
}
