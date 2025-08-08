import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ArrowLeft, CheckCircle, DollarSign, FileText, Loader2, MapPin, Package, Shield, Truck, User } from 'lucide-react';

interface Props {
    data: any;
    onSubmit: () => void;
    onPrev: () => void;
    isSubmitting: boolean;
}

export default function ReviewConfirmStep({ data, onSubmit, onPrev, isSubmitting }: Props) {
    const { sender, recipient, packageDetails, serviceType, totalCost } = data;

    const formatAddress = (address: any) => {
        return [address.address_line_1, address.address_line_2, `${address.city}, ${address.state_province} ${address.postal_code}`, address.country]
            .filter(Boolean)
            .join('\n');
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
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Review & Confirm Shipment
                    </CardTitle>
                    <CardDescription>Please review all details before creating your shipment</CardDescription>
                </CardHeader>
            </Card>

            {/* Sender & Recipient Summary */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <User className="mr-2 h-4 w-4" />
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
                                <p className="text-sm whitespace-pre-line text-gray-600">{formatAddress(sender)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <MapPin className="mr-2 h-4 w-4" />
                            Recipient
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recipient.company_name && <p className="font-medium">{recipient.company_name}</p>}
                            <p className="font-medium">{recipient.contact_person}</p>
                            <p className="text-sm text-gray-600">{recipient.email}</p>
                            <p className="text-sm text-gray-600">{recipient.phone}</p>
                            <div className="pt-2">
                                <p className="text-sm whitespace-pre-line text-gray-600">{formatAddress(recipient)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Package Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Package className="mr-2 h-4 w-4" />
                        Package Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Weight</p>
                            <p className="text-lg">
                                {packageDetails.weight} {packageDetails.weight_unit}
                            </p>
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
                            <p className="mb-2 text-sm font-medium text-gray-700">Contents Description</p>
                            <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">{packageDetails.contents_description}</p>
                        </div>

                        {packageDetails.special_handling.length > 0 && (
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-700">Special Handling</p>
                                <div className="flex flex-wrap gap-2">
                                    {packageDetails.special_handling.map((id: string) => (
                                        <Badge key={id} variant="outline" className="border-orange-300 text-orange-700">
                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                            {getSpecialHandlingLabel(id)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4">
                            {packageDetails.insurance_required && (
                                <div className="flex items-center text-sm text-green-700">
                                    <Shield className="mr-1 h-4 w-4" />
                                    Insurance Coverage Included
                                </div>
                            )}
                            {packageDetails.signature_required && (
                                <div className="flex items-center text-sm text-blue-700">
                                    <FileText className="mr-1 h-4 w-4" />
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
                        <Truck className="mr-2 h-4 w-4" />
                        Selected Service
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900">{serviceType.name}</h3>
                            <p className="mt-1 text-sm text-blue-700">{serviceType.description}</p>
                            <p className="mt-2 text-sm text-blue-600">Estimated delivery: {serviceType.estimated_days} business days</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-900">${totalCost.toFixed(2)}</p>
                            <p className="text-sm text-blue-600">Total Cost</p>
                        </div>
                    </div>

                    {serviceType.features && serviceType.features.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 text-sm font-medium text-gray-700">Included Features</p>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {serviceType.features.map((feature: string, index: number) => (
                                    <div key={index} className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
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
                        <DollarSign className="mr-2 h-4 w-4" />
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
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total Cost</span>
                            <span>${totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="bg-gray-50">
                <CardContent className="pt-6">
                    <div className="space-y-2 text-sm text-gray-600">
                        <p className="font-medium">Terms and Conditions:</p>
                        <ul className="list-inside list-disc space-y-1 text-xs">
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
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button onClick={onSubmit} disabled={isSubmitting} className="min-w-40 bg-green-600 hover:bg-green-700">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Shipment...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Create Shipment
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
