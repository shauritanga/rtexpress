import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    AlertTriangle,
    BarChart3,
    TrendingUp
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
    contact_person: string;
    email: string;
    phone: string;
}

interface Shipment {
    id: number;
    tracking_number: string;
    status: string;
    service_type: string;
    recipient_name: string;
    recipient_address: string;
    declared_value: number;
    created_at: string;
    estimated_delivery_date?: string;
}

interface Stats {
    total_shipments: number;
    active_shipments: number;
    delivered_shipments: number;
    pending_shipments: number;
}



interface DashboardData {
    weekly_shipments: Array<{
        day: string;
        shipments: number;
    }>;
    status_distribution: Array<{
        name: string;
        value: number;
        color: string;
    }>;
}

interface Props {
    customer: Customer;
    stats: Stats;
    activeShipments: Shipment[];
    dashboardData: DashboardData;
}

export default function CustomerDashboard({
    customer,
    stats,
    activeShipments,
    dashboardData
}: Props) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            picked_up: { label: 'Picked Up', variant: 'default' as const, icon: Package },
            in_transit: { label: 'In Transit', variant: 'default' as const, icon: Truck },
            out_for_delivery: { label: 'Out for Delivery', variant: 'default' as const, icon: Truck },
            delivered: { label: 'Delivered', variant: 'success' as const, icon: CheckCircle },
            exception: { label: 'Exception', variant: 'destructive' as const, icon: AlertTriangle },
            cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: Package };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-6 px-4 sm:px-6 lg:px-8 pb-8">
                {/* Dashboard Header - Overview Only */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {customer.company_name} • Your shipping statistics and insights
                    </p>
                </div>

                {/* Modern Stats Cards with Visual Elements */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Shipments */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_shipments}</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                        <span className="text-sm text-green-600 font-medium">+12% this month</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                        </CardContent>
                    </Card>

                    {/* Active Shipments */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_shipments}</p>
                                    <div className="flex items-center mt-2">
                                        <Clock className="h-4 w-4 text-orange-600 mr-1" />
                                        <span className="text-sm text-gray-600">In transit</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Truck className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600"></div>
                        </CardContent>
                    </Card>

                    {/* Delivered */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.delivered_shipments}</p>
                                    <div className="flex items-center mt-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                        <span className="text-sm text-green-600 font-medium">95% on-time</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"></div>
                        </CardContent>
                    </Card>

                    {/* Pending */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending_shipments}</p>
                                    <div className="flex items-center mt-2">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                                        <span className="text-sm text-gray-600">Awaiting pickup</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-600"></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Shipments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Truck className="h-5 w-5 mr-2" />
                            Active Shipments
                        </CardTitle>
                        <CardDescription>
                            Track your shipments currently in transit
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeShipments.length > 0 ? (
                            <div className="space-y-4">
                                {activeShipments.map((shipment) => (
                                    <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{shipment.tracking_number}</p>
                                                    <p className="text-sm text-gray-600">{shipment.recipient_name}</p>
                                                </div>
                                                {getStatusBadge(shipment.status)}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{shipment.recipient_address}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatCurrency(shipment.declared_value)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(shipment.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No active shipments</p>
                                <p className="text-sm text-gray-400 mt-2">Shipment data will appear here once you start shipping</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dashboard Charts & Visualizations */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Weekly Shipments Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                                Weekly Activity
                            </CardTitle>
                            <CardDescription>
                                Your shipment activity over the past week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dashboardData.weekly_shipments}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [`${value} shipments`, 'Shipments']}
                                            labelFormatter={(label) => `Day: ${label}`}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="shipments"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            fillOpacity={0.3}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="h-5 w-5 mr-2 text-green-600" />
                                Shipment Status
                            </CardTitle>
                            <CardDescription>
                                Current distribution of your shipments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dashboardData.status_distribution}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
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

                {/* Recent Shipments Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="h-5 w-5 mr-2 text-blue-600" />
                            Recent Shipments
                        </CardTitle>
                        <CardDescription>
                            Latest shipment activity and status overview
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeShipments.length > 0 ? (
                            <div className="space-y-3">
                                {activeShipments.slice(0, 5).map((shipment) => (
                                    <div key={shipment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Package className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{shipment.tracking_number}</p>
                                                <p className="text-sm text-gray-600">{shipment.recipient_name}</p>
                                                <p className="text-xs text-gray-500">{shipment.recipient_address}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(shipment.status)}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(shipment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No recent shipments</p>
                                <p className="text-sm text-gray-400 mt-2">Shipment data will appear here once you start shipping</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Performance Insights */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Delivery Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                                Delivery Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">95.2%</div>
                                    <p className="text-sm text-gray-600">On-Time Delivery Rate</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Early Deliveries</span>
                                        <span className="font-medium">12%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">On-Time</span>
                                        <span className="font-medium">83%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Late Deliveries</span>
                                        <span className="font-medium">5%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Average Delivery Time */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                                Delivery Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">2.3</div>
                                    <p className="text-sm text-gray-600">Average Days</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Express</span>
                                        <span className="font-medium">1.2 days</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Standard</span>
                                        <span className="font-medium">2.8 days</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">International</span>
                                        <span className="font-medium">5.1 days</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                                This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">{stats.total_shipments}</div>
                                    <p className="text-sm text-gray-600">Total Shipments</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Growth vs Last Month</span>
                                        <span className="font-medium text-green-600">+12%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Most Used Service</span>
                                        <span className="font-medium">Standard</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Peak Day</span>
                                        <span className="font-medium">Wednesday</span>
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
