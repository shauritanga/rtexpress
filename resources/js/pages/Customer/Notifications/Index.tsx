import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import NotificationPreferences from '@/components/customer/notifications/NotificationPreferences';
import NotificationHistory from '@/components/customer/notifications/NotificationHistory';
import SmartNotifications from '@/components/customer/notifications/SmartNotifications';
import {
    Bell,
    Settings,
    History,
    Zap,
    Brain,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertTriangle,
    Mail,
    MessageSquare,
    Smartphone,
    RefreshCw
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
    contact_person: string;
}

interface NotificationSummary {
    total_notifications: number;
    unread_count: number;
    today_count: number;
    failed_count: number;
    channels: {
        email: {
            enabled: boolean;
            verified: boolean;
            success_rate: number;
        };
        sms: {
            enabled: boolean;
            verified: boolean;
            success_rate: number;
        };
        push: {
            enabled: boolean;
            verified: boolean;
            success_rate: number;
        };
        in_app: {
            enabled: boolean;
            verified: boolean;
            success_rate: number;
        };
    };
    smart_rules: {
        total: number;
        active: number;
        triggered_today: number;
    };
    proactive_alerts: {
        active: number;
        dismissed_today: number;
    };
}

interface Props {
    customer: Customer;
    summary: NotificationSummary;
}

export default function NotificationCenter({ customer, summary }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Mock data - in real app, would come from props
    const mockSummary: NotificationSummary = {
        total_notifications: 247,
        unread_count: 12,
        today_count: 8,
        failed_count: 3,
        channels: {
            email: { enabled: true, verified: true, success_rate: 98.5 },
            sms: { enabled: true, verified: true, success_rate: 97.2 },
            push: { enabled: false, verified: false, success_rate: 0 },
            in_app: { enabled: true, verified: true, success_rate: 100 },
        },
        smart_rules: {
            total: 5,
            active: 4,
            triggered_today: 2,
        },
        proactive_alerts: {
            active: 3,
            dismissed_today: 1,
        },
    };

    const currentSummary = summary || mockSummary;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            // In real app, would refresh data
        } catch (error) {
            console.error('Failed to refresh notification data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const getChannelIcon = (channel: string) => {
        const icons = {
            email: <Mail className="h-4 w-4" />,
            sms: <MessageSquare className="h-4 w-4" />,
            push: <Smartphone className="h-4 w-4" />,
            in_app: <Bell className="h-4 w-4" />,
        };
        return icons[channel as keyof typeof icons];
    };

    const getChannelStatus = (channelData: any) => {
        if (!channelData.enabled) {
            return <Badge variant="outline" className="bg-gray-100 text-gray-600">Disabled</Badge>;
        }
        if (!channelData.verified) {
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Unverified</Badge>;
        }
        if (channelData.success_rate >= 95) {
            return <Badge className="bg-green-100 text-green-800 border-green-300">Excellent</Badge>;
        }
        if (channelData.success_rate >= 90) {
            return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Good</Badge>;
        }
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Needs Attention</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Notification Center" />

            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                                <Bell className="h-8 w-8 mr-3 text-blue-600" />
                                Notification Center
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • Manage your notification preferences and history
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600">Total Notifications</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900">
                                    {currentSummary.total_notifications.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600">Unread</p>
                                <p className="text-lg sm:text-xl font-bold text-orange-600">
                                    {currentSummary.unread_count}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Clock className="h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600">Today</p>
                                <p className="text-lg sm:text-xl font-bold text-green-600">
                                    {currentSummary.today_count}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Zap className="h-5 w-5 text-purple-600" />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600">Smart Rules</p>
                                <p className="text-lg sm:text-xl font-bold text-purple-600">
                                    {currentSummary.smart_rules.active}/{currentSummary.smart_rules.total}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Channel Status Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Channel Status Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(currentSummary.channels).map(([channel, data]) => (
                                <div key={channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        {getChannelIcon(channel)}
                                        <div>
                                            <p className="font-medium text-gray-900 capitalize">
                                                {channel.replace('_', ' ')}
                                            </p>
                                            {data.enabled && data.verified && (
                                                <p className="text-xs text-gray-600">
                                                    {data.success_rate}% success rate
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {getChannelStatus(data)}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Preferences</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            <span className="hidden sm:inline">History</span>
                        </TabsTrigger>
                        <TabsTrigger value="smart" className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <span className="hidden sm:inline">Smart</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                            {/* Recent Activity Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm">Shipment delivered notification sent</span>
                                            </div>
                                            <span className="text-xs text-gray-500">2h ago</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-yellow-600" />
                                                <span className="text-sm">Payment reminder scheduled</span>
                                            </div>
                                            <span className="text-xs text-gray-500">4h ago</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Brain className="h-4 w-4 text-purple-600" />
                                                <span className="text-sm">Smart rule triggered: High value tracking</span>
                                            </div>
                                            <span className="text-xs text-gray-500">6h ago</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Smart Insights Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Smart Insights</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                                <span className="font-medium text-green-900">Opportunity Detected</span>
                                            </div>
                                            <p className="text-sm text-green-800">
                                                Switch to Express+ service to save 15% on international shipments
                                            </p>
                                        </div>
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                <span className="font-medium text-yellow-900">Weather Alert</span>
                                            </div>
                                            <p className="text-sm text-yellow-800">
                                                Potential delays in Chicago area due to severe weather
                                            </p>
                                        </div>
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Brain className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium text-blue-900">Volume Analysis</span>
                                            </div>
                                            <p className="text-sm text-blue-800">
                                                34% increase in shipping volume this month
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="preferences">
                        <NotificationPreferences
                            onPreferencesUpdate={(preferences) => {
                                console.log('Preferences updated:', preferences);
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="history">
                        <NotificationHistory
                            onNotificationAction={(action, notificationId) => {
                                console.log('Notification action:', action, notificationId);
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="smart">
                        <SmartNotifications
                            onRuleUpdate={(rule) => {
                                console.log('Rule updated:', rule);
                            }}
                            onAlertAction={(alertId, action) => {
                                console.log('Alert action:', alertId, action);
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
