import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Camera, CheckCircle, ChevronDown, ChevronUp, Clock, ExternalLink, MapPin, Navigation, Package, Truck } from 'lucide-react';
import { useState } from 'react';

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
            pending: <Clock className={iconClass} />,
            picked_up: <Package className={iconClass} />,
            in_transit: <Truck className={iconClass} />,
            out_for_delivery: <Navigation className={iconClass} />,
            delivered: <CheckCircle className={iconClass} />,
            exception: <AlertCircle className={iconClass} />,
        };

        return icons[status as keyof typeof icons] || <Clock className={iconClass} />;
    };

    const getStatusColor = (status: string, isCompleted: boolean) => {
        if (!isCompleted) return 'bg-gray-100 text-gray-600 border-gray-300';

        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            picked_up: 'bg-blue-100 text-blue-800 border-blue-300',
            in_transit: 'bg-purple-100 text-purple-800 border-purple-300',
            out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            exception: 'bg-red-100 text-red-800 border-red-300',
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
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
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
                <CardDescription>Follow your shipment's journey in real-time</CardDescription>
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
                                {!isLast && <div className="absolute top-12 left-6 -z-10 h-full w-0.5 bg-gray-200" />}

                                {/* Event Card - Mobile Optimized */}
                                <div
                                    className={`flex gap-4 rounded-lg border p-4 transition-all ${
                                        isCompleted ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50'
                                    }`}
                                >
                                    {/* Status Icon */}
                                    <div
                                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                                            isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-100'
                                        }`}
                                    >
                                        {getStatusIcon(event.status, isCompleted)}
                                    </div>

                                    {/* Event Content */}
                                    <div className="min-w-0 flex-1">
                                        {/* Header */}
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <Badge className={`${getStatusColor(event.status, isCompleted)} border px-2 py-1 text-xs`}>
                                                        {event.status.replace('_', ' ').toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <h3 className="truncate font-medium text-gray-900">{event.description}</h3>
                                            </div>

                                            {/* Timestamp - Mobile Responsive */}
                                            <div className="flex-shrink-0 text-right text-sm text-gray-600">
                                                <div className="font-medium">{time}</div>
                                                <div>{date}</div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>

                                        {/* Expandable Details */}
                                        {(event.details || event.photos || event.driver) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleEventExpansion(event.id)}
                                                className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-800"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="mr-1 h-4 w-4" />
                                                        Show less
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="mr-1 h-4 w-4" />
                                                        Show details
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                                                {/* Additional Details */}
                                                {event.details && <p className="text-sm text-gray-700">{event.details}</p>}

                                                {/* Driver Info */}
                                                {event.driver && (
                                                    <div className="flex items-center gap-3 rounded border bg-white p-2">
                                                        {event.driver.photo ? (
                                                            <img
                                                                src={event.driver.photo}
                                                                alt={event.driver.name}
                                                                className="h-8 w-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                                                                <Truck className="h-4 w-4 text-gray-600" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-gray-900">{event.driver.name}</p>
                                                            <p className="text-xs text-gray-600">Driver</p>
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
                                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                            {event.photos.map((photo, photoIndex) => (
                                                                <div key={photoIndex} className="group relative">
                                                                    <img
                                                                        src={photo}
                                                                        alt={`Event photo ${photoIndex + 1}`}
                                                                        className="h-20 w-full cursor-pointer rounded border object-cover transition-opacity hover:opacity-90"
                                                                        onClick={() => window.open(photo, '_blank')}
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
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
                                                        <MapPin className="mr-2 h-4 w-4" />
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
                        <div className="pt-4 text-center">
                            <Button variant="outline" onClick={() => setShowAllEvents(!showAllEvents)} className="w-full sm:w-auto">
                                {showAllEvents ? (
                                    <>
                                        <ChevronUp className="mr-2 h-4 w-4" />
                                        Show Less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="mr-2 h-4 w-4" />
                                        Show All Events ({events.length})
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {events.length === 0 && (
                        <div className="py-8 text-center">
                            <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-gray-500">No tracking events available yet</p>
                            <p className="mt-1 text-sm text-gray-400">Check back later for updates</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
