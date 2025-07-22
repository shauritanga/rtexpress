import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    TrendingUp, 
    TrendingDown, 
    Minus,
    ArrowRight,
    MoreHorizontal,
    ChevronRight
} from 'lucide-react';

// Mobile-optimized KPI card
interface MobileKPICardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        type: 'increase' | 'decrease' | 'neutral';
        period?: string;
    };
    icon?: React.ComponentType<{ className?: string }>;
    description?: string;
    className?: string;
    onClick?: () => void;
    loading?: boolean;
}

export function MobileKPICard({
    title,
    value,
    change,
    icon: Icon,
    description,
    className,
    onClick,
    loading = false
}: MobileKPICardProps) {
    const getTrendIcon = () => {
        if (!change) return null;
        
        switch (change.type) {
            case 'increase':
                return <TrendingUp className="h-3 w-3" />;
            case 'decrease':
                return <TrendingDown className="h-3 w-3" />;
            default:
                return <Minus className="h-3 w-3" />;
        }
    };

    const getTrendColor = () => {
        if (!change) return 'text-muted-foreground';
        
        switch (change.type) {
            case 'increase':
                return 'text-green-600';
            case 'decrease':
                return 'text-red-600';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <Card 
            className={cn(
                "hover:shadow-md transition-all duration-200 cursor-pointer touch-manipulation",
                "border-l-4 border-l-rt-red/20 hover:border-l-rt-red/40",
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                            {Icon && (
                                <div className="p-1.5 bg-rt-red/10 rounded-md">
                                    <Icon className="h-4 w-4 text-rt-red" />
                                </div>
                            )}
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                                {title}
                            </p>
                        </div>
                        
                        <div className="space-y-1">
                            {loading ? (
                                <div className="h-8 bg-muted animate-pulse rounded" />
                            ) : (
                                <p className="text-2xl font-bold text-foreground">
                                    {value}
                                </p>
                            )}
                            
                            {change && !loading && (
                                <div className={cn("flex items-center space-x-1 text-xs", getTrendColor())}>
                                    {getTrendIcon()}
                                    <span className="font-medium">
                                        {Math.abs(change.value)}%
                                    </span>
                                    {change.period && (
                                        <span className="text-muted-foreground">
                                            {change.period}
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {description && (
                                <p className="text-xs text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {onClick && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Mobile-optimized dashboard grid
interface MobileDashboardGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: 1 | 2 | 3 | 4;
}

export function MobileDashboardGrid({ 
    children, 
    className,
    columns = 2
}: MobileDashboardGridProps) {
    const gridClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    };

    return (
        <div className={cn(
            "grid gap-4",
            gridClasses[columns],
            className
        )}>
            {children}
        </div>
    );
}

// Mobile-optimized chart card
interface MobileChartCardProps {
    title: string;
    children: React.ReactNode;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
    loading?: boolean;
    height?: 'sm' | 'md' | 'lg' | 'xl';
}

export function MobileChartCard({
    title,
    children,
    description,
    actions,
    className,
    loading = false,
    height = 'md'
}: MobileChartCardProps) {
    const heightClasses = {
        sm: 'h-48',
        md: 'h-64',
        lg: 'h-80',
        xl: 'h-96'
    };

    return (
        <Card className={cn("touch-manipulation", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-semibold truncate">
                            {title}
                        </CardTitle>
                        {description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="ml-2 flex-shrink-0">
                            {actions}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className={cn(
                    "w-full",
                    heightClasses[height],
                    loading && "flex items-center justify-center"
                )}>
                    {loading ? (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rt-red mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Loading chart...</p>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Mobile-optimized activity feed
interface MobileActivityItem {
    id: string;
    title: string;
    description?: string;
    timestamp: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    icon?: React.ComponentType<{ className?: string }>;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface MobileActivityFeedProps {
    items: MobileActivityItem[];
    title?: string;
    className?: string;
    maxItems?: number;
    showViewAll?: boolean;
    onViewAll?: () => void;
}

export function MobileActivityFeed({
    items,
    title = "Recent Activity",
    className,
    maxItems = 5,
    showViewAll = true,
    onViewAll
}: MobileActivityFeedProps) {
    const getTypeColor = (type?: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const displayItems = items.slice(0, maxItems);

    return (
        <Card className={cn("touch-manipulation", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold">
                        {title}
                    </CardTitle>
                    {showViewAll && onViewAll && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={onViewAll}
                            className="text-xs"
                        >
                            View All
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    {displayItems.map((item, index) => (
                        <div key={item.id} className="flex items-start space-x-3">
                            <div className={cn(
                                "flex-shrink-0 w-2 h-2 rounded-full mt-2",
                                getTypeColor(item.type).replace('text-', 'bg-').split(' ')[0]
                            )} />
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {item.title}
                                        </p>
                                        {item.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {item.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {item.timestamp}
                                        </p>
                                    </div>
                                    
                                    {item.action && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={item.action.onClick}
                                            className="text-xs ml-2 flex-shrink-0"
                                        >
                                            {item.action.label}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {displayItems.length === 0 && (
                        <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground">
                                No recent activity
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Mobile-optimized progress card
interface MobileProgressCardProps {
    title: string;
    value: number;
    max: number;
    description?: string;
    color?: 'default' | 'success' | 'warning' | 'error';
    showPercentage?: boolean;
    className?: string;
}

export function MobileProgressCard({
    title,
    value,
    max,
    description,
    color = 'default',
    showPercentage = true,
    className
}: MobileProgressCardProps) {
    const percentage = Math.round((value / max) * 100);
    
    const getProgressColor = () => {
        switch (color) {
            case 'success':
                return 'bg-green-600';
            case 'warning':
                return 'bg-yellow-600';
            case 'error':
                return 'bg-red-600';
            default:
                return 'bg-rt-red';
        }
    };

    return (
        <Card className={cn("touch-manipulation", className)}>
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">
                            {title}
                        </h3>
                        {showPercentage && (
                            <span className="text-sm font-bold text-foreground">
                                {percentage}%
                            </span>
                        )}
                    </div>
                    
                    <Progress 
                        value={percentage} 
                        className="h-2"
                    />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{value} of {max}</span>
                        {description && (
                            <span>{description}</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Mobile-optimized quick actions
interface MobileQuickAction {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    color?: 'default' | 'success' | 'warning' | 'error';
    badge?: string | number;
}

interface MobileQuickActionsProps {
    actions: MobileQuickAction[];
    title?: string;
    className?: string;
    columns?: 2 | 3 | 4;
}

export function MobileQuickActions({
    actions,
    title = "Quick Actions",
    className,
    columns = 2
}: MobileQuickActionsProps) {
    const gridClasses = {
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-2 sm:grid-cols-4"
    };

    const getActionColor = (color?: string) => {
        switch (color) {
            case 'success':
                return 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200';
            case 'warning':
                return 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'error':
                return 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-rt-red/5 hover:bg-rt-red/10 text-rt-red border-rt-red/20';
        }
    };

    return (
        <Card className={cn("touch-manipulation", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg font-semibold">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className={cn("grid gap-3", gridClasses[columns])}>
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            onClick={action.onClick}
                            className={cn(
                                "h-auto p-4 flex flex-col items-center space-y-2 relative",
                                "touch-manipulation transition-all duration-200",
                                getActionColor(action.color)
                            )}
                        >
                            <action.icon className="h-6 w-6" />
                            <span className="text-xs font-medium text-center leading-tight">
                                {action.label}
                            </span>
                            {action.badge && (
                                <Badge 
                                    variant="destructive" 
                                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                >
                                    {action.badge}
                                </Badge>
                            )}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
