import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ShipmentCreationWizard from '@/components/customer/ShipmentCreationWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Package,
    ArrowLeft,
    HelpCircle
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
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

interface ServiceType {
    id: string;
    name: string;
    description: string;
    base_rate: number;
    estimated_days: string;
    features: string[];
}

interface Props {
    customer: Customer;
    serviceTypes: ServiceType[];
    savedAddresses: any[];
}

export default function CreateShipment({ customer, serviceTypes, savedAddresses }: Props) {
    return (
        <AppLayout>
            <Head title="Create Shipment" />
            
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
                                    Create New Shipment
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                    {customer.company_name} • Follow the steps below to create your shipment
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-2">
                            <Button variant="outline" size="sm">
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Help Guide
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Tips */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900 text-lg">Quick Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                            <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p>Have your recipient's complete address ready including postal code</p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p>Measure and weigh your package accurately for precise pricing</p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <p>Choose the right service type based on your delivery timeline</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipment Creation Wizard */}
                <ShipmentCreationWizard 
                    customer={customer}
                    serviceTypes={serviceTypes}
                    savedAddresses={savedAddresses}
                />
            </div>
        </AppLayout>
    );
}
