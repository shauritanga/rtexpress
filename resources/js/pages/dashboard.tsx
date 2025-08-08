import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileActivityFeed, MobileChartCard, MobileDashboardGrid, MobileKPICard } from '@/components/ui/mobile-dashboard';
import { MobileFormSection } from '@/components/ui/mobile-form';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3, DollarSign, Package, Truck, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    // Sample data - in real app, this would come from props or API
    const kpiData = [
        {
            title: 'Total Shipments',
            value: '1,234',
            change: { value: 12, type: 'increase' as const, period: 'vs last month' },
            icon: Package,
            description: 'Active shipments',
        },
        {
            title: 'In Transit',
            value: '456',
            change: { value: 5, type: 'increase' as const, period: 'vs last week' },
            icon: Truck,
            description: 'Currently shipping',
        },
        {
            title: 'Customers',
            value: '89',
            change: { value: 3, type: 'decrease' as const, period: 'vs last month' },
            icon: Users,
            description: 'Active customers',
        },
        {
            title: 'Revenue',
            value: '$45,678',
            change: { value: 18, type: 'increase' as const, period: 'vs last month' },
            icon: DollarSign,
            description: 'Monthly revenue',
        },
    ];

    // ✅ CRITICAL ALERTS - Issues requiring immediate attention
    const criticalAlerts = [
        {
            id: '1',
            type: 'error' as const,
            title: 'Delayed Shipments',
            message: '12 shipments are running behind schedule',
            count: 12,
            action: 'View Delayed Shipments',
            priority: 'high' as const,
        },
        {
            id: '2',
            type: 'warning' as const,
            title: 'Warehouse Capacity Alert',
            message: 'NYC warehouse at 95% capacity',
            count: 1,
            action: 'View Warehouse Status',
            priority: 'medium' as const,
        },
        {
            id: '3',
            type: 'info' as const,
            title: 'Driver Check-ins Pending',
            message: '5 drivers have not checked in today',
            count: 5,
            action: 'View Driver Status',
            priority: 'low' as const,
        },
    ];

    // ✅ OPERATIONAL STATUS - Current state overview
    const operationalStatus = {
        shipmentsByStatus: {
            pending: 156,
            in_transit: 892,
            out_for_delivery: 234,
            delivered_today: 445,
            exceptions: 12,
        },
        warehouseStatus: [
            { name: 'NYC Main', utilization: 87, status: 'normal' },
            { name: 'LA West', utilization: 95, status: 'warning' },
            { name: 'Chicago Hub', utilization: 76, status: 'normal' },
        ],
    };

    const recentActivity = [
        {
            id: '1',
            title: 'New shipment created',
            description: 'RT123456789 - Express delivery to New York',
            timestamp: '2 minutes ago',
            type: 'info' as const,
        },
        {
            id: '2',
            title: 'Package delivered',
            description: 'RT123456788 - Successfully delivered to customer',
            timestamp: '15 minutes ago',
            type: 'success' as const,
        },
        {
            id: '3',
            title: 'Delivery delayed',
            description: 'RT123456787 - Weather conditions causing delay',
            timestamp: '1 hour ago',
            type: 'warning' as const,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-4 p-4 sm:space-y-6 md:p-6">
                {/* Mobile-First Header */}
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
                        <p className="text-sm text-muted-foreground sm:text-base">Welcome back! Here's what's happening with your shipments.</p>
                    </div>
                </div>

                {/* KPI Cards - Mobile-First Grid */}
                <MobileDashboardGrid columns={2}>
                    {kpiData.map((kpi, index) => (
                        <MobileKPICard
                            key={index}
                            title={kpi.title}
                            value={kpi.value}
                            change={kpi.change}
                            icon={kpi.icon}
                            description={kpi.description}
                            onClick={() => console.log(`Clicked ${kpi.title}`)}
                        />
                    ))}
                </MobileDashboardGrid>

                {/* Critical Alerts - Issues requiring immediate attention */}
                <MobileFormSection title="Critical Alerts" description="Issues requiring immediate attention" variant="card">
                    <div className="space-y-3">
                        {criticalAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`rounded-lg border-l-4 p-4 ${
                                    alert.type === 'error'
                                        ? 'border-l-red-500 bg-red-50'
                                        : alert.type === 'warning'
                                          ? 'border-l-yellow-500 bg-yellow-50'
                                          : 'border-l-blue-500 bg-blue-50'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h4
                                                className={`text-sm font-medium ${
                                                    alert.type === 'error'
                                                        ? 'text-red-800'
                                                        : alert.type === 'warning'
                                                          ? 'text-yellow-800'
                                                          : 'text-blue-800'
                                                }`}
                                            >
                                                {alert.title}
                                            </h4>
                                            <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>{alert.count}</Badge>
                                        </div>
                                        <p
                                            className={`mt-1 text-xs ${
                                                alert.type === 'error'
                                                    ? 'text-red-700'
                                                    : alert.type === 'warning'
                                                      ? 'text-yellow-700'
                                                      : 'text-blue-700'
                                            }`}
                                        >
                                            {alert.message}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`text-xs ${
                                            alert.type === 'error'
                                                ? 'text-red-700 hover:text-red-800'
                                                : alert.type === 'warning'
                                                  ? 'text-yellow-700 hover:text-yellow-800'
                                                  : 'text-blue-700 hover:text-blue-800'
                                        }`}
                                    >
                                        {alert.action}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </MobileFormSection>

                {/* Operational Status Overview */}
                <MobileFormSection title="Operational Status" description="Current operational overview" variant="card">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-lg bg-yellow-50 p-3 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{operationalStatus.shipmentsByStatus.pending}</p>
                            <p className="text-xs text-yellow-700">Pending Pickup</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3 text-center">
                            <p className="text-2xl font-bold text-blue-600">{operationalStatus.shipmentsByStatus.in_transit}</p>
                            <p className="text-xs text-blue-700">In Transit</p>
                        </div>
                        <div className="rounded-lg bg-orange-50 p-3 text-center">
                            <p className="text-2xl font-bold text-orange-600">{operationalStatus.shipmentsByStatus.out_for_delivery}</p>
                            <p className="text-xs text-orange-700">Out for Delivery</p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3 text-center">
                            <p className="text-2xl font-bold text-green-600">{operationalStatus.shipmentsByStatus.delivered_today}</p>
                            <p className="text-xs text-green-700">Delivered Today</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h4 className="mb-3 text-sm font-medium">Warehouse Status</h4>
                        <div className="space-y-2">
                            {operationalStatus.warehouseStatus.map((warehouse, index) => (
                                <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
                                    <span className="text-sm font-medium">{warehouse.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-16 rounded-full bg-gray-200">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    warehouse.utilization >= 90
                                                        ? 'bg-red-500'
                                                        : warehouse.utilization >= 80
                                                          ? 'bg-yellow-500'
                                                          : 'bg-green-500'
                                                }`}
                                                style={{ width: `${warehouse.utilization}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium">{warehouse.utilization}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </MobileFormSection>

                {/* Charts and Activity - Mobile-First Layout */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    <MobileChartCard title="Shipment Trends" description="Monthly shipment volume" height="md">
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Chart component will be integrated here</p>
                            </div>
                        </div>
                    </MobileChartCard>

                    <MobileActivityFeed
                        title="Recent Activity"
                        items={recentActivity}
                        maxItems={5}
                        showViewAll={true}
                        onViewAll={() => console.log('View all activity')}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
