import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    DollarSign,
    TrendingUp,
    TrendingDown,
    PieChart,
    Download,
    Calculator,
    Percent,
    Target,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

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

interface Props {
    costData: CostData[];
    totalSpent: number;
    averageCostPerShipment: number;
    totalSavings: number;
    className?: string;
}

export default function CostAnalysisDashboard({ 
    costData, 
    totalSpent, 
    averageCostPerShipment, 
    totalSavings, 
    className = '' 
}: Props) {
    const [viewPeriod, setViewPeriod] = useState<'6months' | '12months' | 'ytd'>('6months');
    const [selectedView, setSelectedView] = useState<'trends' | 'breakdown' | 'savings'>('trends');

    const getFilteredData = () => {
        switch (viewPeriod) {
            case '6months':
                return costData.slice(-6);
            case '12months':
                return costData.slice(-12);
            case 'ytd':
                return costData;
            default:
                return costData.slice(-6);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getMaxValue = (data: CostData[]) => {
        return Math.max(...data.map(d => d.total_cost));
    };

    const getTrendColor = (current: number, previous: number) => {
        if (current > previous) return 'text-red-600';
        if (current < previous) return 'text-green-600';
        return 'text-gray-600';
    };

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) return <ArrowUpRight className="h-4 w-4" />;
        if (current < previous) return <ArrowDownRight className="h-4 w-4" />;
        return null;
    };

    const getPercentageChange = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const filteredData = getFilteredData();
    const maxValue = getMaxValue(filteredData);
    const currentPeriod = filteredData[filteredData.length - 1];
    const previousPeriod = filteredData[filteredData.length - 2];

    const renderTrendsView = () => (
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Monthly Spending Trends</h4>
            
            <div className="space-y-3">
                {filteredData.map((data, index) => {
                    const barWidth = (data.total_cost / maxValue) * 100;
                    const prevData = index > 0 ? filteredData[index - 1] : null;
                    const change = prevData ? getPercentageChange(data.total_cost, prevData.total_cost) : 0;
                    
                    return (
                        <div key={data.period} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">{data.period}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-gray-900">
                                        {formatCurrency(data.total_cost)}
                                    </span>
                                    {prevData && (
                                        <div className={`flex items-center text-xs ${getTrendColor(data.total_cost, prevData.total_cost)}`}>
                                            {getTrendIcon(data.total_cost, prevData.total_cost)}
                                            <span className="ml-1">
                                                {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="relative">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 bg-blue-600 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.max(barWidth, 2)}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Avg per shipment: {formatCurrency(data.cost_per_shipment)}</span>
                                <span>Savings: {formatCurrency(data.savings_from_discounts)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderBreakdownView = () => {
        if (!currentPeriod) return null;
        
        const breakdown = currentPeriod.cost_breakdown;
        const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
        
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Cost Breakdown - {currentPeriod.period}</h4>
                
                <div className="space-y-3">
                    {Object.entries(breakdown).map(([category, amount]) => {
                        const percentage = (amount / total) * 100;
                        const colors = {
                            shipping: 'bg-blue-600',
                            fuel_surcharge: 'bg-orange-600',
                            insurance: 'bg-green-600',
                            customs: 'bg-purple-600',
                            other: 'bg-gray-600',
                        };
                        
                        return (
                            <div key={category} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700 capitalize">
                                        {category.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-gray-900">
                                            {formatCurrency(amount)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                
                                <Progress value={percentage} className="h-2" />
                            </div>
                        );
                    })}
                </div>
                
                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderSavingsView = () => (
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Savings & Discounts</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <Percent className="h-5 w-5 text-green-600" />
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="text-lg font-bold text-green-900">
                        {formatCurrency(totalSavings)}
                    </div>
                    <div className="text-xs text-green-600">Total Savings YTD</div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <Badge className="bg-blue-100 text-blue-800">Potential</Badge>
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                        {formatCurrency(totalSavings * 0.3)}
                    </div>
                    <div className="text-xs text-blue-600">Additional Savings Available</div>
                </div>
            </div>
            
            <div className="space-y-3">
                {filteredData.map((data) => {
                    const savingsRate = (data.savings_from_discounts / data.total_cost) * 100;
                    
                    return (
                        <div key={data.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium text-sm text-gray-900">{data.period}</div>
                                <div className="text-xs text-gray-500">
                                    {savingsRate.toFixed(1)}% savings rate
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-600">
                                    {formatCurrency(data.savings_from_discounts)}
                                </div>
                                <div className="text-xs text-gray-500">saved</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Cost Analysis
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Calculator className="h-4 w-4 mr-1" />
                            Calculator
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>
                    Analyze your shipping costs and identify savings opportunities
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Period and View Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
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
                            variant={selectedView === 'trends' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedView('trends')}
                        >
                            Trends
                        </Button>
                        <Button
                            variant={selectedView === 'breakdown' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedView('breakdown')}
                        >
                            Breakdown
                        </Button>
                        <Button
                            variant={selectedView === 'savings' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedView('savings')}
                        >
                            Savings
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">
                            {formatCurrency(totalSpent)}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">Total Spent</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">
                            {formatCurrency(averageCostPerShipment)}
                        </div>
                        <div className="text-sm text-green-600 mt-1">Avg per Shipment</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-900">
                            {formatCurrency(totalSavings)}
                        </div>
                        <div className="text-sm text-purple-600 mt-1">Total Savings</div>
                    </div>
                </div>

                {/* Dynamic Content */}
                {selectedView === 'trends' && renderTrendsView()}
                {selectedView === 'breakdown' && renderBreakdownView()}
                {selectedView === 'savings' && renderSavingsView()}

                {/* Recommendations */}
                {currentPeriod && previousPeriod && (
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Optimization Tips</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                            {currentPeriod.cost_per_shipment > averageCostPerShipment * 1.1 && (
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <p>
                                        Your cost per shipment is above average. Consider consolidating shipments or using standard service for non-urgent deliveries.
                                    </p>
                                </div>
                            )}
                            
                            <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p>
                                    You've saved {formatCurrency(totalSavings)} this year through discounts and promotions.
                                </p>
                            </div>
                            
                            {currentPeriod.service_costs.express > currentPeriod.service_costs.standard && (
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <p>
                                        Consider using standard shipping for non-urgent deliveries to reduce costs by up to 40%.
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
