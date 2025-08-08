<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    /**
     * Display the communication center.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        $trackingNumber = $request->get('tracking_number');

        if (! $trackingNumber) {
            return redirect()->route('customer.tracking.index');
        }

        // Get shipment data
        $shipment = Shipment::where('tracking_number', $trackingNumber)
            ->where('customer_id', $customer->id)
            ->first();

        if (! $shipment) {
            return redirect()->route('customer.tracking.index')
                ->with('error', 'Shipment not found');
        }

        // Mock data for demonstration
        $mockData = $this->getMockCommunicationData($trackingNumber, $shipment);

        return Inertia::render('Customer/Communication/Index', [
            'customer' => $customer,
            'trackingNumber' => $trackingNumber,
            'driver' => $mockData['driver'],
            'messages' => $mockData['messages'],
            'deliveryInstructions' => $mockData['deliveryInstructions'],
            'deliveryPhotos' => $mockData['deliveryPhotos'],
            'deliveryStatus' => $mockData['deliveryStatus'],
            'deliveryTimestamp' => $mockData['deliveryTimestamp'],
        ]);
    }

    /**
     * Send a message to the driver.
     */
    public function sendMessage(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'tracking_number' => 'required|string',
            'content' => 'required|string|max:1000',
            'type' => 'required|string|in:text,image',
            'attachments.*' => 'image|max:5120', // 5MB max per image
        ]);

        try {
            // Verify customer has access to this shipment
            $shipment = Shipment::where('tracking_number', $validated['tracking_number'])
                ->where('customer_id', $customer->id)
                ->first();

            if (! $shipment) {
                return response()->json(['error' => 'Shipment not found'], 404);
            }

            // Handle file uploads
            $attachments = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('communication/attachments', 'public');
                    $attachments[] = [
                        'type' => 'image',
                        'url' => Storage::url($path),
                        'name' => $file->getClientOriginalName(),
                    ];
                }
            }

            // In a real application, you would:
            // 1. Save the message to the database
            // 2. Send real-time notification to the driver
            // 3. Send push notification if driver is offline

            $messageData = [
                'id' => uniqid(),
                'sender' => 'customer',
                'content' => $validated['content'],
                'timestamp' => now()->toISOString(),
                'type' => $validated['type'],
                'attachments' => $attachments,
                'read' => false,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $messageData,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update delivery instructions.
     */
    public function updateInstructions(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'tracking_number' => 'required|string',
            'instructions' => 'nullable|string|max:1000',
            'preferences' => 'array',
            'preferences.*' => 'string',
        ]);

        try {
            // Verify customer has access to this shipment
            $shipment = Shipment::where('tracking_number', $validated['tracking_number'])
                ->where('customer_id', $customer->id)
                ->first();

            if (! $shipment) {
                return response()->json(['error' => 'Shipment not found'], 404);
            }

            // Update shipment with delivery instructions
            $shipment->update([
                'special_instructions' => $validated['instructions'],
            ]);

            // In a real application, you would also:
            // 1. Save preferences to a separate table
            // 2. Notify the driver of updated instructions
            // 3. Log the instruction change

            return response()->json([
                'success' => true,
                'message' => 'Delivery instructions updated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update instructions: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get messages for a shipment.
     */
    public function getMessages(Request $request, string $trackingNumber)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Verify customer has access to this shipment
        $shipment = Shipment::where('tracking_number', $trackingNumber)
            ->where('customer_id', $customer->id)
            ->first();

        if (! $shipment) {
            return response()->json(['error' => 'Shipment not found'], 404);
        }

        // In a real application, you would fetch messages from the database
        $messages = $this->getMockMessages($trackingNumber);

        return response()->json([
            'success' => true,
            'messages' => $messages,
        ]);
    }

    /**
     * Get mock communication data for demonstration.
     */
    private function getMockCommunicationData(string $trackingNumber, Shipment $shipment): array
    {
        $deliveryStatus = $shipment->status === 'delivered' ? 'delivered' : 'pending';

        return [
            'driver' => in_array($shipment->status, ['out_for_delivery', 'delivered']) ? [
                'id' => 'driver-123',
                'name' => 'Mike Johnson',
                'phone' => '+1 (555) 123-4567',
                'vehicle' => 'Truck #RT-'.substr($trackingNumber, -4),
                'status' => 'online',
                'location' => [
                    'lat' => 40.7128,
                    'lng' => -74.0060,
                    'address' => 'En route to delivery location',
                ],
            ] : null,
            'messages' => $this->getMockMessages($trackingNumber),
            'deliveryInstructions' => $shipment->special_instructions,
            'deliveryPhotos' => $deliveryStatus === 'delivered' ? $this->getMockDeliveryPhotos() : [],
            'deliveryStatus' => $deliveryStatus,
            'deliveryTimestamp' => $deliveryStatus === 'delivered' ? $shipment->updated_at->toISOString() : null,
        ];
    }

    /**
     * Get mock messages for demonstration.
     */
    private function getMockMessages(string $trackingNumber): array
    {
        return [
            [
                'id' => '1',
                'sender' => 'system',
                'content' => 'Your driver Mike has been assigned to your delivery',
                'timestamp' => now()->subHours(2)->toISOString(),
                'type' => 'system',
                'read' => true,
            ],
            [
                'id' => '2',
                'sender' => 'driver',
                'content' => 'Hi! I\'m Mike, your delivery driver. I\'ll be delivering your package today.',
                'timestamp' => now()->subHour()->toISOString(),
                'type' => 'text',
                'read' => true,
            ],
            [
                'id' => '3',
                'sender' => 'customer',
                'content' => 'Great! Please ring the doorbell when you arrive.',
                'timestamp' => now()->subMinutes(45)->toISOString(),
                'type' => 'text',
                'read' => true,
            ],
        ];
    }

    /**
     * Get mock delivery photos for demonstration.
     */
    private function getMockDeliveryPhotos(): array
    {
        return [
            [
                'id' => 'photo-1',
                'url' => '/images/delivery/proof-1.jpg',
                'thumbnail' => '/images/delivery/proof-1-thumb.jpg',
                'timestamp' => now()->toISOString(),
                'location' => [
                    'lat' => 40.7589,
                    'lng' => -73.9851,
                    'address' => '456 Business St, New York, NY 10019',
                ],
                'driver' => [
                    'name' => 'Mike Johnson',
                    'id' => 'driver-123',
                ],
                'type' => 'delivery',
                'description' => 'Package delivered to front door as requested',
            ],
        ];
    }
}
