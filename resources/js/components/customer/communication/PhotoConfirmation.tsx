import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle, Clock, Download, MapPin, Maximize2, Package, Share, User, X } from 'lucide-react';
import { useState } from 'react';

interface DeliveryPhoto {
    id: string;
    url: string;
    thumbnail: string;
    timestamp: string;
    location?: {
        lat: number;
        lng: number;
        address: string;
    };
    driver: {
        name: string;
        id: string;
    };
    type: 'delivery' | 'signature' | 'damage' | 'location';
    description?: string;
}

interface Props {
    trackingNumber: string;
    photos: DeliveryPhoto[];
    deliveryStatus: 'pending' | 'delivered' | 'attempted';
    deliveryTimestamp?: string;
    className?: string;
}

export default function PhotoConfirmation({ trackingNumber, photos, deliveryStatus, deliveryTimestamp, className = '' }: Props) {
    const [selectedPhoto, setSelectedPhoto] = useState<DeliveryPhoto | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            attempted: 'bg-orange-100 text-orange-800 border-orange-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            delivery: <Package className="h-4 w-4" />,
            signature: <User className="h-4 w-4" />,
            damage: <Camera className="h-4 w-4" />,
            location: <MapPin className="h-4 w-4" />,
        };
        return icons[type as keyof typeof icons] || <Camera className="h-4 w-4" />;
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            delivery: 'Delivery Proof',
            signature: 'Signature',
            damage: 'Condition Report',
            location: 'Location Proof',
        };
        return labels[type as keyof typeof labels] || 'Photo';
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

    const handlePhotoClick = (photo: DeliveryPhoto) => {
        setSelectedPhoto(photo);
        setIsFullscreen(true);
    };

    const handleDownload = (photo: DeliveryPhoto) => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `delivery-photo-${trackingNumber}-${photo.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async (photo: DeliveryPhoto) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Delivery Photo - ${trackingNumber}`,
                    text: `Delivery confirmation photo for shipment ${trackingNumber}`,
                    url: photo.url,
                });
            } catch (err) {
                // Fallback to clipboard
                navigator.clipboard.writeText(photo.url);
            }
        }
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        setSelectedPhoto(null);
    };

    return (
        <>
            <Card className={className}>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center text-lg sm:text-xl">
                                <Camera className="mr-2 h-5 w-5" />
                                Delivery Confirmation
                            </CardTitle>
                            <CardDescription>Photo proof of delivery • {trackingNumber}</CardDescription>
                        </div>

                        <Badge className={`${getStatusColor(deliveryStatus)} border`}>
                            {deliveryStatus === 'delivered' && <CheckCircle className="mr-1 h-3 w-3" />}
                            {deliveryStatus === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                            {deliveryStatus.toUpperCase()}
                        </Badge>
                    </div>

                    {/* Delivery Timestamp */}
                    {deliveryTimestamp && deliveryStatus === 'delivered' && (
                        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                            <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">Delivered successfully</span>
                            </div>
                            <p className="mt-1 text-sm text-green-700">
                                {formatDateTime(deliveryTimestamp).date} at {formatDateTime(deliveryTimestamp).time}
                            </p>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {photos.length > 0 ? (
                        <div className="space-y-6">
                            {/* Photo Grid - Mobile Optimized */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {photos.map((photo) => {
                                    const { date, time } = formatDateTime(photo.timestamp);

                                    return (
                                        <div
                                            key={photo.id}
                                            className="group relative overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md"
                                        >
                                            {/* Photo */}
                                            <div className="relative aspect-video">
                                                <img
                                                    src={photo.thumbnail}
                                                    alt={`Delivery photo ${photo.id}`}
                                                    className="h-full w-full cursor-pointer object-cover"
                                                    onClick={() => handlePhotoClick(photo)}
                                                />

                                                {/* Overlay */}
                                                <div className="bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 flex items-center justify-center bg-black transition-all">
                                                    <Maximize2 className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                                </div>

                                                {/* Type Badge */}
                                                <div className="absolute top-2 left-2">
                                                    <Badge className="bg-white/90 text-xs text-gray-800">
                                                        {getTypeIcon(photo.type)}
                                                        <span className="ml-1">{getTypeLabel(photo.type)}</span>
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Photo Info */}
                                            <div className="p-3">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">{date}</p>
                                                        <p className="text-gray-600">{time}</p>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDownload(photo)}
                                                            className="h-8 w-8 p-1"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => handleShare(photo)} className="h-8 w-8 p-1">
                                                            <Share className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Driver Info */}
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <User className="h-3 w-3" />
                                                    <span>By {photo.driver.name}</span>
                                                </div>

                                                {/* Location */}
                                                {photo.location && (
                                                    <div className="mt-2 flex items-start gap-2 text-xs text-gray-600">
                                                        <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                                        <span className="line-clamp-2">{photo.location.address}</span>
                                                    </div>
                                                )}

                                                {/* Description */}
                                                {photo.description && <p className="mt-2 line-clamp-2 text-xs text-gray-600">{photo.description}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary */}
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">Delivery Confirmed</h4>
                                        <p className="mt-1 text-sm text-blue-800">
                                            {photos.length} photo{photos.length !== 1 ? 's' : ''} taken as proof of delivery. All photos are
                                            timestamped and GPS-tagged for your security.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            {deliveryStatus === 'pending' ? (
                                <>
                                    <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500">Awaiting delivery</p>
                                    <p className="mt-1 text-sm text-gray-400">Photos will be taken when your package is delivered</p>
                                </>
                            ) : (
                                <>
                                    <Camera className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500">No delivery photos available</p>
                                    <p className="mt-1 text-sm text-gray-400">Photos may not be available for all delivery types</p>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Fullscreen Photo Modal */}
            {isFullscreen && selectedPhoto && (
                <div className="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                    <div className="relative max-h-full max-w-4xl">
                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={closeFullscreen}
                            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                        >
                            <X className="h-4 w-4" />
                        </Button>

                        {/* Photo */}
                        <img src={selectedPhoto.url} alt={`Delivery photo ${selectedPhoto.id}`} className="max-h-full max-w-full object-contain" />

                        {/* Photo Info Overlay */}
                        <div className="absolute right-4 bottom-4 left-4 rounded-lg bg-black/70 p-4 text-white">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium">{getTypeLabel(selectedPhoto.type)}</p>
                                    <p className="text-sm opacity-90">
                                        {formatDateTime(selectedPhoto.timestamp).date} at {formatDateTime(selectedPhoto.timestamp).time}
                                    </p>
                                    <p className="text-sm opacity-90">By {selectedPhoto.driver.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleDownload(selectedPhoto)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleShare(selectedPhoto)}>
                                        <Share className="mr-2 h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
