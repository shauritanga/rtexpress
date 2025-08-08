import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertTriangle,
    Archive,
    Bell,
    CheckCircle,
    Clock,
    CreditCard,
    Eye,
    Mail,
    MessageSquare,
    MoreHorizontal,
    Package,
    Search,
    Shield,
    Smartphone,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationItem {
    id: number | string;
    notification_id?: string;
    type: string;
    title: string;
    message: string;
    channel: 'email' | 'sms' | 'push' | 'in_app';
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    read_at?: string;
    sent_at?: string;
    delivered_at?: string;
    failed_at?: string;
    failure_reason?: string;
    related_type?: string;
    related_id?: number;
    data?: any;
    metadata?: any;
    related_shipment?: string; // For backward compatibility
}

interface Props {
    notifications?: NotificationItem[];
    className?: string;
    onMarkAsRead?: (notificationId: number | string) => void;
    onArchive?: (notificationId: number | string) => void;
    onDelete?: (notificationId: number | string) => void;
    onMarkAllAsRead?: () => void;
    isProcessing?: boolean;
}

export default function NotificationHistory({
    notifications = [],
    className = '',
    onMarkAsRead,
    onArchive,
    onDelete,
    onMarkAllAsRead,
    isProcessing = false,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Close all dropdowns when processing starts
    useEffect(() => {
        if (isProcessing) {
            setOpenDropdown(null);
        }
    }, [isProcessing]);

    // Use actual notifications from database only - no mock data
    const displayNotifications = notifications;

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'sms':
                return <MessageSquare className="h-4 w-4" />;
            case 'push':
                return <Smartphone className="h-4 w-4" />;
            case 'in_app':
                return <Bell className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'shipment_created':
                return <Package className="h-4 w-4" />;
            case 'shipment_picked_up':
                return <Package className="h-4 w-4" />;
            case 'shipment_in_transit':
                return <Package className="h-4 w-4" />;
            case 'shipment_delivered':
                return <CheckCircle className="h-4 w-4" />;
            case 'shipment_exception':
                return <AlertTriangle className="h-4 w-4" />;
            case 'payment_received':
                return <CreditCard className="h-4 w-4" />;
            case 'account_security':
                return <Shield className="h-4 w-4" />;
            // Legacy types for backward compatibility
            case 'shipment_update':
                return <Package className="h-4 w-4" />;
            case 'delivery_alert':
                return <CheckCircle className="h-4 w-4" />;
            case 'billing_notification':
                return <CreditCard className="h-4 w-4" />;
            case 'security_alert':
                return <Shield className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'sent':
                return <Badge variant="default">Sent</Badge>;
            case 'delivered':
                return <Badge variant="default">Delivered</Badge>;
            case 'read':
                return <Badge variant="outline">Read</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'border-l-red-600';
            case 'high':
                return 'border-l-red-500';
            case 'medium':
                return 'border-l-yellow-500';
            case 'low':
                return 'border-l-green-500';
            default:
                return 'border-l-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const stripHtmlTags = (html: string) => {
        // Create a temporary div element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Extract text content and clean up whitespace
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        return textContent.replace(/\s+/g, ' ').trim();
    };

    const formatMessage = (message: string) => {
        // Check if message contains HTML tags
        const hasHtmlTags = /<[^>]*>/g.test(message);

        if (hasHtmlTags) {
            const plainText = stripHtmlTags(message);
            // Truncate long messages
            return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
        }

        // Return as-is if no HTML tags
        return message.length > 150 ? message.substring(0, 150) + '...' : message;
    };

    const filteredNotifications = displayNotifications.filter((notification) => {
        const matchesSearch =
            notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
        const matchesType = typeFilter === 'all' || notification.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Bell className="h-5 w-5" />
                            <span>Notification History</span>
                        </div>
                        {onMarkAllAsRead && filteredNotifications.some((n) => n.status !== 'read') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onMarkAllAsRead}
                                disabled={isProcessing}
                                className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            >
                                <Eye className="mr-1 h-4 w-4" />
                                {isProcessing ? 'Processing...' : 'Mark All Read'}
                            </Button>
                        )}
                    </CardTitle>
                    <CardDescription>View and manage your notification history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="shipment_created">Shipment Created</SelectItem>
                                <SelectItem value="shipment_picked_up">Shipment Picked Up</SelectItem>
                                <SelectItem value="shipment_in_transit">In Transit</SelectItem>
                                <SelectItem value="shipment_delivered">Delivered</SelectItem>
                                <SelectItem value="shipment_exception">Exception</SelectItem>
                                <SelectItem value="payment_received">Payment Received</SelectItem>
                                <SelectItem value="account_security">Security</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No notifications found</h3>
                            <p className="text-center text-gray-500">
                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'Try adjusting your filters to see more notifications.'
                                    : "You don't have any notifications yet. Notifications will appear here when you create shipments or receive important updates."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notification) => (
                        <Card key={notification.id} className={`border-l-4 ${getPriorityColor(notification.priority)}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-1 items-start space-x-3">
                                        <div className="mt-1 flex-shrink-0">{getTypeIcon(notification.type)}</div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center space-x-2">
                                                <h4 className="truncate text-sm font-medium text-gray-900">{notification.title}</h4>
                                                {getStatusBadge(notification.status)}
                                            </div>
                                            <p className="mb-2 text-sm text-gray-600">{formatMessage(notification.message)}</p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    {getChannelIcon(notification.channel)}
                                                    <span className="capitalize">{notification.channel}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDate(notification.created_at)}</span>
                                                </div>
                                                {(notification.related_shipment ||
                                                    (notification.related_type === 'shipment' && notification.data?.tracking_number)) && (
                                                    <div className="flex items-center space-x-1">
                                                        <Package className="h-3 w-3" />
                                                        <span>{notification.related_shipment || notification.data?.tracking_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu
                                        open={openDropdown === notification.id.toString()}
                                        onOpenChange={(open) => {
                                            if (open && !isProcessing) {
                                                setOpenDropdown(notification.id.toString());
                                            } else {
                                                setOpenDropdown(null);
                                            }
                                        }}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="flex-shrink-0" disabled={isProcessing}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {notification.status !== 'read' && onMarkAsRead && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (!isProcessing) {
                                                            setOpenDropdown(null);
                                                            onMarkAsRead(notification.id);
                                                        }
                                                    }}
                                                    disabled={isProcessing}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Mark as Read
                                                </DropdownMenuItem>
                                            )}
                                            {onArchive && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (!isProcessing) {
                                                            setOpenDropdown(null);
                                                            onArchive(notification.id);
                                                        }
                                                    }}
                                                    disabled={isProcessing}
                                                >
                                                    <Archive className="mr-2 h-4 w-4" />
                                                    Archive
                                                </DropdownMenuItem>
                                            )}
                                            {onDelete && (
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (!isProcessing) {
                                                            setOpenDropdown(null);
                                                            onDelete(notification.id);
                                                        }
                                                    }}
                                                    disabled={isProcessing}
                                                    className="text-red-600 focus:text-red-600 disabled:opacity-50"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Summary */}
            {filteredNotifications.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Showing {filteredNotifications.length} of {displayNotifications.length} notifications
                            </span>
                            <div className="flex items-center space-x-4">
                                <span className="flex items-center space-x-1">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span>Delivered: {filteredNotifications.filter((n) => n.status === 'delivered').length}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                    <span>Failed: {filteredNotifications.filter((n) => n.status === 'failed').length}</span>
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
