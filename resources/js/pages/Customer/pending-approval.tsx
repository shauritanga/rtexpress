import ParticleBackground from '@/components/ParticleBackground';
import TextLink from '@/components/text-link';
import { Card, CardContent } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Mail, Phone } from 'lucide-react';

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
        day: 'numeric',
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Head title="Account Pending Approval - RT Express" />

            {/* Left side - Particle Background */}
            <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
                <ParticleBackground />
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="max-w-md">
                        <h1 className="mb-6 text-4xl font-bold">Welcome to RT Express</h1>
                        <p className="mb-8 text-xl text-white/90">Your account is being reviewed by our team. We'll notify you once it's approved.</p>
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
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-12">
                <div className="mx-auto w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg">
                            <Clock className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">Account Pending Approval</h2>
                        <p className="text-gray-600">Your registration is under review</p>
                    </div>

                    {/* Main Card */}
                    <Card className="border-0 bg-white shadow-xl">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Status */}
                                <div className="text-center">
                                    <div className="inline-flex items-center rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800">
                                        <Clock className="mr-2 h-4 w-4" />
                                        Pending Review
                                    </div>
                                </div>

                                {/* Account Details */}
                                <div className="space-y-4 rounded-lg bg-gray-50 p-6">
                                    <h3 className="mb-4 font-semibold text-gray-900">Account Information</h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Company Name</label>
                                            <p className="font-medium text-gray-900">{customer.company_name}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Customer Code</label>
                                            <p className="font-mono text-gray-900">{customer.customer_code}</p>
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
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                                    <h4 className="mb-3 font-semibold text-blue-900">What happens next?</h4>
                                    <ul className="space-y-2 text-sm text-blue-800">
                                        <li className="flex items-start">
                                            <span className="mt-2 mr-3 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
                                            Our team will review your account within 1-2 business days
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mt-2 mr-3 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
                                            You'll receive an email notification once approved
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mt-2 mr-3 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></span>
                                            After approval, you can access the full customer portal
                                        </li>
                                    </ul>
                                </div>

                                {/* Contact Support */}
                                <div className="border-t border-gray-200 pt-4 text-center">
                                    <p className="mb-4 text-sm text-gray-600">Need help or have questions about your application?</p>
                                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                                        <a
                                            href="mailto:support@rtexpress.com"
                                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            <Mail className="mr-2 h-4 w-4" />
                                            Email Support
                                        </a>
                                        <a
                                            href="tel:+1234567890"
                                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                        >
                                            <Phone className="mr-2 h-4 w-4" />
                                            Call Support
                                        </a>
                                    </div>
                                </div>

                                {/* Sign Out */}
                                <div className="pt-4">
                                    <TextLink
                                        href={route('logout')}
                                        method="post"
                                        className="inline-flex w-full items-center justify-center text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
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
