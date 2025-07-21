import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertTriangle,
    Target,
    Calendar,
    BarChart3,
    ExternalLink
} from 'lucide-react';

interface PerformanceMetrics {
    on_time_delivery_rate: number;
    average_delivery_time: number; // in hours
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
    metrics: PerformanceMetrics;
    className?: string;
}

export default function DeliveryPerformanceWidget({ metrics, className = '' }: Props) {
    const formatDeliveryTime = (hours: number) => {
        if (hours < 24) {
            return `${Math.round(hours)}h`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round(hours % 24);
            return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
        }
    };

    const getPerformanceColor = (rate: number) => {
        if (rate >= 95) return 'text-green-600';
        if (rate >= 85) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPerformanceGrade = (rate: number) => {
        if (rate >= 95) return { grade: 'A+', color: 'bg-green-100 text-green-800' };
        if (rate >= 90) return { grade: 'A', color: 'bg-green-100 text-green-700' };
        if (rate >= 85) return { grade: 'B+', color: 'bg-yellow-100 text-yellow-800' };
        if (rate >= 80) return { grade: 'B', color: 'bg-yellow-100 text-yellow-700' };
        if (rate >= 75) return { grade: 'C+', color: 'bg-orange-100 text-orange-800' };
        return { grade: 'C', color: 'bg-red-100 text-red-800' };
    };

    const getTrendIcon = () => {
        switch (metrics.performance_trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return <Target className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTrendText = () => {
        const deliveryChange = metrics.total_deliveries_this_month - metrics.total_deliveries_last_month;
        const timeChange = metrics.average_delivery_time - metrics.average_delivery_time_last_month;
        
        if (metrics.performance_trend === 'up') {
            return `+${deliveryChange} deliveries, ${Math.abs(timeChange).toFixed(1)}h faster`;
        } else if (metrics.performance_trend === 'down') {
            return `${deliveryChange} deliveries, ${Math.abs(timeChange).toFixed(1)}h slower`;
        }
        return 'Performance stable';
    };

    const performanceGrade = getPerformanceGrade(metrics.on_time_delivery_rate);

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Delivery Performance
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        Details
                        <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                </CardTitle>
                <CardDescription>
                    Your delivery performance metrics and trends
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Main Performance Score */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className={`text-4xl font-bold ${getPerformanceColor(metrics.on_time_delivery_rate)}`}>
                            {metrics.on_time_delivery_rate.toFixed(1)}%
                        </div>
                        <Badge className={performanceGrade.color}>
                            {performanceGrade.grade}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">On-Time Delivery Rate</p>
                    
                    <Progress 
                        value={metrics.on_time_delivery_rate} 
                        className="h-2 mb-2"
                    />
                    
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        {getTrendIcon()}
                        <span>{getTrendText()}</span>
                    </div>
                </div>

                {/* Performance Breakdown */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-gray-600">Early</span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                            {metrics.early_deliveries}
                        </div>
                        <div className="text-xs text-gray-500">
                            {((metrics.early_deliveries / (metrics.early_deliveries + metrics.on_time_deliveries + metrics.late_deliveries)) * 100).toFixed(1)}%
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <Target className="h-4 w-4 text-blue-600 mr-1" />
                            <span className="text-sm font-medium text-gray-600">On Time</span>
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                            {metrics.on_time_deliveries}
                        </div>
                        <div className="text-xs text-gray-500">
                            {((metrics.on_time_deliveries / (metrics.early_deliveries + metrics.on_time_deliveries + metrics.late_deliveries)) * 100).toFixed(1)}%
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                            <span className="text-sm font-medium text-gray-600">Late</span>
                        </div>
                        <div className="text-lg font-bold text-red-600">
                            {metrics.late_deliveries}
                        </div>
                        <div className="text-xs text-gray-500">
                            {((metrics.late_deliveries / (metrics.early_deliveries + metrics.on_time_deliveries + metrics.late_deliveries)) * 100).toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
                            <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg. Delivery Time</p>
                            <p className="text-lg font-bold text-gray-900">
                                {formatDeliveryTime(metrics.average_delivery_time)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-lg font-bold text-gray-900">
                                {metrics.total_deliveries_this_month} deliveries
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customer Satisfaction Score (if available) */}
                {metrics.customer_satisfaction_score && (
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
                            <span className="text-sm font-bold text-gray-900">
                                {metrics.customer_satisfaction_score.toFixed(1)}/5.0
                            </span>
                        </div>
                        <Progress 
                            value={(metrics.customer_satisfaction_score / 5) * 100} 
                            className="h-2"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
