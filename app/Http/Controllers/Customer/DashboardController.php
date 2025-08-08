<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the customer dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return Inertia::render('Customer/Dashboard/NoAccess');
        }

        // Get customer shipment statistics
        $stats = [
            'total_shipments' => $customer->shipments()->count(),
            'active_shipments' => $customer->shipments()->whereNotIn('status', ['delivered', 'cancelled'])->count(),
            'delivered_shipments' => $customer->shipments()->where('status', 'delivered')->count(),
            'pending_shipments' => $customer->shipments()->where('status', 'pending')->count(),
        ];

        // Get active shipments for overview
        $activeShipments = $customer->shipments()
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->latest()
            ->limit(10)
            ->get();

        // Get dashboard visualization data
        $dashboardData = $this->getDashboardData($customer);

        return Inertia::render('Customer/Dashboard/Index', [
            'customer' => $customer,
            'stats' => $stats,
            'activeShipments' => $activeShipments,
            'dashboardData' => $dashboardData,
        ]);
    }

    /**
     * Get dashboard visualization data.
     */
    private function getDashboardData($customer): array
    {
        // Weekly shipments for the last 7 days
        $weeklyData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayName = $date->format('D'); // Mon, Tue, etc.

            $shipments = $customer->shipments()
                ->whereDate('created_at', $date->toDateString())
                ->count();

            $weeklyData[] = [
                'day' => $dayName,
                'shipments' => $shipments,
            ];
        }

        // Status distribution
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

        // Filter out zero values and add fallback
        $filteredStatusData = array_values(array_filter($statusData, fn ($item) => $item['value'] > 0));

        if (empty($filteredStatusData)) {
            $filteredStatusData = [
                ['name' => 'No Data', 'value' => 1, 'color' => '#e5e7eb'],
            ];
        }

        return [
            'weekly_shipments' => $weeklyData,
            'status_distribution' => $filteredStatusData,
        ];
    }

    /**
     * Get recent activity timeline events for the customer.
     */
    private function getRecentActivityEvents($customer)
    {
        // Generate mock timeline events based on recent shipments
        $recentShipments = $customer->shipments()
            ->with(['originWarehouse', 'destinationWarehouse'])
            ->latest()
            ->limit(10)
            ->get();

        $events = [];
        foreach ($recentShipments as $shipment) {
            // Create timeline events based on shipment status
            $events[] = [
                'id' => $shipment->id * 1000 + 1,
                'shipment_id' => $shipment->id,
                'tracking_number' => $shipment->tracking_number,
                'event_type' => $this->mapStatusToEventType($shipment->status),
                'status' => $shipment->status,
                'description' => $this->getEventDescription($shipment->status, $shipment),
                'location' => $shipment->originWarehouse?->name ?? 'Processing Center',
                'timestamp' => $shipment->updated_at->toISOString(),
                'recipient_name' => $shipment->recipient_name,
                'service_type' => $shipment->service_type,
            ];
        }

        // Sort by timestamp descending
        usort($events, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return array_slice($events, 0, 15);
    }

    /**
     * Get delivery performance metrics for the customer.
     */
    private function getDeliveryPerformanceMetrics($customer)
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // Get deliveries for current and last month
        $currentMonthDeliveries = $customer->shipments()
            ->where('status', 'delivered')
            ->where('created_at', '>=', $currentMonth)
            ->get();

        $lastMonthDeliveries = $customer->shipments()
            ->where('status', 'delivered')
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $currentMonth)
            ->get();

        // Calculate metrics
        $totalDeliveries = $currentMonthDeliveries->count();
        $onTimeDeliveries = $currentMonthDeliveries->filter(function ($shipment) {
            // Mock on-time calculation - in real app, compare actual vs estimated delivery
            return rand(0, 100) > 15; // 85% on-time rate
        })->count();

        $earlyDeliveries = $currentMonthDeliveries->filter(function ($shipment) {
            return rand(0, 100) > 90; // 10% early
        })->count();

        $lateDeliveries = $totalDeliveries - $onTimeDeliveries - $earlyDeliveries;

        $onTimeRate = $totalDeliveries > 0 ? ($onTimeDeliveries + $earlyDeliveries) / $totalDeliveries * 100 : 0;

        // Calculate average delivery time (mock data)
        $avgDeliveryTime = 48 + rand(-12, 12); // 48 hours +/- 12 hours
        $lastMonthAvgTime = 52 + rand(-8, 8);

        $trend = $avgDeliveryTime < $lastMonthAvgTime ? 'up' : ($avgDeliveryTime > $lastMonthAvgTime ? 'down' : 'stable');

        return [
            'on_time_delivery_rate' => round($onTimeRate, 1),
            'average_delivery_time' => $avgDeliveryTime,
            'total_deliveries_this_month' => $totalDeliveries,
            'total_deliveries_last_month' => $lastMonthDeliveries->count(),
            'early_deliveries' => $earlyDeliveries,
            'on_time_deliveries' => $onTimeDeliveries,
            'late_deliveries' => max(0, $lateDeliveries),
            'average_delivery_time_last_month' => $lastMonthAvgTime,
            'performance_trend' => $trend,
            'customer_satisfaction_score' => 4.2 + (rand(0, 8) / 10), // 4.2-5.0 range
        ];
    }

    /**
     * Get upcoming deliveries for the customer.
     */
    private function getUpcomingDeliveries($customer)
    {
        $upcomingShipments = $customer->shipments()
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->whereNotNull('estimated_delivery_date')
            ->where('estimated_delivery_date', '>=', Carbon::now())
            ->orderBy('estimated_delivery_date')
            ->limit(20)
            ->get();

        return $upcomingShipments->map(function ($shipment) {
            return [
                'id' => $shipment->id,
                'tracking_number' => $shipment->tracking_number,
                'recipient_name' => $shipment->recipient_name,
                'recipient_address' => $shipment->recipient_address,
                'service_type' => $shipment->service_type,
                'estimated_delivery_date' => $shipment->estimated_delivery_date,
                'delivery_time_window' => $this->getDeliveryTimeWindow($shipment->service_type),
                'status' => $shipment->status,
                'priority' => $this->getShipmentPriority($shipment),
            ];
        })->toArray();
    }

    /**
     * Map shipment status to timeline event type.
     */
    private function mapStatusToEventType($status)
    {
        $mapping = [
            'pending' => 'created',
            'picked_up' => 'picked_up',
            'in_transit' => 'in_transit',
            'out_for_delivery' => 'out_for_delivery',
            'delivered' => 'delivered',
            'exception' => 'exception',
            'cancelled' => 'exception',
        ];

        return $mapping[$status] ?? 'created';
    }

    /**
     * Get event description based on status.
     */
    private function getEventDescription($status, $shipment)
    {
        $descriptions = [
            'pending' => 'Shipment created and awaiting pickup',
            'picked_up' => 'Package picked up from origin',
            'in_transit' => 'Package in transit to destination',
            'out_for_delivery' => 'Out for delivery to recipient',
            'delivered' => 'Package delivered successfully',
            'exception' => 'Delivery exception occurred',
            'cancelled' => 'Shipment cancelled',
        ];

        return $descriptions[$status] ?? 'Status updated';
    }

    /**
     * Get delivery time window based on service type.
     */
    private function getDeliveryTimeWindow($serviceType)
    {
        $windows = [
            'express' => '9:00 AM - 12:00 PM',
            'standard' => '9:00 AM - 6:00 PM',
            'overnight' => '8:00 AM - 10:00 AM',
            'international' => '9:00 AM - 5:00 PM',
        ];

        return $windows[$serviceType] ?? '9:00 AM - 6:00 PM';
    }

    /**
     * Get shipment priority based on service type and value.
     */
    private function getShipmentPriority($shipment)
    {
        if ($shipment->service_type === 'express' || $shipment->service_type === 'overnight') {
            return 'high';
        }

        if ($shipment->declared_value > 1000) {
            return 'medium';
        }

        return 'low';
    }
}
