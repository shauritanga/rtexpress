import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, BarChart3, Calendar, CheckCircle, Clock, DollarSign, Package, PieChart, TrendingUp, Truck } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
}

interface SimpleStats {
    total_shipments: number;
    this_month_shipments: number;
    total_spent: number;
    this_month_spent: number;
    on_time_rate: number;
    average_delivery_days: number;
    pending_shipments: number;
    delivered_shipments: number;
}

interface ChartData {
    monthly_shipments: Array<{
        month: string;
        shipments: number;
        cost: number;
    }>;
    status_breakdown: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    service_breakdown: Array<{
        name: string;
        value: number;
        color: string;
    }>;
}

interface Props {
    customer: Customer;
    stats: SimpleStats;
    chartData: ChartData;
}

export default function AnalyticsIndex({ customer, stats, chartData }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

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

    const currentMonth = new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    // Simple calculations for visual indicators
    const monthlyGrowth =
        stats.total_shipments > stats.this_month_shipments
            ? (stats.this_month_shipments / (stats.total_shipments - stats.this_month_shipments)) * 100
            : 0;

    const avgCostPerShipment = stats.total_shipments > 0 ? stats.total_spent / stats.total_shipments : 0;

    // Ensure chart data is properly formatted with fallbacks
    const safeChartData = {
        monthly_shipments: chartData?.monthly_shipments || [],
        status_breakdown: Array.isArray(chartData?.status_breakdown) ? chartData.status_breakdown : [{ name: 'No Data', value: 1, color: '#e5e7eb' }],
        service_breakdown: Array.isArray(chartData?.service_breakdown)
            ? chartData.service_breakdown
            : [{ name: 'Standard', value: 1, color: '#3b82f6' }],
    };

    return (
        <AppLayout>
            <Head title="Analytics Dashboard" />

            <div className="space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center text-2xl font-bold text-gray-900">
                            <BarChart3 className="mr-2 h-6 w-6 text-blue-600" />
                            Analytics Dashboard
                        </h1>
                        <p className="mt-1 text-gray-600">
                            {customer.company_name} • {currentMonth}
                        </p>
                    </div>
                </div>

                {/* Key Metrics - Compact */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Shipments</p>
                                    <p className="text-2xl font-bold">{stats.total_shipments.toLocaleString()}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Spent</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.total_spent)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">On-Time Rate</p>
                                    <p className="text-2xl font-bold">{stats.on_time_rate.toFixed(1)}%</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avg Delivery</p>
                                    <p className="text-2xl font-bold">{stats.average_delivery_days.toFixed(1)} days</p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Monthly Shipments Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                                Monthly Shipments Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={safeChartData.monthly_shipments}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                name === 'shipments' ? `${value} shipments` : formatCurrency(value as number),
                                                name === 'shipments' ? 'Shipments' : 'Cost',
                                            ]}
                                            labelFormatter={(label) => `Month: ${label}`}
                                        />
                                        <Area type="monotone" dataKey="shipments" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipment Status Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <PieChart className="mr-2 h-5 w-5 text-green-600" />
                                Shipment Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={safeChartData.status_breakdown}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {safeChartData.status_breakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Service Type & Cost Analysis */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Service Type Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Truck className="mr-2 h-5 w-5 text-purple-600" />
                                Service Types
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={safeChartData.service_breakdown}>
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

                    {/* Monthly Cost Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                                Monthly Spending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={safeChartData.monthly_shipments}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value) => formatCurrencyShort(value)} />
                                        <Tooltip
                                            formatter={(value) => [formatCurrency(value as number), 'Cost']}
                                            labelFormatter={(label) => `Month: ${label}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="cost"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Status Overview */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* This Month Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                                This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Shipments</span>
                                    <span className="font-semibold">{stats.this_month_shipments}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Spending</span>
                                    <span className="font-semibold">{formatCurrency(stats.this_month_spent)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Pending</span>
                                    <span className="font-semibold text-orange-600">{stats.pending_shipments}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Delivered</span>
                                    <span className="font-semibold text-green-600">{stats.delivered_shipments}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                                Quick Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Performance Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Performance</span>
                                    {stats.on_time_rate >= 95 ? (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="mr-1 h-4 w-4" />
                                            <span className="font-semibold">Excellent</span>
                                        </div>
                                    ) : stats.on_time_rate >= 85 ? (
                                        <div className="flex items-center text-yellow-600">
                                            <Clock className="mr-1 h-4 w-4" />
                                            <span className="font-semibold">Good</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-red-600">
                                            <AlertTriangle className="mr-1 h-4 w-4" />
                                            <span className="font-semibold">Needs Attention</span>
                                        </div>
                                    )}
                                </div>

                                {/* Growth Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Growth</span>
                                    {monthlyGrowth > 10 ? (
                                        <div className="flex items-center text-green-600">
                                            <TrendingUp className="mr-1 h-4 w-4" />
                                            <span className="font-semibold">Strong</span>
                                        </div>
                                    ) : monthlyGrowth > 0 ? (
                                        <div className="flex items-center text-blue-600">
                                            <TrendingUp className="mr-1 h-4 w-4" />
                                            <span className="font-semibold">Steady</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-600">
                                            <span className="font-semibold">Stable</span>
                                        </div>
                                    )}
                                </div>

                                {/* Cost Efficiency */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Cost per Shipment</span>
                                    <span className="font-semibold">{formatCurrency(avgCostPerShipment)}</span>
                                </div>

                                {/* Active Shipments */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Active Shipments</span>
                                    <div className="flex items-center text-blue-600">
                                        <Truck className="mr-1 h-4 w-4" />
                                        <span className="font-semibold">{stats.pending_shipments}</span>
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
