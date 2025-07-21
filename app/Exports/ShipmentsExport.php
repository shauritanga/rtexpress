<?php

namespace App\Exports;

use App\Models\Shipment;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\Exportable;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ShipmentsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithTitle
{
    use Exportable;

    protected $filters;
    protected $startDate;
    protected $endDate;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
        
        // Set date range
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $this->startDate = Carbon::parse($filters['start_date']);
            $this->endDate = Carbon::parse($filters['end_date']);
        } else {
            $this->endDate = Carbon::now();
            $this->startDate = Carbon::now()->subDays(30);
        }
    }

    public function query()
    {
        $query = Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse', 'createdBy'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate]);

        // Apply filters
        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['service_type'])) {
            $query->where('service_type', $this->filters['service_type']);
        }

        if (!empty($this->filters['customer_id'])) {
            $query->where('customer_id', $this->filters['customer_id']);
        }

        if (!empty($this->filters['warehouse_id'])) {
            $query->where('origin_warehouse_id', $this->filters['warehouse_id']);
        }

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($customerQuery) use ($search) {
                      $customerQuery->where('company_name', 'like', "%{$search}%");
                  });
            });
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'Tracking Number',
            'Customer Company',
            'Customer Code',
            'Status',
            'Service Type',
            'Sender Name',
            'Sender Phone',
            'Sender Address',
            'Recipient Name',
            'Recipient Phone',
            'Recipient Address',
            'Origin Warehouse',
            'Destination Warehouse',
            'Weight (kg)',
            'Dimensions (L×W×H cm)',
            'Declared Value ($)',
            'Insurance Value ($)',
            'Special Instructions',
            'Created Date',
            'Estimated Delivery',
            'Actual Delivery',
            'Created By',
            'Days in Transit',
            'On Time Status'
        ];
    }

    public function map($shipment): array
    {
        // Calculate days in transit
        $daysInTransit = null;
        if ($shipment->actual_delivery_date) {
            $daysInTransit = $shipment->created_at->diffInDays($shipment->actual_delivery_date);
        } elseif ($shipment->status !== 'pending') {
            $daysInTransit = $shipment->created_at->diffInDays(now());
        }

        // Determine on-time status
        $onTimeStatus = 'N/A';
        if ($shipment->actual_delivery_date && $shipment->estimated_delivery_date) {
            $onTimeStatus = $shipment->actual_delivery_date <= $shipment->estimated_delivery_date ? 'On Time' : 'Late';
        } elseif ($shipment->estimated_delivery_date && $shipment->status !== 'delivered') {
            $onTimeStatus = now() > $shipment->estimated_delivery_date ? 'Overdue' : 'In Progress';
        }

        // Format dimensions
        $dimensions = '';
        if ($shipment->dimensions_length_cm && $shipment->dimensions_width_cm && $shipment->dimensions_height_cm) {
            $dimensions = "{$shipment->dimensions_length_cm}×{$shipment->dimensions_width_cm}×{$shipment->dimensions_height_cm}";
        }

        return [
            $shipment->tracking_number,
            $shipment->customer->company_name ?? 'N/A',
            $shipment->customer->customer_code ?? 'N/A',
            ucfirst(str_replace('_', ' ', $shipment->status)),
            ucfirst($shipment->service_type),
            $shipment->sender_name,
            $shipment->sender_phone,
            $shipment->sender_address,
            $shipment->recipient_name,
            $shipment->recipient_phone,
            $shipment->recipient_address,
            $shipment->originWarehouse->name ?? 'N/A',
            $shipment->destinationWarehouse->name ?? 'Direct Delivery',
            $shipment->weight_kg,
            $dimensions,
            number_format($shipment->declared_value, 2),
            number_format($shipment->insurance_value ?? 0, 2),
            $shipment->special_instructions ?? '',
            $shipment->created_at->format('Y-m-d H:i:s'),
            $shipment->estimated_delivery_date ? $shipment->estimated_delivery_date->format('Y-m-d H:i:s') : 'N/A',
            $shipment->actual_delivery_date ? $shipment->actual_delivery_date->format('Y-m-d H:i:s') : 'N/A',
            $shipment->createdBy->name ?? 'System',
            $daysInTransit ?? 'N/A',
            $onTimeStatus
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Header row styling
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 11,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1F2937']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ],
            // Auto-size columns
            'A:X' => [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT]
            ]
        ];
    }

    public function title(): string
    {
        $dateRange = $this->startDate->format('M d') . ' - ' . $this->endDate->format('M d, Y');
        return "Shipments Export ({$dateRange})";
    }
}

// Specialized export for performance reports
class PerformanceReportExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithTitle
{
    use Exportable;

    protected $startDate;
    protected $endDate;

    public function __construct($startDate = null, $endDate = null)
    {
        $this->startDate = $startDate ? Carbon::parse($startDate) : Carbon::now()->subDays(30);
        $this->endDate = $endDate ? Carbon::parse($endDate) : Carbon::now();
    }

    public function query()
    {
        return Shipment::with(['customer', 'originWarehouse'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'delivered')
            ->orderBy('created_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'Tracking Number',
            'Customer',
            'Origin Warehouse',
            'Service Type',
            'Created Date',
            'Estimated Delivery',
            'Actual Delivery',
            'Days to Deliver',
            'On Time Status',
            'Performance Score'
        ];
    }

    public function map($shipment): array
    {
        $daysToDeliver = $shipment->created_at->diffInDays($shipment->actual_delivery_date);
        $onTime = $shipment->actual_delivery_date <= $shipment->estimated_delivery_date;
        $onTimeStatus = $onTime ? 'On Time' : 'Late';
        
        // Calculate performance score (100 for on-time, decreasing for late deliveries)
        $performanceScore = 100;
        if (!$onTime && $shipment->estimated_delivery_date) {
            $daysLate = $shipment->actual_delivery_date->diffInDays($shipment->estimated_delivery_date);
            $performanceScore = max(0, 100 - ($daysLate * 10));
        }

        return [
            $shipment->tracking_number,
            $shipment->customer->company_name ?? 'N/A',
            $shipment->originWarehouse->name ?? 'N/A',
            ucfirst($shipment->service_type),
            $shipment->created_at->format('Y-m-d'),
            $shipment->estimated_delivery_date->format('Y-m-d'),
            $shipment->actual_delivery_date->format('Y-m-d'),
            $daysToDeliver,
            $onTimeStatus,
            $performanceScore . '%'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '059669']
                ]
            ]
        ];
    }

    public function title(): string
    {
        return 'Performance Report';
    }
}
