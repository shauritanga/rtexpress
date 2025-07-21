import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Bell,
    Mail,
    MessageSquare,
    Smartphone,
    Clock,
    Globe,
    Volume2,
    VolumeX,
    Settings,
    Save,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Info,
    Moon,
    Sun,
    Languages,
    MapPin,
    Package,
    CreditCard
} from 'lucide-react';

interface NotificationChannel {
    id: string;
    name: string;
    type: 'email' | 'sms' | 'push' | 'in_app';
    icon: React.ReactNode;
    enabled: boolean;
    verified: boolean;
    address?: string;
}

interface NotificationEvent {
    id: string;
    name: string;
    description: string;
    category: 'shipment' | 'payment' | 'account' | 'marketing';
    channels: {
        email: boolean;
        sms: boolean;
        push: boolean;
        in_app: boolean;
    };
    frequency: 'immediate' | 'daily' | 'weekly' | 'disabled';
}

interface NotificationPreferences {
    channels: NotificationChannel[];
    events: NotificationEvent[];
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        timezone: string;
    };
    language: string;
    frequency: {
        digest: 'daily' | 'weekly' | 'disabled';
        summary: 'weekly' | 'monthly' | 'disabled';
    };
}

interface Props {
    className?: string;
    onPreferencesUpdate?: (preferences: NotificationPreferences) => void;
}

