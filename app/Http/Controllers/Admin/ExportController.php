<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Exports\AnalyticsExport;
use App\Exports\ShipmentsExport;
use App\Exports\PerformanceReportExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ExportController extends Controller
{
    /**
     * Export analytics data to Excel
     */
    public function exportAnalytics(Request $request)
    {
        $request->validate([
            'period' => 'required|in:7,30,90,365',
            'format' => 'required|in:excel,pdf'
        ]);

        $period = $request->input('period', '30');
        $format = $request->input('format', 'excel');

        if ($format === 'excel') {
            $fileName = 'analytics_report_' . $period . 'days_' . now()->format('Y-m-d') . '.xlsx';
            return Excel::download(new AnalyticsExport($period), $fileName);
        } else {
            return $this->exportAnalyticsPDF($period);
        }
    }

    /**
     * Export shipments data to Excel
     */
    public function exportShipments(Request $request)
    {
        $request->validate([
            'format' => 'required|in:excel,pdf',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string',
            'service_type' => 'nullable|string',
            'customer_id' => 'nullable|integer',
            'warehouse_id' => 'nullable|integer',
            'search' => 'nullable|string'
        ]);

        $filters = $request->only(['start_date', 'end_date', 'status', 'service_type', 'customer_id', 'warehouse_id', 'search']);
        $format = $request->input('format', 'excel');

        if ($format === 'excel') {
            $fileName = 'shipments_export_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            return Excel::download(new ShipmentsExport($filters), $fileName);
        } else {
            return $this->exportShipmentsPDF($filters);
        }
    }

    /**
     * Export performance report
     */
    public function exportPerformance(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'format' => 'required|in:excel,pdf'
        ]);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $format = $request->input('format', 'excel');

        if ($format === 'excel') {
            $fileName = 'performance_report_' . now()->format('Y-m-d') . '.xlsx';
            return Excel::download(new PerformanceReportExport($startDate, $endDate), $fileName);
        } else {
            return $this->exportPerformancePDF($startDate, $endDate);
        }
    }

    /**
     * Export analytics as PDF
     */
    private function exportAnalyticsPDF($period)
    {
        $startDate = Carbon::now()->subDays((int) $period);
        $endDate = Carbon::now();

        // Get analytics data
        $analytics = app(\App\Http\Controllers\Admin\AnalyticsController::class)->getAnalyticsData($period);

        $pdf = Pdf::loadView('exports.analytics-pdf', [
            'analytics' => $analytics,
            'period' => $period,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now()
        ]);

        $fileName = 'analytics_report_' . $period . 'days_' . now()->format('Y-m-d') . '.pdf';
        return $pdf->download($fileName);
    }

    /**
     * Export shipments as PDF
     */
    private function exportShipmentsPDF($filters)
    {
        $startDate = isset($filters['start_date']) ? Carbon::parse($filters['start_date']) : Carbon::now()->subDays(30);
        $endDate = isset($filters['end_date']) ? Carbon::parse($filters['end_date']) : Carbon::now();

        // Get shipments data
        $shipmentsQuery = \App\Models\Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        // Apply filters (same logic as ShipmentsExport)
        if (!empty($filters['status'])) {
            $shipmentsQuery->where('status', $filters['status']);
        }
        if (!empty($filters['service_type'])) {
            $shipmentsQuery->where('service_type', $filters['service_type']);
        }
        if (!empty($filters['customer_id'])) {
            $shipmentsQuery->where('customer_id', $filters['customer_id']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $shipmentsQuery->where(function($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }

        $shipments = $shipmentsQuery->orderBy('created_at', 'desc')->get();

        $pdf = Pdf::loadView('exports.shipments-pdf', [
            'shipments' => $shipments,
            'filters' => $filters,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now()
        ]);

        $fileName = 'shipments_report_' . now()->format('Y-m-d') . '.pdf';
        return $pdf->download($fileName);
    }

    /**
     * Export performance report as PDF
     */
    private function exportPerformancePDF($startDate, $endDate)
    {
        $startDate = $startDate ? Carbon::parse($startDate) : Carbon::now()->subDays(30);
        $endDate = $endDate ? Carbon::parse($endDate) : Carbon::now();

        $shipments = \App\Models\Shipment::with(['customer', 'originWarehouse'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'delivered')
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('exports.performance-pdf', [
            'shipments' => $shipments,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now()
        ]);

        $fileName = 'performance_report_' . now()->format('Y-m-d') . '.pdf';
        return $pdf->download($fileName);
    }
}
