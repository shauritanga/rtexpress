import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Package, 
    TrendingUp, 
    Users, 
    Warehouse, 
    AlertTriangle,
    CheckCircle,
    Clock,
    Truck
} from 'lucide-react';
import { Head } from '@inertiajs/react';

interface DashboardStats {
    total_shipments: number;
    pending_shipments: number;
    in_transit_shipments: number;
    delivered_shipments: number;
    overdue_shipments: number;
    active_customers: number;
    total_warehouses: number;
    revenue_today: number;
}

interface Props {
    stats: DashboardStats;
}

export default function AdminDashboard({ stats }: Props) {
    const kpiCards = [
        {
            title: 'Total Shipments',
            value: stats.total_shipments.toLocaleString(),
            description: 'All time shipments',
            icon: Package,
            trend: '+12%',
            trendUp: true,
        },
        {
            title: 'Active Customers',
            value: stats.active_customers.toLocaleString(),
            description: 'Customers with shipments',
            icon: Users,
            trend: '+8%',
            trendUp: true,
        },
        {
            title: 'Warehouses',
            value: stats.total_warehouses.toLocaleString(),
            description: 'Operational facilities',
            icon: Warehouse,
            trend: 'Stable',
            trendUp: null,
        },
        {
            title: 'Revenue Today',
            value: `$${stats.revenue_today.toLocaleString()}`,
            description: 'Daily earnings',
            icon: TrendingUp,
            trend: '+15%',
            trendUp: true,
        },
    ];

    const statusCards = [
        {
            title: 'Pending Pickup',
            value: stats.pending_shipments,
            color: 'bg-yellow-500',
            icon: Clock,
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'In Transit',
            value: stats.in_transit_shipments,
            color: 'bg-blue-500',
            icon: Truck,
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Delivered',
            value: stats.delivered_shipments,
            color: 'bg-green-500',
            icon: CheckCircle,
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Overdue',
            value: stats.overdue_shipments,
            color: 'bg-red-500',
            icon: AlertTriangle,
            textColor: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    ];

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome to RT Express Admin Dashboard
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                        <Button variant="outline" size="sm">
                            Export Report
                        </Button>
                        <Button size="sm">
                            Create Shipment
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {kpiCards.map((card) => (
                        <Card key={card.title} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <card.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <span>{card.description}</span>
                                    {card.trendUp !== null && (
                                        <Badge 
                                            variant={card.trendUp ? "default" : "destructive"}
                                            className="text-xs"
                                        >
                                            {card.trend}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Shipment Status Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipment Status Overview</CardTitle>
                        <CardDescription>
                            Current status of all shipments in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {statusCards.map((status) => (
                                <div 
                                    key={status.title}
                                    className={`rounded-lg p-4 ${status.bgColor} border border-gray-200`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`rounded-full p-2 ${status.color}`}>
                                            <status.icon className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                {status.title}
                                            </p>
                                            <p className={`text-2xl font-bold ${status.textColor}`}>
                                                {status.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Package className="h-5 w-5" />
                                <span>Manage Shipments</span>
                            </CardTitle>
                            <CardDescription>
                                View, create, and track all shipments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Go to Shipments
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Customer Management</span>
                            </CardTitle>
                            <CardDescription>
                                Manage customer accounts and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                Manage Customers
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5" />
                                <span>Analytics & Reports</span>
                            </CardTitle>
                            <CardDescription>
                                View performance metrics and insights
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full">
                                View Analytics
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
