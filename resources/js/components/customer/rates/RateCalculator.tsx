import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Calculator,
    Package,
    MapPin,
    Clock,
    DollarSign,
    Truck,
    Plane,
    Ship,
    Leaf,
    Star,
    Info,
    RefreshCw,
    ArrowRight,
    Zap,
    Shield,
    Globe
} from 'lucide-react';

interface RateOption {
    id: string;
    service: string;
    serviceType: 'standard' | 'express' | 'overnight' | 'international' | 'economy';
    price: number;
    originalPrice?: number;
    discount?: number;
    transitTime: string;
    deliveryDate: string;
    features: string[];
    icon: React.ReactNode;
    popular?: boolean;
    eco?: boolean;
    guaranteed?: boolean;
}

interface PackageDetails {
    weight: number;
    length: number;
    width: number;
    height: number;
    declaredValue: number;
    packageType: string;
}

interface AddressDetails {
    zipCode: string;
    city: string;
    state: string;
    country: string;
    residential: boolean;
}

interface Props {
    className?: string;
    onRateSelect?: (rate: RateOption) => void;
    prefilledOrigin?: AddressDetails;
    prefilledDestination?: AddressDetails;
    prefilledPackage?: PackageDetails;
}

export default function RateCalculator({ 
    className = '', 
    onRateSelect,
    prefilledOrigin,
    prefilledDestination,
    prefilledPackage
}: Props) {
    const [origin, setOrigin] = useState<AddressDetails>(prefilledOrigin || {
        zipCode: '',
        city: '',
        state: '',
        country: 'US',
        residential: false,
    });

    const [destination, setDestination] = useState<AddressDetails>(prefilledDestination || {
        zipCode: '',
        city: '',
        state: '',
        country: 'US',
        residential: false,
    });

    const [packageDetails, setPackageDetails] = useState<PackageDetails>(prefilledPackage || {
        weight: 1,
        length: 10,
        width: 10,
        height: 10,
        declaredValue: 100,
        packageType: 'package',
    });

    const [rates, setRates] = useState<RateOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRate, setSelectedRate] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const packageTypes = [
        { value: 'package', label: 'Package' },
        { value: 'envelope', label: 'Envelope' },
        { value: 'tube', label: 'Tube' },
        { value: 'pak', label: 'Pak' },
        { value: 'box', label: 'Box' },
    ];

    const countries = [
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
        { value: 'MX', label: 'Mexico' },
        { value: 'GB', label: 'United Kingdom' },
        { value: 'DE', label: 'Germany' },
        { value: 'FR', label: 'France' },
        { value: 'AU', label: 'Australia' },
        { value: 'JP', label: 'Japan' },
        { value: 'CN', label: 'China' },
    ];

    const calculateRates = async () => {
        if (!origin.zipCode || !destination.zipCode) {
            setError('Please enter origin and destination zip codes');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockRates: RateOption[] = [
                {
                    id: 'economy',
                    service: 'RT Economy',
                    serviceType: 'economy',
                    price: 12.99,
                    originalPrice: 15.99,
                    discount: 18.8,
                    transitTime: '5-7 business days',
                    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    features: ['Ground delivery', 'Tracking included', 'Signature on delivery'],
                    icon: <Truck className="h-5 w-5" />,
                    eco: true,
                },
                {
                    id: 'standard',
                    service: 'RT Standard',
                    serviceType: 'standard',
                    price: 18.99,
                    originalPrice: 22.99,
                    discount: 17.4,
                    transitTime: '3-5 business days',
                    deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    features: ['Ground delivery', 'Tracking included', 'Insurance up to $100'],
                    icon: <Package className="h-5 w-5" />,
                    popular: true,
                },
                {
                    id: 'express',
                    service: 'RT Express',
                    serviceType: 'express',
                    price: 29.99,
                    originalPrice: 34.99,
                    discount: 14.3,
                    transitTime: '1-2 business days',
                    deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    features: ['Air delivery', 'Priority handling', 'Insurance up to $500'],
                    icon: <Zap className="h-5 w-5" />,
                    guaranteed: true,
                },
                {
                    id: 'overnight',
                    service: 'RT Overnight',
                    serviceType: 'overnight',
                    price: 49.99,
                    transitTime: 'Next business day',
                    deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    features: ['Next day delivery', 'Morning delivery', 'Insurance up to $1000'],
                    icon: <Plane className="h-5 w-5" />,
                    guaranteed: true,
                },
            ];

            // Add international option if different countries
            if (origin.country !== destination.country) {
                mockRates.push({
                    id: 'international',
                    service: 'RT International',
                    serviceType: 'international',
                    price: 89.99,
                    transitTime: '7-14 business days',
                    deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    features: ['International delivery', 'Customs handling', 'Tracking included'],
                    icon: <Globe className="h-5 w-5" />,
                });
            }

            setRates(mockRates);
        } catch (err) {
            setError('Failed to calculate rates. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRateSelect = (rate: RateOption) => {
        setSelectedRate(rate.id);
        onRateSelect?.(rate);
    };

    const getServiceColor = (serviceType: string) => {
        const colors = {
            economy: 'bg-green-100 text-green-800 border-green-300',
            standard: 'bg-blue-100 text-blue-800 border-blue-300',
            express: 'bg-purple-100 text-purple-800 border-purple-300',
            overnight: 'bg-red-100 text-red-800 border-red-300',
            international: 'bg-orange-100 text-orange-800 border-orange-300',
        };
        return colors[serviceType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Rate Calculator
                </CardTitle>
                <CardDescription>
                    Get instant shipping quotes and compare service options
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Origin and Destination - Mobile Optimized */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Origin */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                            Ship From
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="origin-zip">Zip Code *</Label>
                                <Input
                                    id="origin-zip"
                                    value={origin.zipCode}
                                    onChange={(e) => setOrigin(prev => ({ ...prev, zipCode: e.target.value }))}
                                    placeholder="12345"
                                    className="text-base sm:text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="origin-country">Country</Label>
                                <Select
                                    value={origin.country}
                                    onValueChange={(value) => setOrigin(prev => ({ ...prev, country: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map(country => (
                                            <SelectItem key={country.value} value={country.value}>
                                                {country.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="origin-residential"
                                checked={origin.residential}
                                onCheckedChange={(checked) => 
                                    setOrigin(prev => ({ ...prev, residential: !!checked }))
                                }
                            />
                            <Label htmlFor="origin-residential" className="text-sm">
                                Residential address
                            </Label>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-red-600" />
                            Ship To
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="dest-zip">Zip Code *</Label>
                                <Input
                                    id="dest-zip"
                                    value={destination.zipCode}
                                    onChange={(e) => setDestination(prev => ({ ...prev, zipCode: e.target.value }))}
                                    placeholder="54321"
                                    className="text-base sm:text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dest-country">Country</Label>
                                <Select
                                    value={destination.country}
                                    onValueChange={(value) => setDestination(prev => ({ ...prev, country: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map(country => (
                                            <SelectItem key={country.value} value={country.value}>
                                                {country.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="dest-residential"
                                checked={destination.residential}
                                onCheckedChange={(checked) => 
                                    setDestination(prev => ({ ...prev, residential: !!checked }))
                                }
                            />
                            <Label htmlFor="dest-residential" className="text-sm">
                                Residential address
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Package Details */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 flex items-center">
                        <Package className="h-4 w-4 mr-2 text-green-600" />
                        Package Details
                    </h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <Label htmlFor="weight">Weight (lbs) *</Label>
                            <Input
                                id="weight"
                                type="number"
                                value={packageDetails.weight}
                                onChange={(e) => setPackageDetails(prev => ({ 
                                    ...prev, 
                                    weight: parseFloat(e.target.value) || 0 
                                }))}
                                min="0.1"
                                step="0.1"
                                className="text-base sm:text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="length">Length (in)</Label>
                            <Input
                                id="length"
                                type="number"
                                value={packageDetails.length}
                                onChange={(e) => setPackageDetails(prev => ({ 
                                    ...prev, 
                                    length: parseFloat(e.target.value) || 0 
                                }))}
                                min="1"
                                className="text-base sm:text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="width">Width (in)</Label>
                            <Input
                                id="width"
                                type="number"
                                value={packageDetails.width}
                                onChange={(e) => setPackageDetails(prev => ({ 
                                    ...prev, 
                                    width: parseFloat(e.target.value) || 0 
                                }))}
                                min="1"
                                className="text-base sm:text-sm"
                            />
                        </div>
                        <div>
                            <Label htmlFor="height">Height (in)</Label>
                            <Input
                                id="height"
                                type="number"
                                value={packageDetails.height}
                                onChange={(e) => setPackageDetails(prev => ({ 
                                    ...prev, 
                                    height: parseFloat(e.target.value) || 0 
                                }))}
                                min="1"
                                className="text-base sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="package-type">Package Type</Label>
                            <Select
                                value={packageDetails.packageType}
                                onValueChange={(value) => setPackageDetails(prev => ({ 
                                    ...prev, 
                                    packageType: value 
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {packageTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="declared-value">Declared Value ($)</Label>
                            <Input
                                id="declared-value"
                                type="number"
                                value={packageDetails.declaredValue}
                                onChange={(e) => setPackageDetails(prev => ({ 
                                    ...prev, 
                                    declaredValue: parseFloat(e.target.value) || 0 
                                }))}
                                min="1"
                                className="text-base sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Calculate Button */}
                <Button
                    onClick={calculateRates}
                    disabled={isLoading || !origin.zipCode || !destination.zipCode}
                    className="w-full"
                    size="lg"
                >
                    {isLoading ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Calculating Rates...
                        </>
                    ) : (
                        <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Get Shipping Rates
                        </>
                    )}
                </Button>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Rate Results */}
                {rates.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                            Available Rates ({rates.length} options)
                        </h3>

                        <div className="space-y-3">
                            {rates.map((rate) => (
                                <div
                                    key={rate.id}
                                    className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                        selectedRate === rate.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleRateSelect(rate)}
                                >
                                    {/* Popular/Eco Badges */}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {rate.popular && (
                                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                                                <Star className="h-3 w-3 mr-1" />
                                                Popular
                                            </Badge>
                                        )}
                                        {rate.eco && (
                                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                                <Leaf className="h-3 w-3 mr-1" />
                                                Eco
                                            </Badge>
                                        )}
                                        {rate.guaranteed && (
                                            <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Guaranteed
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-start justify-between pr-20">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${getServiceColor(rate.serviceType)}`}>
                                                {rate.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900">{rate.service}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-3 w-3 text-gray-500" />
                                                    <span className="text-sm text-gray-600">{rate.transitTime}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Delivery by {rate.deliveryDate}
                                                </p>

                                                {/* Features */}
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {rate.features.slice(0, 2).map((feature, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                    {rate.features.length > 2 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{rate.features.length - 2} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                {rate.originalPrice && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        ${rate.originalPrice.toFixed(2)}
                                                    </span>
                                                )}
                                                <span className="text-lg font-bold text-gray-900">
                                                    ${rate.price.toFixed(2)}
                                                </span>
                                            </div>
                                            {rate.discount && (
                                                <div className="text-xs text-green-600 font-medium">
                                                    Save {rate.discount.toFixed(1)}%
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selected Indicator */}
                                    {selectedRate === rate.id && (
                                        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Rate Comparison Summary */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Fastest: {rates.find(r => r.serviceType === 'overnight')?.service || rates[0]?.service}
                                </span>
                                <span className="text-gray-600">
                                    Most Economical: {rates.find(r => r.serviceType === 'economy')?.service || rates[rates.length - 1]?.service}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
