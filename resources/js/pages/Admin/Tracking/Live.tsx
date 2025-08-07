import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import TrackingMap from '@/components/customer/tracking/TrackingMap';
import TrackingTimeline from '@/components/customer/tracking/TrackingTimeline';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectionStatus, LiveDataIndicator } from '@/components/ui/real-time-indicator';
import { useShipmentTracking } from '@/hooks/usePusher';
import { BarcodeScanResult } from '@/hooks/useBarcodeScanner';
import {
    Activity,
    Search,
    MapPin,
    Truck,
    Package,
    Clock,
    CheckCircle,
    AlertTriangle,
    Navigation,
    Zap,
    RefreshCw,
    Map,
    History,
    Scan
} from 'lucide-react';

interface LiveShipment {
    id: number;
    tracking_number: string;
    status: string;
    customer_name: string;
    origin: string;
    destination: string;
    estimated_delivery: string | null;
    last_update: string;
    progress_percentage: number;
}

interface Props {
    activeShipments: LiveShipment[];
}

export default function LiveTracking({ activeShipments }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('grid');
    const [searchMode, setSearchMode] = useState<'text' | 'scanner'>('text');
    const [liveShipments, setLiveShipments] = useState<LiveShipment[]>(activeShipments);

    // Use WebSocket for real-time updates
    const { isConnected, lastMessage } = useShipmentTracking(selectedShipment || undefined);

    // Handle barcode scan
    const handleScan = (result: BarcodeScanResult) => {
        const code = result.decodedText.trim().toUpperCase();
        setSearchTerm(code);
        setSearchMode('text'); // Switch back to text mode after scan
    };

    // Update shipments when new data comes from props
    useEffect(() => {
        setLiveShipments(activeShipments);
    }, [activeShipments]);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            picked_up: { label: 'Picked Up', variant: 'default' as const, icon: Package },
            in_transit: { label: 'In Transit', variant: 'default' as const, icon: Truck },
            out_for_delivery: { label: 'Out for Delivery', variant: 'default' as const, icon: Navigation },
            delivered: { label: 'Delivered', variant: 'success' as const, icon: CheckCircle },
            exception: { label: 'Exception', variant: 'destructive' as const, icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: Package };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const filteredShipments = liveShipments.filter(shipment =>
        shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Live Tracking" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Live Tracking
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Real-time shipment tracking and monitoring
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ConnectionStatus />
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Search Shipments</CardTitle>
                        <CardDescription>
                            Search by tracking number, location, or scan barcode
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'text' | 'scanner')} className="space-y-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="text" className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Search
                                </TabsTrigger>
                                <TabsTrigger value="scanner" className="flex items-center gap-2">
                                    <Scan className="h-4 w-4" />
                                    Scanner
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="text" className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by tracking number, location, or destination..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="scanner" className="space-y-4">
                                <BarcodeScanner
                                    onScan={handleScan}
                                    title="Scan Tracking Barcode"
                                    description="Point camera at barcode to search for shipment"
                                    size="md"
                                    autoStop={true}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Tracking Views */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="grid" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Live Grid
                        </TabsTrigger>
                        <TabsTrigger value="map" className="flex items-center gap-2">
                            <Map className="h-4 w-4" />
                            Map View
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Timeline
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="grid" className="space-y-6">
                        {/* Live Shipments Grid */}
                        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredShipments.map((shipment) => (
                        <Card 
                            key={shipment.id} 
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedShipment === shipment.tracking_number ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedShipment(
                                selectedShipment === shipment.tracking_number ? null : shipment.tracking_number
                            )}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {shipment.tracking_number}
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Zap className="h-4 w-4 text-green-500" />
                                        <span className="text-xs text-green-600 font-medium">LIVE</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    {getStatusBadge(shipment.status)}
                                    <LiveDataIndicator 
                                        lastUpdated={new Date(shipment.last_update)} 
                                        isLive={isConnected} 
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{Math.round(shipment.progress_percentage)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${shipment.progress_percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Location Info */}
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Origin</p>
                                            <p className="text-sm text-muted-foreground">
                                                {shipment.origin}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Navigation className="h-4 w-4 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Destination</p>
                                            <p className="text-sm text-muted-foreground">
                                                {shipment.destination}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Truck className="h-4 w-4 text-orange-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Customer</p>
                                            <p className="text-sm text-muted-foreground">
                                                {shipment.customer_name}
                                            </p>
                                        </div>
                                    </div>

                                    {shipment.estimated_delivery && (
                                        <div className="flex items-start space-x-2">
                                            <Clock className="h-4 w-4 text-purple-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">ETA</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(shipment.estimated_delivery).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Real-time Indicator */}
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-muted-foreground">
                                                Live tracking active
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                        {filteredShipments.length === 0 && (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-medium mb-2">No Live Shipments Found</h3>
                                    <p className="text-muted-foreground">
                                        {searchTerm
                                            ? 'No shipments match your search criteria.'
                                            : 'No shipments are currently being tracked in real-time.'
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="map" className="space-y-6">
                        {selectedShipment ? (
                            <TrackingMap
                                currentLocation={{
                                    lat: -6.7924,
                                    lng: 39.2083,
                                    address: filteredShipments.find(s => s.tracking_number === selectedShipment)?.origin || 'Unknown',
                                    type: 'current'
                                }}
                                destination={{
                                    lat: -6.8924,
                                    lng: 39.3083,
                                    address: filteredShipments.find(s => s.tracking_number === selectedShipment)?.destination || 'Unknown',
                                    type: 'destination'
                                }}
                                height="h-[600px]"
                            />
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-medium mb-2">Select a Shipment</h3>
                                    <p className="text-muted-foreground">
                                        Choose a shipment from the grid view to see its location on the map.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-6">
                        {selectedShipment ? (
                            <TrackingTimeline
                                events={[
                                    {
                                        id: '1',
                                        status: 'picked_up',
                                        description: 'Package picked up from sender',
                                        location: 'Origin Warehouse',
                                        timestamp: new Date(Date.now() - 86400000).toISOString(),
                                    },
                                    {
                                        id: '2',
                                        status: 'in_transit',
                                        description: 'Package in transit',
                                        location: filteredShipments.find(s => s.tracking_number === selectedShipment)?.origin || 'Unknown',
                                        timestamp: new Date().toISOString(),
                                    }
                                ]}
                                currentStatus={filteredShipments.find(s => s.tracking_number === selectedShipment)?.status || 'unknown'}
                            />
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-medium mb-2">Select a Shipment</h3>
                                    <p className="text-muted-foreground">
                                        Choose a shipment from the grid view to see its tracking timeline.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* WebSocket Status */}
                {lastMessage && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Latest Update</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-2 rounded">
                                {JSON.stringify(lastMessage, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
