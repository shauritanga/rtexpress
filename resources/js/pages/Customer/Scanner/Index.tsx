import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarcodeScanResult } from '@/hooks/useBarcodeScanner';
import { 
    Scan,
    Package,
    Truck,
    MapPin,
    Clock,
    User,
    Building,
    CheckCircle,
    AlertTriangle,
    Search,
    History,
    Eye,
    RefreshCw,
    Star,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingInfo {
    tracking_number: string;
    status: string;
    sender_name: string;
    recipient_name: string;
    origin: string;
    destination: string;
    estimated_delivery: string;
    current_location: string;
    last_updated: string;
    tracking_events: Array<{
        status: string;
        location: string;
        timestamp: string;
        description: string;
    }>;
}

interface Props {
    customer: {
        id: number;
        company_name: string;
        customer_code: string;
    };
}

export default function CustomerTrackingEnhanced({ customer }: Props) {
    const [scannedCode, setScannedCode] = useState<string>('');
    const [manualCode, setManualCode] = useState<string>('');
    const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanHistory, setScanHistory] = useState<BarcodeScanResult[]>([]);

    // Handle barcode scan
    const handleScan = async (result: BarcodeScanResult) => {
        const code = result.decodedText.trim().toUpperCase();
        setScannedCode(code);
        setScanHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 scans
        
        // Automatically lookup tracking info
        await lookupTracking(code);
    };

    // Handle manual code entry
    const handleManualLookup = async () => {
        if (!manualCode.trim()) return;
        
        const code = manualCode.trim().toUpperCase();
        setScannedCode(code);
        await lookupTracking(code);
    };

    // Lookup tracking information
    const lookupTracking = async (trackingNumber: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/customer/tracking/${trackingNumber}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Tracking number not found');
            }

            const data = await response.json();
            setTrackingInfo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to lookup tracking information');
            setTrackingInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'in_transit': return 'bg-blue-100 text-blue-800';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'exception': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return <CheckCircle className="h-4 w-4" />;
            case 'in_transit': return <Truck className="h-4 w-4" />;
            case 'out_for_delivery': return <MapPin className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'exception': return <AlertTriangle className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout customer={customer}>
            <Head title="Track Package" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-rt-red/10 rounded-lg">
                            <MapPin className="h-6 w-6 text-rt-red" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Track Your Package
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Enter tracking number manually or scan barcode with your camera
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Real-time Tracking
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Scanner Section */}
                    <div className="space-y-6">
                        <Tabs defaultValue="manual" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="manual">Enter Number</TabsTrigger>
                                <TabsTrigger value="scanner">Scan Barcode</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="manual" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Search className="h-5 w-5 text-rt-red" />
                                            Enter Tracking Number
                                        </CardTitle>
                                        <CardDescription>
                                            Type your tracking number from the shipping label
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="manual-code">Tracking Number</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="manual-code"
                                                    placeholder="e.g., RT123456789"
                                                    value={manualCode}
                                                    onChange={(e) => setManualCode(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleManualLookup()}
                                                    className="font-mono"
                                                />
                                                <Button 
                                                    onClick={handleManualLookup}
                                                    disabled={!manualCode.trim() || isLoading}
                                                    className="bg-rt-red hover:bg-rt-red-700"
                                                >
                                                    {isLoading ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Search className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="scanner" className="space-y-4">
                                <BarcodeScanner
                                    onScan={handleScan}
                                    onError={setError}
                                    title="Scan Tracking Barcode"
                                    description="Point your camera at the barcode on your shipping label"
                                    size="lg"
                                    autoStop={true}
                                />
                            </TabsContent>
                        </Tabs>

                        {/* Recent Searches */}
                        {scanHistory.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5 text-rt-red" />
                                        Recent Searches
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {scanHistory.map((scan, index) => (
                                            <div 
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                                onClick={() => lookupTracking(scan.decodedText)}
                                            >
                                                <span className="font-mono text-sm truncate flex-1 mr-2">
                                                    {scan.decodedText}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {scan.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Current Tracking */}
                        {scannedCode && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-rt-red" />
                                        Tracking Number
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-3 bg-rt-red-50 border border-rt-red-200 rounded-lg">
                                        <p className="font-mono text-lg font-semibold text-rt-red">
                                            {scannedCode}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Tracking Information */}
                        {trackingInfo && (
                            <>
                                {/* Package Status */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(trackingInfo.status)}
                                                Package Status
                                            </div>
                                            <Badge className={cn("text-xs", getStatusColor(trackingInfo.status))}>
                                                {trackingInfo.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium">From</span>
                                                </div>
                                                <p className="text-sm text-gray-700 ml-6">{trackingInfo.sender_name}</p>
                                                <p className="text-xs text-gray-500 ml-6">{trackingInfo.origin}</p>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium">To</span>
                                                </div>
                                                <p className="text-sm text-gray-700 ml-6">{trackingInfo.recipient_name}</p>
                                                <p className="text-xs text-gray-500 ml-6">{trackingInfo.destination}</p>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium">Expected Delivery</span>
                                                </div>
                                                <p className="text-sm font-semibold text-rt-red ml-6">{trackingInfo.estimated_delivery}</p>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium">Current Location</span>
                                                </div>
                                                <p className="text-sm text-gray-700 ml-6">{trackingInfo.current_location}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tracking Timeline */}
                                {trackingInfo.tracking_events && trackingInfo.tracking_events.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-rt-red" />
                                                Tracking Timeline
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {trackingInfo.tracking_events.map((event, index) => (
                                                    <div key={index} className="flex gap-4">
                                                        <div className="flex flex-col items-center">
                                                            <div className={cn(
                                                                "w-3 h-3 rounded-full border-2",
                                                                index === 0 ? "bg-rt-red border-rt-red" : "bg-gray-200 border-gray-300"
                                                            )} />
                                                            {index < trackingInfo.tracking_events.length - 1 && (
                                                                <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 pb-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={cn(
                                                                        "text-xs",
                                                                        index === 0 && "border-rt-red text-rt-red"
                                                                    )}
                                                                >
                                                                    {event.status.replace('_', ' ').toUpperCase()}
                                                                </Badge>
                                                                <span className="text-xs text-gray-500">
                                                                    {event.timestamp}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium">{event.description}</p>
                                                            <p className="text-xs text-gray-500">{event.location}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
