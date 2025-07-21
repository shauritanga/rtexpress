import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import RealTimeTracker from '@/components/customer/tracking/RealTimeTracker';
import TrackingTimeline from '@/components/customer/tracking/TrackingTimeline';
import TrackingMap from '@/components/customer/tracking/TrackingMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    MapPin,
    ArrowLeft,
    Share,
    Bell,
    Download,
    Clock,
    Truck,
    Package
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
    // Mock tracking data for demonstration
    const mockTrackingData: ShipmentTracking = trackingData || {
        tracking_number: 'RT12345678',
        current_status: 'in_transit',
        estimated_delivery: '2024-01-25T17:00:00Z',
        current_location: {
            lat: 40.7128,
            lng: -74.0060,
            address: 'New York Distribution Center, 123 Logistics Ave, New York, NY 10001'
        },
        destination: {
            lat: 40.7589,
            lng: -73.9851,
            address: '456 Business St, New York, NY 10019'
        },
        driver: {
            name: 'Mike Johnson',
            phone: '+1 (555) 123-4567',
            photo: '/images/drivers/mike.jpg',
            vehicle: 'Truck #RT-2024'
        },
        delivery_window: '2:00 PM - 6:00 PM',
        special_instructions: 'Ring doorbell twice, leave at front desk if no answer',
        events: [
            {
                id: '1',
                timestamp: '2024-01-23T09:00:00Z',
                status: 'pending',
                location: 'RT Express Facility, Los Angeles, CA',
                description: 'Shipment created and ready for pickup',
                details: 'Package has been processed and is ready for collection by our driver.'
            },
            {
                id: '2',
                timestamp: '2024-01-23T14:30:00Z',
                status: 'picked_up',
                location: 'Customer Location, Los Angeles, CA',
                description: 'Package picked up from sender',
                driver: {
                    name: 'Sarah Wilson',
                    phone: '+1 (555) 987-6543',
                    photo: '/images/drivers/sarah.jpg'
                },
                details: 'Package successfully collected from sender location.',
                photos: ['/images/pickup1.jpg', '/images/pickup2.jpg']
            },
            {
                id: '3',
                timestamp: '2024-01-23T18:45:00Z',
                status: 'in_transit',
                location: 'Los Angeles Distribution Center, CA',
                description: 'Package arrived at sorting facility',
                details: 'Package has been sorted and loaded for transport to destination city.'
            },
            {
                id: '4',
                timestamp: '2024-01-24T22:15:00Z',
                status: 'in_transit',
                location: 'Phoenix Distribution Center, AZ',
                description: 'Package in transit - Phoenix hub',
                details: 'Package passed through Phoenix distribution center and is continuing to destination.'
            },
            {
                id: '5',
                timestamp: '2024-01-25T08:30:00Z',
                status: 'in_transit',
                location: 'New York Distribution Center, NY',
                description: 'Package arrived at destination facility',
                details: 'Package has arrived at the destination distribution center and is being prepared for final delivery.'
            }
        ]
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Track Shipment ${mockTrackingData.tracking_number}`,
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
                                        {new Date(mockTrackingData.estimated_delivery).toLocaleDateString()}
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
                                        {mockTrackingData.current_status.replace('_', ' ')}
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
                                        New York, NY
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
                                        {mockTrackingData.events.length}
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
                                    currentLocation={mockTrackingData.current_location}
                                    destination={mockTrackingData.destination}
                                    height="h-96"
                                />
                            </div>
                            <TrackingTimeline 
                                events={mockTrackingData.events}
                                currentStatus={mockTrackingData.current_status}
                            />
                        </TabsContent>

                        <TabsContent value="map">
                            <TrackingMap
                                currentLocation={mockTrackingData.current_location}
                                destination={mockTrackingData.destination}
                                height="h-[600px]"
                            />
                        </TabsContent>

                        <TabsContent value="timeline">
                            <TrackingTimeline 
                                events={mockTrackingData.events}
                                currentStatus={mockTrackingData.current_status}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Mobile Layout - Stacked Components */}
                <div className="lg:hidden space-y-4">
                    <TrackingMap
                        currentLocation={mockTrackingData.current_location}
                        destination={mockTrackingData.destination}
                        height="h-64"
                    />
                    <TrackingTimeline 
                        events={mockTrackingData.events}
                        currentStatus={mockTrackingData.current_status}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
