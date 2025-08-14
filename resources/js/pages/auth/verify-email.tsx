// Components
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, LoaderCircle, RefreshCw } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import ParticleBackground from '@/components/ParticleBackground';
import AppLogoIcon from '@/components/app-logo-icon';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
        <div className="flex min-h-screen bg-gray-50">
            <Head title="Email Verification Required" />

            {/* Left side - Logo with Particle Background */}
            <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center">
                <ParticleBackground />
                {/* Centered Logo */}
                <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
                        <AppLogoIcon className="h-24 w-24 rounded-xl" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white drop-shadow-lg">RT EXPRESS</h1>
                        <p className="text-lg text-white/90 italic font-medium drop-shadow-md">On Time, The First Time</p>
                    </div>
                </div>
            </div>

            {/* Right side - Content */}
            <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-12">
                <div className="mx-auto w-full max-w-md">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border bg-white shadow-lg">
                            <AppLogoIcon className="h-10 w-10 rounded-lg" />
                        </div>
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">Check Your Email</h2>
                        <p className="text-gray-600">Verify your email address to continue</p>
                    </div>

                    {/* Success Toast */}
                    {showSuccess && success && (
                        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="font-medium">{success}</AlertDescription>
                        </Alert>
                    )}

                    {/* Main Verification Card */}
                    <Card className="border-0 bg-white shadow-xl">
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
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="mb-2 flex items-center space-x-2 text-green-600">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-medium">Verification email sent!</span>
                                        </div>
                                        <p className="mb-2 text-sm text-gray-600">We've sent a verification link to:</p>
                                        <p className="rounded border bg-white px-3 py-2 font-semibold text-gray-900">{user_email}</p>
                                    </div>
                                )}

                                {/* Instructions */}
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <h4 className="mb-3 font-semibold text-blue-900">Next Steps:</h4>
                                    <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800">
                                        <li>Check your email inbox (and spam folder)</li>
                                        <li>Click the verification link in the email</li>
                                        <li>Return here to complete your registration</li>
                                    </ol>
                                </div>

                                {/* Verification Status */}
                                {status === 'verification-link-sent' && (
                                    <Alert className="border-green-200 bg-green-50 text-green-800">
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>A new verification link has been sent to your email address.</AlertDescription>
                                    </Alert>
                                )}

                                {/* Resend Form */}
                                <form onSubmit={submit} className="space-y-4">
                                    <p className="text-center text-sm text-gray-600">
                                        Didn't receive the email? Check your spam folder or request a new one.
                                    </p>
                                    <Button disabled={processing} variant="outline" className="h-12 w-full">
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Resend Verification Email
                                            </>
                                        )}
                                    </Button>
                                </form>

                                {/* Help Text */}
                                <div className="space-y-3 border-t border-gray-200 pt-4 text-center">
                                    <p className="text-xs text-gray-500">Having trouble? Contact our support team for assistance.</p>
                                    <TextLink
                                        href={route('logout')}
                                        method="post"
                                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
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
