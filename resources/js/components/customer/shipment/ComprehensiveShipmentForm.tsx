import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/useToast';
import { 
    Package,
    MapPin,
    User,
    Phone,
    Mail,
    Building,
    Truck,
    Banknote,
    Calendar,
    FileText,
    Shield,
    Settings
} from 'lucide-react';
import { countries } from '@/lib/countries';

interface Warehouse {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
}

interface Customer {
    id: number;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
}

interface Props {
    customer: Customer;
    warehouses: Warehouse[];
    className?: string;
}

export default function ComprehensiveShipmentForm({
    customer,
    warehouses,
    className = ''
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        // Customer and tracking (auto-filled)
        customer_id: customer?.id || '',
        tracking_number: '', // Will be auto-generated
        
        // Warehouse selection (USER MUST SELECT)
        origin_warehouse_id: '',
        destination_warehouse_id: '',
        
        // Sender information (pre-filled from customer, editable)
        sender_name: customer?.contact_person || '',
        sender_phone: customer?.phone || '',
        sender_address: customer ? `${customer.address_line_1}${customer.address_line_2 ? ', ' + customer.address_line_2 : ''}, ${customer.city}, ${customer.state_province} ${customer.postal_code}, ${customer.country}` : '',
        
        // Recipient information (USER MUST FILL)
        recipient_name: '',
        recipient_phone: '',
        recipient_address: '',
        recipient_country: 'TZ', // Default to Tanzania
        
        // Service and package details (USER MUST SELECT)
        service_type: '',
        package_type: '',
        
        // Package specifications (USER MUST FILL)
        weight_kg: '',
        dimensions_length_cm: '',
        dimensions_width_cm: '',
        dimensions_height_cm: '',
        declared_value: '',
        insurance_value: '',
        
        // Additional options (OPTIONAL)
        special_instructions: '',
        estimated_delivery_date: '',
        
        // System fields (auto-filled)
        status: 'pending',
        created_by: '', // Will be set by backend
        
        // Advanced options (OPTIONAL)
        delivery_options: {
            signature_required: false,
            weekend_delivery: false,
            evening_delivery: false,
            leave_at_door: false,
        },
        customs_data: {
            contents_description: '',
            country_of_origin: customer?.country || 'TZ',
            harmonized_code: '',
            export_reason: '',
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.shipments.store'), {
            onSuccess: (page) => {
                toast({
                    title: "Shipment Created Successfully!",
                    description: "Your shipment has been created and is being processed. You will receive updates via email and SMS.",
                    variant: "success",
                });

                // Redirect to shipment details after a short delay to show the toast
                setTimeout(() => {
                    if (page.props.shipment?.id) {
                        router.visit(`/customer/shipments/${page.props.shipment.id}`);
                    } else {
                        router.visit('/customer/shipments');
                    }
                }, 2000);
            },
            onError: (errors) => {
                toast({
                    title: "Failed to Create Shipment",
                    description: "Please check the form for errors and try again.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleDeliveryOptionChange = (option: string, checked: boolean) => {
        setData('delivery_options', {
            ...data.delivery_options,
            [option]: checked
        });
    };

    const handleCustomsDataChange = (field: string, value: string) => {
        setData('customs_data', {
            ...data.customs_data,
            [field]: value
        });
    };

    // Check if this is an international shipment
    const isInternationalShipment = data.recipient_country !== 'TZ';

    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Warehouse Selection */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-lg">
                            <Building className="h-5 w-5 mr-2 text-blue-600" />
                            Warehouse Selection
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Choose pickup and delivery locations for your shipment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="origin_warehouse_id" className="text-sm font-medium">
                                    Pickup Warehouse *
                                </Label>
                                <Select
                                    value={data.origin_warehouse_id}
                                    onValueChange={(value) => setData('origin_warehouse_id', value)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select pickup location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                <div className="flex flex-col py-1">
                                                    <span className="font-medium">{warehouse.name}</span>
                                                    <span className="text-xs text-gray-500">{warehouse.city}, {warehouse.country}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.origin_warehouse_id && (
                                    <p className="text-xs text-red-600 mt-1">{errors.origin_warehouse_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="destination_warehouse_id" className="text-sm font-medium">
                                    Destination Warehouse
                                </Label>
                                <Select
                                    value={data.destination_warehouse_id}
                                    onValueChange={(value) => setData('destination_warehouse_id', value)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select destination (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No specific warehouse</SelectItem>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                <div className="flex flex-col py-1">
                                                    <span className="font-medium">{warehouse.name}</span>
                                                    <span className="text-xs text-gray-500">{warehouse.city}, {warehouse.country}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.destination_warehouse_id && (
                                    <p className="text-xs text-red-600 mt-1">{errors.destination_warehouse_id}</p>
                                )}
                            </div>
                        </div>
                </CardContent>
            </Card>

                {/* Contact Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sender Information */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg">
                                <User className="h-5 w-5 mr-2 text-blue-600" />
                                Sender Information
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Your details (pre-filled, editable)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="sender_name" className="text-sm font-medium">
                                    Full Name *
                                </Label>
                                <Input
                                    id="sender_name"
                                    value={data.sender_name}
                                    onChange={(e) => setData('sender_name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className="h-11"
                                />
                                {errors.sender_name && (
                                    <p className="text-xs text-red-600 mt-1">{errors.sender_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sender_phone" className="text-sm font-medium">
                                    Phone Number *
                                </Label>
                                <Input
                                    id="sender_phone"
                                    value={data.sender_phone}
                                    onChange={(e) => setData('sender_phone', e.target.value)}
                                    placeholder="+255 XXX XXX XXX"
                                    className="h-11"
                                />
                                {errors.sender_phone && (
                                    <p className="text-xs text-red-600 mt-1">{errors.sender_phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sender_address" className="text-sm font-medium">
                                    Complete Address *
                                </Label>
                                <Textarea
                                    id="sender_address"
                                    value={data.sender_address}
                                    onChange={(e) => setData('sender_address', e.target.value)}
                                    placeholder="Street address, city, region, postal code"
                                    rows={3}
                                    className="resize-none"
                                />
                                {errors.sender_address && (
                                    <p className="text-xs text-red-600 mt-1">{errors.sender_address}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recipient Information */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg">
                                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                                Recipient Information
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Delivery destination details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="recipient_name" className="text-sm font-medium">
                                    Full Name *
                                </Label>
                                <Input
                                    id="recipient_name"
                                    value={data.recipient_name}
                                    onChange={(e) => setData('recipient_name', e.target.value)}
                                    placeholder="Enter recipient's full name"
                                    className="h-11"
                                />
                                {errors.recipient_name && (
                                    <p className="text-xs text-red-600 mt-1">{errors.recipient_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="recipient_phone" className="text-sm font-medium">
                                    Phone Number *
                                </Label>
                                <Input
                                    id="recipient_phone"
                                    value={data.recipient_phone}
                                    onChange={(e) => setData('recipient_phone', e.target.value)}
                                    placeholder="+255 XXX XXX XXX"
                                    className="h-11"
                                />
                                {errors.recipient_phone && (
                                    <p className="text-xs text-red-600 mt-1">{errors.recipient_phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="recipient_address" className="text-sm font-medium">
                                    Complete Address *
                                </Label>
                                <Textarea
                                    id="recipient_address"
                                    value={data.recipient_address}
                                    onChange={(e) => setData('recipient_address', e.target.value)}
                                    placeholder="Street address, city, region, postal code"
                                    rows={3}
                                    className="resize-none"
                                />
                                {errors.recipient_address && (
                                    <p className="text-xs text-red-600 mt-1">{errors.recipient_address}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="recipient_country" className="text-sm font-medium">
                                    Country *
                                </Label>
                                <Select
                                    value={data.recipient_country}
                                    onValueChange={(value) => setData('recipient_country', value)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select destination country" />
                                    </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {countries.map((country) => (
                                    <SelectItem key={country.code} value={country.name}>
                                        {country.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                                </Select>
                                {errors.recipient_country && (
                                    <p className="text-xs text-red-600 mt-1">{errors.recipient_country}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Service and Package Details */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-lg">
                            <Truck className="h-5 w-5 mr-2 text-blue-600" />
                            Service & Package Details
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Choose delivery service and package specifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="service_type" className="text-sm font-medium">
                                    Delivery Service *
                                </Label>
                                <Select
                                    value={data.service_type}
                                    onValueChange={(value) => setData('service_type', value)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Choose delivery speed" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="economy">
                                            <div className="flex flex-col py-1">
                                                <span className="font-medium">Economy</span>
                                                <span className="text-xs text-gray-500">5-7 business days</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="standard">
                                            <div className="flex flex-col py-1">
                                                <span className="font-medium">Standard</span>
                                                <span className="text-xs text-gray-500">3-5 business days</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="express">
                                            <div className="flex flex-col py-1">
                                                <span className="font-medium">Express</span>
                                                <span className="text-xs text-gray-500">1-2 business days</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="overnight">
                                            <div className="flex flex-col py-1">
                                                <span className="font-medium">Overnight</span>
                                                <span className="text-xs text-gray-500">Next business day</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="same_day">
                                            <div className="flex flex-col py-1">
                                                <span className="font-medium">Same Day</span>
                                                <span className="text-xs text-gray-500">Within 24 hours</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.service_type && (
                                    <p className="text-xs text-red-600 mt-1">{errors.service_type}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="package_type" className="text-sm font-medium">
                                    Package Type *
                                </Label>
                                <Select
                                    value={data.package_type}
                                    onValueChange={(value) => setData('package_type', value)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select package category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="document">📄 Document</SelectItem>
                                        <SelectItem value="package">📦 Package</SelectItem>
                                        <SelectItem value="pallet">🏗️ Pallet</SelectItem>
                                        <SelectItem value="container">🚛 Container</SelectItem>
                                        <SelectItem value="fragile">⚠️ Fragile Item</SelectItem>
                                        <SelectItem value="hazardous">☢️ Hazardous Material</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.package_type && (
                                    <p className="text-xs text-red-600 mt-1">{errors.package_type}</p>
                                )}
                            </div>
                        </div>

                        {/* Package Specifications */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Package Dimensions *</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="dimensions_length_cm" className="text-xs text-gray-600">
                                            Length (cm)
                                        </Label>
                                        <Input
                                            id="dimensions_length_cm"
                                            type="number"
                                            min="0"
                                            value={data.dimensions_length_cm}
                                            onChange={(e) => setData('dimensions_length_cm', e.target.value)}
                                            placeholder="0"
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="dimensions_width_cm" className="text-xs text-gray-600">
                                            Width (cm)
                                        </Label>
                                        <Input
                                            id="dimensions_width_cm"
                                            type="number"
                                            min="0"
                                            value={data.dimensions_width_cm}
                                            onChange={(e) => setData('dimensions_width_cm', e.target.value)}
                                            placeholder="0"
                                            className="h-10"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="dimensions_height_cm" className="text-xs text-gray-600">
                                            Height (cm)
                                        </Label>
                                        <Input
                                            id="dimensions_height_cm"
                                            type="number"
                                            min="0"
                                            value={data.dimensions_height_cm}
                                            onChange={(e) => setData('dimensions_height_cm', e.target.value)}
                                            placeholder="0"
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                                {(errors.dimensions_length_cm || errors.dimensions_width_cm || errors.dimensions_height_cm) && (
                                    <p className="text-xs text-red-600 mt-1">Please enter valid dimensions</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weight_kg" className="text-sm font-medium">
                                        Weight (kg) *
                                    </Label>
                                    <Input
                                        id="weight_kg"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={data.weight_kg}
                                        onChange={(e) => setData('weight_kg', e.target.value)}
                                        placeholder="0.0"
                                        className="h-11"
                                    />
                                    {errors.weight_kg && (
                                        <p className="text-xs text-red-600 mt-1">{errors.weight_kg}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="declared_value" className="text-sm font-medium">
                                        Value (TZS) *
                                    </Label>
                                    <Input
                                        id="declared_value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.declared_value}
                                        onChange={(e) => setData('declared_value', e.target.value)}
                                        placeholder="0.00"
                                        className="h-11"
                                    />
                                    {errors.declared_value && (
                                        <p className="text-xs text-red-600 mt-1">{errors.declared_value}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Options */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-lg">
                            <Settings className="h-5 w-5 mr-2 text-blue-600" />
                            Additional Options
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Optional settings for your shipment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="insurance_value" className="text-sm font-medium">
                                    Insurance Value (TZS)
                                </Label>
                                <Input
                                    id="insurance_value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.insurance_value}
                                    onChange={(e) => setData('insurance_value', e.target.value)}
                                    placeholder="0.00"
                                    className="h-11"
                                />
                                <p className="text-xs text-gray-500">Optional insurance coverage for your package</p>
                                {errors.insurance_value && (
                                    <p className="text-xs text-red-600 mt-1">{errors.insurance_value}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estimated_delivery_date" className="text-sm font-medium">
                                    Preferred Delivery Date
                                </Label>
                                <Input
                                    id="estimated_delivery_date"
                                    type="date"
                                    value={data.estimated_delivery_date}
                                    onChange={(e) => setData('estimated_delivery_date', e.target.value)}
                                    className="h-11"
                                />
                                <p className="text-xs text-gray-500">Your preferred delivery date (if available)</p>
                                {errors.estimated_delivery_date && (
                                    <p className="text-xs text-red-600 mt-1">{errors.estimated_delivery_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Special Instructions */}
                        <div className="space-y-2">
                            <Label htmlFor="special_instructions" className="text-sm font-medium">
                                Special Instructions
                            </Label>
                            <Textarea
                                id="special_instructions"
                                value={data.special_instructions}
                                onChange={(e) => setData('special_instructions', e.target.value)}
                                placeholder="Enter any special delivery instructions, handling requirements, or notes..."
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-gray-500">
                                Include any special handling requirements, delivery preferences, or important notes
                            </p>
                            {errors.special_instructions && (
                                <p className="text-xs text-red-600 mt-1">{errors.special_instructions}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Options */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-lg">
                            <Settings className="h-5 w-5 mr-2 text-blue-600" />
                            Delivery Preferences
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Choose your delivery preferences and requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    id="signature_required"
                                    checked={data.delivery_options.signature_required}
                                    onCheckedChange={(checked) =>
                                        handleDeliveryOptionChange('signature_required', checked as boolean)
                                    }
                                    className="mt-0.5"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="signature_required" className="text-sm font-medium cursor-pointer">
                                        Signature Required
                                    </Label>
                                    <p className="text-xs text-gray-500">Recipient must sign for delivery</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    id="weekend_delivery"
                                    checked={data.delivery_options.weekend_delivery}
                                    onCheckedChange={(checked) =>
                                        handleDeliveryOptionChange('weekend_delivery', checked as boolean)
                                    }
                                    className="mt-0.5"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="weekend_delivery" className="text-sm font-medium cursor-pointer">
                                        Weekend Delivery
                                    </Label>
                                    <p className="text-xs text-gray-500">Allow delivery on weekends</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    id="evening_delivery"
                                    checked={data.delivery_options.evening_delivery}
                                    onCheckedChange={(checked) =>
                                        handleDeliveryOptionChange('evening_delivery', checked as boolean)
                                    }
                                    className="mt-0.5"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="evening_delivery" className="text-sm font-medium cursor-pointer">
                                        Evening Delivery
                                    </Label>
                                    <p className="text-xs text-gray-500">Allow delivery after 6 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Checkbox
                                    id="leave_at_door"
                                    checked={data.delivery_options.leave_at_door}
                                    onCheckedChange={(checked) =>
                                        handleDeliveryOptionChange('leave_at_door', checked as boolean)
                                    }
                                    className="mt-0.5"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="leave_at_door" className="text-sm font-medium cursor-pointer">
                                        Leave at Door
                                    </Label>
                                    <p className="text-xs text-gray-500">Leave package if no one answers</p>
                                </div>
                            </div>
                        </div>
                </CardContent>
            </Card>

            {/* Customs Data */}
            <Card className={isInternationalShipment ? "border-orange-200 bg-orange-50" : ""}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Customs Information
                        {isInternationalShipment && (
                            <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                Required for International
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {isInternationalShipment
                            ? "⚠️ International shipment detected - Customs information is required"
                            : "Required for international shipments (currently domestic)"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label htmlFor="contents_description">Contents Description</Label>
                        <Textarea
                            id="contents_description"
                            value={data.customs_data.contents_description}
                            onChange={(e) => handleCustomsDataChange('contents_description', e.target.value)}
                            placeholder="Detailed description of package contents"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="country_of_origin">Country of Origin</Label>
                        <Select
                            value={data.customs_data.country_of_origin}
                            onValueChange={(value) => handleCustomsDataChange('country_of_origin', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select country of origin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TZ">Tanzania</SelectItem>
                                <SelectItem value="KE">Kenya</SelectItem>
                                <SelectItem value="UG">Uganda</SelectItem>
                                <SelectItem value="RW">Rwanda</SelectItem>
                                <SelectItem value="BI">Burundi</SelectItem>
                                <SelectItem value="ET">Ethiopia</SelectItem>
                                <SelectItem value="ZA">South Africa</SelectItem>
                                <SelectItem value="NG">Nigeria</SelectItem>
                                <SelectItem value="GH">Ghana</SelectItem>
                                <SelectItem value="EG">Egypt</SelectItem>
                                <SelectItem value="MA">Morocco</SelectItem>
                                <SelectItem value="CN">China</SelectItem>
                                <SelectItem value="IN">India</SelectItem>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="GB">United Kingdom</SelectItem>
                                <SelectItem value="DE">Germany</SelectItem>
                                <SelectItem value="FR">France</SelectItem>
                                <SelectItem value="IT">Italy</SelectItem>
                                <SelectItem value="ES">Spain</SelectItem>
                                <SelectItem value="NL">Netherlands</SelectItem>
                                <SelectItem value="BE">Belgium</SelectItem>
                                <SelectItem value="AE">UAE</SelectItem>
                                <SelectItem value="SA">Saudi Arabia</SelectItem>
                                <SelectItem value="JP">Japan</SelectItem>
                                <SelectItem value="KR">South Korea</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="BR">Brazil</SelectItem>
                                <SelectItem value="MX">Mexico</SelectItem>
                                <SelectItem value="TR">Turkey</SelectItem>
                                <SelectItem value="RU">Russia</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="harmonized_code">Harmonized Code</Label>
                        <Input
                            id="harmonized_code"
                            value={data.customs_data.harmonized_code}
                            onChange={(e) => handleCustomsDataChange('harmonized_code', e.target.value)}
                            placeholder="HS code for customs classification"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="export_reason">Export Reason</Label>
                        <Select
                            value={data.customs_data.export_reason}
                            onValueChange={(value) => handleCustomsDataChange('export_reason', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select export reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sale">Sale</SelectItem>
                                <SelectItem value="gift">Gift</SelectItem>
                                <SelectItem value="sample">Sample</SelectItem>
                                <SelectItem value="return">Return</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="personal_use">Personal Use</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

                {/* Submit Section */}
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                            <p>By creating this shipment, you agree to our terms and conditions.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto h-11 px-6"
                                disabled={processing}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto h-11 px-8 bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating Shipment...
                                    </>
                                ) : (
                                    <>
                                        <Package className="h-4 w-4 mr-2" />
                                        Create Shipment
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
