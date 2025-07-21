import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    CheckCircle,
    User,
    MapPin,
    Package,
    Truck,
    DollarSign,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Shield,
    FileText
} from 'lucide-react';

interface Props {
    data: any;
    onSubmit: () => void;
    onPrev: () => void;
    isSubmitting: boolean;
}

export default function ReviewConfirmStep({ data, onSubmit, onPrev, isSubmitting }: Props) {
    const { sender, recipient, packageDetails, serviceType, totalCost } = data;

    const formatAddress = (address: any) => {
        return [
            address.address_line_1,
            address.address_line_2,
            `${address.city}, ${address.state_province} ${address.postal_code}`,
            address.country
        ].filter(Boolean).join('\n');
    };

    const getSpecialHandlingLabel = (id: string) => {
        const labels = {
            fragile: 'Fragile',
            hazardous: 'Hazardous Materials',
            perishable: 'Perishable',
            liquid: 'Liquid',
            electronics: 'Electronics',
            documents: 'Documents',
        };
        return labels[id as keyof typeof labels] || id;
    };

    return (
        <div className="space-y-6">
            {/* Review Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Review & Confirm Shipment
                    </CardTitle>
                    <CardDescription>
                        Please review all details before creating your shipment
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Sender & Recipient Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <User className="h-4 w-4 mr-2" />
                            Sender
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="font-medium">{sender.company_name}</p>
                            <p className="text-sm text-gray-600">{sender.contact_person}</p>
                            <p className="text-sm text-gray-600">{sender.email}</p>
                            <p className="text-sm text-gray-600">{sender.phone}</p>
                            <div className="pt-2">
                                <p className="text-sm whitespace-pre-line text-gray-600">
                                    {formatAddress(sender)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <MapPin className="h-4 w-4 mr-2" />
                            Recipient
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recipient.company_name && (
                                <p className="font-medium">{recipient.company_name}</p>
                            )}
                            <p className="font-medium">{recipient.contact_person}</p>
                            <p className="text-sm text-gray-600">{recipient.email}</p>
                            <p className="text-sm text-gray-600">{recipient.phone}</p>
                            <div className="pt-2">
                                <p className="text-sm whitespace-pre-line text-gray-600">
                                    {formatAddress(recipient)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Package Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Package className="h-4 w-4 mr-2" />
                        Package Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Weight</p>
                            <p className="text-lg">{packageDetails.weight} {packageDetails.weight_unit}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Dimensions</p>
                            <p className="text-lg">
                                {packageDetails.length} × {packageDetails.width} × {packageDetails.height} {packageDetails.dimension_unit}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Declared Value</p>
                            <p className="text-lg">${packageDetails.declared_value}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Package Type</p>
                            <p className="text-lg capitalize">{packageDetails.package_type}</p>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Contents Description</p>
                            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                                {packageDetails.contents_description}
                            </p>
                        </div>

                        {packageDetails.special_handling.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Special Handling</p>
                                <div className="flex flex-wrap gap-2">
                                    {packageDetails.special_handling.map((id: string) => (
                                        <Badge key={id} variant="outline" className="text-orange-700 border-orange-300">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {getSpecialHandlingLabel(id)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4">
                            {packageDetails.insurance_required && (
                                <div className="flex items-center text-sm text-green-700">
                                    <Shield className="h-4 w-4 mr-1" />
                                    Insurance Coverage Included
                                </div>
                            )}
                            {packageDetails.signature_required && (
                                <div className="flex items-center text-sm text-blue-700">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Signature Required
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Service Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Truck className="h-4 w-4 mr-2" />
                        Selected Service
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900">{serviceType.name}</h3>
                            <p className="text-sm text-blue-700 mt-1">{serviceType.description}</p>
                            <p className="text-sm text-blue-600 mt-2">
                                Estimated delivery: {serviceType.estimated_days} business days
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-900">${totalCost.toFixed(2)}</p>
                            <p className="text-sm text-blue-600">Total Cost</p>
                        </div>
                    </div>

                    {serviceType.features && serviceType.features.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Included Features</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {serviceType.features.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Cost Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Shipping Service</span>
                            <span>${serviceType.calculated_cost?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Fuel Surcharge</span>
                            <span>${((serviceType.calculated_cost || 0) * 0.15).toFixed(2)}</span>
                        </div>
                        {packageDetails.insurance_required && (
                            <div className="flex justify-between">
                                <span>Insurance Coverage</span>
                                <span>${(packageDetails.declared_value * 0.01).toFixed(2)}</span>
                            </div>
                        )}
                        {packageDetails.signature_required && (
                            <div className="flex justify-between">
                                <span>Signature Required</span>
                                <span>$5.50</span>
                            </div>
                        )}
                        {packageDetails.special_handling.length > 0 && (
                            <div className="flex justify-between">
                                <span>Special Handling</span>
                                <span>${(packageDetails.special_handling.length * 10).toFixed(2)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Total Cost</span>
                            <span>${totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="bg-gray-50">
                <CardContent className="pt-6">
                    <div className="text-sm text-gray-600 space-y-2">
                        <p className="font-medium">Terms and Conditions:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>By creating this shipment, you agree to RT Express Terms of Service</li>
                            <li>Declared value must accurately reflect the contents value</li>
                            <li>Prohibited items are not allowed and may result in shipment delays</li>
                            <li>Delivery times are estimates and not guaranteed unless specified</li>
                            <li>Additional charges may apply for address corrections or delivery attempts</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={onPrev} disabled={isSubmitting}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button 
                    onClick={onSubmit} 
                    disabled={isSubmitting}
                    className="min-w-40 bg-green-600 hover:bg-green-700"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating Shipment...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Create Shipment
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
