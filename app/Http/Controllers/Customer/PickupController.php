<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PickupController extends Controller
{
    /**
     * Show the pickup scheduling form.
     */
    public function create(Request $request): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        $shipmentIds = $request->get('shipments', []);

        return Inertia::render('Customer/Pickups/Schedule', [
            'customer' => $customer,
            'shipmentIds' => $shipmentIds,
        ]);
    }

    /**
     * Store a new pickup request.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'pickup_date' => 'required|date|after:today',
            'pickup_time_window' => 'required|string|in:8-12,12-17,8-17,9-15',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:50',
            'pickup_location' => 'required|string|max:500',
            'special_instructions' => 'nullable|string|max:1000',
            'package_count' => 'required|integer|min:1',
            'total_weight' => 'required|numeric|min:0',
            'ready_time' => 'required|string',
            'close_time' => 'required|string',
            'residential_pickup' => 'boolean',
            'shipment_ids' => 'array',
            'shipment_ids.*' => 'integer|exists:shipments,id',
        ]);

        try {
            DB::beginTransaction();

            // Generate pickup ID
            $pickupId = 'PU'.strtoupper(substr(uniqid(), -8));

            // In a real application, you would save this to a pickups table
            // For now, we'll just simulate the creation

            $pickupData = [
                'pickup_id' => $pickupId,
                'customer_id' => $customer->id,
                'pickup_date' => $validated['pickup_date'],
                'pickup_time_window' => $validated['pickup_time_window'],
                'contact_person' => $validated['contact_person'],
                'contact_phone' => $validated['contact_phone'],
                'pickup_location' => $validated['pickup_location'],
                'special_instructions' => $validated['special_instructions'],
                'package_count' => $validated['package_count'],
                'total_weight' => $validated['total_weight'],
                'ready_time' => $validated['ready_time'],
                'close_time' => $validated['close_time'],
                'residential_pickup' => $validated['residential_pickup'] ?? false,
                'shipment_ids' => $validated['shipment_ids'] ?? [],
                'status' => 'scheduled',
                'created_at' => now(),
            ];

            // Here you would typically:
            // 1. Save to pickups table
            // 2. Update related shipments
            // 3. Send notifications
            // 4. Create calendar entries for drivers

            DB::commit();

            return response()->json([
                'success' => true,
                'pickup_id' => $pickupId,
                'message' => 'Pickup scheduled successfully',
                'pickup_data' => $pickupData,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule pickup: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display pickup history for the customer.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Mock pickup history data
        $pickups = [
            [
                'id' => 'PU12345678',
                'pickup_date' => '2024-01-20',
                'pickup_time_window' => '9:00 AM - 3:00 PM',
                'contact_person' => $customer->contact_person,
                'pickup_location' => $customer->address_line_1,
                'package_count' => 3,
                'total_weight' => 15.5,
                'status' => 'completed',
                'created_at' => '2024-01-18T10:30:00Z',
            ],
            [
                'id' => 'PU87654321',
                'pickup_date' => '2024-01-25',
                'pickup_time_window' => '8:00 AM - 12:00 PM',
                'contact_person' => $customer->contact_person,
                'pickup_location' => $customer->address_line_1,
                'package_count' => 1,
                'total_weight' => 5.2,
                'status' => 'scheduled',
                'created_at' => '2024-01-22T14:15:00Z',
            ],
        ];

        return Inertia::render('Customer/Pickups/Index', [
            'customer' => $customer,
            'pickups' => $pickups,
        ]);
    }
}
