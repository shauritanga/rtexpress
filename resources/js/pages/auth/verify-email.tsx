// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ParticleBackground from '@/components/ParticleBackground';
import AppLogoIcon from '@/components/app-logo-icon';

interface VerifyEmailProps {
    status?: string;
    success?: string;
    email_sent?: boolean;
    user_email?: string;
    company_name?: string;
}



export default function VerifyEmail({ status, success, email_sent, user_email, company_name }: VerifyEmailProps) {
    const { post, processing } = useForm({});
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (success) {
            setShowSuccess(true);
            // Auto-hide success message after 5 seconds
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Head title="Email Verification Required" />

            {/* Left side - Particle Background */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <ParticleBackground />
            </div>

            {/* Right side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg border">
                            <AppLogoIcon className="h-10 w-10 rounded-lg" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                        <p className="text-gray-600">Verify your email address to continue</p>
                    </div>

                    {/* Success Toast */}
                    {showSuccess && success && (
                        <Alert className="border-green-200 bg-green-50 text-green-800 mb-6">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="font-medium">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Main Verification Card */}
                    <Card className="shadow-xl border-0 bg-white">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Welcome Message */}
                                {company_name && (
                                    <div className="text-center">
                                        <p className="text-lg font-medium text-gray-900">
                                            Welcome to RT Express, <span className="text-blue-600">{company_name}</span>!
                                        </p>
                                    </div>
                                )}
                                {/* Email Sent Confirmation */}
                                {email_sent && user_email && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 text-green-600 mb-2">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-medium">Verification email sent!</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            We've sent a verification link to:
                                        </p>
                                        <p className="font-semibold text-gray-900 bg-white px-3 py-2 rounded border">
                                            {user_email}
                                        </p>
                                    </div>
                                )}

                                {/* Instructions */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-3">Next Steps:</h4>
                                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                                        <li>Check your email inbox (and spam folder)</li>
                                        <li>Click the verification link in the email</li>
                                        <li>Return here to complete your registration</li>
                                    </ol>
                                </div>

                                {/* Verification Status */}
                                {status === 'verification-link-sent' && (
                                    <Alert className="border-green-200 bg-green-50 text-green-800">
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            A new verification link has been sent to your email address.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Resend Form */}
                                <form onSubmit={submit} className="space-y-4">
                                    <p className="text-sm text-gray-600 text-center">
                                        Didn't receive the email? Check your spam folder or request a new one.
                                    </p>
                                    <Button
                                        disabled={processing}
                                        variant="outline"
                                        className="w-full h-12"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Resend Verification Email
                                            </>
                                        )}
                                    </Button>
                                </form>

                                {/* Help Text */}
                                <div className="text-center pt-4 border-t border-gray-200 space-y-3">
                                    <p className="text-xs text-gray-500">
                                        Having trouble? Contact our support team for assistance.
                                    </p>
                                    <TextLink
                                        href={route('logout')}
                                        method="post"
                                        className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Sign out and try again
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
