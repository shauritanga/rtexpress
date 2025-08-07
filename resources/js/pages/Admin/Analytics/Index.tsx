import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    Clock,
    CheckCircle,
    AlertTriangle,
    Download,
    Calendar,
    DollarSign,
    Truck,
    Target
} from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

// Import our new chart components
import { ShipmentTrendChart, ServiceTypeDonutChart } from '@/components/charts/ShipmentTrendChart';
import { StatusDistributionChart } from '@/components/charts/WarehousePerformanceChart';
import { KPICard, PerformanceMetricsGrid, QuickStats } from '@/components/charts/KPICards';
import { ExportModal } from '@/components/admin/ExportModal';

interface AnalyticsData {
    overview: {
        total_shipments: number;
        shipments_growth: number;
        delivered_shipments: number;
        delivery_rate: number;
        overdue_shipments: number;
        overdue_rate: number;
        active_customers: number;
        average_delivery_time: number;
    };
    shipmentTrends: Array<{
        date: string;
        count: number;
    }>;
    performanceMetrics: {
        on_time_delivery_rate: number;
        average_transit_time: number;
        customer_satisfaction: number;
        cost_per_shipment: number;
        exception_rate: number;
    };
    revenueAnalytics: {
        total_revenue: number;
        revenue_growth: number;
        average_order_value: number;
        revenue_by_service_type: Array<{
            service_type: string;
            revenue: number;
        }>;
        monthly_revenue_trend: Array<{
            month: string;
            revenue: number;
        }>;
    };
    topCustomers: Array<{
        id: number;
        customer_code: string;
        company_name: string;
        shipments_count: number;
        status: string;
    }>;

    serviceTypeDistribution: Array<{
        service_type: string;
        count: number;
    }>;
    statusDistribution: Array<{
        status: string;
        count: number;
    }>;
}

interface Props {
    analytics: AnalyticsData;
    period: string;
}

export default function AnalyticsIndex({ analytics, period }: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get('/admin/analytics', { period: newPeriod }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Prepare KPI cards data
    const kpiCards = [
        {
            title: 'Total Shipments',
            value: analytics.overview.total_shipments,
            description: 'All shipments in selected period',
            trend: analytics.overview.shipments_growth ? {
                value: analytics.overview.shipments_growth,
                isPositive: analytics.overview.shipments_growth > 0,
                period: 'last period'
            } : undefined,
            icon: Package,
            color: 'blue' as const,
        },
        {
            title: 'Delivery Rate',
            value: `${analytics.overview.delivery_rate}%`,
            description: 'Successfully delivered shipments',
            icon: CheckCircle,
            color: analytics.overview.delivery_rate >= 95 ? 'green' as const :
                   analytics.overview.delivery_rate >= 85 ? 'yellow' as const : 'red' as const,
        },
        {
            title: 'Active Customers',
            value: analytics.overview.active_customers,
            description: 'Customers with recent shipments',
            icon: Users,
            color: 'purple' as const,
        },
        {
            title: 'Avg Delivery Time',
            value: `${analytics.overview.average_delivery_time}`,
            description: 'Days from pickup to delivery',
            icon: Clock,
            color: analytics.overview.average_delivery_time <= 3 ? 'green' as const :
                   analytics.overview.average_delivery_time <= 5 ? 'yellow' as const : 'red' as const,
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(analytics.revenueAnalytics?.total_revenue || 0),
            description: 'Revenue in selected period',
            icon: DollarSign,
            color: 'green' as const,
        },
        {
            title: 'Avg Cost/Shipment',
            value: formatCurrency(analytics.performanceMetrics?.cost_per_shipment || 0),
            description: 'Average cost per shipment',
            icon: Target,
            color: 'blue' as const,
        },
    ];

    // Prepare performance metrics
    const performanceMetrics = [
        {
            title: 'On-Time Delivery',
            value: analytics.performanceMetrics.on_time_delivery_rate,
            unit: '%',
            target: 95,
            status: analytics.performanceMetrics.on_time_delivery_rate >= 95 ? 'excellent' :
                   analytics.performanceMetrics.on_time_delivery_rate >= 85 ? 'good' :
                   analytics.performanceMetrics.on_time_delivery_rate >= 75 ? 'warning' : 'critical',
            description: 'Delivered within estimated time'
        },
        {
            title: 'Avg Transit Time',
            value: analytics.performanceMetrics.average_transit_time,
            unit: ' days',
            target: 3,
            status: analytics.performanceMetrics.average_transit_time <= 3 ? 'excellent' :
                   analytics.performanceMetrics.average_transit_time <= 5 ? 'good' :
                   analytics.performanceMetrics.average_transit_time <= 7 ? 'warning' : 'critical',
            description: 'Average time in transit'
        },
        {
            title: 'Customer Satisfaction',
            value: analytics.performanceMetrics.customer_satisfaction,
            unit: '/5',
            target: 4.5,
            status: analytics.performanceMetrics.customer_satisfaction >= 4.5 ? 'excellent' :
                   analytics.performanceMetrics.customer_satisfaction >= 4.0 ? 'good' :
                   analytics.performanceMetrics.customer_satisfaction >= 3.5 ? 'warning' : 'critical',
            description: 'Average customer rating'
        },
        {
            title: 'Exception Rate',
            value: analytics.performanceMetrics.exception_rate,
            unit: '%',
            target: 2,
            status: analytics.performanceMetrics.exception_rate <= 2 ? 'excellent' :
                   analytics.performanceMetrics.exception_rate <= 5 ? 'good' :
                   analytics.performanceMetrics.exception_rate <= 10 ? 'warning' : 'critical',
            description: 'Shipments with issues'
        }
    ] as const;

    return (
        <AppLayout>
            <Head title="Analytics Dashboard" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Analytics
                        </h1>
                        <p className="text-muted-foreground">
                            Performance insights and business metrics
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                        <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Calendar className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="90">Last 90 days</SelectItem>
                                <SelectItem value="365">Last year</SelectItem>
                            </SelectContent>
                        </Select>
                        <ExportModal
                            type="analytics"
                            filters={{ period: selectedPeriod }}
                            trigger={
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Report
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card) => (
                        <KPICard
                            key={card.title}
                            title={card.title}
                            value={card.value}
                            description={card.description}
                            trend={card.trend}
                            icon={card.icon}
                            color={card.color}
                        />
                    ))}
                </div>

                {/* Performance Metrics */}
                <PerformanceMetricsGrid metrics={performanceMetrics} />

                {/* Charts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Shipment Trends Chart */}
                    <ShipmentTrendChart
                        data={analytics.shipmentTrends}
                        title="Shipment Volume Trends"
                        description="Daily shipment volume over the selected period"
                    />

                    {/* Service Type Distribution */}
                    <ServiceTypeDonutChart
                        data={analytics.serviceTypeDistribution}
                        title="Service Type Distribution"
                        description="Breakdown of shipments by service type"
                    />
                </div>

                {/* Status Distribution */}
                <div className="grid gap-6 lg:grid-cols-1">
                    <StatusDistributionChart
                        data={analytics.statusDistribution || []}
                        title="Current Status Distribution"
                        description="Real-time breakdown of shipment statuses"
                    />
                </div>

                {/* Top Customers */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Customers</CardTitle>
                        <CardDescription>
                            Customers ranked by shipment volume in the selected period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {analytics.topCustomers.slice(0, 6).map((customer, index) => (
                                <div key={customer.id} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {customer.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{customer.company_name}</p>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {customer.customer_code}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Shipments:</span>
                                            <span className="text-sm font-semibold text-blue-600">
                                                {customer.shipments_count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
