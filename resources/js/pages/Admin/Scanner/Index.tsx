import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BarcodeScanner } from '@/components/ui/barcode-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarcodeScanResult } from '@/hooks/useBarcodeScanner';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Building, Clock, History, MapPin, Package, RefreshCw, Scan, Search, Truck, User, Zap } from 'lucide-react';
import { useState } from 'react';

interface ShipmentInfo {
    tracking_number: string;
    status: string;
    sender_name: string;
    recipient_name: string;
    origin: string;
    destination: string;
    estimated_delivery: string;
    current_location: string;
    last_updated: string;
}

export default function AdminScannerIndex() {
    const [scannedCode, setScannedCode] = useState<string>('');
    const [manualCode, setManualCode] = useState<string>('');
    const [shipmentInfo, setShipmentInfo] = useState<ShipmentInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanHistory, setScanHistory] = useState<BarcodeScanResult[]>([]);

    // Handle barcode scan
    const handleScan = async (result: BarcodeScanResult) => {
        const code = result.decodedText.trim().toUpperCase();
        setScannedCode(code);
        setScanHistory((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 scans

        // Automatically lookup shipment info
        await lookupShipment(code);
    };

    // Handle manual code entry
    const handleManualLookup = async () => {
        if (!manualCode.trim()) return;

        const code = manualCode.trim().toUpperCase();
        setScannedCode(code);
        await lookupShipment(code);
    };

    // Lookup shipment information
    const lookupShipment = async (trackingNumber: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/shipments/lookup/${trackingNumber}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Shipment not found');
            }

            const data = await response.json();
            setShipmentInfo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to lookup shipment');
            setShipmentInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Update shipment status
    const updateShipmentStatus = async (status: string) => {
        if (!shipmentInfo) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/shipments/${shipmentInfo.tracking_number}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status, scanned_at: new Date().toISOString() }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            // Refresh shipment info
            await lookupShipment(shipmentInfo.tracking_number);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'in_transit':
                return 'bg-blue-100 text-blue-800';
            case 'out_for_delivery':
                return 'bg-orange-100 text-orange-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'exception':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Barcode Scanner - Admin" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="bg-rt-red/10 rounded-lg p-2">
                            <Scan className="text-rt-red h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Barcode Scanner</h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Scan tracking numbers and update shipment status</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Zap className="mr-1 h-3 w-3" />
                            Live Updates
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Scanner Section */}
                    <div className="space-y-6">
                        <Tabs defaultValue="scanner" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="scanner">Camera Scanner</TabsTrigger>
                                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                            </TabsList>

                            <TabsContent value="scanner" className="space-y-4">
                                <BarcodeScanner
                                    onScan={handleScan}
                                    onError={setError}
                                    title="Scan Tracking Number"
                                    description="Position the barcode or QR code within the scanning area"
                                    size="lg"
                                    autoStop={true}
                                />
                            </TabsContent>

                            <TabsContent value="manual" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Search className="text-rt-red h-5 w-5" />
                                            Manual Entry
                                        </CardTitle>
                                        <CardDescription>Enter tracking number manually</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="manual-code">Tracking Number</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="manual-code"
                                                    placeholder="Enter tracking number..."
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
                                                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Scan History */}
                        {scanHistory.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="text-rt-red h-5 w-5" />
                                        Recent Scans
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-48 space-y-2 overflow-y-auto">
                                        {scanHistory.map((scan, index) => (
                                            <div
                                                key={index}
                                                className="flex cursor-pointer items-center justify-between rounded bg-gray-50 p-2 hover:bg-gray-100"
                                                onClick={() => lookupShipment(scan.decodedText)}
                                            >
                                                <span className="mr-2 flex-1 truncate font-mono text-sm">{scan.decodedText}</span>
                                                <span className="text-xs text-gray-500">{scan.timestamp.toLocaleTimeString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {/* Current Scan */}
                        {scannedCode && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="text-rt-red h-5 w-5" />
                                        Scanned Code
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-rt-red-50 border-rt-red-200 rounded-lg border p-3">
                                        <p className="text-rt-red font-mono text-lg font-semibold">{scannedCode}</p>
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

                        {/* Shipment Information */}
                        {shipmentInfo && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Truck className="text-rt-red h-5 w-5" />
                                            Shipment Details
                                        </div>
                                        <Badge className={cn('text-xs', getStatusColor(shipmentInfo.status))}>
                                            {shipmentInfo.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">Sender</span>
                                            </div>
                                            <p className="ml-6 text-sm text-gray-700">{shipmentInfo.sender_name}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">Recipient</span>
                                            </div>
                                            <p className="ml-6 text-sm text-gray-700">{shipmentInfo.recipient_name}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">Origin</span>
                                            </div>
                                            <p className="ml-6 text-sm text-gray-700">{shipmentInfo.origin}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">Destination</span>
                                            </div>
                                            <p className="ml-6 text-sm text-gray-700">{shipmentInfo.destination}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">Est. Delivery</span>
                                            </div>
                                            <p className="ml-6 text-sm text-gray-700">{shipmentInfo.estimated_delivery}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">Current Location</span>
                                            </div>
                                            <p className="ml-6 text-sm text-gray-700">{shipmentInfo.current_location}</p>
                                        </div>
                                    </div>

                                    {/* Status Update Actions */}
                                    <div className="border-t pt-4">
                                        <h4 className="mb-3 text-sm font-medium">Update Status</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception'].map((status) => (
                                                <Button
                                                    key={status}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateShipmentStatus(status)}
                                                    disabled={isLoading || shipmentInfo.status === status}
                                                    className={cn('text-xs', shipmentInfo.status === status && 'bg-rt-red text-white')}
                                                >
                                                    {status.replace('_', ' ').toUpperCase()}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
