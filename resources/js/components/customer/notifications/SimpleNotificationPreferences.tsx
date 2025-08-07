import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Separator } from '@/components/ui/separator';
import { router } from '@inertiajs/react';
import { 
    Bell,
    Mail,
    MessageSquare,
    Smartphone,
    CheckCircle,
    AlertTriangle,
    Package,
    CreditCard,
    Shield,
    Save,
    RefreshCw
} from 'lucide-react';

interface NotificationChannel {
    id: string;
    name: string;
    icon: React.ReactNode;
    enabled: boolean;
    verified: boolean;
    description: string;
}

interface NotificationType {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
}

interface Props {
    preferences?: any;
    onSave?: (preferences: any) => void;
    className?: string;
    isProcessing?: boolean;
}

export default function SimpleNotificationPreferences({
    preferences = {},
    onSave,
    className = '',
    isProcessing = false
}: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const [emailAddress, setEmailAddress] = useState(preferences.contact_info?.email_address || '');
    const [phoneNumber, setPhoneNumber] = useState(preferences.contact_info?.phone_number || '');
    
    // Get initial channel settings from preferences
    const getInitialChannels = (): NotificationChannel[] => [
        {
            id: 'email',
            name: 'Email',
            icon: <Mail className="h-4 w-4" />,
            enabled: preferences.global_channels?.email ?? true,
            verified: true,
            description: 'Receive all notifications via email'
        },
        {
            id: 'sms',
            name: 'SMS',
            icon: <MessageSquare className="h-4 w-4" />,
            enabled: preferences.global_channels?.sms ?? false,
            verified: !!phoneNumber,
            description: 'Receive all notifications via text message'
        },
        {
            id: 'push',
            name: 'Push Notifications',
            icon: <Smartphone className="h-4 w-4" />,
            enabled: preferences.global_channels?.push ?? false,
            verified: false,
            description: 'Receive all notifications via browser push'
        }
    ];

    // Notification channels
    const [channels, setChannels] = useState<NotificationChannel[]>(getInitialChannels());

    // Notification types
    const getInitialNotificationTypes = (): NotificationType[] => [
        {
            id: 'shipment_created',
            name: 'Shipment Created',
            description: 'Notifications when new shipments are created',
            icon: <Package className="h-4 w-4" />,
            enabled: Boolean(preferences.notification_types?.shipment_created ?? true)
        },
        {
            id: 'shipment_picked_up',
            name: 'Shipment Picked Up',
            description: 'Notifications when shipments are picked up',
            icon: <Package className="h-4 w-4" />,
            enabled: Boolean(preferences.notification_types?.shipment_picked_up ?? true)
        },
        {
            id: 'shipment_in_transit',
            name: 'In Transit',
            description: 'Notifications when shipments are in transit',
            icon: <Package className="h-4 w-4" />,
            enabled: Boolean(preferences.notification_types?.shipment_in_transit ?? false)
        },
        {
            id: 'shipment_delivered',
            name: 'Delivery Completed',
            description: 'Notifications when packages are delivered',
            icon: <CheckCircle className="h-4 w-4" />,
            enabled: Boolean(preferences.notification_types?.shipment_delivered ?? true)
        },
        {
            id: 'shipment_exception',
            name: 'Delivery Exceptions',
            description: 'Notifications about delivery issues',
            icon: <AlertTriangle className="h-4 w-4" />,
            enabled: Boolean(preferences.notification_types?.shipment_exception ?? true)
        },
        {
            id: 'payment_received',
            name: 'Payment Received',
            description: 'Notifications when payments are received',
            icon: <CreditCard className="h-4 w-4" />,
            enabled: Boolean(preferences.notification_types?.payment_received ?? true)
        },
        {
            id: 'account_security',
            name: 'Security Alerts',
            description: 'Account security and login notifications',
            icon: <Shield className="h-4 w-4" />,
            enabled: Boolean(preferences.notification_types?.account_security ?? true)
        }
    ];

    const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>(getInitialNotificationTypes());

    // Update notification types and channels when preferences change (e.g., after page reload)
    useEffect(() => {
        setNotificationTypes(getInitialNotificationTypes());
        setChannels(getInitialChannels());
        setEmailAddress(preferences.contact_info?.email_address || '');
        setPhoneNumber(preferences.contact_info?.phone_number || '');
    }, [preferences]);

    const handleChannelToggle = (channelId: string) => {
        setChannels(prev => prev.map(channel =>
            channel.id === channelId
                ? { ...channel, enabled: !channel.enabled }
                : channel
        ));
    };

    const handleNotificationTypeToggle = (typeId: string) => {
        setNotificationTypes(prev => prev.map(type =>
            type.id === typeId
                ? { ...type, enabled: !type.enabled }
                : type
        ));
    };



    const handleSave = async () => {
        setIsSaving(true);

        try {
            const data = {
                email_address: emailAddress,
                phone_number: phoneNumber,
                global_channels: channels.reduce((acc, channel) => {
                    acc[channel.id] = channel.enabled;
                    return acc;
                }, {} as Record<string, boolean>),
                notification_types: notificationTypes.reduce((acc, type) => {
                    acc[type.id] = type.enabled;
                    return acc;
                }, {} as Record<string, boolean>)
            };

            // Always use direct router call for simplicity
            router.post('/customer/notifications/preferences', data, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success will be shown via flash message
                },
                onError: (errors) => {
                    console.error('Failed to save preferences:', errors);
                },
                onFinish: () => {
                    setIsSaving(false);
                }
            });
        } catch (error) {
            console.error('Error saving preferences:', error);
            setIsSaving(false);
        }
    };



    return (
        <div className={`space-y-6 ${className}`}>
            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Contact Information</span>
                    </CardTitle>
                    <CardDescription>
                        Update your contact details for notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="your@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+255 XXX XXX XXX"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Channels */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                    <CardDescription>
                        Choose how you want to receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {channels.map((channel) => (
                        <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                {channel.icon}
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">{channel.name}</span>
                                        {channel.verified && (
                                            <Badge variant="secondary" className="text-xs">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{channel.description}</p>
                                </div>
                            </div>
                            <Switch
                                checked={channel.enabled}
                                onCheckedChange={() => handleChannelToggle(channel.id)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        Choose which notifications you want to receive for each channel
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {notificationTypes.map((type) => (
                        <div key={type.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-3">
                                {type.icon}
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium">{type.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{type.description}</p>
                                </div>
                            </div>

                            <Switch
                                checked={type.enabled}
                                onCheckedChange={() => handleNotificationTypeToggle(type.id)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button type="button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Preferences
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
