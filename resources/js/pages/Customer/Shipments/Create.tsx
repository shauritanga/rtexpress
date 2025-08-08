import ComprehensiveShipmentForm from '@/components/customer/shipment/ComprehensiveShipmentForm';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, HelpCircle, Package } from 'lucide-react';

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
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="flex items-center text-2xl font-bold text-gray-900 sm:text-3xl">
                                    <Package className="mr-3 h-8 w-8 text-blue-600" />
                                    Create New Shipment
                                </h1>
                                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                                    {customer?.company_name || 'Customer'} • Follow the steps below to create your shipment
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-2 sm:mt-0">
                            <Button variant="outline" size="sm">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Help Guide
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Comprehensive Shipment Form */}
                <ComprehensiveShipmentForm customer={customer} warehouses={warehouses} />
            </div>
        </AppLayout>
    );
}
