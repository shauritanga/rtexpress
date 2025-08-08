<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Display the main analytics dashboard.
     */
    public function index(Request $request)
    {
        $period = $request->get('period', '30'); // Default to 30 days
        $startDate = now()->subDays((int) $period);

        $data = [
            'overview' => $this->getOverviewStats($startDate),
            'shipmentTrends' => $this->getShipmentTrends($startDate),
            'performanceMetrics' => $this->getPerformanceMetrics($startDate),
            'topCustomers' => $this->getTopCustomers($startDate),
            'warehousePerformance' => $this->getWarehousePerformance($startDate),
            'serviceTypeDistribution' => $this->getServiceTypeDistribution($startDate),
            'statusDistribution' => $this->getStatusDistribution($startDate),
            'revenueAnalytics' => $this->getRevenueAnalytics($startDate),
        ];

        return Inertia::render('Admin/Analytics/Index', [
            'analytics' => $data,
            'period' => $period,
        ]);
    }

    /**
     * Get overview statistics.
     */
    private function getOverviewStats(Carbon $startDate): array
    {
        $totalShipments = Shipment::where('created_at', '>=', $startDate)->count();
        $previousPeriodShipments = Shipment::whereBetween('created_at', [
            $startDate->copy()->subDays($startDate->diffInDays(now())),
            $startDate,
        ])->count();

        $deliveredShipments = Shipment::where('created_at', '>=', $startDate)
            ->where('status', 'delivered')
            ->count();

        $overdueShipments = Shipment::where('created_at', '>=', $startDate)
            ->overdue()
            ->count();

        $activeCustomers = Customer::whereHas('shipments', function ($query) use ($startDate) {
            $query->where('created_at', '>=', $startDate);
        })->count();

        return [
            'total_shipments' => $totalShipments,
            'shipments_growth' => $this->calculateGrowthRate($totalShipments, $previousPeriodShipments),
            'delivered_shipments' => $deliveredShipments,
            'delivery_rate' => $totalShipments > 0 ? round(($deliveredShipments / $totalShipments) * 100, 1) : 0,
            'overdue_shipments' => $overdueShipments,
            'overdue_rate' => $totalShipments > 0 ? round(($overdueShipments / $totalShipments) * 100, 1) : 0,
            'active_customers' => $activeCustomers,
            'average_delivery_time' => $this->getAverageDeliveryTime($startDate),
        ];
    }

    /**
     * Get shipment trends over time.
     */
    private function getShipmentTrends(Carbon $startDate): array
    {
        $trends = Shipment::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });

        return $trends->toArray();
    }

    /**
     * Get performance metrics.
     */
    private function getPerformanceMetrics(Carbon $startDate): array
    {
        // Values are already in TZS in the database
        $totalShipments = Shipment::where('created_at', '>=', $startDate)->count();
        $averageCost = Shipment::where('created_at', '>=', $startDate)
            ->whereNotNull('total_cost')
            ->avg('total_cost') ?? 0;

        return [
            'on_time_delivery_rate' => $this->getOnTimeDeliveryRate($startDate),
            'average_transit_time' => $this->getAverageTransitTime($startDate),
            'customer_satisfaction' => $this->getCustomerSatisfactionScore($startDate),
            'cost_per_shipment' => round($averageCost, 2),
            'exception_rate' => $this->getExceptionRate($startDate),
        ];
    }

    /**
     * Get top customers by shipment volume.
     */
    private function getTopCustomers(Carbon $startDate): array
    {
        return Customer::withCount(['shipments' => function ($query) use ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }])
            ->orderBy('shipments_count', 'desc')
            ->limit(10)
            ->get()
            ->filter(function ($customer) {
                return $customer->shipments_count > 0;
            })
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'customer_code' => $customer->customer_code,
                    'company_name' => $customer->company_name,
                    'shipments_count' => $customer->shipments_count,
                    'status' => $customer->status,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get warehouse performance metrics.
     */
    private function getWarehousePerformance(Carbon $startDate): array
    {
        return Warehouse::withCount(['originShipments' => function ($query) use ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }])
            ->get()
            ->map(function ($warehouse) use ($startDate) {
                $deliveredCount = $warehouse->originShipments()
                    ->where('created_at', '>=', $startDate)
                    ->where('status', 'delivered')
                    ->count();

                $totalShipments = $warehouse->origin_shipments_count;

                return [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                    'code' => $warehouse->code,
                    'city' => $warehouse->city,
                    'total_shipments' => $totalShipments,
                    'delivered_shipments' => $deliveredCount,
                    'delivery_rate' => $totalShipments > 0 ? round(($deliveredCount / $totalShipments) * 100, 1) : 0,
                    'capacity_utilization' => $warehouse->getCapacityUtilization(),
                ];
            })
            ->toArray();
    }

    /**
     * Get service type distribution.
     */
    private function getServiceTypeDistribution(Carbon $startDate): array
    {
        return Shipment::where('created_at', '>=', $startDate)
            ->selectRaw('service_type, COUNT(*) as count')
            ->groupBy('service_type')
            ->get()
            ->map(function ($item) {
                return [
                    'service_type' => ucfirst($item->service_type),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get status distribution.
     */
    private function getStatusDistribution(Carbon $startDate): array
    {
        return Shipment::where('created_at', '>=', $startDate)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Get revenue analytics based on shipment costs in TZS.
     */
    private function getRevenueAnalytics(Carbon $startDate): array
    {
        // Values are already in TZS in the database
        $currentPeriodRevenue = Shipment::where('created_at', '>=', $startDate)
            ->whereNotNull('total_cost')
            ->sum('total_cost');

        $previousPeriodStart = $startDate->copy()->subDays($startDate->diffInDays(now()));
        $previousPeriodRevenue = Shipment::whereBetween('created_at', [$previousPeriodStart, $startDate])
            ->whereNotNull('total_cost')
            ->sum('total_cost');

        $revenueGrowth = $previousPeriodRevenue > 0
            ? (($currentPeriodRevenue - $previousPeriodRevenue) / $previousPeriodRevenue) * 100
            : 0;

        $totalShipments = Shipment::where('created_at', '>=', $startDate)->count();
        $averageOrderValue = $totalShipments > 0 ? $currentPeriodRevenue / $totalShipments : 0;

        // Revenue by service type (already in TZS)
        $revenueByServiceType = Shipment::where('created_at', '>=', $startDate)
            ->whereNotNull('total_cost')
            ->selectRaw('service_type, SUM(total_cost) as revenue')
            ->groupBy('service_type')
            ->get()
            ->map(function ($item) {
                return [
                    'service_type' => ucfirst($item->service_type),
                    'revenue' => round($item->revenue, 2),
                ];
            })
            ->toArray();

        // Monthly revenue trend (last 6 months, already in TZS)
        $monthlyRevenueTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();

            $monthRevenue = Shipment::whereBetween('created_at', [$monthStart, $monthEnd])
                ->whereNotNull('total_cost')
                ->sum('total_cost');

            $monthlyRevenueTrend[] = [
                'month' => $monthStart->format('M Y'),
                'revenue' => round($monthRevenue, 2),
            ];
        }

        return [
            'total_revenue' => round($currentPeriodRevenue, 2),
            'revenue_growth' => round($revenueGrowth, 1),
            'average_order_value' => round($averageOrderValue, 2),
            'revenue_by_service_type' => $revenueByServiceType,
            'monthly_revenue_trend' => $monthlyRevenueTrend,
        ];
    }

    /**
     * Calculate growth rate between two periods.
     */
    private function calculateGrowthRate(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Get average delivery time in days.
     */
    private function getAverageDeliveryTime(Carbon $startDate): float
    {
        $deliveredShipments = Shipment::where('created_at', '>=', $startDate)
            ->where('status', 'delivered')
            ->whereNotNull('actual_delivery_date')
            ->get();

        if ($deliveredShipments->isEmpty()) {
            return 0;
        }

        $totalDays = $deliveredShipments->sum(function ($shipment) {
            return $shipment->created_at->diffInDays($shipment->actual_delivery_date);
        });

        return round($totalDays / $deliveredShipments->count(), 1);
    }

    /**
     * Get on-time delivery rate.
     */
    private function getOnTimeDeliveryRate(Carbon $startDate): float
    {
        $deliveredShipments = Shipment::where('created_at', '>=', $startDate)
            ->where('status', 'delivered')
            ->whereNotNull('actual_delivery_date')
            ->whereNotNull('estimated_delivery_date');

        $totalDelivered = $deliveredShipments->count();

        if ($totalDelivered === 0) {
            return 0;
        }

        $onTimeDelivered = $deliveredShipments
            ->whereRaw('actual_delivery_date <= estimated_delivery_date')
            ->count();

        return round(($onTimeDelivered / $totalDelivered) * 100, 1);
    }

    /**
     * Get average transit time in days.
     */
    private function getAverageTransitTime(Carbon $startDate): float
    {
        $inTransitShipments = Shipment::where('created_at', '>=', $startDate)
            ->whereIn('status', ['picked_up', 'in_transit', 'out_for_delivery'])
            ->get();

        if ($inTransitShipments->isEmpty()) {
            return 0;
        }

        $totalDays = $inTransitShipments->sum(function ($shipment) {
            return $shipment->created_at->diffInDays(now());
        });

        return round($totalDays / $inTransitShipments->count(), 1);
    }

    /**
     * Get exception rate (shipments with issues).
     */
    private function getExceptionRate(Carbon $startDate): float
    {
        $totalShipments = Shipment::where('created_at', '>=', $startDate)->count();

        if ($totalShipments === 0) {
            return 0;
        }

        $exceptionShipments = Shipment::where('created_at', '>=', $startDate)
            ->where('status', 'exception')
            ->count();

        return round(($exceptionShipments / $totalShipments) * 100, 1);
    }

    /**
     * Export analytics data to CSV.
     */
    public function export(Request $request)
    {
        $period = $request->get('period', '30');
        $startDate = now()->subDays((int) $period);

        $shipments = Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse'])
            ->where('created_at', '>=', $startDate)
            ->get();

        $filename = 'analytics_'.now()->format('Y-m-d_H-i-s').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($shipments) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Tracking Number',
                'Customer',
                'Status',
                'Service Type',
                'Origin',
                'Destination',
                'Created Date',
                'Estimated Delivery',
                'Actual Delivery',
                'Transit Days',
                'On Time',
            ]);

            // CSV data
            foreach ($shipments as $shipment) {
                $transitDays = $shipment->actual_delivery_date
                    ? $shipment->created_at->diffInDays($shipment->actual_delivery_date)
                    : $shipment->created_at->diffInDays(now());

                $onTime = ($shipment->actual_delivery_date && $shipment->estimated_delivery_date)
                    ? ($shipment->actual_delivery_date <= $shipment->estimated_delivery_date ? 'Yes' : 'No')
                    : 'N/A';

                fputcsv($file, [
                    $shipment->tracking_number,
                    $shipment->customer->company_name ?? 'N/A',
                    ucfirst(str_replace('_', ' ', $shipment->status)),
                    ucfirst($shipment->service_type),
                    $shipment->originWarehouse->name ?? 'N/A',
                    $shipment->destinationWarehouse->name ?? 'Direct Delivery',
                    $shipment->created_at->format('Y-m-d H:i:s'),
                    $shipment->estimated_delivery_date?->format('Y-m-d H:i:s') ?? 'N/A',
                    $shipment->actual_delivery_date?->format('Y-m-d H:i:s') ?? 'N/A',
                    $transitDays,
                    $onTime,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get customer satisfaction score based on delivery performance.
     */
    private function getCustomerSatisfactionScore(Carbon $startDate): float
    {
        $onTimeRate = $this->getOnTimeDeliveryRate($startDate);
        $exceptionRate = $this->getExceptionRate($startDate);

        // Calculate satisfaction based on performance metrics
        // Base score of 3.0, add points for good performance, subtract for poor performance
        $score = 3.0;
        $score += ($onTimeRate / 100) * 2; // Up to 2 points for on-time delivery
        $score -= ($exceptionRate / 100) * 1.5; // Subtract up to 1.5 points for exceptions

        // Ensure score is between 1.0 and 5.0
        return round(max(1.0, min(5.0, $score)), 1);
    }
}
