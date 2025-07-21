import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import ReturnsManager from '@/components/customer/ReturnsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    RotateCcw,
    ArrowLeft,
    HelpCircle,
    FileText,
    Clock,
    CheckCircle
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
    contact_person: string;
}

interface ReturnShipment {
    id: number;
    return_tracking_number: string;
    original_tracking_number: string;
    return_reason: string;
    return_type: 'exchange' | 'refund' | 'repair';
    status: 'pending' | 'approved' | 'picked_up' | 'in_transit' | 'delivered' | 'processed' | 'cancelled';
    created_date: string;
    pickup_date?: string;
    estimated_delivery_date?: string;
    return_value: number;
    sender_name: string;
    recipient_name: string;
    recipient_address: string;
    special_instructions?: string;
}

interface Props {
    customer: Customer;
    returns: ReturnShipment[];
}

export default function CustomerReturns({ customer, returns }: Props) {
    return (
        <AppLayout>
            <Head title="Returns Management" />
            
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
                                    <RotateCcw className="h-8 w-8 mr-3 text-blue-600" />
                                    Returns Management
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">
                                    {customer.company_name} • Manage your return shipments and track their progress
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-2">
                            <Button variant="outline" size="sm">
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Returns Guide
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Returns Process Overview */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900">Returns Process</CardTitle>
                        <CardDescription className="text-blue-700">
                            Simple steps to process your returns efficiently
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Create Return Request</h3>
                                    <p className="text-sm text-blue-700">
                                        Submit a return request with the original tracking number and reason
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Get Return Label</h3>
                                    <p className="text-sm text-blue-700">
                                        Download and print the prepaid return shipping label
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Ship & Track</h3>
                                    <p className="text-sm text-blue-700">
                                        Package your item and track the return shipment progress
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Return Policies */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-green-900">Return Window</p>
                                    <p className="text-xs text-green-700">30 days from delivery date</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Free Returns</p>
                                    <p className="text-xs text-blue-700">Prepaid return labels included</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-purple-900">Quick Processing</p>
                                    <p className="text-xs text-purple-700">3-5 business days processing</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Returns Manager Component */}
                <ReturnsManager returns={returns} />

                {/* Help Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <HelpCircle className="h-5 w-5 mr-2" />
                            Need Help with Returns?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Common Return Reasons</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Defective or damaged items</li>
                                    <li>• Wrong item received</li>
                                    <li>• Item not as described</li>
                                    <li>• Size or fit issues</li>
                                    <li>• Customer change of mind</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Return Requirements</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Items must be in original condition</li>
                                    <li>• Include all original packaging</li>
                                    <li>• Return within 30 days of delivery</li>
                                    <li>• Use provided return label</li>
                                    <li>• Include return authorization number</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-900">Still have questions?</h4>
                                    <p className="text-sm text-gray-600">Our customer service team is here to help</p>
                                </div>
                                <div className="mt-3 sm:mt-0 flex space-x-2">
                                    <Button variant="outline" size="sm">
                                        Contact Support
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Returns FAQ
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
