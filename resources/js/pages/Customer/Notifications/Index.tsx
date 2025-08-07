import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { toast } from '@/hooks/useToast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import SimpleNotificationPreferences from '@/components/customer/notifications/SimpleNotificationPreferences';
import NotificationHistory from '@/components/customer/notifications/NotificationHistory';
import {
    Bell,
    Settings,
    History,
    CheckCircle,
    AlertTriangle,
    Info
} from 'lucide-react';

interface Props {
    preferences?: any;
    notifications?: any[];
    stats?: {
        total: number;
        unread: number;
        failed: number;
        today: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function NotificationsIndex({
    preferences = {},
    notifications = [],
    stats = { total: 0, unread: 0, failed: 0, today: 0 },
    flash = {}
}: Props) {
    const [activeTab, setActiveTab] = useState('preferences');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Success",
                description: flash.success,
                variant: "success",
            });
        }
        if (flash?.error) {
            toast({
                title: "Error",
                description: flash.error,
                variant: "destructive",
            });
        }
    }, [flash]);



    const handleMarkAsRead = (notificationId: number | string) => {
        if (isProcessing) return;
        setIsProcessing(true);

        router.post(`/customer/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            only: ['notifications', 'stats', 'flash'],
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleArchive = (notificationId: number | string) => {
        if (isProcessing) return;
        setIsProcessing(true);

        router.post(`/customer/notifications/${notificationId}/archive`, {}, {
            preserveScroll: true,
            only: ['notifications', 'stats', 'flash'],
            onFinish: () => setIsProcessing(false)
        });
    };

    const handleDelete = (notificationId: number | string) => {
        if (isProcessing) return;
        setShowDeleteConfirm(notificationId.toString());
    };

    const confirmDelete = () => {
        if (showDeleteConfirm && !isProcessing) {
            setIsProcessing(true);
            router.delete(`/customer/notifications/${showDeleteConfirm}`, {
                preserveScroll: true,
                only: ['notifications', 'stats', 'flash'],
                onFinish: () => {
                    setShowDeleteConfirm(null);
                    setIsProcessing(false);
                }
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(null);
        // Small delay to ensure state is properly reset
        setTimeout(() => setIsProcessing(false), 100);
    };

    const handleMarkAllAsRead = () => {
        if (isProcessing) return;
        setIsProcessing(true);

        router.post('/customer/notifications/read-all', {}, {
            preserveScroll: true,
            only: ['notifications', 'stats', 'flash'],
            onFinish: () => setIsProcessing(false)
        });
    };

    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-gray-600">
                            Manage your notification preferences and view your notification history
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Bell className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                    <p className="text-sm text-gray-600">Total Notifications</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Info className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.unread}</p>
                                    <p className="text-sm text-gray-600">Unread</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.failed}</p>
                                    <p className="text-sm text-gray-600">Failed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.today}</p>
                                    <p className="text-sm text-gray-600">Today</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preferences" className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>Preferences</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center space-x-2">
                            <History className="h-4 w-4" />
                            <span>History</span>
                            {stats.unread > 0 && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                    {stats.unread}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preferences" className="space-y-6">
                        <SimpleNotificationPreferences
                            preferences={preferences}
                        />
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6">
                        <NotificationHistory
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                            onMarkAllAsRead={handleMarkAllAsRead}
                            isProcessing={isProcessing}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && cancelDelete()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this notification? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDelete} disabled={isProcessing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                            {isProcessing ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}