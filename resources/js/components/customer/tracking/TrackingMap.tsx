import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin,
    Truck,
    Navigation,
    Maximize2,
    Minimize2,
    RotateCcw,
    Layers,
    Crosshair,
    Route
} from 'lucide-react';

interface MapLocation {
    lat: number;
    lng: number;
    address: string;
    type: 'origin' | 'current' | 'destination' | 'waypoint';
    timestamp?: string;
    description?: string;
}

interface Props {
    currentLocation: MapLocation;
    destination: MapLocation;
    route?: MapLocation[];
    driverLocation?: MapLocation;
    className?: string;
    height?: string;
}

export default function TrackingMap({ 
    currentLocation, 
    destination, 
    route = [], 
    driverLocation,
    className = '',
    height = 'h-64 sm:h-80 lg:h-96'
}: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
    const [isLoading, setIsLoading] = useState(true);
    const [mapError, setMapError] = useState<string | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    // Mock map implementation (in production, you'd use Google Maps, Mapbox, etc.)
    useEffect(() => {
        initializeMap();
    }, []);

    const initializeMap = async () => {
        setIsLoading(true);
        setMapError(null);

        try {
            // Simulate map loading
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In a real implementation, you would initialize the actual map here
            // For now, we'll create a mock map visualization
            createMockMap();
            
            setIsLoading(false);
        } catch (error) {
            setMapError('Failed to load map');
            setIsLoading(false);
        }
    };

    const createMockMap = () => {
        if (!mapRef.current) return;

        // Create a mock map visualization
        const mapContainer = mapRef.current;
        mapContainer.innerHTML = '';

        // Create SVG for mock map
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 400 300');
        svg.style.background = mapType === 'satellite' ? '#2d3748' : '#f7fafc';

        // Add route line
        const routeLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        routeLine.setAttribute('d', 'M 50 250 Q 200 100 350 50');
        routeLine.setAttribute('stroke', '#3182ce');
        routeLine.setAttribute('stroke-width', '3');
        routeLine.setAttribute('fill', 'none');
        routeLine.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(routeLine);

        // Add origin marker
        const originMarker = createMarker(50, 250, '#10b981', 'Origin');
        svg.appendChild(originMarker);

        // Add current location marker (truck)
        const currentMarker = createMarker(200, 150, '#3b82f6', 'Current Location');
        svg.appendChild(currentMarker);

        // Add destination marker
        const destMarker = createMarker(350, 50, '#ef4444', 'Destination');
        svg.appendChild(destMarker);

        mapContainer.appendChild(svg);
    };

    const createMarker = (x: number, y: number, color: string, title: string) => {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', x.toString());
        marker.setAttribute('cy', y.toString());
        marker.setAttribute('r', '8');
        marker.setAttribute('fill', color);
        marker.setAttribute('stroke', 'white');
        marker.setAttribute('stroke-width', '2');
        marker.style.cursor = 'pointer';
        
        // Add title for accessibility
        const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        titleElement.textContent = title;
        marker.appendChild(titleElement);

        return marker;
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const toggleMapType = () => {
        setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap');
        createMockMap(); // Recreate map with new type
    };

    const centerOnCurrent = () => {
        // In a real implementation, this would center the map on current location
        createMockMap();
    };

    const getEstimatedDistance = () => {
        // Mock distance calculation
        return '12.5 miles';
    };

    const getEstimatedTime = () => {
        // Mock time calculation
        return '25 minutes';
    };

    return (
        <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg sm:text-xl">Live Tracking Map</CardTitle>
                        <CardDescription>
                            Real-time location and route information
                        </CardDescription>
                    </div>
                    
                    {/* Map Controls - Mobile Optimized */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleMapType}
                            className="flex-1 sm:flex-none"
                        >
                            <Layers className="h-4 w-4 mr-2" />
                            {mapType === 'roadmap' ? 'Satellite' : 'Road'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={centerOnCurrent}
                            className="flex-1 sm:flex-none"
                        >
                            <Crosshair className="h-4 w-4 mr-2" />
                            Center
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="p-2"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4" />
                            ) : (
                                <Maximize2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Route Information - Mobile First */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-blue-700 mb-1">
                                <Route className="h-4 w-4" />
                                <span className="text-sm font-medium">Distance</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">{getEstimatedDistance()}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-blue-700 mb-1">
                                <Navigation className="h-4 w-4" />
                                <span className="text-sm font-medium">ETA</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">{getEstimatedTime()}</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-blue-700 mb-1">
                                <Truck className="h-4 w-4" />
                                <span className="text-sm font-medium">Status</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                                In Transit
                            </Badge>
                        </div>
                    </div>

                    {/* Map Container */}
                    <div className={`relative ${height} ${isFullscreen ? 'h-full' : ''} rounded-lg border overflow-hidden`}>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading map...</p>
                                </div>
                            </div>
                        )}

                        {mapError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">{mapError}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={initializeMap}
                                        className="mt-2"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isLoading && !mapError && (
                            <div ref={mapRef} className="w-full h-full" />
                        )}

                        {/* Map Legend - Mobile Responsive */}
                        {!isLoading && !mapError && (
                            <div className="absolute bottom-4 left-4 right-4 sm:right-auto">
                                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span>Origin</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span>Current</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span>Destination</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location Details - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                Current Location
                            </div>
                            <p className="text-sm text-gray-600 pl-6">
                                {currentLocation.address}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <MapPin className="h-4 w-4 text-red-600" />
                                Destination
                            </div>
                            <p className="text-sm text-gray-600 pl-6">
                                {destination.address}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
