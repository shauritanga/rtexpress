import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Bell,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    Mail,
    MessageSquare,
    Monitor,
    RefreshCw,
    Send,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface NotificationLog {
    id: number;
    event: string;
    event_time: string;
    event_data?: any;
    provider?: string;
    provider_message_id?: string;
    provider_response?: string;
}

interface Notification {
    id: number;
    notification_id: string;
    type: string;
    channel: string;
    recipient_type: string;
    recipient_id: number;
    recipient_email?: string;
    recipient_phone?: string;
    title: string;
    message: string;
    data?: any;
    template?: string;
    priority: string;
    status: string;
    scheduled_at?: string;
    sent_at?: string;
    delivered_at?: string;
    read_at?: string;
    failed_at?: string;
    failure_reason?: string;
    external_id?: string;
    metadata?: any;
    related_type?: string;
    related_id?: number;
    created_at: string;
    updated_at: string;
    created_by: User;
    logs: NotificationLog[];
}

interface Props {
    notification: Notification;
}

export default function NotificationShow({ notification }: Props) {
    const [isResending, setIsResending] = useState(false);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            sent: { label: 'Sent', variant: 'default' as const, icon: Send },
            delivered: { label: 'Delivered', variant: 'success' as const, icon: CheckCircle },
            failed: { label: 'Failed', variant: 'destructive' as const, icon: XCircle },
            read: { label: 'Read', variant: 'success' as const, icon: CheckCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const, icon: Bell };

        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
            medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
            high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
            urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
        };

        const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'bg-gray-100 text-gray-800' };

        return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>{config.label}</span>;
    };

    const getChannelIcon = (channel: string) => {
        const icons = {
            email: Mail,
            sms: MessageSquare,
            push: Bell,
            in_app: Monitor,
        };

        const IconComponent = icons[channel as keyof typeof icons] || Bell;
        return <IconComponent className="h-4 w-4" />;
    };

    const getEventIcon = (event: string) => {
        const icons = {
            sent: Send,
            delivered: CheckCircle,
            failed: XCircle,
            read: Eye,
            opened: Eye,
            clicked: Activity,
        };

        const IconComponent = icons[event as keyof typeof icons] || Activity;
        return <IconComponent className="h-3 w-3" />;
    };

    const getEventColor = (event: string) => {
        const colors = {
            sent: 'text-blue-600',
            delivered: 'text-green-600',
            failed: 'text-red-600',
            read: 'text-green-600',
            opened: 'text-blue-600',
            clicked: 'text-purple-600',
        };

        return colors[event as keyof typeof colors] || 'text-gray-600';
    };

    const handleResend = () => {
        if (notification.status !== 'failed') return;

        setIsResending(true);
        router.post(
            route('admin.notifications.resend', notification.id),
            {},
            {
                onFinish: () => setIsResending(false),
            },
        );
    };

    const handleMarkAsRead = () => {
        router.post(route('admin.notifications.mark-read', notification.id));
    };

    return (
        <AppLayout>
            <Head title={`Notification ${notification.notification_id}`} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/notifications">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Notifications
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{notification.notification_id}</h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Notification Details</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        {notification.status === 'failed' && (
                            <Button variant="outline" onClick={handleResend} disabled={isResending} className="w-full sm:w-auto">
                                <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                                Resend
                            </Button>
                        )}
                        {notification.status !== 'read' && (
                            <Button variant="outline" onClick={handleMarkAsRead} className="w-full sm:w-auto">
                                <Eye className="mr-2 h-4 w-4" />
                                Mark as Read
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status and Priority Info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">{getStatusBadge(notification.status)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                {getChannelIcon(notification.channel)}
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Channel</p>
                                    <p className="font-medium capitalize">{notification.channel}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                                    <div className="mt-1">{getPriorityBadge(notification.priority)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="text-sm font-medium">{formatDateTime(notification.created_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Notification Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bell className="mr-2 h-5 w-5" />
                                Notification Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Title</p>
                                <p className="font-medium">{notification.title}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Message</p>
                                <div className="mt-2 rounded-md bg-muted p-3">
                                    <p className="text-sm whitespace-pre-wrap">{notification.message}</p>
                                </div>
                            </div>
                            {notification.template && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Template</p>
                                        <p className="text-sm">{notification.template}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recipient Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 h-5 w-5" />
                                Recipient Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Recipient Type</p>
                                <p className="font-medium capitalize">{notification.recipient_type}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Recipient ID</p>
                                <p className="font-medium">#{notification.recipient_id}</p>
                            </div>
                            {notification.recipient_email && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm">{notification.recipient_email}</p>
                                    </div>
                                </>
                            )}
                            {notification.recipient_phone && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                        <p className="text-sm">{notification.recipient_phone}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Delivery Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="mr-2 h-5 w-5" />
                            Delivery Timeline
                        </CardTitle>
                        <CardDescription>Track the notification delivery progress and events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Creation */}
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                        <Bell className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Notification Created</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDateTime(notification.created_at)} by {notification.created_by.name}
                                    </p>
                                </div>
                            </div>

                            {/* Scheduled */}
                            {notification.scheduled_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                                            <Calendar className="h-4 w-4 text-yellow-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Scheduled</p>
                                        <p className="text-xs text-muted-foreground">{formatDateTime(notification.scheduled_at)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Event Logs */}
                            {notification.logs.map((log, index) => (
                                <div key={log.id} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                log.event === 'delivered'
                                                    ? 'bg-green-100'
                                                    : log.event === 'failed'
                                                      ? 'bg-red-100'
                                                      : log.event === 'sent'
                                                        ? 'bg-blue-100'
                                                        : 'bg-gray-100'
                                            }`}
                                        >
                                            <div className={getEventColor(log.event)}>{getEventIcon(log.event)}</div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium capitalize">{log.event.replace('_', ' ')}</p>
                                        <p className="text-xs text-muted-foreground">{formatDateTime(log.event_time)}</p>
                                        {log.provider && <p className="text-xs text-muted-foreground">via {log.provider}</p>}
                                    </div>
                                </div>
                            ))}

                            {/* Failure Reason */}
                            {notification.failure_reason && (
                                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                                    <div className="flex items-start space-x-2">
                                        <XCircle className="mt-0.5 h-4 w-4 text-red-600" />
                                        <div>
                                            <p className="text-sm font-medium text-red-800">Failure Reason</p>
                                            <p className="text-sm text-red-700">{notification.failure_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
