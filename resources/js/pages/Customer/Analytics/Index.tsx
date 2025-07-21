import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ShippingVolumeTrends from '@/components/customer/ShippingVolumeTrends';
import CostAnalysisDashboard from '@/components/customer/CostAnalysisDashboard';
import DeliveryPerformanceWidget from '@/components/customer/DeliveryPerformanceWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    BarChart3,
    Download,
    Calendar,
    TrendingUp,
    DollarSign,
    Package
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
    contact_person: string;
}

interface VolumeData {
    period: string;
    shipments: number;
    growth_rate: number;
    service_breakdown: {
        express: number;
        standard: number;
        overnight: number;
        international: number;
    };
}

interface CostData {
    period: string;
    total_cost: number;
    cost_per_shipment: number;
    savings_from_discounts: number;
    service_costs: {
        express: number;
        standard: number;
        overnight: number;
        international: number;
    };
    cost_breakdown: {
        shipping: number;
        fuel_surcharge: number;
        insurance: number;
        customs: number;
        other: number;
    };
}

interface PerformanceMetrics {
    on_time_delivery_rate: number;
    average_delivery_time: number;
    total_deliveries_this_month: number;
    total_deliveries_last_month: number;
    early_deliveries: number;
    on_time_deliveries: number;
    late_deliveries: number;
    average_delivery_time_last_month: number;
    performance_trend: 'up' | 'down' | 'stable';
    customer_satisfaction_score?: number;
}

interface Props {
    customer: Customer;
    volumeData: VolumeData[];
    costData: CostData[];
    performanceMetrics: PerformanceMetrics;
    totalShipments: number;
    averageMonthlyGrowth: number;
    totalSpent: number;
    averageCostPerShipment: number;
    totalSavings: number;
}

export default function CustomerAnalytics({ 
    customer,
    volumeData,
    costData,
    performanceMetrics,
    totalShipments,
    averageMonthlyGrowth,
    totalSpent,
    averageCostPerShipment,
    totalSavings
}: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const currentMonth = new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });

    return (
        <AppLayout>
            <Head title="Analytics" />
            
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                                <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                                Analytics Dashboard
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • Comprehensive shipping insights for {currentMonth}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-2">
                            <Button variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                Date Range
                            </Button>
                            <Button>
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Overview */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalShipments.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {averageMonthlyGrowth > 0 ? '+' : ''}{averageMonthlyGrowth.toFixed(1)}% growth
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatCurrency(averageCostPerShipment)} avg per shipment
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {performanceMetrics.on_time_delivery_rate.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {performanceMetrics.performance_trend === 'up' ? '↗' : 
                                         performanceMetrics.performance_trend === 'down' ? '↘' : '→'} 
                                        {performanceMetrics.performance_trend}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Savings</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSavings)}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {((totalSavings / totalSpent) * 100).toFixed(1)}% of total spend
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Components */}
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                    {/* Shipping Volume Trends */}
                    <ShippingVolumeTrends 
                        volumeData={volumeData}
                        totalShipments={totalShipments}
                        averageMonthlyGrowth={averageMonthlyGrowth}
                        className="xl:col-span-1"
                    />

                    {/* Cost Analysis Dashboard */}
                    <CostAnalysisDashboard 
                        costData={costData}
                        totalSpent={totalSpent}
                        averageCostPerShipment={averageCostPerShipment}
                        totalSavings={totalSavings}
                        className="xl:col-span-1"
                    />
                </div>

                {/* Delivery Performance - Full Width */}
                <DeliveryPerformanceWidget 
                    metrics={performanceMetrics}
                    className="w-full"
                />

                {/* Additional Insights */}
                <Card>
                    <CardHeader>
                        <CardTitle>Business Insights & Recommendations</CardTitle>
                        <CardDescription>
                            AI-powered insights to optimize your shipping strategy
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Volume Optimization</h4>
                                <p className="text-sm text-blue-800">
                                    {averageMonthlyGrowth > 10 
                                        ? "Your shipping volume is growing rapidly. Consider negotiating volume discounts for better rates."
                                        : averageMonthlyGrowth > 0
                                        ? "Steady growth detected. You're on track for higher volume tiers with better pricing."
                                        : "Volume has been stable. Consider promotional campaigns to drive growth."
                                    }
                                </p>
                            </div>
                            
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Cost Savings</h4>
                                <p className="text-sm text-green-800">
                                    You've saved {formatCurrency(totalSavings)} this year. 
                                    {totalSavings / totalSpent < 0.1 
                                        ? " Consider using more standard shipping options to increase savings."
                                        : " Great job optimizing your shipping costs!"
                                    }
                                </p>
                            </div>
                            
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="font-medium text-purple-900 mb-2">Performance</h4>
                                <p className="text-sm text-purple-800">
                                    {performanceMetrics.on_time_delivery_rate > 95
                                        ? "Excellent delivery performance! Your customers are getting reliable service."
                                        : performanceMetrics.on_time_delivery_rate > 85
                                        ? "Good delivery performance with room for improvement. Consider premium services for critical shipments."
                                        : "Delivery performance needs attention. Let's discuss service upgrades to improve reliability."
                                    }
                                </p>
                            </div>
                            
                            <div className="p-4 bg-orange-50 rounded-lg">
                                <h4 className="font-medium text-orange-900 mb-2">Service Mix</h4>
                                <p className="text-sm text-orange-800">
                                    {costData.length > 0 && costData[costData.length - 1].service_costs.express > costData[costData.length - 1].service_costs.standard
                                        ? "You're using more express services. Consider standard shipping for non-urgent deliveries to reduce costs."
                                        : "Good balance of service types. You're optimizing for both cost and speed effectively."
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
