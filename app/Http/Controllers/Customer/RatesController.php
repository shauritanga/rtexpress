<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RatesController extends Controller
{
    /**
     * Display the rates and discounts page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return redirect()->route('customer.dashboard')
                ->with('error', 'Customer account required');
        }

        // Calculate customer statistics
        $totalSpend = $this->calculateTotalSpend($customer);
        $totalShipments = $this->getTotalShipments($customer);
        $savingsThisMonth = $this->calculateSavingsThisMonth($customer);
        $averageDiscount = $this->calculateAverageDiscount($customer);
        $loyaltyTier = $this->determineLoyaltyTier($totalSpend);

        // Get recent rate quotes (mock data for now)
        $recentRates = $this->getRecentRates($customer);

        return Inertia::render('Customer/Rates/Index', [
            'customer' => array_merge($customer->toArray(), [
                'total_spend' => $totalSpend,
                'total_shipments' => $totalShipments,
                'loyalty_tier' => $loyaltyTier,
            ]),
            'recentRates' => $recentRates,
            'savingsThisMonth' => $savingsThisMonth,
            'averageDiscount' => $averageDiscount,
        ]);
    }

    /**
     * Calculate shipping rates for given parameters.
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'origin' => 'required|array',
            'origin.zipCode' => 'required|string',
            'origin.country' => 'required|string',
            'origin.residential' => 'boolean',
            'destination' => 'required|array',
            'destination.zipCode' => 'required|string',
            'destination.country' => 'required|string',
            'destination.residential' => 'boolean',
            'packageDetails' => 'required|array',
            'packageDetails.weight' => 'required|numeric|min:0.1',
            'packageDetails.length' => 'required|numeric|min:1',
            'packageDetails.width' => 'required|numeric|min:1',
            'packageDetails.height' => 'required|numeric|min:1',
            'packageDetails.declaredValue' => 'required|numeric|min:1',
            'packageDetails.packageType' => 'required|string',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            // Calculate base rates
            $baseRates = $this->calculateBaseRates($validated);

            // Apply customer discounts
            $discountedRates = $this->applyCustomerDiscounts($baseRates, $customer);

            // Add service features and details
            $enrichedRates = $this->enrichRateDetails($discountedRates, $validated);

            return response()->json([
                'success' => true,
                'rates' => $enrichedRates,
                'calculation_id' => uniqid(),
                'valid_until' => now()->addHours(24)->toISOString(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate rates: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Apply a discount code.
     */
    public function applyDiscount(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20',
            'shipment_data' => 'array',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            $discount = $this->validateDiscountCode($validated['code'], $customer);

            if (!$discount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired discount code',
                ], 400);
            }

            return response()->json([
                'success' => true,
                'discount' => $discount,
                'message' => 'Discount applied successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply discount: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get optimization suggestions.
     */
    public function getOptimizations(Request $request)
    {
        $validated = $request->validate([
            'shipment_data' => 'required|array',
        ]);

        try {
            $user = Auth::user();
            $customer = $user->customer;

            $suggestions = $this->generateOptimizationSuggestions($validated['shipment_data'], $customer);

            return response()->json([
                'success' => true,
                'suggestions' => $suggestions,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate optimizations: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate total customer spend.
     */
    private function calculateTotalSpend(Customer $customer): float
    {
        // In a real implementation, this would sum actual shipment costs
        return Shipment::where('customer_id', $customer->id)
            ->sum('total_cost') ?: 2450.00;
    }

    /**
     * Get total shipments count.
     */
    private function getTotalShipments(Customer $customer): int
    {
        return Shipment::where('customer_id', $customer->id)->count() ?: 48;
    }

    /**
     * Calculate savings this month.
     */
    private function calculateSavingsThisMonth(Customer $customer): float
    {
        // Mock calculation - in real app, would calculate actual savings
        return 245.67;
    }

    /**
     * Calculate average discount percentage.
     */
    private function calculateAverageDiscount(Customer $customer): float
    {
        // Mock calculation - in real app, would calculate from actual discounts applied
        return 12.5;
    }

    /**
     * Determine loyalty tier based on spend.
     */
    private function determineLoyaltyTier(float $totalSpend): string
    {
        if ($totalSpend >= 5000) return 'platinum';
        if ($totalSpend >= 2500) return 'gold';
        if ($totalSpend >= 1000) return 'silver';
        return 'bronze';
    }

    /**
     * Get recent rate quotes.
     */
    private function getRecentRates(Customer $customer): array
    {
        // Mock data - in real app, would fetch from database
        return [
            [
                'id' => 'recent-1',
                'service' => 'RT Standard',
                'price' => 18.99,
                'discount' => 10.0,
                'transitTime' => '3-5 business days',
                'icon' => 'Package',
            ],
            [
                'id' => 'recent-2',
                'service' => 'RT Express',
                'price' => 29.99,
                'discount' => 15.0,
                'transitTime' => '1-2 business days',
                'icon' => 'Zap',
            ],
        ];
    }

    /**
     * Calculate base shipping rates.
     */
    private function calculateBaseRates(array $shipmentData): array
    {
        $weight = $shipmentData['packageDetails']['weight'];
        $isInternational = $shipmentData['origin']['country'] !== $shipmentData['destination']['country'];
        $isResidential = $shipmentData['destination']['residential'] ?? false;

        $baseRates = [
            [
                'id' => 'economy',
                'service' => 'RT Economy',
                'serviceType' => 'economy',
                'basePrice' => 8.99 + ($weight * 1.5),
                'transitDays' => 7,
            ],
            [
                'id' => 'standard',
                'service' => 'RT Standard',
                'serviceType' => 'standard',
                'basePrice' => 12.99 + ($weight * 2.0),
                'transitDays' => 4,
            ],
            [
                'id' => 'express',
                'service' => 'RT Express',
                'serviceType' => 'express',
                'basePrice' => 19.99 + ($weight * 3.0),
                'transitDays' => 2,
            ],
            [
                'id' => 'overnight',
                'service' => 'RT Overnight',
                'serviceType' => 'overnight',
                'basePrice' => 39.99 + ($weight * 4.0),
                'transitDays' => 1,
            ],
        ];

        // Apply surcharges
        foreach ($baseRates as &$rate) {
            if ($isResidential) {
                $rate['basePrice'] += 3.50; // Residential surcharge
            }
            if ($isInternational) {
                $rate['basePrice'] *= 2.5; // International multiplier
                $rate['transitDays'] += 5;
            }
        }

        return $baseRates;
    }

    /**
     * Apply customer-specific discounts.
     */
    private function applyCustomerDiscounts(array $rates, ?Customer $customer): array
    {
        if (!$customer) return $rates;

        $totalSpend = $this->calculateTotalSpend($customer);
        $loyaltyDiscount = $this->getLoyaltyDiscount($totalSpend);
        $volumeDiscount = $this->getVolumeDiscount($customer);

        foreach ($rates as &$rate) {
            $rate['originalPrice'] = $rate['basePrice'];
            $rate['discounts'] = [];

            // Apply loyalty discount
            if ($loyaltyDiscount > 0) {
                $rate['discounts'][] = [
                    'type' => 'loyalty',
                    'percent' => $loyaltyDiscount,
                    'amount' => $rate['basePrice'] * ($loyaltyDiscount / 100),
                ];
            }

            // Apply volume discount
            if ($volumeDiscount > 0) {
                $rate['discounts'][] = [
                    'type' => 'volume',
                    'percent' => $volumeDiscount,
                    'amount' => $rate['basePrice'] * ($volumeDiscount / 100),
                ];
            }

            // Calculate final price
            $totalDiscount = array_sum(array_column($rate['discounts'], 'amount'));
            $rate['price'] = max(0, $rate['basePrice'] - $totalDiscount);
            $rate['totalDiscountPercent'] = $rate['basePrice'] > 0 ? ($totalDiscount / $rate['basePrice']) * 100 : 0;
        }

        return $rates;
    }

    /**
     * Get loyalty discount percentage.
     */
    private function getLoyaltyDiscount(float $totalSpend): float
    {
        if ($totalSpend >= 5000) return 15.0; // Platinum
        if ($totalSpend >= 2500) return 10.0; // Gold
        if ($totalSpend >= 1000) return 5.0;  // Silver
        return 0.0; // Bronze
    }

    /**
     * Get volume discount percentage.
     */
    private function getVolumeDiscount(Customer $customer): float
    {
        $monthlyShipments = Shipment::where('customer_id', $customer->id)
            ->whereMonth('created_at', now()->month)
            ->count();

        if ($monthlyShipments >= 50) return 15.0;
        if ($monthlyShipments >= 25) return 10.0;
        if ($monthlyShipments >= 10) return 5.0;
        return 0.0;
    }

    /**
     * Enrich rates with additional details.
     */
    private function enrichRateDetails(array $rates, array $shipmentData): array
    {
        foreach ($rates as &$rate) {
            $rate['deliveryDate'] = now()->addDays($rate['transitDays'])->format('Y-m-d');
            $rate['transitTime'] = $this->formatTransitTime($rate['transitDays']);
            $rate['features'] = $this->getServiceFeatures($rate['serviceType']);
            $rate['icon'] = $this->getServiceIcon($rate['serviceType']);

            // Add badges
            $rate['popular'] = $rate['serviceType'] === 'standard';
            $rate['eco'] = $rate['serviceType'] === 'economy';
            $rate['guaranteed'] = in_array($rate['serviceType'], ['express', 'overnight']);
        }

        return $rates;
    }

    /**
     * Format transit time display.
     */
    private function formatTransitTime(int $days): string
    {
        if ($days === 1) return 'Next business day';
        if ($days <= 2) return '1-2 business days';
        if ($days <= 5) return '3-5 business days';
        if ($days <= 7) return '5-7 business days';
        return '7-14 business days';
    }

    /**
     * Get service features.
     */
    private function getServiceFeatures(string $serviceType): array
    {
        $features = [
            'economy' => ['Ground delivery', 'Tracking included', 'Signature on delivery'],
            'standard' => ['Ground delivery', 'Tracking included', 'Insurance up to $100'],
            'express' => ['Air delivery', 'Priority handling', 'Insurance up to $500'],
            'overnight' => ['Next day delivery', 'Morning delivery', 'Insurance up to $1000'],
        ];

        return $features[$serviceType] ?? ['Standard features'];
    }

    /**
     * Get service icon.
     */
    private function getServiceIcon(string $serviceType): string
    {
        $icons = [
            'economy' => 'Truck',
            'standard' => 'Package',
            'express' => 'Zap',
            'overnight' => 'Plane',
        ];

        return $icons[$serviceType] ?? 'Package';
    }

    /**
     * Validate discount code.
     */
    private function validateDiscountCode(string $code, ?Customer $customer): ?array
    {
        // Mock discount codes - in real app, would check database
        $validCodes = [
            'NEWYEAR20' => [
                'id' => 'new-year-2024',
                'type' => 'seasonal',
                'title' => 'New Year Special',
                'discountPercent' => 20,
                'validUntil' => '2024-01-31',
                'minSpend' => 25,
            ],
            'WELCOME10' => [
                'id' => 'welcome',
                'type' => 'promotional',
                'title' => 'Welcome Discount',
                'discountPercent' => 10,
                'validUntil' => null,
                'minSpend' => 15,
            ],
        ];

        return $validCodes[$code] ?? null;
    }

    /**
     * Generate optimization suggestions.
     */
    private function generateOptimizationSuggestions(array $shipmentData, ?Customer $customer): array
    {
        // Mock suggestions - in real app, would analyze shipment data
        return [
            [
                'id' => 'service-downgrade',
                'type' => 'service',
                'title' => 'Switch to Standard Service',
                'description' => 'Save 37% by choosing Standard instead of Express',
                'savings' => 11.00,
                'effort' => 'low',
                'impact' => 'high',
            ],
            [
                'id' => 'packaging-optimization',
                'type' => 'packaging',
                'title' => 'Optimize Package Size',
                'description' => 'Reduce dimensional weight charges with smaller packaging',
                'savings' => 3.50,
                'effort' => 'medium',
                'impact' => 'medium',
            ],
        ];
    }
}
