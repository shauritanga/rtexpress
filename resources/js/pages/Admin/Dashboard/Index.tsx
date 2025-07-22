import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    MobileChartCard,
    MobileActivityFeed
} from '@/components/ui/mobile-dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

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
                    {/* ✅ REMOVED - Actions don't belong on dashboards */}
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            Last updated: {new Date().toLocaleTimeString()}
                        </p>
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



                {/* ✅ SHIPMENT TRENDS BAR CHART - Mobile Optimized */}
                <MobileChartCard
                    title="Shipment Volume Trends"
                    description="Daily shipment volume over the last 7 days"
                    height="md"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { day: 'Mon', shipments: 45, delivered: 42 },
                                { day: 'Tue', shipments: 52, delivered: 48 },
                                { day: 'Wed', shipments: 38, delivered: 35 },
                                { day: 'Thu', shipments: 61, delivered: 58 },
                                { day: 'Fri', shipments: 55, delivered: 52 },
                                { day: 'Sat', shipments: 28, delivered: 26 },
                                { day: 'Sun', shipments: 33, delivered: 31 }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="day"
                                stroke="#666"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#666"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar dataKey="shipments" fill="#3b82f6" name="Total Shipments" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="delivered" fill="#10b981" name="Delivered" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </MobileChartCard>

                {/* ✅ SHIPMENT STATUS DISTRIBUTION - Mobile Optimized */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                    <MobileChartCard
                        title="Shipment Status Distribution"
                        description="Current status breakdown"
                        height="md"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'In Transit', value: stats.in_transit_shipments || 0, color: '#3b82f6' },
                                        { name: 'Delivered', value: stats.delivered_shipments || 0, color: '#10b981' },
                                        { name: 'Pending', value: (stats.total_shipments - (stats.in_transit_shipments || 0) - (stats.delivered_shipments || 0) - (stats.overdue_shipments || 0)) || 0, color: '#f59e0b' },
                                        { name: 'Overdue', value: stats.overdue_shipments || 0, color: '#ef4444' }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {[
                                        { name: 'In Transit', value: stats.in_transit_shipments || 0, color: '#3b82f6' },
                                        { name: 'Delivered', value: stats.delivered_shipments || 0, color: '#10b981' },
                                        { name: 'Pending', value: (stats.total_shipments - (stats.in_transit_shipments || 0) - (stats.delivered_shipments || 0) - (stats.overdue_shipments || 0)) || 0, color: '#f59e0b' },
                                        { name: 'Overdue', value: stats.overdue_shipments || 0, color: '#ef4444' }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </MobileChartCard>

                    <MobileChartCard
                        title="Performance Trends"
                        description="Weekly performance metrics"
                        height="md"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={[
                                    { week: 'W1', onTime: 94, revenue: 45000 },
                                    { week: 'W2', onTime: 92, revenue: 48000 },
                                    { week: 'W3', onTime: 96, revenue: 52000 },
                                    { week: 'W4', onTime: 89, revenue: 47000 },
                                    { week: 'W5', onTime: 95, revenue: 55000 },
                                    { week: 'W6', onTime: 97, revenue: 58000 }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="week"
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="onTime"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                                    name="On-Time Rate (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </MobileChartCard>
                </div>

                {/* ✅ CRITICAL ALERTS - Compact Mobile Design */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-lg">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span>Critical Alerts</span>
                        </CardTitle>
                        <CardDescription>
                            Issues requiring immediate attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {stats.overdue_shipments > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border-l-4 border-l-red-500">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-red-800">
                                            {stats.overdue_shipments} Delayed Shipments
                                        </p>
                                        <p className="text-xs text-red-600">
                                            Require immediate attention
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="destructive" className="text-xs">
                                    {stats.overdue_shipments}
                                </Badge>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border-l-4 border-l-green-500">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        System Operational
                                    </p>
                                    <p className="text-xs text-green-600">
                                        All services running normally
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                Online
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* ✅ RECENT ACTIVITY FEED - Mobile Optimized */}
                <MobileActivityFeed
                    title="Recent Activity"
                    items={[
                        {
                            id: '1',
                            type: 'success',
                            title: 'Shipment Delivered',
                            description: `RT${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')} delivered to New York`,
                            timestamp: '2 minutes ago',
                            icon: CheckCircle
                        },
                        {
                            id: '2',
                            type: 'info',
                            title: 'New Shipment',
                            description: `RT${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')} created for Los Angeles`,
                            timestamp: '15 minutes ago',
                            icon: Package
                        },
                        {
                            id: '3',
                            type: 'success',
                            title: 'Issue Resolved',
                            description: 'Weather delay resolved for Chicago route',
                            timestamp: '1 hour ago',
                            icon: CheckCircle
                        },
                        {
                            id: '4',
                            type: 'warning',
                            title: 'Warehouse Alert',
                            description: 'NYC warehouse at 85% capacity',
                            timestamp: '2 hours ago',
                            icon: AlertTriangle
                        }
                    ]}
                    maxItems={4}
                    showViewAll={true}
                    onViewAll={() => console.log('View all activity')}
                />
            </div>
        </AppLayout>
    );
}
