import { Head } from '@inertiajs/react';
import { Clock, CheckCircle, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TextLink from '@/components/text-link';
import ParticleBackground from '@/components/ParticleBackground';

interface PendingApprovalProps {
    user: {
        name: string;
        email: string;
    };
    customer: {
        company_name: string;
        customer_code: string;
        created_at: string;
    };
}

export default function PendingApproval({ user, customer }: PendingApprovalProps) {
    const registrationDate = new Date(customer.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Head title="Account Pending Approval - RT Express" />
            
            {/* Left side - Particle Background */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <ParticleBackground />
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold mb-6">
                            Welcome to RT Express
                        </h1>
                        <p className="text-xl mb-8 text-white/90">
                            Your account is being reviewed by our team. We'll notify you once it's approved.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-300" />
                                <span>Account created successfully</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-300" />
                                <span>Email verified</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-yellow-300" />
                                <span>Pending admin approval</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                            <Clock className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
                        <p className="text-gray-600">Your registration is under review</p>
                    </div>

                    {/* Main Card */}
                    <Card className="shadow-xl border-0 bg-white">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Status */}
                                <div className="text-center">
                                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Pending Review
                                    </div>
                                </div>

                                {/* Account Details */}
                                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                    <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Company Name</label>
                                            <p className="text-gray-900 font-medium">{customer.company_name}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Customer Code</label>
                                            <p className="text-gray-900 font-mono">{customer.customer_code}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Contact Person</label>
                                            <p className="text-gray-900">{user.name}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email Address</label>
                                            <p className="text-gray-900">{user.email}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Registration Date</label>
                                            <p className="text-gray-900">{registrationDate}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* What's Next */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h4 className="font-semibold text-blue-900 mb-3">What happens next?</h4>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li className="flex items-start">
                                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            Our team will review your account within 1-2 business days
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            You'll receive an email notification once approved
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            After approval, you can access the full customer portal
                                        </li>
                                    </ul>
                                </div>

                                {/* Contact Support */}
                                <div className="text-center pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Need help or have questions about your application?
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <a 
                                            href="mailto:support@rtexpress.com" 
                                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email Support
                                        </a>
                                        <a 
                                            href="tel:+1234567890" 
                                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <Phone className="h-4 w-4 mr-2" />
                                            Call Support
                                        </a>
                                    </div>
                                </div>

                                {/* Sign Out */}
                                <div className="pt-4">
                                    <TextLink 
                                        href={route('logout')} 
                                        method="post"
                                        className="w-full inline-flex items-center justify-center text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Sign out
                                    </TextLink>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
