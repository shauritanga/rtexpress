<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomsRegulation;
use App\Models\Shipment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

        if (! $customer) {
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
                $validated['currency'] ?? 'TZS'
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
                'message' => 'Failed to calculate duty and tax: '.$e->getMessage(),
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
                'message' => 'Failed to check compliance: '.$e->getMessage(),
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
                'message' => 'Failed to save document: '.$e->getMessage(),
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
                'message' => 'Failed to generate document: '.$e->getMessage(),
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
        // Query actual customs regulations
        $regulation = CustomsRegulation::where('country', $destinationCountry)
            ->where('is_active', true)
            ->where(function ($query) use ($hsCode) {
                $query->where('hs_code', $hsCode)
                    ->orWhere('hs_code', substr($hsCode, 0, 6))
                    ->orWhere('hs_code', substr($hsCode, 0, 4))
                    ->orWhere('hs_code', substr($hsCode, 0, 2))
                    ->orWhereNull('hs_code');
            })
            ->where('regulation_type', 'duty_rate')
            ->orderByRaw('CASE WHEN hs_code = ? THEN 1 WHEN hs_code = ? THEN 2 WHEN hs_code = ? THEN 3 WHEN hs_code = ? THEN 4 ELSE 5 END', [
                $hsCode, substr($hsCode, 0, 6), substr($hsCode, 0, 4), substr($hsCode, 0, 2),
            ])
            ->first();

        if ($regulation) {
            return [
                'rate' => $regulation->duty_rate ?? 0,
                'minimum' => $regulation->minimum_duty,
                'maximum' => $regulation->maximum_duty,
                'exemptions' => $regulation->restrictions['exemptions'] ?? [],
                'tradeAgreements' => $regulation->restrictions['trade_agreements'] ?? [],
            ];
        }

        // Fallback to default rates if no regulation found
        $defaultRates = [
            'CA' => 6.5, 'GB' => 4.0, 'AU' => 5.0, 'DE' => 4.7, 'US' => 3.5,
        ];

        return [
            'rate' => $defaultRates[$destinationCountry] ?? 5.0,
            'exemptions' => [],
            'tradeAgreements' => [],
        ];
    }

    /**
     * Get tax rates for destination country.
     */
    private function getTaxRates(string $destinationCountry): array
    {
        // Query actual tax regulations
        $regulation = CustomsRegulation::where('country', $destinationCountry)
            ->where('is_active', true)
            ->where('regulation_type', 'tax_rate')
            ->whereNotNull('tax_rate')
            ->first();

        if ($regulation) {
            return [
                'rate' => $regulation->tax_rate,
                'name' => $regulation->title,
                'threshold' => $regulation->threshold_value,
            ];
        }

        // Fallback to known tax rates
        $defaultTaxRates = [
            'CA' => ['rate' => 12.0, 'name' => 'GST + PST'],
            'GB' => ['rate' => 20.0, 'name' => 'VAT'],
            'AU' => ['rate' => 10.0, 'name' => 'GST'],
            'DE' => ['rate' => 19.0, 'name' => 'VAT'],
            'US' => ['rate' => 8.5, 'name' => 'Sales Tax'],
            'TZ' => ['rate' => 18.0, 'name' => 'VAT'],
        ];

        return $defaultTaxRates[$destinationCountry] ?? ['rate' => 0, 'name' => 'No tax'];
    }

    /**
     * Perform compliance check.
     */
    private function performComplianceCheck(string $itemDescription, string $destinationCountry, ?string $itemCategory, float $itemValue): array
    {
        $issues = [];
        $requiredDocuments = ['Commercial Invoice', 'Customs Declaration'];
        $additionalRequirements = [];

        // Check against actual customs regulations
        $regulations = CustomsRegulation::where('country', $destinationCountry)
            ->where('is_active', true)
            ->where(function ($query) use ($itemCategory) {
                $query->whereNull('product_category')
                    ->orWhere('product_category', $itemCategory);
            })
            ->get();

        foreach ($regulations as $regulation) {
            // Check for prohibited items
            if ($regulation->regulation_type === 'prohibition') {
                $prohibitedItems = $regulation->prohibited_items ?? [];
                foreach ($prohibitedItems as $prohibited) {
                    if (stripos($itemDescription, $prohibited) !== false) {
                        $issues[] = [
                            'type' => 'prohibited',
                            'severity' => 'high',
                            'message' => $regulation->title,
                            'recommendation' => $regulation->compliance_notes ?? 'Item is prohibited for import',
                        ];
                    }
                }
            }

            // Check for restrictions
            if ($regulation->regulation_type === 'restriction') {
                $restrictions = $regulation->restrictions ?? [];
                if (! empty($restrictions)) {
                    $issues[] = [
                        'type' => 'restricted',
                        'severity' => 'medium',
                        'message' => $regulation->title,
                        'recommendation' => $regulation->compliance_notes ?? 'Additional requirements apply',
                    ];
                }
            }

            // Check required documents
            if ($regulation->required_documents) {
                $requiredDocuments = array_merge($requiredDocuments, $regulation->required_documents);
            }

            // Check if permits are required
            if ($regulation->requires_permit) {
                $additionalRequirements[] = 'Permit from '.($regulation->permit_authority ?? 'relevant authority');
            }
        }

        // Check value thresholds
        if ($itemValue > 1000) {
            $requiredDocuments[] = 'Insurance Certificate';
            $additionalRequirements[] = 'High-value declaration';
        }

        // Determine status
        $status = 'compliant';
        if (count(array_filter($issues, fn ($issue) => $issue['severity'] === 'high')) > 0) {
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
        if (! $address) {
            return null;
        }

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
     * Generate document PDF using DomPDF.
     */
    private function generateDocumentPDF(string $documentType, array $documentData): string
    {
        try {
            // Create the customs directory if it doesn't exist
            Storage::makeDirectory('public/customs');

            // Generate filename
            $filename = $documentType.'_'.time().'_'.uniqid().'.pdf';
            $filePath = 'public/customs/'.$filename;

            // Generate PDF content based on document type
            $html = $this->generateDocumentHTML($documentType, $documentData);

            // Create PDF
            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'portrait');

            // Save PDF to storage
            Storage::put($filePath, $pdf->output());

            // Return public URL
            return Storage::url($filePath);

        } catch (\Exception $e) {
            \Log::error('PDF generation failed: '.$e->getMessage(), [
                'document_type' => $documentType,
                'document_data' => $documentData,
            ]);

            throw new \Exception('Failed to generate PDF document');
        }
    }

    /**
     * Generate HTML content for PDF based on document type.
     */
    private function generateDocumentHTML(string $documentType, array $documentData): string
    {
        $customer = Auth::user()->customer;
        $currentDate = now()->format('F j, Y');

        switch ($documentType) {
            case 'commercial_invoice':
                return $this->generateCommercialInvoiceHTML($documentData, $customer, $currentDate);
            case 'customs_declaration':
                return $this->generateCustomsDeclarationHTML($documentData, $customer, $currentDate);
            case 'certificate_origin':
                return $this->generateCertificateOfOriginHTML($documentData, $customer, $currentDate);
            case 'packing_list':
                return $this->generatePackingListHTML($documentData, $customer, $currentDate);
            default:
                return $this->generateGenericDocumentHTML($documentData, $customer, $currentDate, $documentType);
        }
    }

    /**
     * Generate Commercial Invoice HTML.
     */
    private function generateCommercialInvoiceHTML(array $data, $customer, string $date): string
    {
        $items = $data['items'] ?? [];
        $totalValue = array_sum(array_column($items, 'total_value'));

        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Commercial Invoice</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; }
                .header { text-align: center; margin-bottom: 20px; }
                .company-info { margin-bottom: 20px; }
                .invoice-details { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f0f0f0; }
                .total { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>COMMERCIAL INVOICE</h1>
            </div>

            <div class="company-info">
                <strong>Exporter:</strong><br>
                '.($data['exporterInfo']['name'] ?? $customer->company_name).'<br>
                '.($data['exporterInfo']['address'] ?? $customer->address).'<br>
                Phone: '.($data['exporterInfo']['phone'] ?? $customer->phone).'<br>
                Email: '.($data['exporterInfo']['email'] ?? $customer->email).'
            </div>

            <div class="company-info">
                <strong>Importer:</strong><br>
                '.($data['importerInfo']['name'] ?? '').'<br>
                '.($data['importerInfo']['address'] ?? '').'<br>
                Phone: '.($data['importerInfo']['phone'] ?? '').'<br>
                Email: '.($data['importerInfo']['email'] ?? '').'
            </div>

            <div class="invoice-details">
                <strong>Invoice Date:</strong> '.$date.'<br>
                <strong>Currency:</strong> '.($data['currency'] ?? 'USD').'<br>
                <strong>Incoterms:</strong> '.($data['incoterms'] ?? 'DDP').'<br>
                <strong>Export Reason:</strong> '.($data['exportReason'] ?? 'Sale').'
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>HS Code</th>
                        <th>Quantity</th>
                        <th>Unit Value</th>
                        <th>Total Value</th>
                        <th>Country of Origin</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($items as $item) {
            $html .= '
                    <tr>
                        <td>'.($item['description'] ?? '').'</td>
                        <td>'.($item['hsCode'] ?? '').'</td>
                        <td>'.($item['quantity'] ?? 0).'</td>
                        <td>'.number_format($item['unitValue'] ?? 0, 2).'</td>
                        <td>'.number_format($item['totalValue'] ?? 0, 2).'</td>
                        <td>'.($item['countryOfOrigin'] ?? '').'</td>
                    </tr>';
        }

        $html .= '
                </tbody>
                <tfoot>
                    <tr class="total">
                        <td colspan="4">TOTAL</td>
                        <td>'.number_format($totalValue, 2).'</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>

            <p><strong>Declaration:</strong> I hereby certify that the information on this invoice is true and correct and that the contents and value of this shipment is as stated above.</p>

            <div style="margin-top: 40px;">
                <p>_________________________<br>
                Signature of Exporter</p>
            </div>
        </body>
        </html>';

        return $html;
    }

    /**
     * Generate Customs Declaration HTML.
     */
    private function generateCustomsDeclarationHTML(array $data, $customer, string $date): string
    {
        return $this->generateGenericDocumentHTML($data, $customer, $date, 'customs_declaration');
    }

    /**
     * Generate Certificate of Origin HTML.
     */
    private function generateCertificateOfOriginHTML(array $data, $customer, string $date): string
    {
        return $this->generateGenericDocumentHTML($data, $customer, $date, 'certificate_of_origin');
    }

    /**
     * Generate Packing List HTML.
     */
    private function generatePackingListHTML(array $data, $customer, string $date): string
    {
        return $this->generateGenericDocumentHTML($data, $customer, $date, 'packing_list');
    }

    /**
     * Generate generic document HTML for other document types.
     */
    private function generateGenericDocumentHTML(array $data, $customer, string $date, string $documentType): string
    {
        $title = ucwords(str_replace('_', ' ', $documentType));

        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>'.$title.'</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; }
                .header { text-align: center; margin-bottom: 20px; }
                .content { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>'.strtoupper($title).'</h1>
                <p>Date: '.$date.'</p>
            </div>

            <div class="content">
                <p>This is a '.$title.' document generated for '.$customer->company_name.'.</p>
                <p>Document data has been processed and is available for customs clearance.</p>
            </div>
        </body>
        </html>';
    }
}
