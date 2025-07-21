import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    History,
    Bell,
    Mail,
    MessageSquare,
    Smartphone,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Search,
    Filter,
    Calendar,
    Eye,
    EyeOff,
    Trash2,
    Archive,
    RefreshCw,
    Download,
    MoreHorizontal,
    Package,
    CreditCard,
    Settings,
    TrendingUp,
    BarChart3
} from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'shipment' | 'payment' | 'account' | 'marketing' | 'system';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    channels: {
        email?: {
            sent: boolean;
            delivered: boolean;
            opened: boolean;
            clicked: boolean;
            sent_at?: string;
            delivered_at?: string;
            opened_at?: string;
            clicked_at?: string;
        };
        sms?: {
            sent: boolean;
            delivered: boolean;
            sent_at?: string;
            delivered_at?: string;
        };
        push?: {
            sent: boolean;
            delivered: boolean;
            clicked: boolean;
            sent_at?: string;
            delivered_at?: string;
            clicked_at?: string;
        };
        in_app?: {
            sent: boolean;
            read: boolean;
            sent_at?: string;
            read_at?: string;
        };
    };
    metadata?: {
        shipment_id?: string;
        invoice_id?: string;
        tracking_number?: string;
        amount?: number;
        currency?: string;
    };
    created_at: string;
    updated_at: string;
    read: boolean;
    archived: boolean;
}

interface NotificationStats {
    total: number;
    unread: number;
    delivered: number;
    failed: number;
    engagement: {
        email_open_rate: number;
        email_click_rate: number;
        sms_delivery_rate: number;
        push_click_rate: number;
    };
}

interface Props {
    className?: string;
    onNotificationAction?: (action: string, notificationId: string) => void;
}

