import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/useToast';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Archive,
    Bell,
    CheckCircle,
    Clock,
    Eye,
    Filter,
    Mail,
    MessageSquare,
    Monitor,
    MoreHorizontal,
    Plus,
    Search,
    Send,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    name: string;
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
    priority: string;
    status: string;
    scheduled_at?: string;
    sent_at?: string;
    delivered_at?: string;
    read_at?: string;
    failed_at?: string;
    failure_reason?: string;
    created_at: string;
    created_by: User;
}

interface Stats {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
    delivery_rate: number;
    failure_rate: number;
    pending_notifications: number;
    high_priority_pending: number;
    failed_today: number;
}

interface Props {
    notifications: {
        data: Notification[];
        meta: any;
        links: any[];
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        channel?: string;
        type?: string;
        priority?: string;
        date_from?: string;
        date_to?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function NotificationsIndex({ notifications, stats, filters, flash }: Props) {
    const { props } = usePage();

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Success',
                description: flash.success,
                variant: 'default',
            });
        }
        if (flash?.error) {
            toast({
                title: 'Error',
                description: flash.error,
                variant: 'destructive',
            });
        }
    }, [flash]);

    // Reset processing state on component mount to ensure buttons are interactive
    useEffect(() => {
        setProcessingAction(null);
        setDeleteConfirmation({
            isOpen: false,
            notificationId: null,
            notificationTitle: '',
        });
    }, []);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedChannel, setSelectedChannel] = useState(filters.channel || 'all');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [processingAction, setProcessingAction] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        notificationId: number | null;
        notificationTitle: string;
    }>({
        isOpen: false,
        notificationId: null,
        notificationTitle: '',
    });
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

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

    const handleSearch = () => {
        router.get(
            route('admin.notifications.index'),
            {
                search: searchTerm,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                channel: selectedChannel !== 'all' ? selectedChannel : undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedChannel('all');
        setSelectedType('all');
        setSelectedPriority('all');
        setDateFrom('');
        setDateTo('');

        router.get(
            route('admin.notifications.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleProcessPending = () => {
        router.post(
            route('admin.notifications.process-pending'),
            {},
            {
                preserveState: true,
                onSuccess: () => {
                    router.reload();
                },
            },
        );
    };

    const handleArchive = (notificationId: number) => {
        if (processingAction) return;

        setProcessingAction(`archive-${notificationId}`);
        setOpenDropdown(null); // Close dropdown immediately

        router.post(
            route('admin.notifications.archive', notificationId),
            {},
            {
                onSuccess: () => {
                    // Reset processing state and reload the page data
                    setProcessingAction(null);
                    router.reload({ only: ['notifications', 'stats'] });
                },
                onError: () => {
                    setProcessingAction(null);
                },
            },
        );
    };

    const handleDeleteClick = (notificationId: number, notificationTitle: string) => {
        if (processingAction) return;

        setOpenDropdown(null); // Close dropdown immediately
        setDeleteConfirmation({
            isOpen: true,
            notificationId,
            notificationTitle,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteConfirmation.notificationId || processingAction) return;

        setProcessingAction(`delete-${deleteConfirmation.notificationId}`);
        router.delete(route('admin.notifications.destroy', deleteConfirmation.notificationId), {
            onSuccess: () => {
                // Reset all states and reload the page data
                setProcessingAction(null);
                setDeleteConfirmation({
                    isOpen: false,
                    notificationId: null,
                    notificationTitle: '',
                });
                router.reload({ only: ['notifications', 'stats'] });
            },
            onError: () => {
                setProcessingAction(null);
                setDeleteConfirmation({
                    isOpen: false,
                    notificationId: null,
                    notificationTitle: '',
                });
            },
        });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({
            isOpen: false,
            notificationId: null,
            notificationTitle: '',
        });
    };

    return (
        <AppLayout>
            <Head title="Notification Center" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notification Center</h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage and monitor all system notifications</p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" onClick={handleProcessPending} className="w-full sm:w-auto">
                            <Activity className="mr-2 h-4 w-4" />
                            Process Pending
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/notifications/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Send Notification
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Bell className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                    <p className="text-xs text-muted-foreground">{stats.delivery_rate}% delivery rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending_notifications}</p>
                                    <p className="text-xs text-orange-600">{stats.high_priority_pending} high priority</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                                    <p className="text-2xl font-bold">{stats.delivered}</p>
                                    <p className="text-xs text-green-600">{stats.sent} sent total</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Failed Today</p>
                                    <p className="text-2xl font-bold">{stats.failed_today}</p>
                                    <p className="text-xs text-red-600">{stats.failure_rate}% failure rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="mr-2 h-5 w-5" />
                            Filter Notifications
                        </CardTitle>
                        <CardDescription>Search and filter notifications by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Title, message, notification ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="read">Read</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Channel</label>
                                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All channels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Channels</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="sms">SMS</SelectItem>
                                        <SelectItem value="push">Push</SelectItem>
                                        <SelectItem value="in_app">In-App</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">From Date</label>
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Actions</label>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                    <Button onClick={handleSearch} className="flex-1">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                    <Button variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-none">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>All system notifications and their delivery status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-md border">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Notification</TableHead>
                                            <TableHead className="min-w-[100px]">Channel</TableHead>
                                            <TableHead className="min-w-[100px]">Priority</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Recipient</TableHead>
                                            <TableHead className="hidden min-w-[100px] sm:table-cell">Type</TableHead>
                                            <TableHead className="hidden min-w-[120px] md:table-cell">Created</TableHead>
                                            <TableHead className="min-w-[80px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {notifications.data.length > 0 ? (
                                            notifications.data.map((notification) => (
                                                <TableRow key={notification.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{notification.notification_id}</p>
                                                            <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                                                                {notification.title}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            {getChannelIcon(notification.channel)}
                                                            <span className="capitalize">{notification.channel}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getPriorityBadge(notification.priority)}</TableCell>
                                                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm font-medium capitalize">
                                                                {notification.recipient_type} #{notification.recipient_id}
                                                            </p>
                                                            {notification.recipient_email && (
                                                                <p className="text-xs text-muted-foreground">{notification.recipient_email}</p>
                                                            )}
                                                            {notification.recipient_phone && (
                                                                <p className="text-xs text-muted-foreground">{notification.recipient_phone}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <span className="text-sm capitalize">{notification.type.replace('_', ' ')}</span>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div>
                                                            <p className="text-sm">{formatDateTime(notification.created_at)}</p>
                                                            {notification.sent_at && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Sent: {formatDateTime(notification.sent_at)}
                                                                </p>
                                                            )}
                                                            {notification.delivered_at && (
                                                                <p className="text-xs text-green-600">
                                                                    Delivered: {formatDateTime(notification.delivered_at)}
                                                                </p>
                                                            )}
                                                            {notification.failed_at && (
                                                                <p className="text-xs text-red-600">
                                                                    Failed: {formatDateTime(notification.failed_at)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={route('admin.notifications.show', notification.id)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>

                                                            <DropdownMenu
                                                                open={openDropdown === notification.id}
                                                                onOpenChange={(open) => setOpenDropdown(open ? notification.id : null)}
                                                            >
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleArchive(notification.id)}
                                                                        disabled={
                                                                            processingAction === `archive-${notification.id}` ||
                                                                            notification.archived_at
                                                                        }
                                                                    >
                                                                        <Archive className="mr-2 h-4 w-4" />
                                                                        {processingAction === `archive-${notification.id}`
                                                                            ? 'Archiving...'
                                                                            : 'Archive'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDeleteClick(notification.id, notification.title)}
                                                                        disabled={processingAction === `delete-${notification.id}`}
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        {processingAction === `delete-${notification.id}` ? 'Deleting...' : 'Delete'}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                                    No notifications found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {notifications?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <div className="text-center text-sm text-muted-foreground sm:text-left">
                                    Showing {notifications?.meta?.from || 0} to {notifications?.meta?.to || 0} of {notifications?.meta?.total || 0}{' '}
                                    notifications
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                                    {notifications?.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="min-w-[40px]"
                                        />
                                    )) || []}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(open) => !open && handleDeleteCancel()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the notification "{deleteConfirmation.notificationTitle}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel} disabled={processingAction === `delete-${deleteConfirmation.notificationId}`}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={processingAction === `delete-${deleteConfirmation.notificationId}`}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {processingAction === `delete-${deleteConfirmation.notificationId}` ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
