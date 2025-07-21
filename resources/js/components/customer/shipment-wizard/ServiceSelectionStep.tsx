import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
    Truck,
    Clock,
    DollarSign,
    ArrowRight,
    ArrowLeft,
    Zap,
    Shield,
    Plane,
    CheckCircle,
    Star,
    Info
} from 'lucide-react';

interface ServiceType {
    id: string;
    name: string;
    description: string;
    base_rate: number;
    estimated_days: string;
    features: string[];
}

interface ServiceOption extends ServiceType {
    calculated_cost: number;
    total_cost: number;
    delivery_date: string;
    is_recommended?: boolean;
}

interface Props {
    data: any;
    serviceTypes: ServiceType[];
    onUpdate: (data: any) => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function ServiceSelectionStep({ data, serviceTypes, onUpdate, onNext, onPrev }: Props) {
    const [selectedService, setSelectedService] = useState<string>(data.serviceType?.id || '');
    const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);

    // Calculate costs for all services
    useEffect(() => {
        calculateServiceCosts();
    }, []);

    const calculateServiceCosts = async () => {
        setIsCalculating(true);
        
        try {
            // Simulate API call for rate calculation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { packageDetails, sender, recipient } = data;
            const billingWeight = Math.max(
                packageDetails.weight || 0,
                calculateVolumetricWeight(packageDetails)
            );

            const options: ServiceOption[] = serviceTypes.map((service, index) => {
                // Mock cost calculation based on service type and package details
                let baseCost = service.base_rate * billingWeight;
                
                // Add surcharges
                let fuelSurcharge = baseCost * 0.15; // 15% fuel surcharge
                let insuranceCost = packageDetails.insurance_required ? packageDetails.declared_value * 0.01 : 0;
                let signatureCost = packageDetails.signature_required ? 5.50 : 0;
                let specialHandlingCost = packageDetails.special_handling.length * 10;
                
                // Distance-based adjustment (mock)
                let distanceMultiplier = 1 + (Math.random() * 0.3); // 0-30% variation
                
                let calculatedCost = baseCost * distanceMultiplier;
                let totalCost = calculatedCost + fuelSurcharge + insuranceCost + signatureCost + specialHandlingCost;
                
                // Calculate delivery date
                const deliveryDays = parseInt(service.estimated_days.split('-')[0]);
                const deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
                
                return {
                    ...service,
                    calculated_cost: Math.round(calculatedCost * 100) / 100,
                    total_cost: Math.round(totalCost * 100) / 100,
                    delivery_date: deliveryDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    }),
                    is_recommended: index === 1, // Make second option recommended
                };
            });

            // Sort by cost
            options.sort((a, b) => a.total_cost - b.total_cost);
            
