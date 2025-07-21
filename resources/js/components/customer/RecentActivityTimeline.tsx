import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Package,
    Truck,
    CheckCircle,
    Clock,
    AlertTriangle,
    MapPin,
    Calendar,
    ArrowRight,
    ExternalLink
} from 'lucide-react';

interface TimelineEvent {
    id: number;
    shipment_id: number;
    tracking_number: string;
    event_type: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
    status: string;
    description: string;
    location?: string;
    timestamp: string;
    recipient_name: string;
    service_type: string;
}

interface Props {
    events: TimelineEvent[];
    className?: string;
}

export default function RecentActivityTimeline({ events, className = '' }: Props) {
    const getEventIcon = (eventType: string) => {
        const iconConfig = {
            created: { icon: Package, color: 'text-blue-600 bg-blue-50' },
            picked_up: { icon: Package, color: 'text-orange-600 bg-orange-50' },
            in_transit: { icon: Truck, color: 'text-purple-600 bg-purple-50' },
            out_for_delivery: { icon: Truck, color: 'text-yellow-600 bg-yellow-50' },
            delivered: { icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            exception: { icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
        };

        const config = iconConfig[eventType as keyof typeof iconConfig] || 
                      { icon: Package, color: 'text-gray-600 bg-gray-50' };
        
        return config;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const },
            picked_up: { label: 'Picked Up', variant: 'default' as const },
            in_transit: { label: 'In Transit', variant: 'default' as const },
            out_for_delivery: { label: 'Out for Delivery', variant: 'default' as const },
            delivered: { label: 'Delivered', variant: 'success' as const },
            exception: { label: 'Exception', variant: 'destructive' as const },
            cancelled: { label: 'Cancelled', variant: 'destructive' as const },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const };
        
        return (
            <Badge variant={config.variant} className="text-xs">
                {config.label}
            </Badge>
        );
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getServiceTypeColor = (serviceType: string) => {
        const colors = {
            express: 'text-red-600 bg-red-50',
            standard: 'text-blue-600 bg-blue-50',
            overnight: 'text-purple-600 bg-purple-50',
            international: 'text-green-600 bg-green-50',
        };
        return colors[serviceType as keyof typeof colors] || 'text-gray-600 bg-gray-50';
    };

    if (!events || events.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Recent Activity
                    </CardTitle>
                    <CardDescription>
                        Track your latest shipment updates and activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No recent activity to display</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Your shipment updates will appear here
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        Recent Activity
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        View All
                        <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                </CardTitle>
                <CardDescription>
                    Latest updates from your shipments
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200"></div>
                        
                        {events.map((event, index) => {
                            const { icon: Icon, color } = getEventIcon(event.event_type);
                            
                            return (
                                <div key={event.id} className="relative flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors">
                                    {/* Timeline dot */}
                                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    
                                    {/* Event content */}
                                    <div className="flex-1 min-w-0 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {event.tracking_number}
                                                    </p>
                                                    {getStatusBadge(event.status)}
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(event.service_type)}`}>
                                                        {event.service_type}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {event.description}
                                                </p>
                                                
                                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {formatTimestamp(event.timestamp)}
                                                    </div>
                                                    
                                                    {event.location && (
                                                        <div className="flex items-center">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {event.location}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center">
                                                        <ArrowRight className="h-3 w-3 mr-1" />
                                                        {event.recipient_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {events.length > 5 && (
                    <div className="border-t p-4">
                        <Button variant="outline" className="w-full" size="sm">
                            Load More Activities
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
