import PickupScheduler from '@/components/customer/PickupScheduler';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Clock, MapPin, Phone, Truck } from 'lucide-react';

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

interface Props {
    customer: Customer;
    shipmentIds?: number[];
}

export default function SchedulePickup({ customer, shipmentIds = [] }: Props) {
    const handlePickupScheduled = (pickupId: string) => {
        // Redirect to pickup details or dashboard
        window.location.href = '/customer/dashboard';
    };

    return (
        <AppLayout>
            <Head title="Schedule Pickup" />

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
                                    <Truck className="mr-3 h-8 w-8 text-blue-600" />
                                    Schedule Package Pickup
                                </h1>
                                <p className="mt-1 text-sm text-gray-600 sm:text-base">
                                    {customer.company_name} • Arrange convenient pickup for your packages
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Information */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Pickup Windows</p>
                                    <p className="text-xs text-blue-700">8 AM - 5 PM, Monday - Friday</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-green-900">Service Area</p>
                                    <p className="text-xs text-green-700">Nationwide pickup available</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-purple-900">Support</p>
                                    <p className="text-xs text-purple-700">24/7 customer assistance</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pickup Scheduler */}
                <PickupScheduler customer={customer} shipmentIds={shipmentIds} onScheduled={handlePickupScheduled} />
            </div>
        </AppLayout>
    );
}