export default function NotificationHistory({ 
    className = '', 
    onNotificationAction
}: Props) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

    // Mock data - in real app, would fetch from API
    const mockNotifications: Notification[] = [
        {
            id: 'notif_1',
            title: 'Shipment Delivered',
            message: 'Your shipment RT-2024-001 has been delivered to 123 Main St, New York, NY',
            type: 'shipment',
            priority: 'high',
            channels: {
                email: { sent: true, delivered: true, opened: true, clicked: false, sent_at: '2024-01-20T14:30:00Z', delivered_at: '2024-01-20T14:31:00Z', opened_at: '2024-01-20T15:45:00Z' },
                sms: { sent: true, delivered: true, sent_at: '2024-01-20T14:30:00Z', delivered_at: '2024-01-20T14:31:00Z' },
                push: { sent: true, delivered: true, clicked: true, sent_at: '2024-01-20T14:30:00Z', delivered_at: '2024-01-20T14:30:30Z', clicked_at: '2024-01-20T14:32:00Z' },
                in_app: { sent: true, read: true, sent_at: '2024-01-20T14:30:00Z', read_at: '2024-01-20T14:32:00Z' },
            },
            metadata: {
                shipment_id: 'ship_001',
                tracking_number: 'RT-2024-001',
            },
            created_at: '2024-01-20T14:30:00Z',
            updated_at: '2024-01-20T14:32:00Z',
            read: true,
            archived: false,
        },
        {
            id: 'notif_2',
            title: 'Payment Due Reminder',
            message: 'Invoice INV-2024-002 for $93.45 is due in 3 days',
            type: 'payment',
            priority: 'medium',
            channels: {
                email: { sent: true, delivered: true, opened: false, clicked: false, sent_at: '2024-01-19T09:00:00Z', delivered_at: '2024-01-19T09:01:00Z' },
                in_app: { sent: true, read: false, sent_at: '2024-01-19T09:00:00Z' },
            },
            metadata: {
                invoice_id: 'inv_002',
                amount: 93.45,
                currency: 'USD',
            },
            created_at: '2024-01-19T09:00:00Z',
            updated_at: '2024-01-19T09:00:00Z',
            read: false,
            archived: false,
        },
        {
            id: 'notif_3',
            title: 'Shipment Exception',
            message: 'Delivery attempt failed for RT-2024-003. Recipient not available.',
            type: 'shipment',
            priority: 'urgent',
            channels: {
                email: { sent: true, delivered: true, opened: true, clicked: true, sent_at: '2024-01-18T16:20:00Z', delivered_at: '2024-01-18T16:21:00Z', opened_at: '2024-01-18T16:25:00Z', clicked_at: '2024-01-18T16:26:00Z' },
                sms: { sent: true, delivered: true, sent_at: '2024-01-18T16:20:00Z', delivered_at: '2024-01-18T16:21:00Z' },
                push: { sent: true, delivered: true, clicked: false, sent_at: '2024-01-18T16:20:00Z', delivered_at: '2024-01-18T16:20:30Z' },
                in_app: { sent: true, read: true, sent_at: '2024-01-18T16:20:00Z', read_at: '2024-01-18T16:25:00Z' },
            },
            metadata: {
                shipment_id: 'ship_003',
                tracking_number: 'RT-2024-003',
            },
            created_at: '2024-01-18T16:20:00Z',
            updated_at: '2024-01-18T16:25:00Z',
            read: true,
            archived: false,
        },
        {
            id: 'notif_4',
            title: 'Account Security Alert',
            message: 'New login detected from Chrome on Windows in New York, NY',
            type: 'account',
            priority: 'high',
            channels: {
                email: { sent: true, delivered: true, opened: true, clicked: false, sent_at: '2024-01-17T10:15:00Z', delivered_at: '2024-01-17T10:16:00Z', opened_at: '2024-01-17T10:20:00Z' },
                sms: { sent: true, delivered: true, sent_at: '2024-01-17T10:15:00Z', delivered_at: '2024-01-17T10:16:00Z' },
                in_app: { sent: true, read: true, sent_at: '2024-01-17T10:15:00Z', read_at: '2024-01-17T10:20:00Z' },
            },
            created_at: '2024-01-17T10:15:00Z',
            updated_at: '2024-01-17T10:20:00Z',
            read: true,
            archived: false,
        },
        {
            id: 'notif_5',
            title: 'Weekly Shipping Summary',
            message: 'You shipped 5 packages this week with a total value of $1,247.50',
            type: 'marketing',
            priority: 'low',
            channels: {
                email: { sent: true, delivered: true, opened: false, clicked: false, sent_at: '2024-01-15T08:00:00Z', delivered_at: '2024-01-15T08:01:00Z' },
            },
            created_at: '2024-01-15T08:00:00Z',
            updated_at: '2024-01-15T08:00:00Z',
            read: false,
            archived: false,
        },
    ];

    const mockStats: NotificationStats = {
        total: 127,
        unread: 8,
        delivered: 119,
        failed: 3,
        engagement: {
            email_open_rate: 68.5,
            email_click_rate: 12.3,
            sms_delivery_rate: 98.2,
            push_click_rate: 24.7,
        },
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        filterNotifications();
    }, [notifications, searchQuery, typeFilter, priorityFilter, statusFilter, dateFilter]);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setNotifications(mockNotifications);
            setStats(mockStats);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterNotifications = () => {
        let filtered = [...notifications];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(notification =>
                notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.metadata?.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(notification => notification.type === typeFilter);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(notification => notification.priority === priorityFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'read') {
                filtered = filtered.filter(notification => notification.read);
            } else if (statusFilter === 'unread') {
                filtered = filtered.filter(notification => !notification.read);
            } else if (statusFilter === 'archived') {
                filtered = filtered.filter(notification => notification.archived);
            }
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
            }
            
            filtered = filtered.filter(notification => 
                new Date(notification.created_at) >= filterDate
            );
        }

        setFilteredNotifications(filtered);
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            shipment: <Package className="h-4 w-4" />,
            payment: <CreditCard className="h-4 w-4" />,
            account: <Settings className="h-4 w-4" />,
            marketing: <TrendingUp className="h-4 w-4" />,
            system: <Bell className="h-4 w-4" />,
        };
        return icons[type as keyof typeof icons] || <Bell className="h-4 w-4" />;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            shipment: 'bg-blue-100 text-blue-800 border-blue-300',
            payment: 'bg-green-100 text-green-800 border-green-300',
            account: 'bg-purple-100 text-purple-800 border-purple-300',
            marketing: 'bg-orange-100 text-orange-800 border-orange-300',
            system: 'bg-gray-100 text-gray-800 border-gray-300',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800 border-gray-300',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            high: 'bg-orange-100 text-orange-800 border-orange-300',
            urgent: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getChannelIcon = (channel: string) => {
        const icons = {
            email: <Mail className="h-3 w-3" />,
            sms: <MessageSquare className="h-3 w-3" />,
            push: <Smartphone className="h-3 w-3" />,
            in_app: <Bell className="h-3 w-3" />,
        };
        return icons[channel as keyof typeof icons];
    };

    const getChannelStatus = (channelData: any) => {
        if (!channelData) return null;
        
        if (channelData.clicked || channelData.read) {
            return <CheckCircle className="h-3 w-3 text-green-600" />;
        } else if (channelData.opened || channelData.delivered) {
            return <CheckCircle className="h-3 w-3 text-blue-600" />;
        } else if (channelData.sent) {
            return <Clock className="h-3 w-3 text-yellow-600" />;
        } else {
            return <XCircle className="h-3 w-3 text-red-600" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            });
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        onNotificationAction?.('view', notification.id);
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => prev.map(notification =>
            notification.id === notificationId
                ? { ...notification, read: true, updated_at: new Date().toISOString() }
                : notification
        ));
    };

    const markAsUnread = (notificationId: string) => {
        setNotifications(prev => prev.map(notification =>
            notification.id === notificationId
                ? { ...notification, read: false, updated_at: new Date().toISOString() }
                : notification
        ));
    };

    const archiveNotification = (notificationId: string) => {
        setNotifications(prev => prev.map(notification =>
            notification.id === notificationId
                ? { ...notification, archived: true, updated_at: new Date().toISOString() }
                : notification
        ));
    };

    const deleteNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    };

    const handleBulkAction = (action: string) => {
        selectedNotifications.forEach(id => {
            switch (action) {
                case 'read':
                    markAsRead(id);
                    break;
                case 'unread':
                    markAsUnread(id);
                    break;
                case 'archive':
                    archiveNotification(id);
                    break;
                case 'delete':
                    deleteNotification(id);
                    break;
            }
        });
        setSelectedNotifications([]);
    };

    const toggleNotificationSelection = (notificationId: string) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const selectAllNotifications = () => {
        setSelectedNotifications(filteredNotifications.map(n => n.id));
    };

    const clearSelection = () => {
        setSelectedNotifications([]);
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg sm:text-xl flex items-center">
                            <History className="h-5 w-5 mr-2" />
                            Notification History
                        </CardTitle>
                        <CardDescription>
                            View and manage your notification history and delivery status
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={loadNotifications} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Statistics */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-600">Total</p>
                                    <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-600">Unread</p>
                                    <p className="text-lg sm:text-xl font-bold text-orange-600">{stats.unread}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-600">Delivered</p>
                                    <p className="text-lg sm:text-xl font-bold text-green-600">{stats.delivered}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-gray-600">Failed</p>
                                    <p className="text-lg sm:text-xl font-bold text-red-600">{stats.failed}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Engagement Metrics */}
                {stats && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Engagement Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Email Open Rate</p>
                                    <p className="text-lg font-bold text-blue-600">{stats.engagement.email_open_rate}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Email Click Rate</p>
                                    <p className="text-lg font-bold text-green-600">{stats.engagement.email_click_rate}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">SMS Delivery</p>
                                    <p className="text-lg font-bold text-purple-600">{stats.engagement.sms_delivery_rate}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Push Click Rate</p>
                                    <p className="text-lg font-bold text-orange-600">{stats.engagement.push_click_rate}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notifications..."
                            className="pl-10"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="shipment">Shipment</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="account">Account</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm text-blue-800">
                            {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleBulkAction('read')}>
                                <Eye className="h-3 w-3 mr-1" />
                                Mark Read
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                                <Archive className="h-3 w-3 mr-1" />
                                Archive
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                            <Button size="sm" variant="ghost" onClick={clearSelection}>
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Notifications List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading notifications...</span>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications Found</h3>
                        <p className="text-gray-600">
                            {searchQuery || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'You have no notifications yet'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => (
                            <Card 
                                key={notification.id} 
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                    !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                                } ${
                                    selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.includes(notification.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleNotificationSelection(notification.id);
                                            }}
                                            className="mt-1"
                                        />
                                        
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <Badge className={getTypeColor(notification.type)}>
                                                        {getTypeIcon(notification.type)}
                                                        <span className="ml-1 capitalize">{notification.type}</span>
                                                    </Badge>
                                                    <Badge className={getPriorityColor(notification.priority)}>
                                                        {notification.priority}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(notification.created_at)}
                                                </span>
                                            </div>
                                            
                                            <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                                                {notification.message}
                                            </p>
                                            
                                            {/* Channel Status */}
                                            <div className="flex items-center gap-4 text-xs">
                                                {Object.entries(notification.channels).map(([channel, data]) => (
                                                    <div key={channel} className="flex items-center gap-1">
                                                        {getChannelIcon(channel)}
                                                        <span className="capitalize">{channel.replace('_', ' ')}</span>
                                                        {getChannelStatus(data)}
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Metadata */}
                                            {notification.metadata && (
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                    {notification.metadata.tracking_number && (
                                                        <span>Tracking: {notification.metadata.tracking_number}</span>
                                                    )}
                                                    {notification.metadata.amount && (
                                                        <span>Amount: ${notification.metadata.amount}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Show action menu
                                                }}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
