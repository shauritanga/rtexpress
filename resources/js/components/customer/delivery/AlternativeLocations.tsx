import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin,
    Search,
    Navigation,
    Clock,
    Star,
    Package,
    Shield,
    Truck,
    Building,
    Home,
    CheckCircle,
    AlertCircle,
    Phone,
    ExternalLink,
    Filter,
    Map
} from 'lucide-react';

interface PickupLocation {
    id: string;
    name: string;
    type: 'pickup_point' | 'locker' | 'store' | 'post_office';
    address: string;
    distance: number;
    walkingTime: number;
    drivingTime: number;
    hours: {
        weekdays: string;
        saturday: string;
        sunday: string;
    };
    phone?: string;
    rating: number;
    reviewCount: number;
    features: string[];
    available: boolean;
    capacity?: number;
    maxPackageSize?: string;
    fees: {
        pickup: number;
        storage: number;
    };
    coordinates: {
        lat: number;
        lng: number;
    };
}

interface Props {
    className?: string;
    currentAddress?: string;
    selectedLocation?: string;
    onLocationSelect?: (location: PickupLocation) => void;
    packageSize?: 'small' | 'medium' | 'large';
}

export default function AlternativeLocations({ 
    className = '', 
    currentAddress = "123 Business St, New York, NY 10019",
    selectedLocation,
    onLocationSelect,
    packageSize = 'medium'
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [locations, setLocations] = useState<PickupLocation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        loadNearbyLocations();
    }, [currentAddress]);

    const loadNearbyLocations = () => {
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            const mockLocations: PickupLocation[] = [
                {
                    id: 'loc-1',
                    name: 'RT Express Pickup Point - Manhattan',
                    type: 'pickup_point',
                    address: '456 Broadway, New York, NY 10013',
                    distance: 0.8,
                    walkingTime: 12,
                    drivingTime: 5,
                    hours: {
                        weekdays: '8:00 AM - 8:00 PM',
                        saturday: '9:00 AM - 6:00 PM',
                        sunday: '10:00 AM - 4:00 PM',
                    },
                    phone: '(212) 555-0123',
                    rating: 4.8,
                    reviewCount: 245,
                    features: ['24/7 Access', 'Secure Storage', 'Package Tracking', 'SMS Notifications'],
                    available: true,
                    capacity: 95,
                    maxPackageSize: 'Large (up to 50 lbs)',
                    fees: { pickup: 0, storage: 0 },
                    coordinates: { lat: 40.7589, lng: -73.9851 },
                },
                {
                    id: 'loc-2',
                    name: 'Smart Locker - Times Square',
                    type: 'locker',
                    address: '789 7th Ave, New York, NY 10019',
                    distance: 0.3,
                    walkingTime: 4,
                    drivingTime: 2,
                    hours: {
                        weekdays: '24/7',
                        saturday: '24/7',
                        sunday: '24/7',
                    },
                    rating: 4.6,
                    reviewCount: 189,
                    features: ['24/7 Access', 'Contactless Pickup', 'Climate Controlled', 'Security Cameras'],
                    available: true,
                    capacity: 78,
                    maxPackageSize: 'Medium (up to 25 lbs)',
                    fees: { pickup: 2.99, storage: 1.00 },
                    coordinates: { lat: 40.7580, lng: -73.9855 },
                },
                {
                    id: 'loc-3',
                    name: 'FedEx Office Print & Ship Center',
                    type: 'store',
                    address: '321 W 42nd St, New York, NY 10036',
                    distance: 1.2,
                    walkingTime: 18,
                    drivingTime: 8,
                    hours: {
                        weekdays: '7:00 AM - 10:00 PM',
                        saturday: '8:00 AM - 8:00 PM',
                        sunday: '9:00 AM - 6:00 PM',
                    },
                    phone: '(212) 555-0456',
                    rating: 4.2,
                    reviewCount: 156,
                    features: ['Staff Assistance', 'Package Tracking', 'Extended Hours', 'Multiple Services'],
                    available: true,
                    maxPackageSize: 'Large (up to 70 lbs)',
                    fees: { pickup: 4.99, storage: 2.00 },
                    coordinates: { lat: 40.7570, lng: -73.9900 },
                },
                {
                    id: 'loc-4',
                    name: 'USPS Post Office - Midtown',
                    type: 'post_office',
                    address: '223 W 38th St, New York, NY 10018',
                    distance: 1.5,
                    walkingTime: 22,
                    drivingTime: 10,
                    hours: {
                        weekdays: '9:00 AM - 5:00 PM',
                        saturday: '9:00 AM - 3:00 PM',
                        sunday: 'Closed',
                    },
                    phone: '(212) 555-0789',
                    rating: 3.8,
                    reviewCount: 89,
                    features: ['Government Facility', 'Secure Storage', 'ID Required', 'Hold for Pickup'],
                    available: true,
                    maxPackageSize: 'Large (up to 70 lbs)',
                    fees: { pickup: 0, storage: 0 },
                    coordinates: { lat: 40.7540, lng: -73.9920 },
                },
                {
                    id: 'loc-5',
                    name: 'Amazon Hub Locker - Herald Square',
                    type: 'locker',
                    address: '1 Herald Sq, New York, NY 10001',
                    distance: 2.1,
                    walkingTime: 28,
                    drivingTime: 12,
                    hours: {
                        weekdays: '6:00 AM - 11:00 PM',
                        saturday: '6:00 AM - 11:00 PM',
                        sunday: '7:00 AM - 10:00 PM',
                    },
                    rating: 4.4,
                    reviewCount: 312,
                    features: ['Extended Hours', 'Contactless Pickup', 'Mobile App', 'Multiple Sizes'],
                    available: false, // Full capacity
                    capacity: 0,
                    maxPackageSize: 'Medium (up to 25 lbs)',
                    fees: { pickup: 0, storage: 0 },
                    coordinates: { lat: 40.7505, lng: -73.9934 },
                },
            ];
            
            setLocations(mockLocations);
            setIsLoading(false);
        }, 800);
    };

    const filteredLocations = locations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            location.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || location.type === selectedType;
        return matchesSearch && matchesType;
    });

    const handleLocationSelect = (location: PickupLocation) => {
        if (location.available) {
            onLocationSelect?.(location);
        }
    };

    const getLocationTypeIcon = (type: string) => {
        const icons = {
            pickup_point: <Package className="h-5 w-5" />,
            locker: <Shield className="h-5 w-5" />,
            store: <Building className="h-5 w-5" />,
            post_office: <Home className="h-5 w-5" />,
        };
        return icons[type as keyof typeof icons] || <MapPin className="h-5 w-5" />;
    };

    const getLocationTypeColor = (type: string) => {
        const colors = {
            pickup_point: 'bg-blue-100 text-blue-800 border-blue-300',
            locker: 'bg-purple-100 text-purple-800 border-purple-300',
            store: 'bg-green-100 text-green-800 border-green-300',
            post_office: 'bg-orange-100 text-orange-800 border-orange-300',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getLocationTypeName = (type: string) => {
        const names = {
            pickup_point: 'Pickup Point',
            locker: 'Smart Locker',
            store: 'Retail Store',
            post_office: 'Post Office',
        };
        return names[type as keyof typeof names] || 'Location';
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.floor(rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Alternative Delivery Locations
                </CardTitle>
                <CardDescription>
                    Choose a convenient pickup location near you
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Current Address */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Current delivery address:</span>
                    </div>
                    <p className="text-sm text-blue-800 mt-1">{currentAddress}</p>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowMap(!showMap)}
                            className="px-3"
                        >
                            <Map className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Type Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <Button
                            variant={selectedType === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedType('all')}
                        >
                            All Types
                        </Button>
                        <Button
                            variant={selectedType === 'pickup_point' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedType('pickup_point')}
                        >
                            <Package className="h-4 w-4 mr-2" />
                            Pickup Points
                        </Button>
                        <Button
                            variant={selectedType === 'locker' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedType('locker')}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Lockers
                        </Button>
                        <Button
                            variant={selectedType === 'store' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedType('store')}
                        >
                            <Building className="h-4 w-4 mr-2" />
                            Stores
                        </Button>
                    </div>
                </div>

                {/* Locations List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Finding nearby locations...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLocations.map((location) => (
                            <div
                                key={location.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedLocation === location.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : location.available
                                        ? 'border-gray-200 hover:border-gray-300'
                                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-75'
                                }`}
                                onClick={() => handleLocationSelect(location)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`p-2 rounded-lg ${getLocationTypeColor(location.type)}`}>
                                            {getLocationTypeIcon(location.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-medium text-gray-900 truncate">{location.name}</h4>
                                                <Badge className={getLocationTypeColor(location.type)}>
                                                    {getLocationTypeName(location.type)}
                                                </Badge>
                                                {!location.available && (
                                                    <Badge className="bg-red-100 text-red-800 border-red-300">
                                                        Full
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                                            
                                            {/* Distance and Time */}
                                            <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Navigation className="h-3 w-3" />
                                                    <span>{location.distance} mi</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{location.walkingTime} min walk</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Truck className="h-3 w-3" />
                                                    <span>{location.drivingTime} min drive</span>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex items-center">
                                                    {renderStars(location.rating)}
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {location.rating} ({location.reviewCount} reviews)
                                                </span>
                                            </div>

                                            {/* Hours */}
                                            <div className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">Hours: </span>
                                                {location.hours.weekdays}
                                            </div>

                                            {/* Features */}
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {location.features.slice(0, 3).map((feature, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                                {location.features.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{location.features.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Capacity and Size */}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                {location.capacity !== undefined && (
                                                    <span>Capacity: {location.capacity}% available</span>
                                                )}
                                                {location.maxPackageSize && (
                                                    <span>Max size: {location.maxPackageSize}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right ml-4">
                                        {/* Fees */}
                                        <div className="text-sm">
                                            {location.fees.pickup > 0 ? (
                                                <span className="font-medium text-gray-900">
                                                    ${location.fees.pickup.toFixed(2)} pickup fee
                                                </span>
                                            ) : (
                                                <span className="font-medium text-green-600">Free pickup</span>
                                            )}
                                            {location.fees.storage > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    +${location.fees.storage.toFixed(2)}/day storage
                                                </div>
                                            )}
                                        </div>

                                        {/* Contact */}
                                        {location.phone && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 p-1 h-auto"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`tel:${location.phone}`);
                                                }}
                                            >
                                                <Phone className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {selectedLocation === location.id && (
                                    <div className="mt-3 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">
                                                Selected for pickup
                                            </span>
                                        </div>
                                        <p className="text-sm text-blue-800 mt-1">
                                            Your package will be available for pickup at this location
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-blue-800">
                                            <span>📍 {location.distance} mi away</span>
                                            <span>🕒 {location.hours.weekdays}</span>
                                            {location.fees.pickup > 0 && (
                                                <span>💰 ${location.fees.pickup.toFixed(2)} fee</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredLocations.length === 0 && !isLoading && (
                            <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No locations found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Pickup Location Benefits</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Secure package storage</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Extended pickup hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>No missed deliveries</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Convenient locations</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
