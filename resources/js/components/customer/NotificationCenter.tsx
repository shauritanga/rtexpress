import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Bell,
    BellRing,
    Package,
    Truck,
    AlertTriangle,
    CheckCircle,
    Gift,
    Settings,
    MoreHorizontal,
    X,
    Filter,
    MarkAsRead
} from 'lucide-react';

interface Notification {
    id: number;
    type: 'shipment_update' | 'delivery' | 'exception' | 'promotion' | 'system';
    title: string;
    message: string;
    timestamp: string;
    is_read: boolean;
    priority: 'high' | 'medium' | 'low';
    action_url?: string;
    metadata?: {
        tracking_number?: string;
        shipment_id?: number;
        discount_code?: string;
    };
}

interface Props {
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (notificationId: number) => void;
    onMarkAllAsRead: () => void;
    onDeleteNotification: (notificationId: number) => void;
    className?: string;
}

export default function NotificationCenter({ 
    notifications, 
    unreadCount, 
    onMarkAsRead, 
    onMarkAllAsRead, 
    onDeleteNotification, 
    className = '' 
}: Props) {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'shipment' | 'promotion'>('all');
    const [isExpanded, setIsExpanded] = useState(false);

    const getNotificationIcon = (type: string, priority: string) => {
        const iconProps = {
            className: `h-5 w-5 ${priority === 'high' ? 'text-red-600' : priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`
        };

        switch (type) {
            case 'shipment_update':
                return <Package {...iconProps} />;
            case 'delivery':
                return <Truck {...iconProps} />;
            case 'exception':
                return <AlertTriangle {...iconProps} />;
            case 'promotion':
                return <Gift {...iconProps} />;
            case 'system':
                return <Settings {...iconProps} />;
            default:
                return <Bell {...iconProps} />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const variants = {
            high: 'destructive',
            medium: 'default',
            low: 'secondary',
        } as const;

        return (
            <Badge variant={variants[priority as keyof typeof variants]} className="text-xs">
                {priority}
            </Badge>
        );
    };

    const getTypeColor = (type: string) => {
        const colors = {
            shipment_update: 'bg-blue-50 border-blue-200',
            delivery: 'bg-green-50 border-green-200',
            exception: 'bg-red-50 border-red-200',
            promotion: 'bg-purple-50 border-purple-200',
            system: 'bg-gray-50 border-gray-200',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200';
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
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    const getFilteredNotifications = () => {
        let filtered = notifications;

        switch (selectedFilter) {
            case 'unread':
                filtered = notifications.filter(n => !n.is_read);
                break;
            case 'shipment':
                filtered = notifications.filter(n => ['shipment_update', 'delivery', 'exception'].includes(n.type));
                break;
            case 'promotion':
                filtered = notifications.filter(n => n.type === 'promotion');
                break;
            default:
                filtered = notifications;
        }

        return filtered.sort((a, b) => {
            // Sort by read status (unread first), then by timestamp (newest first)
            if (a.is_read !== b.is_read) {
                return a.is_read ? 1 : -1;
            }
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    };

    const filteredNotifications = getFilteredNotifications();

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="relative">
                            <Bell className="h-5 w-5 mr-2" />
                            {unreadCount > 0 && (
                                <div className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                            )}
                        </div>
                        Notifications
                    </div>
                    <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark All Read
                            </Button>
                        )}
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>
                    Stay updated with your shipment status and important alerts
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {/* Filter Tabs */}
                <div className="flex items-center space-x-1 p-4 border-b">
                    <Button
                        variant={selectedFilter === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedFilter('all')}
                    >
                        All ({notifications.length})
                    </Button>
                    <Button
                        variant={selectedFilter === 'unread' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </Button>
                    <Button
                        variant={selectedFilter === 'shipment' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedFilter('shipment')}
                    >
                        Shipments
                    </Button>
                    <Button
                        variant={selectedFilter === 'promotion' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedFilter('promotion')}
                    >
                        Promotions
                    </Button>
                </div>

                {/* Notifications List */}
                <ScrollArea className={`${isExpanded ? 'h-96' : 'h-64'}`}>
                    {filteredNotifications.length > 0 ? (
                        <div className="divide-y">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${
                                        !notification.is_read ? 'bg-blue-50/50' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type, notification.priority)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.is_read && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        )}
                                                        {getPriorityBadge(notification.priority)}
                                                    </div>
                                                    
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>{formatTimestamp(notification.timestamp)}</span>
                                                        
                                                        {notification.metadata?.tracking_number && (
                                                            <span className="font-mono">
                                                                #{notification.metadata.tracking_number}
                                                            </span>
                                                        )}
                                                        
                                                        {notification.metadata?.discount_code && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {notification.metadata.discount_code}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-1 ml-2">
                                                    {!notification.is_read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onMarkAsRead(notification.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDeleteNotification(notification.id)}
                                                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            {notification.action_url && (
                                                <div className="mt-2">
                                                    <Button variant="outline" size="sm">
                                                        View Details
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                {selectedFilter === 'all' 
                                    ? 'No notifications yet' 
                                    : `No ${selectedFilter} notifications`
                                }
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                We'll notify you about important updates here
                            </p>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {filteredNotifications.length > 0 && (
                    <div className="border-t p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                Showing {filteredNotifications.length} of {notifications.length} notifications
                            </span>
                            <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-1" />
                                Notification Settings
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
