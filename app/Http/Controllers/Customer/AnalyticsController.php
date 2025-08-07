<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Show the customer analytics dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Generate simple stats and chart data
        $stats = $this->getSimpleStats($customer);
        $chartData = $this->getChartData($customer);

        return Inertia::render('Customer/Analytics/Index', [
            'customer' => $customer,
            'stats' => $stats,
            'chartData' => $chartData,
        ]);
    }

    /**
     * Get simple, essential stats for clean analytics.
     */
    private function getSimpleStats($customer): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();

        // Basic counts
        $totalShipments = $customer->shipments()->count();
        $thisMonthShipments = $customer->shipments()
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        // Basic costs (in TZS)
        $totalSpent = $customer->shipments()->sum('total_cost') ?? 0;
        $thisMonthSpent = $customer->shipments()
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total_cost') ?? 0;

        // Delivery performance
        $deliveredShipments = $customer->shipments()
            ->where('status', 'delivered')
            ->get();

        $onTimeCount = $deliveredShipments->filter(function ($shipment) {
            return $shipment->actual_delivery_date && $shipment->estimated_delivery_date &&
                   $shipment->actual_delivery_date <= $shipment->estimated_delivery_date;
        })->count();

        $onTimeRate = $deliveredShipments->count() > 0
            ? ($onTimeCount / $deliveredShipments->count()) * 100
            : 95; // Default to 95% if no delivery data yet

        // Average delivery time
        $deliveryTimes = $deliveredShipments->filter(function ($shipment) {
            return $shipment->actual_delivery_date && $shipment->created_at;
        })->map(function ($shipment) {
            return $shipment->created_at->diffInDays($shipment->actual_delivery_date);
        });

        $avgDeliveryDays = $deliveryTimes->count() > 0 ? $deliveryTimes->avg() : 3; // Default to 3 days if no data

        // Current status counts
        $pendingShipments = $customer->shipments()
            ->whereIn('status', ['pending', 'picked_up', 'in_transit', 'out_for_delivery'])
            ->count();

        $deliveredThisMonth = $customer->shipments()
            ->where('status', 'delivered')
            ->where('actual_delivery_date', '>=', $startOfMonth)
            ->count();

        return [
            'total_shipments' => $totalShipments,
            'this_month_shipments' => $thisMonthShipments,
            'total_spent' => $totalSpent,
            'this_month_spent' => $thisMonthSpent,
            'on_time_rate' => round($onTimeRate, 1),
            'average_delivery_days' => round($avgDeliveryDays, 1),
            'pending_shipments' => $pendingShipments,
            'delivered_shipments' => $deliveredThisMonth,
        ];
    }

    /**
     * Get chart data for visualizations.
     */
    private function getChartData($customer): array
    {
        // Monthly shipments for the last 6 months
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $shipments = $customer->shipments()
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            $cost = $customer->shipments()
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('total_cost') ?? 0;

            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'shipments' => $shipments,
                'cost' => $cost,
            ];
        }

        // Status breakdown
        $statusData = [
            [
                'name' => 'Delivered',
                'value' => $customer->shipments()->where('status', 'delivered')->count(),
                'color' => '#10b981',
            ],
            [
                'name' => 'In Transit',
                'value' => $customer->shipments()->where('status', 'in_transit')->count(),
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Pending',
                'value' => $customer->shipments()->where('status', 'pending')->count(),
                'color' => '#f59e0b',
            ],
            [
                'name' => 'Out for Delivery',
                'value' => $customer->shipments()->where('status', 'out_for_delivery')->count(),
                'color' => '#8b5cf6',
            ],
        ];

        // Service type breakdown
        $serviceData = [
            [
                'name' => 'Standard',
                'value' => $customer->shipments()->where('service_type', 'standard')->count(),
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Express',
                'value' => $customer->shipments()->where('service_type', 'express')->count(),
                'color' => '#10b981',
            ],
            [
                'name' => 'Overnight',
                'value' => $customer->shipments()->where('service_type', 'overnight')->count(),
                'color' => '#f59e0b',
            ],
            [
                'name' => 'International',
                'value' => $customer->shipments()->where('service_type', 'international')->count(),
                'color' => '#ef4444',
            ],
        ];

        // Add sample data if no real data exists
        $filteredStatusData = array_values(array_filter($statusData, fn($item) => $item['value'] > 0));
        $filteredServiceData = array_values(array_filter($serviceData, fn($item) => $item['value'] > 0));

        // If no data, provide sample data for better visualization
        if (empty($filteredStatusData)) {
            $filteredStatusData = [
                ['name' => 'No Data Yet', 'value' => 1, 'color' => '#e5e7eb'],
            ];
        }

        if (empty($filteredServiceData)) {
            $filteredServiceData = [
                ['name' => 'Standard', 'value' => 1, 'color' => '#3b82f6'],
            ];
        }

        return [
            'monthly_shipments' => $monthlyData,
            'status_breakdown' => $filteredStatusData,
            'service_breakdown' => $filteredServiceData,
        ];
    }

    /**
     * Generate volume data for the last 12 months.
     */
    private function generateVolumeData($customer)
    {
        $data = [];
        $currentDate = Carbon::now();

        for ($i = 11; $i >= 0; $i--) {
            $monthStart = $currentDate->copy()->subMonths($i)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();

            $shipments = $customer->shipments()
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->get();

            $totalShipments = $shipments->count();
            $previousMonthShipments = $i < 11 ? ($data[$i > 0 ? count($data) - 1 : 0]['shipments'] ?? 0) : $totalShipments;
            $growthRate = $previousMonthShipments > 0 ? (($totalShipments - $previousMonthShipments) / $previousMonthShipments) * 100 : 0;

            // Service breakdown
            $serviceBreakdown = [
                'express' => $shipments->where('service_type', 'express')->count(),
                'standard' => $shipments->where('service_type', 'standard')->count(),
                'overnight' => $shipments->where('service_type', 'overnight')->count(),
                'international' => $shipments->where('service_type', 'international')->count(),
            ];

            $data[] = [
                'period' => $monthStart->format('M Y'),
                'shipments' => $totalShipments,
                'growth_rate' => round($growthRate, 1),
                'service_breakdown' => $serviceBreakdown,
            ];
        }

        return $data;
    }

    /**
     * Generate cost data for the last 12 months.
     */
    private function generateCostData($customer)
    {
        $data = [];
        $currentDate = Carbon::now();

        for ($i = 11; $i >= 0; $i--) {
            $monthStart = $currentDate->copy()->subMonths($i)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();

            $shipments = $customer->shipments()
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->get();

            // Values are already in TZS in the database
            $totalCost = $shipments->sum('total_cost') ?: 0;
            $shipmentsCount = $shipments->count();
            $costPerShipment = $shipmentsCount > 0 ? $totalCost / $shipmentsCount : 0;

            // Calculate meaningful savings based on volume discounts or service upgrades
            $totalDeclaredValue = $shipments->sum('declared_value') ?: 0;
            $averageValuePerShipment = $shipmentsCount > 0 ? $totalDeclaredValue / $shipmentsCount : 0;

            // Calculate potential savings from volume discounts (example: 5% for customers with 10+ shipments)
            $volumeDiscount = $shipmentsCount >= 10 ? $totalCost * 0.05 : 0;
            $savings = $volumeDiscount;

            // Service costs breakdown - values already in TZS
            $serviceCosts = [
                'express' => $shipments->where('service_type', 'express')->sum('total_cost'),
                'standard' => $shipments->where('service_type', 'standard')->sum('total_cost'),
                'overnight' => $shipments->where('service_type', 'overnight')->sum('total_cost'),
                'international' => $shipments->where('service_type', 'international')->sum('total_cost'),
            ];

            // Cost breakdown
            $costBreakdown = [
                'shipping' => $totalCost * 0.70,
                'fuel_surcharge' => $totalCost * 0.15,
                'insurance' => $totalCost * 0.08,
                'customs' => $totalCost * 0.05,
                'other' => $totalCost * 0.02,
            ];

            $data[] = [
                'period' => $monthStart->format('M Y'),
                'total_cost' => round($totalCost, 2),
                'cost_per_shipment' => round($costPerShipment, 2),
                'savings_from_discounts' => round($savings, 2),
                'service_costs' => $serviceCosts,
                'cost_breakdown' => $costBreakdown,
            ];
        }

        return $data;
    }

    /**
     * Get delivery performance metrics.
     */
    private function getDeliveryPerformanceMetrics($customer)
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $currentMonthDeliveries = $customer->shipments()
            ->where('status', 'delivered')
            ->where('created_at', '>=', $currentMonth)
            ->get();

        $lastMonthDeliveries = $customer->shipments()
            ->where('status', 'delivered')
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $currentMonth)
            ->get();

        $totalDeliveries = $currentMonthDeliveries->count();

        // Calculate real on-time delivery metrics
        $onTimeDeliveries = 0;
        $earlyDeliveries = 0;
        $lateDeliveries = 0;
        $totalTransitTime = 0;
        $deliveriesWithTransitTime = 0;

        foreach ($currentMonthDeliveries as $shipment) {
            if ($shipment->estimated_delivery_date && $shipment->actual_delivery_date) {
                $estimatedDate = Carbon::parse($shipment->estimated_delivery_date);
                $actualDate = Carbon::parse($shipment->actual_delivery_date);

                if ($actualDate->lte($estimatedDate)) {
                    if ($actualDate->lt($estimatedDate)) {
                        $earlyDeliveries++;
                    } else {
                        $onTimeDeliveries++;
                    }
                } else {
                    $lateDeliveries++;
                }

                // Calculate transit time
                $transitTime = $shipment->created_at->diffInHours($actualDate);
                $totalTransitTime += $transitTime;
                $deliveriesWithTransitTime++;
            }
        }

        // Calculate same for last month
        $lastMonthTotalTransitTime = 0;
        $lastMonthDeliveriesWithTransitTime = 0;

        foreach ($lastMonthDeliveries as $shipment) {
            if ($shipment->actual_delivery_date) {
                $actualDate = Carbon::parse($shipment->actual_delivery_date);
                $transitTime = $shipment->created_at->diffInHours($actualDate);
                $lastMonthTotalTransitTime += $transitTime;
                $lastMonthDeliveriesWithTransitTime++;
            }
        }

        $onTimeRate = $totalDeliveries > 0 ? (($onTimeDeliveries + $earlyDeliveries) / $totalDeliveries) * 100 : 0;
        $avgDeliveryTime = $deliveriesWithTransitTime > 0 ? $totalTransitTime / $deliveriesWithTransitTime : 0;
        $lastMonthAvgTime = $lastMonthDeliveriesWithTransitTime > 0 ? $lastMonthTotalTransitTime / $lastMonthDeliveriesWithTransitTime : 0;

        $trend = $avgDeliveryTime < $lastMonthAvgTime ? 'up' : ($avgDeliveryTime > $lastMonthAvgTime ? 'down' : 'stable');

        // Calculate customer satisfaction based on performance
        $satisfactionScore = 3.0; // Base score
        $satisfactionScore += ($onTimeRate / 100) * 2; // Up to 2 points for on-time delivery
        $satisfactionScore = max(1.0, min(5.0, $satisfactionScore)); // Ensure between 1-5

        return [
            'on_time_delivery_rate' => round($onTimeRate, 1),
            'average_delivery_time' => round($avgDeliveryTime, 1),
            'total_deliveries_this_month' => $totalDeliveries,
            'total_deliveries_last_month' => $lastMonthDeliveries->count(),
            'early_deliveries' => $earlyDeliveries,
            'on_time_deliveries' => $onTimeDeliveries,
            'late_deliveries' => max(0, $lateDeliveries),
            'average_delivery_time_last_month' => round($lastMonthAvgTime, 1),
            'performance_trend' => $trend,
            'customer_satisfaction_score' => round($satisfactionScore, 1),
        ];
    }

    /**
     * Calculate average growth rate.
     */
    private function calculateAverageGrowth($volumeData)
    {
        if (count($volumeData) < 2) return 0;

        $growthRates = array_column($volumeData, 'growth_rate');
        $validGrowthRates = array_filter($growthRates, function($rate) {
            return $rate !== 0;
        });

        return count($validGrowthRates) > 0 ? array_sum($validGrowthRates) / count($validGrowthRates) : 0;
    }
}
