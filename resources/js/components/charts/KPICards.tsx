import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    TrendingUp, 
    TrendingDown, 
    Package, 
    Users, 
    Clock, 
    CheckCircle,
    AlertTriangle,
    Banknote,
    Truck,
    Target
} from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
        period: string;
    };
    icon?: React.ComponentType<{ className?: string }>;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
    size?: 'sm' | 'md' | 'lg';
}

export function KPICard({ 
    title, 
    value, 
    description, 
    trend, 
    icon: Icon = Package,
    color = 'blue',
    size = 'md'
}: KPICardProps) {
    const colorClasses = {
        blue: {
            icon: 'text-blue-600 bg-blue-100',
            trend: 'text-blue-600',
            accent: 'border-l-blue-500'
        },
        green: {
            icon: 'text-green-600 bg-green-100',
            trend: 'text-green-600',
            accent: 'border-l-green-500'
        },
        yellow: {
            icon: 'text-yellow-600 bg-yellow-100',
            trend: 'text-yellow-600',
            accent: 'border-l-yellow-500'
        },
        red: {
            icon: 'text-red-600 bg-red-100',
            trend: 'text-red-600',
            accent: 'border-l-red-500'
        },
        purple: {
            icon: 'text-purple-600 bg-purple-100',
            trend: 'text-purple-600',
            accent: 'border-l-purple-500'
        },
        orange: {
            icon: 'text-orange-600 bg-orange-100',
            trend: 'text-orange-600',
            accent: 'border-l-orange-500'
        }
    };

    const sizeClasses = {
        sm: {
            card: 'p-3',
            icon: 'h-6 w-6 p-1',
            value: 'text-lg',
            title: 'text-xs'
        },
        md: {
            card: 'p-4',
            icon: 'h-8 w-8 p-1.5',
            value: 'text-xl',
            title: 'text-sm'
        },
        lg: {
            card: 'p-5',
            icon: 'h-10 w-10 p-2',
            value: 'text-2xl',
            title: 'text-base'
        }
    };

    const colors = colorClasses[color];
    const sizes = sizeClasses[size];

    return (
        <Card className={`hover:shadow-md transition-shadow border-l-4 ${colors.accent}`}>
            <CardContent className={sizes.card}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className={`rounded-full ${colors.icon} ${sizes.icon} flex-shrink-0`}>
                                <Icon className="h-full w-full" />
                            </div>
                            <CardTitle className={`${sizes.title} font-medium text-gray-600`}>
                                {title}
                            </CardTitle>
                        </div>

                        <div className={`${sizes.value} font-bold text-gray-900 mb-1`}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>

                        <div className="flex items-center justify-between">
                            {description && (
                                <CardDescription className="text-xs text-gray-500 flex-1">
                                    {description}
                                </CardDescription>
                            )}

                            {trend && (
                                <div className="flex items-center space-x-1 ml-2">
                                    {trend.isPositive ? (
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                    )}
                                    <span className={`text-xs font-medium ${
                                        trend.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {trend.isPositive ? '+' : ''}{trend.value}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Performance metrics grid component
interface PerformanceMetric {
    title: string;
    value: string | number;
    target?: number;
    unit?: string;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    description: string;
}

interface PerformanceMetricsGridProps {
    metrics: PerformanceMetric[];
    title?: string;
    description?: string;
}

export function PerformanceMetricsGrid({ 
    metrics, 
    title = "Performance Metrics", 
    description = "Key performance indicators for operational excellence" 
}: PerformanceMetricsGridProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
            case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'excellent': return CheckCircle;
            case 'good': return Target;
            case 'warning': return AlertTriangle;
            case 'critical': return AlertTriangle;
            default: return Clock;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {metrics.map((metric, index) => {
                        const StatusIcon = getStatusIcon(metric.status);
                        const statusColor = getStatusColor(metric.status);
                        
                        return (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border ${statusColor}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <StatusIcon className="h-4 w-4" />
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                        {metric.status}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="font-medium text-sm">{metric.title}</h4>
                                    <div className="flex items-baseline space-x-1">
                                        <span className="text-xl font-bold">
                                            {typeof metric.value === 'number'
                                                ? metric.value.toLocaleString()
                                                : metric.value
                                            }
                                        </span>
                                        {metric.unit && (
                                            <span className="text-xs text-gray-500">{metric.unit}</span>
                                        )}
                                    </div>

                                    {metric.target && (
                                        <div className="text-xs text-gray-500">
                                            Target: {metric.target}{metric.unit}
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-600 leading-tight">
                                        {metric.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// Quick stats component for dashboard overview
interface QuickStat {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface QuickStatsProps {
    stats: QuickStat[];
}

export function QuickStats({ stats }: QuickStatsProps) {
    return (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-full ${stat.color} flex-shrink-0`}>
                            <stat.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-lg font-bold text-gray-900 truncate">
                                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                            </div>
                            <div className="text-xs text-gray-600 truncate">{stat.label}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
