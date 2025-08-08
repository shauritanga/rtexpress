import { Badge } from '@/components/ui/badge';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarcodeScanResult } from '@/hooks/useBarcodeScanner';
import { Head } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, CheckCircle, Clock, MapPin, Package, RefreshCw, Scan, Search, Truck } from 'lucide-react';
import { useState } from 'react';

interface TrackingResult {
    tracking_number: string;
    current_status: string;
    estimated_delivery: string;
    current_location: {
        address: string;
    };
    origin: {
        address: string;
    };
    destination: {
        address: string;
    };
    events: Array<{
        id: string;
        status: string;
        description: string;
        location: string;
        timestamp: string;
    }>;
}

export default function PublicTrack() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('search');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/tracking/${trackingNumber.trim()}`);
            const data = await response.json();

            if (response.ok) {
                setTrackingResult(data);
            } else {
                setError(data.message || 'Tracking information not found');
                setTrackingResult(null);
            }
        } catch (err) {
            setError('Failed to fetch tracking information. Please try again.');
            setTrackingResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScan = async (result: BarcodeScanResult) => {
        const code = result.decodedText.trim().toUpperCase();
        setTrackingNumber(code);
        setActiveTab('search');

        // Auto-search after scan
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/tracking/${code}`);
            const data = await response.json();

            if (response.ok) {
                setTrackingResult(data);
            } else {
                setError(data.message || 'Tracking information not found');
                setTrackingResult(null);
            }
        } catch (err) {
            setError('Failed to fetch tracking information. Please try again.');
            setTrackingResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'out_for_delivery':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_transit':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'picked_up':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'exception':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle className="h-4 w-4" />;
            case 'out_for_delivery':
                return <Truck className="h-4 w-4" />;
            case 'in_transit':
                return <Package className="h-4 w-4" />;
            case 'exception':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Track Your Package - RT Express" />

            {/* Header */}
            <div className="border-b bg-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-lg bg-red-100 p-2">
                                <Package className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">RT Express</h1>
                                <p className="text-sm text-gray-600">Track Your Package</p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <a href="/login">Customer Login</a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Track Your Shipment</h2>
                        <p className="text-gray-600">Enter your tracking number or scan the barcode to get real-time updates.</p>
                    </div>

                    {/* Tracking Input */}
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Enter Tracking Number</CardTitle>
                                    <CardDescription>Enter your RT Express tracking number to get real-time updates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSearch} className="space-y-4">
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Input
                                                type="text"
                                                placeholder="Enter tracking number (e.g., RT12345678)"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                                                className="flex-1"
                                                disabled={isLoading}
                                            />
                                            <Button type="submit" disabled={isLoading || !trackingNumber.trim()} className="w-full sm:w-auto">
                                                {isLoading ? (
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Search className="mr-2 h-4 w-4" />
                                                )}
                                                Track Package
                                            </Button>
                                        </div>
                                    </form>

                                    {error && (
                                        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                                            <p className="text-sm text-red-600">{error}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
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

                    {/* Tracking Results */}
                    {trackingResult && (
                        <div className="mt-8 space-y-6">
                            {/* Status Overview */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="font-mono">{trackingResult.tracking_number}</CardTitle>
                                            <CardDescription>Package Status</CardDescription>
                                        </div>
                                        <Badge className={`${getStatusColor(trackingResult.current_status)} border`}>
                                            {getStatusIcon(trackingResult.current_status)}
                                            <span className="ml-1">{trackingResult.current_status.replace('_', ' ').toUpperCase()}</span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium">Current Location</p>
                                                <p className="text-sm text-gray-600">{trackingResult.current_location.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Package className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium">From</p>
                                                <p className="text-sm text-gray-600">{trackingResult.origin.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <ArrowRight className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium">To</p>
                                                <p className="text-sm text-gray-600">{trackingResult.destination.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tracking Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tracking History</CardTitle>
                                    <CardDescription>Follow your package's journey</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {trackingResult.events.map((event, index) => (
                                            <div key={event.id} className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                            index === 0 ? 'bg-blue-100' : 'bg-gray-100'
                                                        }`}
                                                    >
                                                        {getStatusIcon(event.status)}
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                                        <p className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{event.location}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
