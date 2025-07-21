<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    /**
     * Display the customer's returns.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Generate mock return data
        $returns = $this->generateMockReturns($customer);

        return Inertia::render('Customer/Returns/Index', [
            'customer' => $customer,
            'returns' => $returns,
        ]);
    }

    /**
     * Store a new return request.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'original_tracking_number' => 'required|string|max:50',
            'return_reason' => 'required|string|max:255',
            'return_type' => 'required|string|in:refund,exchange,repair',
            'return_value' => 'required|numeric|min:0',
            'special_instructions' => 'nullable|string|max:1000',
        ]);

        try {
            DB::beginTransaction();

            // Verify the original shipment exists and belongs to the customer
            $originalShipment = Shipment::where('tracking_number', $validated['original_tracking_number'])
                ->where('customer_id', $customer->id)
                ->first();

            if (!$originalShipment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Original shipment not found or does not belong to your account',
                ], 404);
            }

            // Generate return tracking number
            $returnTrackingNumber = 'RET' . strtoupper(substr(uniqid(), -8));

            // In a real application, you would save this to a returns table
            $returnData = [
                'return_tracking_number' => $returnTrackingNumber,
                'original_tracking_number' => $validated['original_tracking_number'],
                'customer_id' => $customer->id,
                'original_shipment_id' => $originalShipment->id,
                'return_reason' => $validated['return_reason'],
                'return_type' => $validated['return_type'],
                'return_value' => $validated['return_value'],
                'special_instructions' => $validated['special_instructions'] ?? null,
                'status' => 'pending',
                'sender_name' => $originalShipment->recipient_name,
                'sender_address' => $originalShipment->recipient_address,
                'recipient_name' => $originalShipment->sender_name,
                'recipient_address' => $originalShipment->sender_address,
                'created_at' => now(),
            ];

            // Here you would typically:
            // 1. Save to returns table
            // 2. Generate return label
            // 3. Send confirmation email
            // 4. Create pickup request if needed

            DB::commit();

            return response()->json([
                'success' => true,
                'return_tracking_number' => $returnTrackingNumber,
                'message' => 'Return request created successfully',
                'return_data' => $returnData,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create return request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate mock return data for demonstration.
     */
    private function generateMockReturns($customer)
    {
        $returns = [];
        $statuses = ['pending', 'approved', 'picked_up', 'in_transit', 'delivered', 'processed'];
        $types = ['refund', 'exchange', 'repair'];
        $reasons = [
            'Defective/Damaged Item',
            'Wrong Item Received',
            'Not as Described',
            'Size/Fit Issue',
            'Customer Changed Mind',
            'Warranty Claim'
        ];

        // Get some recent shipments for realistic data
        $recentShipments = $customer->shipments()->latest()->limit(10)->get();

        for ($i = 0; $i < 8; $i++) {
            $originalShipment = $recentShipments->isNotEmpty()
                ? $recentShipments->random()
                : null;

            $createdDate = now()->subDays(rand(1, 30));
            $status = $statuses[array_rand($statuses)];
            $type = $types[array_rand($types)];
            $reason = $reasons[array_rand($reasons)];

            $returns[] = [
                'id' => $i + 1,
                'return_tracking_number' => 'RET' . strtoupper(substr(uniqid(), -8)),
                'original_tracking_number' => $originalShipment
                    ? $originalShipment->tracking_number
                    : 'RT' . strtoupper(substr(uniqid(), -8)),
                'return_reason' => $reason,
                'return_type' => $type,
                'status' => $status,
                'created_date' => $createdDate->toISOString(),
                'pickup_date' => $status !== 'pending' ? $createdDate->addDays(1)->toISOString() : null,
                'estimated_delivery_date' => $createdDate->addDays(rand(5, 10))->toISOString(),
                'return_value' => rand(25, 500),
                'sender_name' => $originalShipment
                    ? $originalShipment->recipient_name
                    : 'Customer ' . ($i + 1),
                'recipient_name' => $customer->contact_person,
                'recipient_address' => $customer->address_line_1 . ', ' . $customer->city,
                'special_instructions' => rand(0, 1) ? 'Handle with care - fragile items' : null,
            ];
        }

        // Sort by created date (newest first)
        usort($returns, function($a, $b) {
            return strtotime($b['created_date']) - strtotime($a['created_date']);
        });

        return $returns;
    }

    /**
     * Generate return label for the specified return.
     */
    public function generateLabel(Request $request, $returnId)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            // In a real application, you would:
            // 1. Verify the return belongs to the customer
            // 2. Generate the actual return label PDF
            // 3. Include return authorization number
            // 4. Add special handling instructions

            $labelContent = $this->generateMockReturnLabel($returnId);

            return response($labelContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="return-label-' . $returnId . '.pdf"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate return label: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a mock return label PDF.
     */
    private function generateMockReturnLabel($returnId): string
    {
        // This is a mock implementation
        // In a real application, you would use a PDF library

        $pdfContent = "%PDF-1.4\n";
        $pdfContent .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $pdfContent .= "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        $pdfContent .= "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n";
        $pdfContent .= "xref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000125 00000 n \n";
        $pdfContent .= "trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n199\n%%EOF";

        return $pdfContent;
    }
}
