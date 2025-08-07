import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

import {
    Package,
    TrendingUp,
    Users,
    Warehouse,
    AlertTriangle,
    CheckCircle,
    Clock,
    Truck,
    DollarSign,
    BarChart3,
    Activity,
    Target,
    Calendar
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
    revenue_this_month: number;
    revenue_last_month: number;
    avg_delivery_time: number;
    on_time_delivery_rate: number;
}

interface DashboardData {
    daily_shipments: Array<{
        date: string;
        shipments: number;
        revenue: number;
    }>;
    status_distribution: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    service_type_distribution: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    warehouse_performance: Array<{
        name: string;
        shipments: number;
        efficiency: number;
    }>;
}

interface Props {
    stats: DashboardStats;
    dashboardData: DashboardData;
}

export default function AdminDashboard({ stats, dashboardData }: Props) {

    // Calculate performance metrics
    const revenueGrowth = stats.revenue_last_month > 0
        ? ((stats.revenue_this_month - stats.revenue_last_month) / stats.revenue_last_month * 100).toFixed(1)
        : 0;

    const formatCurrencyShort = (amount: number) => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1)}B TZS`;
        } else if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M TZS`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K TZS`;
        } else {
            return `${amount.toFixed(0)} TZS`;
        }
    };

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-4 md:p-6 pb-8">
                {/* Dashboard Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        RT Express Operations Overview & Analytics
                    </p>
                </div>

                {/* Key Performance Indicators */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Shipments */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_shipments.toLocaleString()}</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                                        <span className="text-sm text-gray-600">All time total</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                        </CardContent>
                    </Card>

                    {/* Revenue Today */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Revenue Today</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrencyShort(stats.revenue_today)}</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                        <span className={`text-sm font-medium ${Number(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Number(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}% vs last month
                                        </span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"></div>
                        </CardContent>
                    </Card>

                    {/* Active Customers */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Customers</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_customers.toLocaleString()}</p>
                                    <div className="flex items-center mt-2">
                                        <Users className="h-4 w-4 text-purple-600 mr-1" />
                                        <span className="text-sm text-gray-600">With shipments</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600"></div>
                        </CardContent>
                    </Card>

                    {/* On-Time Delivery */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.on_time_delivery_rate.toFixed(1)}%</p>
                                    <div className="flex items-center mt-2">
                                        <Target className="h-4 w-4 text-orange-600 mr-1" />
                                        <span className="text-sm text-gray-600">{stats.avg_delivery_time.toFixed(1)} avg days</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600"></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Visualizations */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Daily Shipments & Revenue Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                                Daily Performance
                            </CardTitle>
                            <CardDescription>
                                Shipments and revenue over the last 7 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dashboardData.daily_shipments}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrencyShort(value)} />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                name === 'shipments' ? `${value} shipments` : formatCurrency(value as number),
                                                name === 'shipments' ? 'Shipments' : 'Revenue'
                                            ]}
                                            labelFormatter={(label) => `Date: ${label}`}
                                        />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="shipments"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            fillOpacity={0.3}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipment Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-green-600" />
                                Status Distribution
                            </CardTitle>
                            <CardDescription>
                                Current breakdown of all shipments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dashboardData.status_distribution}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {dashboardData.status_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>



                {/* Service Type & Warehouse Performance */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Service Type Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="h-5 w-5 mr-2 text-purple-600" />
                                Service Types
                            </CardTitle>
                            <CardDescription>
                                Distribution of shipments by service type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData.service_type_distribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`${value} shipments`, 'Count']}
                                            labelFormatter={(label) => `Service: ${label}`}
                                        />
                                        <Bar dataKey="value" fill="#8b5cf6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warehouse Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Warehouse className="h-5 w-5 mr-2 text-indigo-600" />
                                Warehouse Performance
                            </CardTitle>
                            <CardDescription>
                                Shipment volume and efficiency by warehouse
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dashboardData.warehouse_performance.map((warehouse, index) => (
                                    <div key={warehouse.name} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{warehouse.name}</span>
                                            <span className="text-sm text-gray-600">{warehouse.shipments} shipments</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={warehouse.efficiency} className="flex-1" />
                                            <span className="text-sm font-medium text-gray-900">{warehouse.efficiency}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Operational Insights */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Current Status Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                                Current Status
                            </CardTitle>
                            <CardDescription>
                                Real-time shipment status breakdown
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-900">Pending</span>
                                    </div>
                                    <span className="text-xl font-bold text-yellow-600">{stats.pending_shipments}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <Truck className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-900">In Transit</span>
                                    </div>
                                    <span className="text-xl font-bold text-blue-600">{stats.in_transit_shipments}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-900">Delivered</span>
                                    </div>
                                    <span className="text-xl font-bold text-green-600">{stats.delivered_shipments}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-gray-900">Overdue</span>
                                    </div>
                                    <span className="text-xl font-bold text-red-600">{stats.overdue_shipments}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="h-5 w-5 mr-2 text-green-600" />
                                Performance Metrics
                            </CardTitle>
                            <CardDescription>
                                Key operational performance indicators
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">On-Time Delivery</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.on_time_delivery_rate.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={stats.on_time_delivery_rate} className="h-2" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">Average Delivery Time</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.avg_delivery_time.toFixed(1)} days</span>
                                    </div>
                                    <Progress value={Math.max(0, 100 - (stats.avg_delivery_time * 10))} className="h-2" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">Total Warehouses</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.total_warehouses}</span>
                                    </div>
                                    <Progress value={Math.min(100, (stats.total_warehouses / 10) * 100)} className="h-2" />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600">Active Customers</span>
                                        <span className="text-sm font-bold text-gray-900">{stats.active_customers}</span>
                                    </div>
                                    <Progress value={Math.min(100, (stats.active_customers / 100) * 100)} className="h-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                                Revenue Insights
                            </CardTitle>
                            <CardDescription>
                                Financial performance overview
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{formatCurrencyShort(stats.revenue_today)}</div>
                                    <p className="text-sm text-gray-600">Today's Revenue</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">This Month</span>
                                        <span className="text-sm font-medium">{formatCurrencyShort(stats.revenue_this_month)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Last Month</span>
                                        <span className="text-sm font-medium">{formatCurrencyShort(stats.revenue_last_month)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Growth</span>
                                        <span className={`text-sm font-medium ${Number(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Number(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Avg per Shipment</span>
                                        <span className="text-sm font-medium">
                                            {formatCurrencyShort(stats.total_shipments > 0 ? stats.revenue_this_month / stats.total_shipments : 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
