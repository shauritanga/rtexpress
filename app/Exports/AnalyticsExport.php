<?php

namespace App\Exports;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\Warehouse;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AnalyticsExport implements WithMultipleSheets
{
    protected $startDate;

    protected $endDate;

    protected $period;

    public function __construct($period = '30')
    {
        $this->period = $period;
        $this->endDate = Carbon::now();
        $this->startDate = Carbon::now()->subDays((int) $period);
    }

    public function sheets(): array
    {
        return [
            'Overview' => new AnalyticsOverviewSheet($this->startDate, $this->endDate, $this->period),
            'Shipments' => new ShipmentsDataSheet($this->startDate, $this->endDate),
            'Performance' => new PerformanceMetricsSheet($this->startDate, $this->endDate),
            'Warehouses' => new WarehousePerformanceSheet($this->startDate, $this->endDate),
            'Customers' => new TopCustomersSheet($this->startDate, $this->endDate),
        ];
    }
}

class AnalyticsOverviewSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;

    protected $endDate;

    protected $period;

    public function __construct($startDate, $endDate, $period)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->period = $period;
    }

    public function collection()
    {
        $totalShipments = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])->count();
        $deliveredShipments = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'delivered')->count();
        $pendingShipments = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'pending')->count();
        $inTransitShipments = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'in_transit')->count();
        $overdueShipments = Shipment::where('estimated_delivery_date', '<', now())
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->count();

        $deliveryRate = $totalShipments > 0 ? round(($deliveredShipments / $totalShipments) * 100, 2) : 0;
        $activeCustomers = Customer::whereHas('shipments', function ($query) {
            $query->whereBetween('created_at', [$this->startDate, $this->endDate]);
        })->count();

        return collect([
            (object) ['metric' => 'Total Shipments', 'value' => $totalShipments, 'period' => "Last {$this->period} days"],
            (object) ['metric' => 'Delivered Shipments', 'value' => $deliveredShipments, 'period' => "Last {$this->period} days"],
            (object) ['metric' => 'Pending Shipments', 'value' => $pendingShipments, 'period' => "Last {$this->period} days"],
            (object) ['metric' => 'In Transit Shipments', 'value' => $inTransitShipments, 'period' => "Last {$this->period} days"],
            (object) ['metric' => 'Overdue Shipments', 'value' => $overdueShipments, 'period' => "Last {$this->period} days"],
            (object) ['metric' => 'Delivery Rate', 'value' => $deliveryRate.'%', 'period' => "Last {$this->period} days"],
            (object) ['metric' => 'Active Customers', 'value' => $activeCustomers, 'period' => "Last {$this->period} days"],
        ]);
    }

    public function headings(): array
    {
        return [
            'Metric',
            'Value',
            'Period',
            'Generated At',
        ];
    }

    public function map($row): array
    {
        return [
            $row->metric,
            $row->value,
            $row->period,
            now()->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '3B82F6'],
                ],
                'font' => ['color' => ['rgb' => 'FFFFFF'], 'bold' => true],
            ],
            'A:D' => [
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
            ],
        ];
    }

    public function title(): string
    {
        return 'Analytics Overview';
    }
}

class ShipmentsDataSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Tracking Number',
            'Customer',
            'Status',
            'Service Type',
            'Origin',
            'Destination',
            'Weight (kg)',
            'Declared Value',
            'Created Date',
            'Estimated Delivery',
            'Actual Delivery',
        ];
    }

    public function map($shipment): array
    {
        return [
            $shipment->tracking_number,
            $shipment->customer->company_name ?? 'N/A',
            ucfirst(str_replace('_', ' ', $shipment->status)),
            ucfirst($shipment->service_type),
            $shipment->originWarehouse->city ?? 'N/A',
            $shipment->destinationWarehouse->city ?? $shipment->recipient_address,
            $shipment->weight_kg,
            '$'.number_format($shipment->declared_value, 2),
            $shipment->created_at->format('Y-m-d H:i'),
            $shipment->estimated_delivery_date ? $shipment->estimated_delivery_date->format('Y-m-d') : 'N/A',
            $shipment->actual_delivery_date ? $shipment->actual_delivery_date->format('Y-m-d H:i') : 'N/A',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 11],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '10B981'],
                ],
                'font' => ['color' => ['rgb' => 'FFFFFF'], 'bold' => true],
            ],
        ];
    }

    public function title(): string
    {
        return 'Shipments Data';
    }
}

class PerformanceMetricsSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        $totalShipments = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])->count();
        $deliveredShipments = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'delivered')->count();
        $onTimeDeliveries = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'delivered')
            ->whereColumn('actual_delivery_date', '<=', 'estimated_delivery_date')
            ->count();
        $exceptionShipments = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'exception')->count();

        $onTimeRate = $deliveredShipments > 0 ? round(($onTimeDeliveries / $deliveredShipments) * 100, 2) : 0;
        $exceptionRate = $totalShipments > 0 ? round(($exceptionShipments / $totalShipments) * 100, 2) : 0;
        $deliveryRate = $totalShipments > 0 ? round(($deliveredShipments / $totalShipments) * 100, 2) : 0;

        // Calculate average transit time
        $avgTransitTime = Shipment::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', 'delivered')
            ->whereNotNull('actual_delivery_date')
            ->selectRaw('AVG(DATEDIFF(actual_delivery_date, created_at)) as avg_days')
            ->value('avg_days') ?? 0;

        return collect([
            (object) [
                'metric' => 'On-Time Delivery Rate',
                'value' => $onTimeRate.'%',
                'target' => '95%',
                'status' => $onTimeRate >= 95 ? 'Excellent' : ($onTimeRate >= 85 ? 'Good' : 'Needs Improvement'),
            ],
            (object) [
                'metric' => 'Overall Delivery Rate',
                'value' => $deliveryRate.'%',
                'target' => '98%',
                'status' => $deliveryRate >= 98 ? 'Excellent' : ($deliveryRate >= 90 ? 'Good' : 'Needs Improvement'),
            ],
            (object) [
                'metric' => 'Exception Rate',
                'value' => $exceptionRate.'%',
                'target' => '<2%',
                'status' => $exceptionRate <= 2 ? 'Excellent' : ($exceptionRate <= 5 ? 'Good' : 'Needs Improvement'),
            ],
            (object) [
                'metric' => 'Average Transit Time',
                'value' => round($avgTransitTime, 1).' days',
                'target' => '3 days',
                'status' => $avgTransitTime <= 3 ? 'Excellent' : ($avgTransitTime <= 5 ? 'Good' : 'Needs Improvement'),
            ],
        ]);
    }

    public function headings(): array
    {
        return [
            'Performance Metric',
            'Current Value',
            'Target',
            'Status',
        ];
    }

    public function map($row): array
    {
        return [
            $row->metric,
            $row->value,
            $row->target,
            $row->status,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 11],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F59E0B'],
                ],
                'font' => ['color' => ['rgb' => 'FFFFFF'], 'bold' => true],
            ],
        ];
    }

    public function title(): string
    {
        return 'Performance Metrics';
    }
}

class WarehousePerformanceSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return Warehouse::withCount([
            'originShipments as total_shipments' => function ($query) {
                $query->whereBetween('created_at', [$this->startDate, $this->endDate]);
            },
            'originShipments as delivered_shipments' => function ($query) {
                $query->whereBetween('created_at', [$this->startDate, $this->endDate])
                    ->where('status', 'delivered');
            },
        ])->get()->map(function ($warehouse) {
            $deliveryRate = $warehouse->total_shipments > 0
                ? round(($warehouse->delivered_shipments / $warehouse->total_shipments) * 100, 2)
                : 0;

            $warehouse->delivery_rate = $deliveryRate;
            $warehouse->capacity_utilization = $warehouse->getCapacityUtilization();

            return $warehouse;
        });
    }

    public function headings(): array
    {
        return [
            'Warehouse Code',
            'Name',
            'City',
            'Total Shipments',
            'Delivered Shipments',
            'Delivery Rate (%)',
            'Capacity Utilization (%)',
            'Status',
        ];
    }

    public function map($warehouse): array
    {
        return [
            $warehouse->code,
            $warehouse->name,
            $warehouse->city,
            $warehouse->total_shipments,
            $warehouse->delivered_shipments,
            $warehouse->delivery_rate.'%',
            $warehouse->capacity_utilization.'%',
            ucfirst($warehouse->status),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 11],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '8B5CF6'],
                ],
                'font' => ['color' => ['rgb' => 'FFFFFF'], 'bold' => true],
            ],
        ];
    }

    public function title(): string
    {
        return 'Warehouse Performance';
    }
}

class TopCustomersSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $startDate;

    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return Customer::withCount(['shipments' => function ($query) {
            $query->whereBetween('created_at', [$this->startDate, $this->endDate]);
        }])
            ->orderBy('shipments_count', 'desc')
            ->limit(20)
            ->get()
            ->filter(function ($customer) {
                return $customer->shipments_count > 0;
            });
    }

    public function headings(): array
    {
        return [
            'Rank',
            'Customer Code',
            'Company Name',
            'Contact Person',
            'Email',
            'Phone',
            'City',
            'Shipments Count',
            'Status',
        ];
    }

    public function map($customer): array
    {
        static $rank = 0;
        $rank++;

        return [
            $rank,
            $customer->customer_code,
            $customer->company_name,
            $customer->contact_person,
            $customer->email,
            $customer->phone,
            $customer->city,
            $customer->shipments_count,
            ucfirst($customer->status),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 11],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'EF4444'],
                ],
                'font' => ['color' => ['rgb' => 'FFFFFF'], 'bold' => true],
            ],
        ];
    }

    public function title(): string
    {
        return 'Top Customers';
    }
}