            setServiceOptions(options);
        } catch (error) {
            console.error('Error calculating service costs:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const calculateVolumetricWeight = (packageDetails: any) => {
        const { length, width, height, dimension_unit } = packageDetails;
        if (!length || !width || !height) return 0;
        
        let volume = length * width * height;
        if (dimension_unit === 'cm') {
            volume = volume / 16.387; // Convert cm³ to in³
        }
        
        return volume / 166; // Volumetric weight divisor
    };

    const handleServiceSelect = (serviceId: string) => {
        setSelectedService(serviceId);
        const service = serviceOptions.find(s => s.id === serviceId);
        if (service) {
            onUpdate({ 
                serviceType: service,
                totalCost: service.total_cost
            });
        }
    };

    const handleNext = () => {
        if (selectedService) {
            onNext();
        }
    };

    const getServiceIcon = (serviceName: string) => {
        if (serviceName.toLowerCase().includes('express') || serviceName.toLowerCase().includes('overnight')) {
            return <Zap className="h-5 w-5" />;
        }
        if (serviceName.toLowerCase().includes('international')) {
            return <Plane className="h-5 w-5" />;
        }
        return <Truck className="h-5 w-5" />;
    };

    const getServiceColor = (serviceName: string) => {
        if (serviceName.toLowerCase().includes('express') || serviceName.toLowerCase().includes('overnight')) {
            return 'text-red-600 bg-red-50 border-red-200';
        }
        if (serviceName.toLowerCase().includes('international')) {
            return 'text-purple-600 bg-purple-50 border-purple-200';
        }
        return 'text-blue-600 bg-blue-50 border-blue-200';
    };

    return (
        <div className="space-y-6">
            {/* Service Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Truck className="h-5 w-5 mr-2" />
                        Choose Shipping Service
                    </CardTitle>
                    <CardDescription>
                        Compare services and select the best option for your shipment
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isCalculating ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Calculating shipping rates...</p>
                            </div>
                        </div>
                    ) : (
                        <RadioGroup value={selectedService} onValueChange={handleServiceSelect}>
                            <div className="space-y-4">
                                {serviceOptions.map((service) => (
                                    <div key={service.id} className="relative">
                                        <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                            selectedService === service.id 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            {service.is_recommended && (
                                                <div className="absolute -top-2 left-4">
                                                    <Badge className="bg-green-600 text-white">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Recommended
                                                    </Badge>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center space-x-4">
                                                <RadioGroupItem value={service.id} id={service.id} />
                                                
                                                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${getServiceColor(service.name)}`}>
                                                    {getServiceIcon(service.name)}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label htmlFor={service.id} className="text-lg font-semibold cursor-pointer">
                                                                {service.name}
                                                            </Label>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {service.description}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-gray-900">
                                                                ${service.total_cost.toFixed(2)}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                Delivery by {service.delivery_date}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4 mt-3">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            {service.estimated_days} business days
                                                        </div>
                                                        
                                                        {service.features.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {service.features.slice(0, 3).map((feature, index) => (
                                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                                        {feature}
                                                                    </Badge>
                                                                ))}
                                                                {service.features.length > 3 && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        +{service.features.length - 3} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    )}
                </CardContent>
            </Card>

            {/* Cost Breakdown */}
            {selectedService && !isCalculating && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2" />
                            Cost Breakdown
                        </CardTitle>
                        <CardDescription>
                            Detailed breakdown of your shipping costs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const service = serviceOptions.find(s => s.id === selectedService);
                            if (!service) return null;

                            const { packageDetails } = data;
                            const billingWeight = Math.max(
                                packageDetails.weight || 0,
                                calculateVolumetricWeight(packageDetails)
                            );

                            const baseCost = service.calculated_cost;
                            const fuelSurcharge = baseCost * 0.15;
                            const insuranceCost = packageDetails.insurance_required ? packageDetails.declared_value * 0.01 : 0;
                            const signatureCost = packageDetails.signature_required ? 5.50 : 0;
                            const specialHandlingCost = packageDetails.special_handling.length * 10;

                            return (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Base shipping cost ({billingWeight.toFixed(1)} lbs)</span>
                                        <span>${baseCost.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span>Fuel surcharge (15%)</span>
                                        <span>${fuelSurcharge.toFixed(2)}</span>
                                    </div>
                                    
                                    {insuranceCost > 0 && (
                                        <div className="flex justify-between">
                                            <span>Insurance coverage</span>
                                            <span>${insuranceCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    {signatureCost > 0 && (
                                        <div className="flex justify-between">
                                            <span>Signature required</span>
                                            <span>${signatureCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    {specialHandlingCost > 0 && (
                                        <div className="flex justify-between">
                                            <span>Special handling ({packageDetails.special_handling.length} items)</span>
                                            <span>${specialHandlingCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total Cost</span>
                                            <span>${service.total_cost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}

            {/* Service Features */}
            {selectedService && !isCalculating && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Service Features
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const service = serviceOptions.find(s => s.id === selectedService);
                            if (!service) return null;

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {service.features.map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={onPrev}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button 
                    onClick={handleNext} 
                    disabled={!selectedService || isCalculating}
                    className="min-w-32"
                >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
