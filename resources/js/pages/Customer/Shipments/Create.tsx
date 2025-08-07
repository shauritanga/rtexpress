import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ComprehensiveShipmentForm from '@/components/customer/shipment/ComprehensiveShipmentForm';
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

interface Warehouse {
    id: number;
    name: string;
    address: string;
    city: string;
    country: string;
}

interface Props {
    customer: Customer;
    serviceTypes: ServiceType[];
    savedAddresses: any[];
    warehouses: Warehouse[];
}

export default function CreateShipment({ customer, serviceTypes, savedAddresses, warehouses }: Props) {
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
                                    {customer?.company_name || 'Customer'} • Follow the steps below to create your shipment
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



                {/* Comprehensive Shipment Form */}
                <ComprehensiveShipmentForm
                    customer={customer}
                    warehouses={warehouses}
                />
            </div>
        </AppLayout>
    );
}