export default function NotificationPreferences({ 
    className = '', 
    onPreferencesUpdate
}: Props) {
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Mock data - in real app, would fetch from API
    const mockPreferences: NotificationPreferences = {
        channels: [
            {
                id: 'email',
                name: 'Email Notifications',
                type: 'email',
                icon: <Mail className="h-4 w-4" />,
                enabled: true,
                verified: true,
                address: 'customer@example.com',
            },
            {
                id: 'sms',
                name: 'SMS Notifications',
                type: 'sms',
                icon: <MessageSquare className="h-4 w-4" />,
                enabled: true,
                verified: true,
                address: '+1 (555) 123-4567',
            },
            {
                id: 'push',
                name: 'Push Notifications',
                type: 'push',
                icon: <Smartphone className="h-4 w-4" />,
                enabled: false,
                verified: false,
            },
            {
                id: 'in_app',
                name: 'In-App Notifications',
                type: 'in_app',
                icon: <Bell className="h-4 w-4" />,
                enabled: true,
                verified: true,
            },
        ],
        events: [
            {
                id: 'shipment_created',
                name: 'Shipment Created',
                description: 'When a new shipment is created',
                category: 'shipment',
                channels: { email: true, sms: false, push: true, in_app: true },
                frequency: 'immediate',
            },
            {
                id: 'shipment_picked_up',
                name: 'Shipment Picked Up',
                description: 'When your shipment is picked up',
                category: 'shipment',
                channels: { email: true, sms: true, push: true, in_app: true },
                frequency: 'immediate',
            },
            {
                id: 'shipment_in_transit',
                name: 'Shipment In Transit',
                description: 'Transit updates and location changes',
                category: 'shipment',
                channels: { email: false, sms: false, push: true, in_app: true },
                frequency: 'daily',
            },
            {
                id: 'shipment_delivered',
                name: 'Shipment Delivered',
                description: 'When your shipment is delivered',
                category: 'shipment',
                channels: { email: true, sms: true, push: true, in_app: true },
                frequency: 'immediate',
            },
            {
                id: 'shipment_exception',
                name: 'Delivery Exception',
                description: 'Delays, customs holds, or delivery issues',
                category: 'shipment',
                channels: { email: true, sms: true, push: true, in_app: true },
                frequency: 'immediate',
            },
            {
                id: 'payment_due',
                name: 'Payment Due',
                description: 'Invoice payment reminders',
                category: 'payment',
                channels: { email: true, sms: false, push: false, in_app: true },
                frequency: 'immediate',
            },
            {
                id: 'payment_received',
                name: 'Payment Received',
                description: 'Payment confirmation notifications',
                category: 'payment',
                channels: { email: true, sms: false, push: false, in_app: true },
                frequency: 'immediate',
            },
            {
                id: 'account_security',
                name: 'Security Alerts',
                description: 'Login attempts and security changes',
                category: 'account',
                channels: { email: true, sms: true, push: false, in_app: true },
                frequency: 'immediate',
            },
        ],
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
            timezone: 'America/New_York',
        },
        language: 'en',
        frequency: {
            digest: 'daily',
            summary: 'weekly',
        },
    };

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPreferences(mockPreferences);
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChannelToggle = (channelId: string, enabled: boolean) => {
        if (!preferences) return;

        const updatedPreferences = {
            ...preferences,
            channels: preferences.channels.map(channel =>
                channel.id === channelId ? { ...channel, enabled } : channel
            ),
        };

        setPreferences(updatedPreferences);
        setHasChanges(true);
    };

    const handleEventChannelToggle = (eventId: string, channelType: keyof NotificationEvent['channels'], enabled: boolean) => {
        if (!preferences) return;

        const updatedPreferences = {
            ...preferences,
            events: preferences.events.map(event =>
                event.id === eventId 
                    ? { ...event, channels: { ...event.channels, [channelType]: enabled } }
                    : event
            ),
        };

        setPreferences(updatedPreferences);
        setHasChanges(true);
    };

    const handleEventFrequencyChange = (eventId: string, frequency: NotificationEvent['frequency']) => {
        if (!preferences) return;

        const updatedPreferences = {
            ...preferences,
            events: preferences.events.map(event =>
                event.id === eventId ? { ...event, frequency } : event
            ),
        };

        setPreferences(updatedPreferences);
        setHasChanges(true);
    };

    const handleQuietHoursToggle = (enabled: boolean) => {
        if (!preferences) return;

        const updatedPreferences = {
            ...preferences,
            quietHours: { ...preferences.quietHours, enabled },
        };

        setPreferences(updatedPreferences);
        setHasChanges(true);
    };

    const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
        if (!preferences) return;

        const updatedPreferences = {
            ...preferences,
            quietHours: { ...preferences.quietHours, [field]: value },
        };

        setPreferences(updatedPreferences);
        setHasChanges(true);
    };

    const handleLanguageChange = (language: string) => {
        if (!preferences) return;

        const updatedPreferences = { ...preferences, language };
        setPreferences(updatedPreferences);
        setHasChanges(true);
    };

    const handleFrequencyChange = (type: 'digest' | 'summary', frequency: string) => {
        if (!preferences) return;

        const updatedPreferences = {
            ...preferences,
            frequency: { ...preferences.frequency, [type]: frequency },
        };

        setPreferences(updatedPreferences);
        setHasChanges(true);
    };

    const savePreferences = async () => {
        if (!preferences) return;

        setIsSaving(true);
        setErrors({});

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setHasChanges(false);
            onPreferencesUpdate?.(preferences);

            // Show success message
            console.log('Notification preferences saved successfully');

        } catch (error) {
            setErrors({ general: 'Failed to save preferences. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const resetPreferences = () => {
        setPreferences(mockPreferences);
        setHasChanges(false);
        setErrors({});
    };

    const getCategoryIcon = (category: string) => {
        const icons = {
            shipment: <Package className="h-4 w-4" />,
            payment: <CreditCard className="h-4 w-4" />,
            account: <Settings className="h-4 w-4" />,
            marketing: <Mail className="h-4 w-4" />,
        };
        return icons[category as keyof typeof icons] || <Bell className="h-4 w-4" />;
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            shipment: 'bg-blue-100 text-blue-800 border-blue-300',
            payment: 'bg-green-100 text-green-800 border-green-300',
            account: 'bg-purple-100 text-purple-800 border-purple-300',
            marketing: 'bg-orange-100 text-orange-800 border-orange-300',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getFrequencyColor = (frequency: string) => {
        const colors = {
            immediate: 'bg-red-100 text-red-800 border-red-300',
            daily: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            weekly: 'bg-blue-100 text-blue-800 border-blue-300',
            disabled: 'bg-gray-100 text-gray-800 border-gray-300',
        };
        return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'sw', name: 'Kiswahili' },
    ];

    const timezones = [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Africa/Nairobi',
        'Asia/Tokyo',
    ];

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading notification preferences...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!preferences) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Preferences</h3>
                        <p className="text-gray-600 mb-4">Unable to load your notification preferences</p>
                        <Button onClick={loadPreferences}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg sm:text-xl flex items-center">
                            <Bell className="h-5 w-5 mr-2" />
                            Notification Preferences
                        </CardTitle>
                        <CardDescription>
                            Customize how and when you receive notifications
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {hasChanges && (
                            <Button variant="outline" onClick={resetPreferences}>
                                Reset
                            </Button>
                        )}
                        <Button 
                            onClick={savePreferences} 
                            disabled={!hasChanges || isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-8">
                {/* Errors */}
                {errors.general && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <p className="text-sm text-red-800">{errors.general}</p>
                        </div>
                    </div>
                )}

                {/* Notification Channels */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Notification Channels
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {preferences.channels.map((channel) => (
                            <Card key={channel.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            {channel.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{channel.name}</h4>
                                            {channel.address && (
                                                <p className="text-sm text-gray-600">{channel.address}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                {channel.verified ? (
                                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Unverified
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={channel.enabled}
                                        onCheckedChange={(enabled) => handleChannelToggle(channel.id, enabled)}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Event Notifications */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center">
                        <Bell className="h-4 w-4 mr-2" />
                        Event Notifications
                    </h3>
                    
                    <div className="space-y-4">
                        {preferences.events.map((event) => (
                            <Card key={event.id} className="p-4">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-gray-900">{event.name}</h4>
                                                <Badge className={getCategoryColor(event.category)}>
                                                    {getCategoryIcon(event.category)}
                                                    <span className="ml-1 capitalize">{event.category}</span>
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{event.description}</p>
                                        </div>
                                        <div className="ml-4">
                                            <Select
                                                value={event.frequency}
                                                onValueChange={(frequency) => handleEventFrequencyChange(event.id, frequency as NotificationEvent['frequency'])}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="immediate">Immediate</SelectItem>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="disabled">Disabled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {preferences.channels.filter(ch => ch.enabled).map((channel) => (
                                            <div key={channel.id} className="flex items-center space-x-2">
                                                <Switch
                                                    checked={event.channels[channel.type]}
                                                    onCheckedChange={(enabled) => handleEventChannelToggle(event.id, channel.type, enabled)}
                                                    disabled={event.frequency === 'disabled'}
                                                />
                                                <div className="flex items-center gap-1">
                                                    {channel.icon}
                                                    <span className="text-sm text-gray-700 capitalize">{channel.type}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Quiet Hours */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        Quiet Hours
                    </h3>
                    
                    <Card className="p-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">Enable Quiet Hours</h4>
                                    <p className="text-sm text-gray-600">Pause non-urgent notifications during specified hours</p>
                                </div>
                                <Switch
                                    checked={preferences.quietHours.enabled}
                                    onCheckedChange={handleQuietHoursToggle}
                                />
                            </div>
                            
                            {preferences.quietHours.enabled && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="quiet-start">Start Time</Label>
                                        <Input
                                            id="quiet-start"
                                            type="time"
                                            value={preferences.quietHours.start}
                                            onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="quiet-end">End Time</Label>
                                        <Input
                                            id="quiet-end"
                                            type="time"
                                            value={preferences.quietHours.end}
                                            onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select value={preferences.quietHours.timezone} onValueChange={(tz) => setPreferences({...preferences, quietHours: {...preferences.quietHours, timezone: tz}})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timezones.map(tz => (
                                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Language & Frequency Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center">
                            <Languages className="h-4 w-4 mr-2" />
                            Language
                        </h3>
                        <Select value={preferences.language} onValueChange={handleLanguageChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Summary Frequency
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="digest-frequency">Daily Digest</Label>
                                <Select 
                                    value={preferences.frequency.digest} 
                                    onValueChange={(freq) => handleFrequencyChange('digest', freq)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="summary-frequency">Weekly Summary</Label>
                                <Select 
                                    value={preferences.frequency.summary} 
                                    onValueChange={(freq) => handleFrequencyChange('summary', freq)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900 mb-1">About Notifications</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Critical security alerts cannot be disabled</li>
                                <li>• Quiet hours don't apply to urgent delivery exceptions</li>
                                <li>• SMS charges may apply based on your mobile plan</li>
                                <li>• Email notifications include tracking links and attachments</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
