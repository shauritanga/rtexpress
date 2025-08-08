import { Html5QrcodeScanner, Html5QrcodeScannerConfig, Html5QrcodeScanType } from 'html5-qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface BarcodeScanResult {
    decodedText: string;
    result: any;
    timestamp: Date;
}

export interface BarcodeScannerConfig {
    fps?: number;
    qrbox?: { width: number; height: number } | number;
    aspectRatio?: number;
    disableFlip?: boolean;
    verbose?: boolean;
    supportedScanTypes?: Html5QrcodeScanType[];
}

export interface BarcodeScannerState {
    isScanning: boolean;
    isSupported: boolean;
    error: string | null;
    lastScan: BarcodeScanResult | null;
    cameraPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export function useBarcodeScanner(elementId: string, config: BarcodeScannerConfig = {}) {
    const [state, setState] = useState<BarcodeScannerState>({
        isScanning: false,
        isSupported: false,
        error: null,
        lastScan: null,
        cameraPermission: 'unknown',
    });

    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const onScanSuccessRef = useRef<((result: BarcodeScanResult) => void) | null>(null);
    const onScanErrorRef = useRef<((error: string) => void) | null>(null);

    // Check if barcode scanning is supported
    useEffect(() => {
        const checkSupport = async () => {
            try {
                // Check if getUserMedia is supported
                const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

                // Check camera permission
                if (isSupported) {
                    try {
                        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
                        setState((prev) => ({
                            ...prev,
                            isSupported,
                            cameraPermission: permission.state as any,
                        }));

                        // Listen for permission changes
                        permission.onchange = () => {
                            setState((prev) => ({
                                ...prev,
                                cameraPermission: permission.state as any,
                            }));
                        };
                    } catch (permissionError) {
                        setState((prev) => ({
                            ...prev,
                            isSupported,
                            cameraPermission: 'unknown',
                        }));
                    }
                } else {
                    setState((prev) => ({
                        ...prev,
                        isSupported: false,
                        error: 'Camera access is not supported in this browser',
                    }));
                }
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    isSupported: false,
                    error: 'Failed to check camera support',
                }));
            }
        };

        checkSupport();
    }, []);

    const startScanning = useCallback(
        async (onSuccess?: (result: BarcodeScanResult) => void, onError?: (error: string) => void) => {
            if (!state.isSupported) {
                const error = 'Barcode scanning is not supported in this browser';
                setState((prev) => ({ ...prev, error }));
                onError?.(error);
                return;
            }

            if (state.isScanning) {
                return; // Already scanning
            }

            try {
                // Store callbacks
                onScanSuccessRef.current = onSuccess || null;
                onScanErrorRef.current = onError || null;

                // Default configuration
                const scannerConfig: Html5QrcodeScannerConfig = {
                    fps: config.fps || 10,
                    qrbox: config.qrbox || { width: 250, height: 250 },
                    aspectRatio: config.aspectRatio || 1.0,
                    disableFlip: config.disableFlip || false,
                    verbose: config.verbose || false,
                    supportedScanTypes: config.supportedScanTypes || [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE],
                };

                // Create scanner instance
                const scanner = new Html5QrcodeScanner(
                    elementId,
                    scannerConfig,
                    false, // verbose
                );

                // Success callback
                const onScanSuccess = (decodedText: string, result: any) => {
                    const scanResult: BarcodeScanResult = {
                        decodedText,
                        result,
                        timestamp: new Date(),
                    };

                    setState((prev) => ({
                        ...prev,
                        lastScan: scanResult,
                        error: null,
                    }));

                    onScanSuccessRef.current?.(scanResult);
                };

                // Error callback
                const onScanFailure = (error: string) => {
                    // Don't treat scan failures as errors (they happen frequently)
                    // Only log actual errors
                    if (error.includes('NotFoundException') || error.includes('No MultiFormat Readers')) {
                        return; // Normal scanning state, no barcode found
                    }

                    setState((prev) => ({
                        ...prev,
                        error: `Scan error: ${error}`,
                    }));

                    onScanErrorRef.current?.(error);
                };

                // Start scanning
                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;

                setState((prev) => ({
                    ...prev,
                    isScanning: true,
                    error: null,
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to start scanner';
                setState((prev) => ({
                    ...prev,
                    error: errorMessage,
                    isScanning: false,
                }));
                onError?.(errorMessage);
            }
        },
        [elementId, config, state.isSupported, state.isScanning],
    );

    const stopScanning = useCallback(async () => {
        if (scannerRef.current && state.isScanning) {
            try {
                await scannerRef.current.clear();
                scannerRef.current = null;

                setState((prev) => ({
                    ...prev,
                    isScanning: false,
                    error: null,
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to stop scanner';
                setState((prev) => ({
                    ...prev,
                    error: errorMessage,
                }));
            }
        }
    }, [state.isScanning]);

    const requestCameraPermission = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Stop the stream immediately, we just wanted to request permission
            stream.getTracks().forEach((track) => track.stop());

            setState((prev) => ({
                ...prev,
                cameraPermission: 'granted',
            }));

            return true;
        } catch (error) {
            setState((prev) => ({
                ...prev,
                cameraPermission: 'denied',
                error: 'Camera permission denied',
            }));
            return false;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    return {
        ...state,
        startScanning,
        stopScanning,
        requestCameraPermission,
    };
}
