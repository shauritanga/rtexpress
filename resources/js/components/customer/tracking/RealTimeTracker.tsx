import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    AlertCircle,
    Bell,
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    MessageCircle,
    Navigation,
    Package,
    Phone,
    RefreshCw,
    Share,
    Truck,
    User,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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

interface Props {
    trackingNumber?: string;
    className?: string;
}

export default function RealTimeTracker({ trackingNumber: initialTrackingNumber, className = '' }: Props) {
    const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
    const [trackingData, setTrackingData] = useState<ShipmentTracking | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);

    // Auto-refresh functionality
    useEffect(() => {
        if (isAutoRefresh && trackingData) {
            refreshInterval.current = setInterval(() => {
                fetchTrackingData(trackingNumber, false);
            }, 30000); // Refresh every 30 seconds

            return () => {
                if (refreshInterval.current) {
                    clearInterval(refreshInterval.current);
                }
            };
        }
    }, [isAutoRefresh, trackingData, trackingNumber]);

    // Initial load if tracking number is provided
    useEffect(() => {
        if (initialTrackingNumber) {
            fetchTrackingData(initialTrackingNumber);
        }
    }, [initialTrackingNumber]);

    const fetchTrackingData = async (trackingNum: string, showLoading = true) => {
        if (!trackingNum.trim()) {
            setError('Please enter a tracking number');
            return;
        }

        if (showLoading) setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/tracking/${trackingNum}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Tracking information not found');
            }

            const data = await response.json();
            setTrackingData(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tracking data');
            setTrackingData(null);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const handleTrackingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTrackingData(trackingNumber);
    };

    const handleRefresh = () => {
        if (trackingData) {
            fetchTrackingData(trackingNumber, false);
        }
    };

    const handleShare = async () => {
        if (trackingData && navigator.share) {
            try {
                await navigator.share({
                    title: `Tracking ${trackingData.tracking_number}`,
                    text: `Track your shipment: ${trackingData.current_status}`,
                    url: window.location.href,
                });
            } catch (err) {
                // Fallback to clipboard
                navigator.clipboard.writeText(window.location.href);
            }
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            picked_up: 'bg-blue-100 text-blue-800 border-blue-300',
            in_transit: 'bg-purple-100 text-purple-800 border-purple-300',
            out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            exception: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            pending: Clock,
            picked_up: Package,
            in_transit: Truck,
            out_for_delivery: Navigation,
            delivered: CheckCircle,
            exception: AlertCircle,
        };
        const Icon = icons[status as keyof typeof icons] || Clock;
        return <Icon className="h-4 w-4" />;
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Tracking Input - Mobile First */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl">Track Your Shipment</CardTitle>
                    <CardDescription>Enter your tracking number to get real-time updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleTrackingSubmit} className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Input
                                type="text"
                                placeholder="Enter tracking number (e.g., RT12345678)"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                                className="flex-1 text-base sm:text-sm"
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading || !trackingNumber.trim()} className="w-full min-w-24 sm:w-auto">
                                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Track'}
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

            {/* Tracking Results */}
            {trackingData && (
                <>
                    {/* Current Status - Mobile Optimized */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="font-mono text-lg sm:text-xl">{trackingData.tracking_number}</CardTitle>
                                    <CardDescription>Last updated: {lastUpdated?.toLocaleTimeString()}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleRefresh} className="flex-1 sm:flex-none">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Refresh
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 sm:flex-none">
                                        <Share className="mr-2 h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Current Status Badge */}
                                <div className="flex items-center gap-3">
                                    <Badge className={`${getStatusColor(trackingData.current_status)} border px-3 py-1 text-sm`}>
                                        {getStatusIcon(trackingData.current_status)}
                                        <span className="ml-2 capitalize">{trackingData.current_status.replace('_', ' ')}</span>
                                    </Badge>
                                </div>

                                {/* Delivery Info Grid - Mobile Responsive */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Estimated Delivery
                                        </div>
                                        <p className="font-medium">
                                            {new Date(trackingData.estimated_delivery).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                        {trackingData.delivery_window && <p className="text-sm text-gray-600">{trackingData.delivery_window}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Current Location
                                        </div>
                                        <p className="font-medium">{trackingData.current_location.address}</p>
                                    </div>
                                </div>

                                {/* Driver Info - Mobile Optimized */}
                                {trackingData.driver && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <div className="flex items-center gap-3">
                                            {trackingData.driver.photo ? (
                                                <img
                                                    src={trackingData.driver.photo}
                                                    alt={trackingData.driver.name}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200">
                                                    <User className="h-6 w-6 text-blue-600" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-blue-900">{trackingData.driver.name}</p>
                                                <p className="text-sm text-blue-700">{trackingData.driver.vehicle}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="p-2">
                                                    <Phone className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="p-2">
                                                    <MessageCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Auto-refresh Toggle */}
                                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                    <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium">Auto-refresh</span>
                                    </div>
                                    <Button
                                        variant={isAutoRefresh ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                                    >
                                        {isAutoRefresh ? 'On' : 'Off'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
