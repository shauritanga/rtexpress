<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\User;
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

        if (! $customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Get customer's shipments with filtering
        $query = Shipment::where('customer_id', $customer->id)
            ->with(['originWarehouse', 'destinationWarehouse']);

        // Apply search filter
        if (request('search')) {
            $query->where('tracking_number', 'like', '%'.request('search').'%');
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

        if (! $customer) {
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

        // Get all warehouses for selection - USER MUST SELECT
        $warehouses = Warehouse::select('id', 'name', 'address_line_1', 'address_line_2', 'city', 'state_province', 'country')->get()->map(function ($warehouse) {
            return [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'address' => trim($warehouse->address_line_1.($warehouse->address_line_2 ? ', '.$warehouse->address_line_2 : '')),
                'city' => $warehouse->city,
                'country' => $warehouse->country,
            ];
        });

        return Inertia::render('Customer/Shipments/Create', [
            'customer' => $customer,
            'serviceTypes' => $serviceTypes,
            'savedAddresses' => $savedAddresses,
            'warehouses' => $warehouses,
        ]);
    }

    /**
     * Store a new shipment (original method for backward compatibility).
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            // Required warehouse selection - NO AUTO-SELECTION
            'origin_warehouse_id' => 'required|exists:warehouses,id',
            'destination_warehouse_id' => 'nullable|string',

            // Sender information (editable)
            'sender_name' => 'required|string|max:255',
            'sender_phone' => 'required|string|max:50',
            'sender_address' => 'required|string|max:500',

            // Recipient information (required)
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:50',
            'recipient_address' => 'required|string|max:500',
            'recipient_country' => 'required|string|size:2',

            // Service and package type (required)
            'service_type' => 'required|in:standard,express,overnight,same_day,economy',
            'package_type' => 'required|in:document,package,pallet,container,fragile,hazardous',

            // Package specifications (required)
            'weight_kg' => 'required|numeric|min:0.1',
            'dimensions_length_cm' => 'required|numeric|min:1',
            'dimensions_width_cm' => 'required|numeric|min:1',
            'dimensions_height_cm' => 'required|numeric|min:1',
            'declared_value' => 'required|numeric|min:0.01',

            // Optional fields
            'insurance_value' => 'nullable|numeric|min:0',
            'special_instructions' => 'nullable|string|max:1000',
            'estimated_delivery_date' => 'nullable|date|after:today',

            // Delivery options (optional)
            'delivery_options' => 'nullable|array',
            'delivery_options.signature_required' => 'boolean',
            'delivery_options.weekend_delivery' => 'boolean',
            'delivery_options.evening_delivery' => 'boolean',
            'delivery_options.leave_at_door' => 'boolean',

            // Customs data (optional)
            'customs_data' => 'nullable|array',
            'customs_data.contents_description' => 'nullable|string|max:500',
            'customs_data.country_of_origin' => 'nullable|string|max:100',
            'customs_data.harmonized_code' => 'nullable|string|max:20',
            'customs_data.export_reason' => 'nullable|in:sale,gift,sample,return,repair,personal_use',
        ]);

        try {
            DB::beginTransaction();

            // Check if this is an international shipment
            $isInternational = $validated['recipient_country'] !== 'TZ';

            // For international shipments, require customs data
            if ($isInternational) {
                $customsValidation = $request->validate([
                    'customs_data.contents_description' => 'required|string|max:500',
                    'customs_data.country_of_origin' => 'required|string|max:100',
                    'customs_data.harmonized_code' => 'nullable|string|max:20',
                    'customs_data.export_reason' => 'required|in:sale,gift,sample,return,repair,personal_use',
                ]);
            }

            // Calculate total cost based on service type and package details
            $totalCost = $this->calculateShippingCost(
                $validated['service_type'],
                $validated['weight_kg'],
                $validated['declared_value'],
                $validated['delivery_options'] ?? [],
                $isInternational
            );

            // Create the shipment with all provided data - NO AUTO-SELECTION
            $shipment = Shipment::create([
                'customer_id' => $customer->id,
                'tracking_number' => $this->generateTrackingNumber(),
                'origin_warehouse_id' => $validated['origin_warehouse_id'],
                'destination_warehouse_id' => ($validated['destination_warehouse_id'] === 'none') ? null : $validated['destination_warehouse_id'],
                'sender_name' => $validated['sender_name'],
                'sender_phone' => $validated['sender_phone'],
                'sender_address' => $validated['sender_address'],
                'recipient_name' => $validated['recipient_name'],
                'recipient_phone' => $validated['recipient_phone'],
                'recipient_address' => $validated['recipient_address'],
                'recipient_country' => $validated['recipient_country'],
                'service_type' => $validated['service_type'],
                'package_type' => $validated['package_type'],
                'weight_kg' => $validated['weight_kg'],
                'dimensions_length_cm' => $validated['dimensions_length_cm'],
                'dimensions_width_cm' => $validated['dimensions_width_cm'],
                'dimensions_height_cm' => $validated['dimensions_height_cm'],
                'declared_value' => $validated['declared_value'],
                'insurance_value' => $validated['insurance_value'] ?? 0,
                'special_instructions' => $validated['special_instructions'],
                'estimated_delivery_date' => $validated['estimated_delivery_date'] ?? $this->calculateEstimatedDeliveryDate($validated['service_type']),
                'total_cost' => $totalCost,
                'delivery_options' => json_encode($validated['delivery_options'] ?? []),
                'customs_data' => json_encode($validated['customs_data'] ?? []),
                'created_by' => $user->id,
                'assigned_to' => null, // Staff assignment is handled internally by admins
            ]);

            DB::commit();

            return Inertia::render('Customer/Shipments/Create', [
                'success' => true,
                'shipment' => $shipment,
                'message' => 'Shipment created successfully',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create shipment: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a unique tracking number.
     */
    private function generateTrackingNumber(): string
    {
        do {
            $trackingNumber = 'RT-'.date('Y').'-'.str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (Shipment::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }

    /**
     * Calculate shipping cost based on service type, weight, value, and options.
     */
    private function calculateShippingCost(string $serviceType, float $weight, float $declaredValue, array $deliveryOptions = [], bool $isInternational = false): float
    {
        // Base rates per kg for different service types (in TZS)
        $baseRates = [
            'economy' => 2000,
            'standard' => 3000,
            'express' => 5000,
            'overnight' => 8000,
            'same_day' => 12000,
        ];

        $baseRate = $baseRates[$serviceType] ?? $baseRates['standard'];
        $baseCost = $baseRate * $weight;

        // Add insurance cost (0.5% of declared value)
        $insuranceCost = $declaredValue * 0.005;

        // Add delivery option costs
        $optionCosts = 0;
        if (! empty($deliveryOptions['signature_required'])) {
            $optionCosts += 1000;
        }
        if (! empty($deliveryOptions['weekend_delivery'])) {
            $optionCosts += 2000;
        }
        if (! empty($deliveryOptions['evening_delivery'])) {
            $optionCosts += 1500;
        }

        // International shipping surcharge
        $internationalSurcharge = 0;
        if ($isInternational) {
            $internationalSurcharge = $baseCost * 0.5; // 50% surcharge for international
        }

        return round($baseCost + $insuranceCost + $optionCosts + $internationalSurcharge, 2);
    }

    /**
     * Calculate estimated delivery date based on service type.
     */
    private function calculateEstimatedDeliveryDate(string $serviceType): string
    {
        $businessDays = match ($serviceType) {
            'same_day' => 0,
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

        if (! $customer || $shipment->customer_id !== $customer->id) {
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

        if (! $customer || $shipment->customer_id !== $customer->id) {
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
                ->header('Content-Disposition', 'attachment; filename="shipping-label-'.$shipment->tracking_number.'.pdf"');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate label: '.$e->getMessage(),
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
