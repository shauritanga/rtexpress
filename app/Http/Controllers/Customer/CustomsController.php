<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomsController extends Controller
{
    /**
     * Display the customs management page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return redirect()->route('customer.dashboard')
                ->with('error', 'Customer account required');
        }

        // Get customs statistics
        $customsStats = $this->getCustomsStats($customer);

        // Get current shipment if specified
        $currentShipment = null;
        $destinationCountry = $request->get('country', 'CA');

        if ($request->has('shipment_id')) {
            $currentShipment = Shipment::where('customer_id', $customer->id)
                ->where('id', $request->shipment_id)
                ->first();

            if ($currentShipment) {
                // Extract country from destination address or use default
                $destinationCountry = $this->extractCountryFromAddress($currentShipment->destination_address) ?? $destinationCountry;
            }
        }

        return Inertia::render('Customer/Customs/Index', [
            'customer' => $customer->toArray(),
            'customsStats' => $customsStats,
            'currentShipment' => $currentShipment,
            'destinationCountry' => $destinationCountry,
        ]);
    }

    /**
     * Calculate duty and tax for an item.
     */
    public function calculateDutyTax(Request $request)
    {
        $validated = $request->validate([
            'item_value' => 'required|numeric|min:0',
            'hs_code' => 'required|string|max:10',
            'destination_country' => 'required|string|size:2',
            'origin_country' => 'string|size:2',
            'currency' => 'string|size:3',
            'item_description' => 'string|max:255',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            $calculation = $this->performDutyTaxCalculation(
                $validated['item_value'],
                $validated['hs_code'],
                $validated['destination_country'],
                $validated['origin_country'] ?? 'US',
                $validated['currency'] ?? 'USD'
            );

            // Log calculation for statistics
            $this->logCalculation($customer, $validated, $calculation);

            return response()->json([
                'success' => true,
                'calculation' => $calculation,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate duty and tax: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check compliance for an item.
     */
    public function checkCompliance(Request $request)
    {
        $validated = $request->validate([
            'item_description' => 'required|string|max:255',
            'item_category' => 'string|max:100',
            'item_value' => 'numeric|min:0',
            'destination_country' => 'required|string|size:2',
            'origin_country' => 'string|size:2',
        ]);

        try {
            $complianceResult = $this->performComplianceCheck(
                $validated['item_description'],
                $validated['destination_country'],
                $validated['item_category'] ?? null,
                $validated['item_value'] ?? 0
            );

            return response()->json([
                'success' => true,
                'compliance' => $complianceResult,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check compliance: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save customs document.
     */
    public function saveDocument(Request $request)
    {
        $validated = $request->validate([
            'shipment_id' => 'required|exists:shipments,id',
            'document_type' => 'required|string|in:commercial_invoice,customs_declaration,certificate_origin,packing_list',
            'document_data' => 'required|array',
            'items' => 'required|array',
            'items.*.description' => 'required|string',
            'items.*.hs_code' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_value' => 'required|numeric|min:0',
            'items.*.total_value' => 'required|numeric|min:0',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            $shipment = Shipment::where('customer_id', $customer->id)
                ->where('id', $validated['shipment_id'])
                ->firstOrFail();

            // Save customs document data to shipment
            $customsData = [
                'document_type' => $validated['document_type'],
                'document_data' => $validated['document_data'],
                'items' => $validated['items'],
                'total_value' => array_sum(array_column($validated['items'], 'total_value')),
                'created_at' => now()->toISOString(),
            ];

            $existingCustomsData = $shipment->customs_data ? json_decode($shipment->customs_data, true) : [];
            $existingCustomsData[] = $customsData;

            $shipment->update([
                'customs_data' => json_encode($existingCustomsData),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Customs document saved successfully',
                'document_id' => count($existingCustomsData),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save document: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate customs document PDF.
     */
    public function generateDocument(Request $request)
    {
        $validated = $request->validate([
            'document_type' => 'required|string|in:commercial_invoice,customs_declaration,certificate_origin,packing_list',
            'document_data' => 'required|array',
        ]);

        try {
            // In a real implementation, this would generate a PDF using a library like TCPDF or DomPDF
            $documentUrl = $this->generateDocumentPDF($validated['document_type'], $validated['document_data']);

            return response()->json([
                'success' => true,
                'document_url' => $documentUrl,
                'message' => 'Document generated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate document: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customs statistics for customer.
     */
    private function getCustomsStats(Customer $customer): array
    {
        // In a real implementation, these would be calculated from actual data
        $internationalShipments = Shipment::where('customer_id', $customer->id)
            ->where('service_type', 'international')
            ->count();

        return [
            'totalDocuments' => $internationalShipments * 2, // Assume 2 docs per shipment
            'pendingDocuments' => rand(0, 5),
            'complianceRate' => 96.8,
            'averageDutyRate' => 8.5,
            'recentCalculations' => rand(5, 20),
            'commonDestinations' => ['CA', 'GB', 'AU', 'DE'],
        ];
    }

    /**
     * Perform duty and tax calculation.
     */
    private function performDutyTaxCalculation(float $itemValue, string $hsCode, string $destinationCountry, string $originCountry, string $currency): array
    {
        // Mock calculation - in real app, would use actual duty/tax APIs
        $dutyRates = $this->getDutyRates($hsCode, $destinationCountry, $originCountry);
        $taxRates = $this->getTaxRates($destinationCountry);

        $dutyAmount = $itemValue * ($dutyRates['rate'] / 100);
        $taxableValue = $itemValue + $dutyAmount;
        $taxAmount = $taxableValue * ($taxRates['rate'] / 100);

        return [
            'itemValue' => $itemValue,
            'dutyAmount' => $dutyAmount,
            'taxAmount' => $taxAmount,
            'totalCharges' => $dutyAmount + $taxAmount,
            'totalCost' => $itemValue + $dutyAmount + $taxAmount,
            'breakdown' => [
                'customsValue' => $itemValue,
                'dutyRate' => $dutyRates['rate'],
                'taxRate' => $taxRates['rate'],
                'exemptions' => $dutyRates['exemptions'] ?? [],
                'tradeAgreements' => $dutyRates['tradeAgreements'] ?? [],
            ],
        ];
    }

    /**
     * Get duty rates for HS code and country combination.
     */
    private function getDutyRates(string $hsCode, string $destinationCountry, string $originCountry): array
    {
        // Mock duty rates - in real app, would query duty rate database/API
        $rates = [
            'CA' => [
                '6109' => ['rate' => 18.0, 'tradeAgreements' => ['USMCA']],
                '6203' => ['rate' => 16.1, 'tradeAgreements' => ['USMCA']],
                '8517' => ['rate' => 0, 'exemptions' => ['Electronics exemption']],
                'default' => ['rate' => 6.5],
            ],
            'GB' => [
                'default' => ['rate' => 4.0],
            ],
            'AU' => [
                'default' => ['rate' => 5.0],
            ],
        ];

        $countryRates = $rates[$destinationCountry] ?? $rates['CA'];
        $hsPrefix = substr($hsCode, 0, 4);

        return $countryRates[$hsPrefix] ?? $countryRates['default'];
    }

    /**
     * Get tax rates for destination country.
     */
    private function getTaxRates(string $destinationCountry): array
    {
        $taxRates = [
            'CA' => ['rate' => 12.0, 'name' => 'GST + PST'],
            'GB' => ['rate' => 20.0, 'name' => 'VAT'],
            'AU' => ['rate' => 10.0, 'name' => 'GST'],
            'DE' => ['rate' => 19.0, 'name' => 'VAT'],
        ];

        return $taxRates[$destinationCountry] ?? ['rate' => 0, 'name' => 'No tax'];
    }

    /**
     * Perform compliance check.
     */
    private function performComplianceCheck(string $itemDescription, string $destinationCountry, ?string $itemCategory, float $itemValue): array
    {
        $issues = [];
        $requiredDocuments = ['Commercial Invoice', 'Customs Declaration'];
        $additionalRequirements = [];

        // Check for restricted items (mock logic)
        $restrictedKeywords = ['weapon', 'firearm', 'drug', 'medicine', 'battery', 'food'];

        foreach ($restrictedKeywords as $keyword) {
            if (stripos($itemDescription, $keyword) !== false) {
                if (in_array($keyword, ['weapon', 'firearm'])) {
                    $issues[] = [
                        'type' => 'prohibited',
                        'severity' => 'high',
                        'message' => 'Weapons and firearms are prohibited',
                        'recommendation' => 'Consider alternative products or contact customs',
                    ];
                } else {
                    $issues[] = [
                        'type' => 'restricted',
                        'severity' => 'medium',
                        'message' => ucfirst($keyword) . ' items require special handling',
                        'recommendation' => 'Additional permits and documentation required',
                    ];
                    $additionalRequirements[] = 'Import permit for ' . $keyword . ' items';
                }
            }
        }

        // Check value thresholds
        if ($itemValue > 1000) {
            $requiredDocuments[] = 'Insurance Certificate';
            $additionalRequirements[] = 'High-value declaration';
        }

        // Determine status
        $status = 'compliant';
        if (count(array_filter($issues, fn($issue) => $issue['severity'] === 'high')) > 0) {
            $status = 'violation';
        } elseif (count($issues) > 0) {
            $status = 'warning';
        }

        return [
            'status' => $status,
            'issues' => $issues,
            'requiredDocuments' => array_unique($requiredDocuments),
            'additionalRequirements' => array_unique($additionalRequirements),
        ];
    }

    /**
     * Log calculation for statistics.
     */
    private function logCalculation(Customer $customer, array $data, array $calculation): void
    {
        // In a real app, would log to database for analytics
        \Log::info('Duty/Tax calculation performed', [
            'customer_id' => $customer->id,
            'destination_country' => $data['destination_country'],
            'hs_code' => $data['hs_code'],
            'item_value' => $data['item_value'],
            'total_cost' => $calculation['totalCost'],
        ]);
    }

    /**
     * Extract country code from address.
     */
    private function extractCountryFromAddress(?string $address): ?string
    {
        if (!$address) return null;

        // Simple country extraction - in real app, would use proper address parsing
        $countryCodes = [
            'Canada' => 'CA',
            'United Kingdom' => 'GB',
            'Australia' => 'AU',
            'Germany' => 'DE',
            'France' => 'FR',
        ];

        foreach ($countryCodes as $country => $code) {
            if (stripos($address, $country) !== false) {
                return $code;
            }
        }

        return null;
    }

    /**
     * Generate document PDF (mock implementation).
     */
    private function generateDocumentPDF(string $documentType, array $documentData): string
    {
        // Mock PDF generation - in real app, would use PDF library
        $filename = $documentType . '_' . time() . '.pdf';
        return '/storage/customs/' . $filename;
    }
}
