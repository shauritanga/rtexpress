import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Package,
    MapPin,
    Clock,
    Truck,
    CheckCircle,
    User,
    Calendar,
    ArrowLeft,
    Share,
    Download,
    Bell
} from 'lucide-react';

interface TimelineItem {
    title: string;
    description: string;
    date: string | null;
    status: 'completed' | 'pending';
    icon: string;
}

interface Shipment {
    tracking_number: string;
    status: string;
    service_type: string;
    estimated_delivery_date: string;
    actual_delivery_date: string | null;
    sender_name: string;
    recipient_name: string;
    recipient_address: string;
    origin_warehouse: {
        name: string;
        city: string;
        country: string;
    } | null;
    destination_warehouse: {
        name: string;
        city: string;
        country: string;
    } | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    shipment: Shipment;
    timeline: TimelineItem[];
    progress: number;
    recentSearches: string[];
}

export default function TrackingResult({ shipment, timeline, progress, recentSearches }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'out_for_delivery':
                return 'bg-blue-100 text-blue-800';
            case 'in_transit':
                return 'bg-yellow-100 text-yellow-800';
            case 'picked_up':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'Delivered';
            case 'out_for_delivery':
                return 'Out for Delivery';
            case 'in_transit':
                return 'In Transit';
            case 'picked_up':
                return 'Picked Up';
            case 'pending':
                return 'Pending Pickup';
            default:
                return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    };

    const getIcon = (iconName: string) => {
        const icons = {
            Package,
            Truck,
            MapPin,
            CheckCircle,
            Clock,
        };
        return icons[iconName as keyof typeof icons] || Package;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <MarketingLayout>
            <Head title={`Track ${shipment.tracking_number} - RT Express`} />
            
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" className="mb-4" asChild>
                            <Link href="/track">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Tracking
                            </Link>
                        </Button>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Tracking: {shipment.tracking_number}
                                </h1>
                                <div className="flex items-center space-x-4">
                                    <Badge className={getStatusColor(shipment.status)}>
                                        {getStatusText(shipment.status)}
                                    </Badge>
                                    <span className="text-sm text-gray-500 capitalize">
                                        {shipment.service_type} Service
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2 mt-4 sm:mt-0">
                                <Button variant="outline" size="sm">
                                    <Share className="h-4 w-4 mr-2" />
                                    Share
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notify
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Tracking Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Progress */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Package className="h-5 w-5 mr-2" />
                                        Delivery Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                        {shipment.estimated_delivery_date && (
                                            <div className="text-sm text-gray-600">
                                                <strong>Estimated Delivery:</strong> {formatDate(shipment.estimated_delivery_date)}
                                            </div>
                                        )}
                                        {shipment.actual_delivery_date && (
                                            <div className="text-sm text-green-600">
                                                <strong>Delivered:</strong> {formatDate(shipment.actual_delivery_date)}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Clock className="h-5 w-5 mr-2" />
                                        Tracking Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {timeline.map((item, index) => {
                                            const Icon = getIcon(item.icon);
                                            const isCompleted = item.status === 'completed';
                                            
                                            return (
                                                <div key={index} className="flex items-start space-x-4">
                                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                                        isCompleted 
                                                            ? 'bg-green-100 text-green-600' 
                                                            : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-medium ${
                                                            isCompleted ? 'text-gray-900' : 'text-gray-500'
                                                        }`}>
                                                            {item.title}
                                                        </div>
                                                        <div className={`text-sm ${
                                                            isCompleted ? 'text-gray-600' : 'text-gray-400'
                                                        }`}>
                                                            {item.description}
                                                        </div>
                                                        {item.date && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatDate(item.date)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Shipment Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Shipment Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">From</div>
                                        <div className="text-sm">{shipment.sender_name}</div>
                                        {shipment.origin_warehouse && (
                                            <div className="text-xs text-gray-500">
                                                {shipment.origin_warehouse.city}, {shipment.origin_warehouse.country}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <div className="text-sm font-medium text-gray-500">To</div>
                                        <div className="text-sm">{shipment.recipient_name}</div>
                                        <div className="text-xs text-gray-500">
                                            {shipment.recipient_address}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Service Type</div>
                                        <div className="text-sm capitalize">{shipment.service_type}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-gray-500">Shipped Date</div>
                                        <div className="text-sm">{formatDate(shipment.created_at)}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recent Searches</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {recentSearches.slice(0, 5).map((trackingNumber, index) => (
                                                <Link
                                                    key={index}
                                                    href={`/track?tracking_number=${trackingNumber}`}
                                                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {trackingNumber}
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Help */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Need Help?</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/contact">
                                            Contact Support
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        Report Issue
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        FAQ
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
