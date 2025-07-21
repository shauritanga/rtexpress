<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Display the main analytics dashboard.
     */
    public function index(Request $request)
    {
        $period = $request->get('period', '30'); // Default to 30 days
        $startDate = now()->subDays((int)$period);

        $data = [
            'overview' => $this->getOverviewStats($startDate),
            'shipmentTrends' => $this->getShipmentTrends($startDate),
            'performanceMetrics' => $this->getPerformanceMetrics($startDate),
            'topCustomers' => $this->getTopCustomers($startDate),
            'warehousePerformance' => $this->getWarehousePerformance($startDate),
            'serviceTypeDistribution' => $this->getServiceTypeDistribution($startDate),
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
            $startDate
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
        $shipments = Shipment::where('created_at', '>=', $startDate);

        return [
            'on_time_delivery_rate' => $this->getOnTimeDeliveryRate($startDate),
            'average_transit_time' => $this->getAverageTransitTime($startDate),
            'customer_satisfaction' => 4.2, // TODO: Implement when feedback system is ready
            'cost_per_shipment' => 0, // TODO: Implement when billing is ready
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
     * Get revenue analytics (placeholder for when billing is implemented).
     */
    private function getRevenueAnalytics(Carbon $startDate): array
    {
        // TODO: Implement when billing system is ready
        return [
            'total_revenue' => 0,
            'revenue_growth' => 0,
            'average_order_value' => 0,
            'revenue_by_service_type' => [],
            'monthly_revenue_trend' => [],
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
        $startDate = now()->subDays((int)$period);

        $shipments = Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse'])
            ->where('created_at', '>=', $startDate)
            ->get();

        $filename = 'analytics_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($shipments) {
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
}
