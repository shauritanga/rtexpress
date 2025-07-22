import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBarcodeScanner, BarcodeScanResult } from '@/hooks/useBarcodeScanner';
import { 
    Camera, 
    CameraOff, 
    Scan, 
    CheckCircle, 
    AlertTriangle, 
    Upload,
    X,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BarcodeScannerProps {
    onScan?: (result: BarcodeScanResult) => void;
    onError?: (error: string) => void;
    className?: string;
    title?: string;
    description?: string;
    acceptedFormats?: string[];
    showLastScan?: boolean;
    autoStop?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function BarcodeScanner({
    onScan,
    onError,
    className,
    title = "Barcode Scanner",
    description = "Position the barcode within the scanning area",
    acceptedFormats = ['QR Code', 'Code 128', 'Code 39', 'EAN-13', 'UPC-A'],
    showLastScan = true,
    autoStop = false,
    size = 'md'
}: BarcodeScannerProps) {
    const scannerId = useRef(`barcode-scanner-${Math.random().toString(36).substr(2, 9)}`);
    const [isExpanded, setIsExpanded] = useState(false);
    const [scanHistory, setScanHistory] = useState<BarcodeScanResult[]>([]);
    
    const {
        isScanning,
        isSupported,
        error,
        lastScan,
        cameraPermission,
        startScanning,
        stopScanning,
        requestCameraPermission
    } = useBarcodeScanner(scannerId.current);

    // Handle successful scan
    const handleScanSuccess = (result: BarcodeScanResult) => {
        // Add to scan history
        setScanHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 scans
        
        // Call parent callback
        onScan?.(result);
        
        // Auto-stop if enabled
        if (autoStop) {
            stopScanning();
        }
    };

    // Handle scan error
    const handleScanError = (errorMessage: string) => {
        onError?.(errorMessage);
    };

    // Start scanning with callbacks
    const handleStartScanning = () => {
        startScanning(handleScanSuccess, handleScanError);
    };

    // Get size classes
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    container: 'max-w-sm',
                    scanner: 'h-48',
                    button: 'h-8 px-3 text-xs'
                };
            case 'lg':
                return {
                    container: 'max-w-2xl',
                    scanner: 'h-96',
                    button: 'h-12 px-6 text-base'
                };
            default:
                return {
                    container: 'max-w-lg',
                    scanner: 'h-64',
                    button: 'h-10 px-4 text-sm'
                };
        }
    };

    const sizeClasses = getSizeClasses();

    // Permission status component
    const PermissionStatus = () => {
        if (cameraPermission === 'granted') {
            return (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Camera Access Granted
                </Badge>
            );
        } else if (cameraPermission === 'denied') {
            return (
                <Badge variant="destructive">
                    <CameraOff className="h-3 w-3 mr-1" />
                    Camera Access Denied
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline">
                    <Camera className="h-3 w-3 mr-1" />
                    Camera Permission Required
                </Badge>
            );
        }
    };

    // Scanner controls
    const ScannerControls = () => (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                {!isScanning ? (
                    <Button
                        onClick={cameraPermission === 'granted' ? handleStartScanning : requestCameraPermission}
                        className={cn("bg-rt-red hover:bg-rt-red-700", sizeClasses.button)}
                        disabled={!isSupported}
                    >
                        <Camera className="h-4 w-4 mr-2" />
                        {cameraPermission === 'granted' ? 'Start Scanning' : 'Enable Camera'}
                    </Button>
                ) : (
                    <Button
                        onClick={stopScanning}
                        variant="outline"
                        className={sizeClasses.button}
                    >
                        <CameraOff className="h-4 w-4 mr-2" />
                        Stop Scanning
                    </Button>
                )}
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2"
                >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
            </div>
            
            <PermissionStatus />
        </div>
    );

    return (
        <Card className={cn(sizeClasses.container, "mx-auto", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Scan className="h-5 w-5 text-rt-red" />
                            {title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {description}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Not Supported Alert */}
                {!isSupported && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Barcode scanning is not supported in this browser. Please use a modern browser with camera support.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Scanner Controls */}
                <ScannerControls />

                {/* Scanner Area */}
                <div className={cn(
                    "relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden",
                    sizeClasses.scanner,
                    isScanning && "border-rt-red border-solid",
                    isExpanded && "h-96"
                )}>
                    {isScanning ? (
                        <div id={scannerId.current} className="w-full h-full" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Camera className="h-12 w-12 mb-2 opacity-50" />
                            <p className="text-sm text-center px-4">
                                {cameraPermission === 'granted' 
                                    ? 'Click "Start Scanning" to begin'
                                    : 'Camera permission required to scan barcodes'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Accepted Formats */}
                <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">Supported formats:</p>
                    <div className="flex flex-wrap gap-1">
                        {acceptedFormats.map((format) => (
                            <Badge key={format} variant="outline" className="text-xs">
                                {format}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Last Scan Result */}
                {showLastScan && lastScan && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Last Scan</span>
                            <Badge variant="secondary" className="text-xs">
                                {lastScan.timestamp.toLocaleTimeString()}
                            </Badge>
                        </div>
                        <p className="text-sm font-mono bg-white p-2 rounded border">
                            {lastScan.decodedText}
                        </p>
                    </div>
                )}

                {/* Scan History */}
                {scanHistory.length > 1 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Recent Scans</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {scanHistory.slice(1).map((scan, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                    <span className="font-mono truncate flex-1 mr-2">
                                        {scan.decodedText}
                                    </span>
                                    <span className="text-gray-500">
                                        {scan.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
