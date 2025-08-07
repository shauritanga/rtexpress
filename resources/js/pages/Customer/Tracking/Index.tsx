import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import RealTimeTracker from '@/components/customer/tracking/RealTimeTracker';
import TrackingTimeline from '@/components/customer/tracking/TrackingTimeline';
import TrackingMap from '@/components/customer/tracking/TrackingMap';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarcodeScanResult } from '@/hooks/useBarcodeScanner';
import { router } from '@inertiajs/react';
import {
    MapPin,
    ArrowLeft,
    Share,
    Bell,
    Download,
    Clock,
    Truck,
    Package,
    Scan,
    Search
} from 'lucide-react';

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
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Tracking</h1>
                        <p className="text-gray-600">Search for your shipment using tracking number or scan barcode.</p>
                    </div>

                    {/* Tracking Methods Tabs */}
                    <div className="max-w-4xl mx-auto">
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
            
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header - Mobile Optimized */}
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            
                            {/* Action Buttons - Mobile Responsive */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleShare} className="p-2 sm:px-3">
                                    <Share className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Share</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleNotificationToggle} className="p-2 sm:px-3">
                                    <Bell className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Alerts</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownloadReport} className="p-2 sm:px-3">
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Report</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                                <Package className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-blue-600" />
                                Real-time Tracking
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • Live shipment monitoring and updates
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats - Mobile First Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">ETA</p>
                                    <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                                        {new Date(realTrackingData.estimated_delivery).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Status</p>
                                    <p className="text-sm sm:text-lg font-bold text-gray-900 capitalize truncate">
                                        {realTrackingData.current_status.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Location</p>
                                    <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                                        {realTrackingData.current_location?.address || 'Location updating...'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Events</p>
                                    <p className="text-sm sm:text-lg font-bold text-gray-900">
                                        {realTrackingData.events.length}
                                    </p>
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
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <RealTimeTracker trackingNumber={trackingNumber} />
                                <TrackingMap
                                    currentLocation={realTrackingData.current_location}
                                    destination={realTrackingData.destination}
                                    height="h-96"
                                />
                            </div>
                            <TrackingTimeline
                                events={realTrackingData.events}
                                currentStatus={realTrackingData.current_status}
                            />
                        </TabsContent>

                        <TabsContent value="map">
                            <TrackingMap
                                currentLocation={realTrackingData.current_location}
                                destination={realTrackingData.destination}
                                height="h-[600px]"
                            />
                        </TabsContent>

                        <TabsContent value="timeline">
                            <TrackingTimeline
                                events={realTrackingData.events}
                                currentStatus={realTrackingData.current_status}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Mobile Layout - Stacked Components */}
                <div className="lg:hidden space-y-4">
                    <TrackingMap
                        currentLocation={realTrackingData.current_location}
                        destination={realTrackingData.destination}
                        height="h-64"
                    />
                    <TrackingTimeline
                        events={realTrackingData.events}
                        currentStatus={realTrackingData.current_status}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
