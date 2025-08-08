import RealTimeTracker from '@/components/customer/tracking/RealTimeTracker';
import TrackingMap from '@/components/customer/tracking/TrackingMap';
import TrackingTimeline from '@/components/customer/tracking/TrackingTimeline';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarcodeScanResult } from '@/hooks/useBarcodeScanner';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Bell, Clock, Download, MapPin, Package, Scan, Search, Share, Truck } from 'lucide-react';
import { useState } from 'react';

interface TrackingEvent {
    id: string;
    timestamp: string;
    status: string;
    location: string;
    description: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    driver?: {
        name: string;
        phone: string;
        photo?: string;
    };
    photos?: string[];
    details?: string;
}

interface ShipmentTracking {
    tracking_number: string;
    current_status: string;
    estimated_delivery: string;
    current_location: {
        lat: number;
        lng: number;
        address: string;
    };
    destination: {
        lat: number;
        lng: number;
        address: string;
    };
    driver?: {
        name: string;
        phone: string;
        photo?: string;
        vehicle: string;
    };
    events: TrackingEvent[];
    delivery_window?: string;
    special_instructions?: string;
}

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
}

interface Props {
    customer: Customer;
    trackingNumber?: string;
    trackingData?: ShipmentTracking;
}

export default function TrackingIndex({ customer, trackingNumber, trackingData }: Props) {
    const [activeTab, setActiveTab] = useState('search');

    // Handle barcode scan
    const handleScan = async (result: BarcodeScanResult) => {
        const code = result.decodedText.trim().toUpperCase();

        // Navigate to tracking page with the scanned code
        router.get('/customer/tracking', { tracking_number: code });
    };

    // Show tracking search interface when no tracking data
    if (!trackingData) {
        return (
            <AppLayout customer={customer}>
                <Head title="Track Shipment" />
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8 text-center">
                        <h1 className="mb-4 text-2xl font-bold text-gray-900">Package Tracking</h1>
                        <p className="text-gray-600">Search for your shipment using tracking number or scan barcode.</p>
                    </div>

                    {/* Tracking Methods Tabs */}
                    <div className="mx-auto max-w-4xl">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="search" className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Search
                                </TabsTrigger>
                                <TabsTrigger value="scanner" className="flex items-center gap-2">
                                    <Scan className="h-4 w-4" />
                                    Scanner
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="search" className="space-y-4">
                                <RealTimeTracker trackingNumber={trackingNumber} />
                            </TabsContent>

                            <TabsContent value="scanner" className="space-y-4">
                                <BarcodeScanner
                                    onScan={handleScan}
                                    title="Scan Tracking Barcode"
                                    description="Point your camera at the barcode on your shipping label"
                                    size="lg"
                                    autoStop={true}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Use real tracking data only - NO MOCK DATA
    const realTrackingData: ShipmentTracking = trackingData;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Track Shipment ${realTrackingData.tracking_number}`,
                    text: `Track your RT Express shipment`,
                    url: window.location.href,
                });
            } catch (err) {
                // Fallback to clipboard
                navigator.clipboard.writeText(window.location.href);
            }
        }
    };

    const handleNotificationToggle = () => {
        // In a real app, this would toggle push notifications
        console.log('Toggle notifications');
    };

    const handleDownloadReport = () => {
        // In a real app, this would generate and download a tracking report
        console.log('Download tracking report');
    };

    return (
        <AppLayout>
            <Head title="Track Shipment" />

            <div className="space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
                {/* Header - Mobile Optimized */}
                <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>

                            {/* Action Buttons - Mobile Responsive */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleShare} className="p-2 sm:px-3">
                                    <Share className="h-4 w-4" />
                                    <span className="ml-2 hidden sm:inline">Share</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleNotificationToggle} className="p-2 sm:px-3">
                                    <Bell className="h-4 w-4" />
                                    <span className="ml-2 hidden sm:inline">Alerts</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownloadReport} className="p-2 sm:px-3">
                                    <Download className="h-4 w-4" />
                                    <span className="ml-2 hidden sm:inline">Report</span>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h1 className="flex items-center text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
                                <Package className="mr-3 h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
                                Real-time Tracking
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 sm:text-base">{customer.company_name} • Live shipment monitoring and updates</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats - Mobile First Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">ETA</p>
                                    <p className="truncate text-sm font-bold text-gray-900 sm:text-lg">
                                        {new Date(realTrackingData.estimated_delivery).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Status</p>
                                    <p className="truncate text-sm font-bold text-gray-900 capitalize sm:text-lg">
                                        {realTrackingData.current_status.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Location</p>
                                    <p className="truncate text-sm font-bold text-gray-900 sm:text-lg">
                                        {realTrackingData.current_location?.address || 'Location updating...'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Events</p>
                                    <p className="text-sm font-bold text-gray-900 sm:text-lg">{realTrackingData.events.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Tracking Interface */}
                <RealTimeTracker
                    trackingNumber={trackingNumber}
                    className="lg:hidden" // Show on mobile/tablet only
                />

                {/* Desktop Layout with Tabs */}
                <div className="hidden lg:block">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="map">Live Map</TabsTrigger>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <RealTimeTracker trackingNumber={trackingNumber} />
                                <TrackingMap
                                    currentLocation={realTrackingData.current_location}
                                    destination={realTrackingData.destination}
                                    height="h-96"
                                />
                            </div>
                            <TrackingTimeline events={realTrackingData.events} currentStatus={realTrackingData.current_status} />
                        </TabsContent>

                        <TabsContent value="map">
                            <TrackingMap
                                currentLocation={realTrackingData.current_location}
                                destination={realTrackingData.destination}
                                height="h-[600px]"
                            />
                        </TabsContent>

                        <TabsContent value="timeline">
                            <TrackingTimeline events={realTrackingData.events} currentStatus={realTrackingData.current_status} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Mobile Layout - Stacked Components */}
                <div className="space-y-4 lg:hidden">
                    <TrackingMap currentLocation={realTrackingData.current_location} destination={realTrackingData.destination} height="h-64" />
                    <TrackingTimeline events={realTrackingData.events} currentStatus={realTrackingData.current_status} />
                </div>
            </div>
        </AppLayout>
    );
}
