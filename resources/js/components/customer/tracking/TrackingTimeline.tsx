import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin,
    Truck,
    Package,
    Clock,
    CheckCircle,
    AlertCircle,
    Navigation,
    Camera,
    ChevronDown,
    ChevronUp,
    ExternalLink
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

interface Props {
    events: TrackingEvent[];
    currentStatus: string;
    className?: string;
}

export default function TrackingTimeline({ events, currentStatus, className = '' }: Props) {
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
    const [showAllEvents, setShowAllEvents] = useState(false);

    const getStatusIcon = (status: string, isCompleted: boolean) => {
        const iconClass = `h-5 w-5 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`;
        
        const icons = {
            'pending': <Clock className={iconClass} />,
            'picked_up': <Package className={iconClass} />,
            'in_transit': <Truck className={iconClass} />,
            'out_for_delivery': <Navigation className={iconClass} />,
            'delivered': <CheckCircle className={iconClass} />,
            'exception': <AlertCircle className={iconClass} />,
        };
        
        return icons[status as keyof typeof icons] || <Clock className={iconClass} />;
    };

    const getStatusColor = (status: string, isCompleted: boolean) => {
        if (!isCompleted) return 'bg-gray-100 text-gray-600 border-gray-300';
        
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'picked_up': 'bg-blue-100 text-blue-800 border-blue-300',
            'in_transit': 'bg-purple-100 text-purple-800 border-purple-300',
            'out_for_delivery': 'bg-orange-100 text-orange-800 border-orange-300',
            'delivered': 'bg-green-100 text-green-800 border-green-300',
            'exception': 'bg-red-100 text-red-800 border-red-300',
        };
        
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600 border-gray-300';
    };

    const isEventCompleted = (eventStatus: string) => {
        const statusOrder = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        const eventIndex = statusOrder.indexOf(eventStatus);
        return eventIndex <= currentIndex;
    };

    const formatDateTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const toggleEventExpansion = (eventId: string) => {
        setExpandedEvent(expandedEvent === eventId ? null : eventId);
    };

    const displayedEvents = showAllEvents ? events : events.slice(0, 5);

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Tracking Timeline</CardTitle>
                <CardDescription>
                    Follow your shipment's journey in real-time
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {displayedEvents.map((event, index) => {
                        const isCompleted = isEventCompleted(event.status);
                        const isExpanded = expandedEvent === event.id;
                        const { date, time } = formatDateTime(event.timestamp);
                        const isLast = index === displayedEvents.length - 1;

                        return (
                            <div key={event.id} className="relative">
                                {/* Timeline Line */}
                                {!isLast && (
                                    <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 -z-10" />
                                )}

                                {/* Event Card - Mobile Optimized */}
                                <div className={`flex gap-4 p-4 rounded-lg border transition-all ${
                                    isCompleted 
                                        ? 'bg-white border-gray-200 shadow-sm' 
                                        : 'bg-gray-50 border-gray-100'
                                }`}>
                                    {/* Status Icon */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                                        isCompleted 
                                            ? 'bg-green-50 border-green-200' 
                                            : 'bg-gray-100 border-gray-200'
                                    }`}>
                                        {getStatusIcon(event.status, isCompleted)}
                                    </div>

                                    {/* Event Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className={`${getStatusColor(event.status, isCompleted)} border text-xs px-2 py-1`}>
                                                        {event.status.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {event.description}
                                                </h3>
                                            </div>
                                            
                                            {/* Timestamp - Mobile Responsive */}
                                            <div className="text-right text-sm text-gray-600 flex-shrink-0">
                                                <div className="font-medium">{time}</div>
                                                <div>{date}</div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>

                                        {/* Expandable Details */}
                                        {(event.details || event.photos || event.driver) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleEventExpansion(event.id)}
                                                className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4 mr-1" />
                                                        Show less
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4 mr-1" />
                                                        Show details
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-md">
                                                {/* Additional Details */}
                                                {event.details && (
                                                    <p className="text-sm text-gray-700">
                                                        {event.details}
                                                    </p>
                                                )}

                                                {/* Driver Info */}
                                                {event.driver && (
                                                    <div className="flex items-center gap-3 p-2 bg-white rounded border">
                                                        {event.driver.photo ? (
                                                            <img
                                                                src={event.driver.photo}
                                                                alt={event.driver.name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <Truck className="h-4 w-4 text-gray-600" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {event.driver.name}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                Driver
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Photos */}
                                                {event.photos && event.photos.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                            <Camera className="h-4 w-4" />
                                                            Photos ({event.photos.length})
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                            {event.photos.map((photo, photoIndex) => (
                                                                <div key={photoIndex} className="relative group">
                                                                    <img
                                                                        src={photo}
                                                                        alt={`Event photo ${photoIndex + 1}`}
                                                                        className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                                                                        onClick={() => window.open(photo, '_blank')}
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <ExternalLink className="h-4 w-4 text-white drop-shadow-lg" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Coordinates Link */}
                                                {event.coordinates && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const url = `https://maps.google.com/?q=${event.coordinates!.lat},${event.coordinates!.lng}`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <MapPin className="h-4 w-4 mr-2" />
                                                        View on Map
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Show More/Less Button */}
                    {events.length > 5 && (
                        <div className="text-center pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowAllEvents(!showAllEvents)}
                                className="w-full sm:w-auto"
                            >
                                {showAllEvents ? (
                                    <>
                                        <ChevronUp className="h-4 w-4 mr-2" />
                                        Show Less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4 mr-2" />
                                        Show All Events ({events.length})
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {events.length === 0 && (
                        <div className="text-center py-8">
                            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No tracking events available yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Check back later for updates
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
