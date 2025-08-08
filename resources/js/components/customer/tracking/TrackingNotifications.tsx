import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Bell, Check, Info, Mail, MessageSquare, Settings } from 'lucide-react';
import { useState } from 'react';

interface NotificationSettings {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    status_updates: boolean;
    delivery_reminders: boolean;
    exception_alerts: boolean;
    delivery_confirmation: boolean;
}

interface TrackingNotification {
    id: string;
    type: 'status_update' | 'delivery_reminder' | 'exception' | 'delivery_confirmation';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    tracking_number: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

interface Props {
    trackingNumber: string;
    notifications?: TrackingNotification[];
    settings?: NotificationSettings;
    onSettingsUpdate?: (settings: NotificationSettings) => void;
}

export default function TrackingNotifications({
    trackingNumber,
    notifications = [],
    settings = {
        email_enabled: true,
        sms_enabled: false,
        push_enabled: true,
        status_updates: true,
        delivery_reminders: true,
        exception_alerts: true,
        delivery_confirmation: true,
    },
    onSettingsUpdate,
}: Props) {
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(settings);
    const [showSettings, setShowSettings] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
        const newSettings = { ...notificationSettings, [key]: value };
        setNotificationSettings(newSettings);
        onSettingsUpdate?.(newSettings);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'status_update':
                return <Info className="h-4 w-4" />;
            case 'delivery_reminder':
                return <Bell className="h-4 w-4" />;
            case 'exception':
                return <AlertCircle className="h-4 w-4" />;
            case 'delivery_confirmation':
                return <Check className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'info':
                return 'bg-blue-100 text-blue-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'success':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Mock notifications for demonstration
    const mockNotifications: TrackingNotification[] = [
        {
            id: '1',
            type: 'status_update',
            title: 'Package In Transit',
            message: 'Your package has left the Dar es Salaam facility and is on its way to Dodoma.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            tracking_number: trackingNumber,
            severity: 'info',
        },
        {
            id: '2',
            type: 'delivery_reminder',
            title: 'Delivery Scheduled',
            message: 'Your package is scheduled for delivery tomorrow between 9:00 AM - 6:00 PM.',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            read: true,
            tracking_number: trackingNumber,
            severity: 'info',
        },
        {
            id: '3',
            type: 'status_update',
            title: 'Package Picked Up',
            message: 'Your package has been picked up from the sender and is being processed.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            tracking_number: trackingNumber,
            severity: 'success',
        },
    ];

    const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;

    return (
        <div className="space-y-6">
            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Tracking Notifications
                            </CardTitle>
                            <CardDescription>Stay updated on your shipment status</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {displayNotifications.length > 0 ? (
                            displayNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                                        notification.read ? 'bg-gray-50' : 'border-blue-200 bg-blue-50'
                                    }`}
                                >
                                    <div className="mt-1 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h4 className="text-sm font-medium">{notification.title}</h4>
                                            <Badge className={getSeverityColor(notification.severity)}>{notification.type.replace('_', ' ')}</Badge>
                                            {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-600"></div>}
                                        </div>
                                        <p className="mb-2 text-sm text-gray-600">{notification.message}</p>
                                        <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(notification.timestamp))} ago</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500">No notifications yet</p>
                                <p className="text-sm text-gray-400">You'll receive updates as your package moves</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            {showSettings && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Notification Preferences
                        </CardTitle>
                        <CardDescription>Choose how you want to receive tracking updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Delivery Methods */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Delivery Methods</h4>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <Label htmlFor="email">Email Notifications</Label>
                                        <p className="text-sm text-gray-500">Receive updates via email</p>
                                    </div>
                                </div>
                                <Switch
                                    id="email"
                                    checked={notificationSettings.email_enabled}
                                    onCheckedChange={(checked) => handleSettingChange('email_enabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <Label htmlFor="sms">SMS Notifications</Label>
                                        <p className="text-sm text-gray-500">Receive updates via text message</p>
                                    </div>
                                </div>
                                <Switch
                                    id="sms"
                                    checked={notificationSettings.sms_enabled}
                                    onCheckedChange={(checked) => handleSettingChange('sms_enabled', checked)}
                                />
                            </div>

                            {notificationSettings.sms_enabled && (
                                <div className="ml-7 space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+255 XXX XXX XXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <Label htmlFor="push">Push Notifications</Label>
                                        <p className="text-sm text-gray-500">Receive browser notifications</p>
                                    </div>
                                </div>
                                <Switch
                                    id="push"
                                    checked={notificationSettings.push_enabled}
                                    onCheckedChange={(checked) => handleSettingChange('push_enabled', checked)}
                                />
                            </div>
                        </div>

                        {/* Notification Types */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Notification Types</h4>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="status_updates">Status Updates</Label>
                                    <p className="text-sm text-gray-500">When your package status changes</p>
                                </div>
                                <Switch
                                    id="status_updates"
                                    checked={notificationSettings.status_updates}
                                    onCheckedChange={(checked) => handleSettingChange('status_updates', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="delivery_reminders">Delivery Reminders</Label>
                                    <p className="text-sm text-gray-500">Reminders about upcoming deliveries</p>
                                </div>
                                <Switch
                                    id="delivery_reminders"
                                    checked={notificationSettings.delivery_reminders}
                                    onCheckedChange={(checked) => handleSettingChange('delivery_reminders', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="exception_alerts">Exception Alerts</Label>
                                    <p className="text-sm text-gray-500">Important alerts about delivery issues</p>
                                </div>
                                <Switch
                                    id="exception_alerts"
                                    checked={notificationSettings.exception_alerts}
                                    onCheckedChange={(checked) => handleSettingChange('exception_alerts', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="delivery_confirmation">Delivery Confirmation</Label>
                                    <p className="text-sm text-gray-500">Confirmation when package is delivered</p>
                                </div>
                                <Switch
                                    id="delivery_confirmation"
                                    checked={notificationSettings.delivery_confirmation}
                                    onCheckedChange={(checked) => handleSettingChange('delivery_confirmation', checked)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => setShowSettings(false)}>Save Preferences</Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
