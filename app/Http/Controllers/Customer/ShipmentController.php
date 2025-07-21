<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ShipmentController extends Controller
{
    /**
     * Display a listing of the customer's shipments.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Get customer's shipments with filtering
        $query = Shipment::where('customer_id', $customer->id)
            ->with(['originWarehouse', 'destinationWarehouse']);

        // Apply search filter
        if (request('search')) {
            $query->where('tracking_number', 'like', '%' . request('search') . '%');
        }

        // Apply status filter
        if (request('status')) {
            $query->where('status', request('status'));
        }

        // Apply service type filter
        if (request('service_type')) {
            $query->where('service_type', request('service_type'));
        }

        // Apply date range filter
        if (request('date_from')) {
            $query->whereDate('created_at', '>=', request('date_from'));
        }
        if (request('date_to')) {
            $query->whereDate('created_at', '<=', request('date_to'));
        }

        $shipments = $query->orderBy('created_at', 'desc')->paginate(20);

        // Calculate stats for the customer
        $stats = [
            'total' => Shipment::where('customer_id', $customer->id)->count(),
            'pending' => Shipment::where('customer_id', $customer->id)->where('status', 'pending')->count(),
            'in_transit' => Shipment::where('customer_id', $customer->id)->where('status', 'in_transit')->count(),
            'delivered' => Shipment::where('customer_id', $customer->id)->where('status', 'delivered')->count(),
            'this_month' => Shipment::where('customer_id', $customer->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return Inertia::render('Customer/Shipments/Index', [
            'shipments' => $shipments,
            'stats' => $stats,
            'filters' => request()->only(['search', 'status', 'service_type', 'date_from', 'date_to']),
            'customer' => $customer,
        ]);
    }

    /**
     * Display the shipment creation form.
     */
    public function create(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Get available service types
        $serviceTypes = [
            [
                'id' => 'standard',
                'name' => 'RT Standard',
                'description' => 'Reliable delivery for everyday shipping needs',
                'base_rate' => 12.50,
                'estimated_days' => '3-5',
                'features' => ['Package tracking', 'Delivery confirmation', 'Basic insurance'],
            ],
            [
                'id' => 'express',
                'name' => 'RT Express',
                'description' => 'Fast delivery when time matters',
                'base_rate' => 24.99,
                'estimated_days' => '1-2',
                'features' => ['Priority handling', 'Real-time tracking', 'Enhanced insurance', 'SMS notifications'],
            ],
            [
                'id' => 'overnight',
                'name' => 'RT Overnight',
                'description' => 'Next business day delivery',
                'base_rate' => 39.99,
                'estimated_days' => '1',
                'features' => ['Next day delivery', 'Morning delivery option', 'Premium insurance', 'Signature required'],
            ],
            [
                'id' => 'international',
                'name' => 'RT International',
                'description' => 'Worldwide shipping solutions',
                'base_rate' => 45.00,
                'estimated_days' => '5-10',
                'features' => ['Customs clearance', 'International tracking', 'Duty handling', 'Documentation support'],
            ],
        ];

        // Get saved addresses (mock data for now)
        $savedAddresses = [
            [
                'id' => 1,
                'contact_person' => 'John Smith',
                'company_name' => 'Tech Solutions Inc',
                'email' => 'john@techsolutions.com',
                'phone' => '+1 (555) 123-4567',
                'address_line_1' => '123 Business Ave',
                'address_line_2' => 'Suite 100',
                'city' => 'New York',
                'state_province' => 'NY',
                'postal_code' => '10001',
                'country' => 'US',
            ],
            [
                'id' => 2,
                'contact_person' => 'Sarah Johnson',
                'company_name' => 'Global Imports',
                'email' => 'sarah@globalimports.com',
                'phone' => '+1 (555) 987-6543',
                'address_line_1' => '456 Commerce St',
                'city' => 'Los Angeles',
                'state_province' => 'CA',
                'postal_code' => '90210',
                'country' => 'US',
            ],
        ];

        return Inertia::render('Customer/Shipments/Create', [
            'customer' => $customer,
            'serviceTypes' => $serviceTypes,
            'savedAddresses' => $savedAddresses,
        ]);
    }

    /**
     * Store a new shipment.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'recipient' => 'required|array',
            'recipient.contact_person' => 'required|string|max:255',
            'recipient.email' => 'required|email|max:255',
            'recipient.phone' => 'required|string|max:50',
            'recipient.address_line_1' => 'required|string|max:255',
            'recipient.city' => 'required|string|max:100',
            'recipient.state_province' => 'required|string|max:100',
            'recipient.postal_code' => 'required|string|max:20',
            'recipient.country' => 'required|string|max:2',
            'packageDetails' => 'required|array',
            'packageDetails.weight' => 'required|numeric|min:0.1',
            'packageDetails.length' => 'required|numeric|min:0.1',
            'packageDetails.width' => 'required|numeric|min:0.1',
            'packageDetails.height' => 'required|numeric|min:0.1',
            'packageDetails.declared_value' => 'required|numeric|min:0.01',
            'packageDetails.contents_description' => 'required|string|max:500',
            'serviceType' => 'required|array',
            'serviceType.id' => 'required|string',
            'totalCost' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Get warehouses for origin and destination
            $originWarehouse = Warehouse::first();
            $destinationWarehouse = Warehouse::skip(1)->first();

            if (!$originWarehouse || !$destinationWarehouse) {
                throw new \Exception('Warehouses not configured');
            }

            // Create the shipment
            $shipment = Shipment::create([
                'customer_id' => $customer->id,
                'tracking_number' => $this->generateTrackingNumber(),
                'origin_warehouse_id' => $originWarehouse->id,
                'destination_warehouse_id' => $destinationWarehouse->id,
                'sender_name' => $customer->contact_person,
                'sender_phone' => $customer->phone,
                'sender_address' => $customer->address_line_1 . ($customer->address_line_2 ? ', ' . $customer->address_line_2 : '') .
                                 ', ' . $customer->city . ', ' . $customer->state_province . ' ' . $customer->postal_code,
                'recipient_name' => $validated['recipient']['contact_person'],
                'recipient_phone' => $validated['recipient']['phone'],
                'recipient_address' => $validated['recipient']['address_line_1'] .
                                    ($validated['recipient']['address_line_2'] ?? '' ? ', ' . $validated['recipient']['address_line_2'] : '') .
                                    ', ' . $validated['recipient']['city'] . ', ' . $validated['recipient']['state_province'] . ' ' . $validated['recipient']['postal_code'],
                'weight_kg' => $validated['packageDetails']['weight'] * 0.453592, // Convert lbs to kg
                'dimensions_length_cm' => $validated['packageDetails']['length'] * 2.54, // Convert inches to cm
                'dimensions_width_cm' => $validated['packageDetails']['width'] * 2.54,
                'dimensions_height_cm' => $validated['packageDetails']['height'] * 2.54,
                'declared_value' => $validated['packageDetails']['declared_value'],
                'special_instructions' => $validated['packageDetails']['contents_description'],
                'service_type' => $validated['serviceType']['id'],
                'status' => 'pending',
                'estimated_delivery_date' => $this->calculateEstimatedDeliveryDate($validated['serviceType']['id']),
                'created_by' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'shipment' => $shipment,
                'message' => 'Shipment created successfully',
                'redirect' => route('customer.shipments.show', $shipment->id),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create shipment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a unique tracking number.
     */
    private function generateTrackingNumber(): string
    {
        do {
            $trackingNumber = 'RT' . strtoupper(substr(uniqid(), -8));
        } while (Shipment::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }

    /**
     * Calculate estimated delivery date based on service type.
     */
    private function calculateEstimatedDeliveryDate(string $serviceType): string
    {
        $businessDays = match ($serviceType) {
            'overnight' => 1,
            'express' => 2,
            'standard' => 4,
            'international' => 7,
            default => 4,
        };

        $deliveryDate = now();
        $addedDays = 0;

        while ($addedDays < $businessDays) {
            $deliveryDate->addDay();

            // Skip weekends
            if ($deliveryDate->isWeekday()) {
                $addedDays++;
            }
        }

        return $deliveryDate->toDateString();
    }

    /**
     * Display the specified shipment.
     */
    public function show(Shipment $shipment): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer || $shipment->customer_id !== $customer->id) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        return Inertia::render('Customer/Shipments/Show', [
            'shipment' => $shipment,
            'customer' => $customer,
        ]);
    }

    /**
     * Generate shipping label for the specified shipment.
     */
    public function generateLabel(Request $request, Shipment $shipment)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer || $shipment->customer_id !== $customer->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'format' => 'required|string|in:4x6,4x6.75,8.5x11',
            'options' => 'array',
            'options.*' => 'string|in:qr_code,return_label,customs_form,handling_instructions',
        ]);

        try {
            // Here we would generate the actual PDF label
            // For now, we'll create a mock PDF response

            $labelContent = $this->generateMockLabel($shipment, $validated);

            return response($labelContent)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="shipping-label-' . $shipment->tracking_number . '.pdf"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate label: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a mock PDF label (in a real app, this would use a PDF library).
     */
    private function generateMockLabel(Shipment $shipment, array $options): string
    {
        // This is a mock implementation
        // In a real application, you would use a PDF library like TCPDF, FPDF, or DomPDF

        $labelData = [
            'tracking_number' => $shipment->tracking_number,
            'service_type' => $shipment->service_type,
            'sender' => [
                'name' => $shipment->sender_name,
                'company' => $shipment->sender_company,
                'address' => $shipment->sender_address,
                'city' => $shipment->sender_city,
                'state' => $shipment->sender_state,
                'postal_code' => $shipment->sender_postal_code,
                'country' => $shipment->sender_country,
            ],
            'recipient' => [
                'name' => $shipment->recipient_name,
                'company' => $shipment->recipient_company,
                'address' => $shipment->recipient_address,
                'city' => $shipment->recipient_city,
                'state' => $shipment->recipient_state,
                'postal_code' => $shipment->recipient_postal_code,
                'country' => $shipment->recipient_country,
            ],
            'package' => [
                'weight' => $shipment->weight,
                'dimensions' => "{$shipment->length}x{$shipment->width}x{$shipment->height}",
                'declared_value' => $shipment->declared_value,
            ],
            'options' => $options,
        ];

        // Generate a simple PDF-like content (this is just a placeholder)
        $pdfContent = "%PDF-1.4\n";
        $pdfContent .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
        $pdfContent .= "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
        $pdfContent .= "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n";
        $pdfContent .= "xref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000125 00000 n \n";
        $pdfContent .= "trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n199\n%%EOF";

        return $pdfContent;
    }
}
