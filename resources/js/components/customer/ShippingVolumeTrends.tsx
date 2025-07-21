import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    Filter,
    Package,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

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

interface Props {
    volumeData: VolumeData[];
    totalShipments: number;
    averageMonthlyGrowth: number;
    className?: string;
}

export default function ShippingVolumeTrends({ 
    volumeData, 
    totalShipments, 
    averageMonthlyGrowth, 
    className = '' 
}: Props) {
    const [viewPeriod, setViewPeriod] = useState<'6months' | '12months' | 'ytd'>('6months');
    const [selectedMetric, setSelectedMetric] = useState<'volume' | 'growth'>('volume');

    const getFilteredData = () => {
        switch (viewPeriod) {
            case '6months':
                return volumeData.slice(-6);
            case '12months':
                return volumeData.slice(-12);
            case 'ytd':
                return volumeData;
            default:
                return volumeData.slice(-6);
        }
    };

    const getMaxValue = (data: VolumeData[]) => {
        return Math.max(...data.map(d => d.shipments));
    };

    const getGrowthColor = (growth: number) => {
        if (growth > 0) return 'text-green-600';
        if (growth < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <ArrowUpRight className="h-4 w-4" />;
        if (growth < 0) return <ArrowDownRight className="h-4 w-4" />;
        return null;
    };

    const formatGrowth = (growth: number) => {
        const sign = growth > 0 ? '+' : '';
        return `${sign}${growth.toFixed(1)}%`;
    };

    const getServiceTypeColor = (serviceType: string) => {
        const colors = {
            express: 'bg-red-100 text-red-800',
            standard: 'bg-blue-100 text-blue-800',
            overnight: 'bg-purple-100 text-purple-800',
            international: 'bg-green-100 text-green-800',
        };
        return colors[serviceType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const filteredData = getFilteredData();
    const maxValue = getMaxValue(filteredData);

    const currentPeriodData = filteredData[filteredData.length - 1];
    const previousPeriodData = filteredData[filteredData.length - 2];

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Shipping Volume Trends
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-1" />
                            Filter
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>
                    Track your shipping volume patterns and growth trends
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Period Selection */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={viewPeriod === '6months' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewPeriod('6months')}
                        >
                            6 Months
                        </Button>
                        <Button
                            variant={viewPeriod === '12months' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewPeriod('12months')}
                        >
                            12 Months
                        </Button>
                        <Button
                            variant={viewPeriod === 'ytd' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewPeriod('ytd')}
                        >
                            YTD
                        </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={selectedMetric === 'volume' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedMetric('volume')}
                        >
                            Volume
                        </Button>
                        <Button
                            variant={selectedMetric === 'growth' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedMetric('growth')}
                        >
                            Growth
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <Package className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-800">Total Shipments</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{totalShipments.toLocaleString()}</div>
                        <div className="text-xs text-blue-600 mt-1">This period</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">Avg. Growth</span>
                        </div>
                        <div className={`text-2xl font-bold ${getGrowthColor(averageMonthlyGrowth)}`}>
                            {formatGrowth(averageMonthlyGrowth)}
                        </div>
                        <div className="text-xs text-green-600 mt-1">Monthly average</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-800">Current Month</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                            {currentPeriodData?.shipments.toLocaleString() || '0'}
                        </div>
                        <div className={`text-xs mt-1 flex items-center justify-center ${getGrowthColor(currentPeriodData?.growth_rate || 0)}`}>
                            {getGrowthIcon(currentPeriodData?.growth_rate || 0)}
                            <span className="ml-1">{formatGrowth(currentPeriodData?.growth_rate || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">
                        {selectedMetric === 'volume' ? 'Monthly Shipment Volume' : 'Monthly Growth Rate'}
                    </h4>
                    
                    <div className="space-y-3">
                        {filteredData.map((data, index) => {
                            const value = selectedMetric === 'volume' ? data.shipments : Math.abs(data.growth_rate);
                            const maxVal = selectedMetric === 'volume' ? maxValue : 50; // Max 50% for growth
                            const barWidth = (value / maxVal) * 100;
                            
                            return (
                                <div key={data.period} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">{data.period}</span>
                                        <div className="flex items-center space-x-2">
                                            {selectedMetric === 'volume' ? (
                                                <span className="font-bold text-gray-900">
                                                    {data.shipments.toLocaleString()}
                                                </span>
                                            ) : (
                                                <div className={`flex items-center ${getGrowthColor(data.growth_rate)}`}>
                                                    {getGrowthIcon(data.growth_rate)}
                                                    <span className="font-bold ml-1">
                                                        {formatGrowth(data.growth_rate)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="relative">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    selectedMetric === 'volume' 
                                                        ? 'bg-blue-600' 
                                                        : data.growth_rate >= 0 
                                                            ? 'bg-green-600' 
                                                            : 'bg-red-600'
                                                }`}
                                                style={{ width: `${Math.max(barWidth, 2)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    {selectedMetric === 'volume' && (
                                        <div className="flex items-center space-x-2 text-xs">
                                            {Object.entries(data.service_breakdown).map(([service, count]) => (
                                                <Badge key={service} className={`${getServiceTypeColor(service)} text-xs`}>
                                                    {service}: {count}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Insights */}
                {previousPeriodData && currentPeriodData && (
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Key Insights</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p>
                                    Your shipping volume {currentPeriodData.growth_rate > 0 ? 'increased' : 'decreased'} by{' '}
                                    <span className={`font-medium ${getGrowthColor(currentPeriodData.growth_rate)}`}>
                                        {Math.abs(currentPeriodData.growth_rate).toFixed(1)}%
                                    </span>{' '}
                                    compared to last month
                                </p>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p>
                                    Most popular service: <span className="font-medium">
                                        {Object.entries(currentPeriodData.service_breakdown)
                                            .sort(([,a], [,b]) => b - a)[0][0]}
                                    </span> ({Object.entries(currentPeriodData.service_breakdown)
                                        .sort(([,a], [,b]) => b - a)[0][1]} shipments)
                                </p>
                            </div>
                            
                            {averageMonthlyGrowth > 5 && (
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <p>
                                        Strong growth trend detected! Consider upgrading your service plan for better rates.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
