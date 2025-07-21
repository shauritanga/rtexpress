import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ShippingLabelGenerator from '@/components/customer/ShippingLabelGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Package,
    ArrowLeft,
    MapPin,
    Calendar,
    Truck,
    FileText,
    Clock,
    DollarSign,
    Eye
} from 'lucide-react';

interface Shipment {
    id: number;
    tracking_number: string;
    sender_name: string;
    sender_company: string;
    sender_address: string;
    sender_city: string;
    sender_state: string;
    sender_postal_code: string;
    sender_country: string;
    recipient_name: string;
    recipient_company?: string;
    recipient_address: string;
    recipient_city: string;
    recipient_state: string;
    recipient_postal_code: string;
    recipient_country: string;
    service_type: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    declared_value: number;
    contents_description: string;
    total_cost: number;
    status: string;
    estimated_delivery_date: string;
    created_at: string;
    updated_at: string;
}

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
}

interface Props {
    shipment: Shipment;
    customer: Customer;
}

export default function ShowShipment({ shipment, customer }: Props) {
    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            picked_up: 'bg-blue-100 text-blue-800 border-blue-300',
            in_transit: 'bg-purple-100 text-purple-800 border-purple-300',
            out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            exception: 'bg-red-100 text-red-800 border-red-300',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getServiceTypeColor = (serviceType: string) => {
        const colors = {
            express: 'bg-red-100 text-red-800',
            standard: 'bg-blue-100 text-blue-800',
            overnight: 'bg-purple-100 text-purple-800',
            international: 'bg-green-100 text-green-800',
        };
        return colors[serviceType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout>
            <Head title={`Shipment ${shipment.tracking_number}`} />
            
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                                    <Package className="h-8 w-8 mr-3 text-blue-600" />
                                    {shipment.tracking_number}
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                    {customer.company_name} • Created {formatDate(shipment.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                            <Badge className={`${getStatusColor(shipment.status)} border`}>
                                {shipment.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={getServiceTypeColor(shipment.service_type)}>
                                {shipment.service_type.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Service</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">{shipment.service_type}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Weight</p>
                                    <p className="text-lg font-bold text-gray-900">{shipment.weight} lbs</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Est. Delivery</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date(shipment.estimated_delivery_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Cost</p>
                                    <p className="text-lg font-bold text-gray-900">${shipment.total_cost.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="details" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details" className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                        </TabsTrigger>
                        <TabsTrigger value="label" className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Shipping Label
                        </TabsTrigger>
                        <TabsTrigger value="tracking" className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Tracking
                        </TabsTrigger>
                    </TabsList>

                    {/* Shipment Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Sender Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Sender Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-medium">{shipment.sender_company}</p>
                                        <p className="text-sm text-gray-600">{shipment.sender_name}</p>
                                        <div className="pt-2 text-sm text-gray-600">
                                            <p>{shipment.sender_address}</p>
                                            <p>{shipment.sender_city}, {shipment.sender_state} {shipment.sender_postal_code}</p>
                                            <p>{shipment.sender_country}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recipient Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Recipient Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {shipment.recipient_company && (
                                            <p className="font-medium">{shipment.recipient_company}</p>
                                        )}
                                        <p className="font-medium">{shipment.recipient_name}</p>
                                        <div className="pt-2 text-sm text-gray-600">
                                            <p>{shipment.recipient_address}</p>
                                            <p>{shipment.recipient_city}, {shipment.recipient_state} {shipment.recipient_postal_code}</p>
                                            <p>{shipment.recipient_country}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Package Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-4 w-4 mr-2" />
                                    Package Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Weight</p>
                                        <p className="text-lg">{shipment.weight} lbs</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Dimensions</p>
                                        <p className="text-lg">{shipment.length}" × {shipment.width}" × {shipment.height}"</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Declared Value</p>
                                        <p className="text-lg">${shipment.declared_value}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Total Cost</p>
                                        <p className="text-lg">${shipment.total_cost.toFixed(2)}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Contents Description</p>
                                    <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md">
                                        {shipment.contents_description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Shipping Label Tab */}
                    <TabsContent value="label">
                        <ShippingLabelGenerator shipment={shipment} />
                    </TabsContent>

                    {/* Tracking Tab */}
                    <TabsContent value="tracking">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Tracking Information
                                </CardTitle>
                                <CardDescription>
                                    Real-time tracking updates for your shipment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Tracking information will be available once the package is picked up</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Check back later for real-time updates
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
