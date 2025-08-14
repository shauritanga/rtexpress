// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import ParticleBackground from '@/components/ParticleBackground';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Head title="Forgot Password - RT Express" />

            <div className="flex min-h-screen">
                {/* Left Side - Logo with Particle Background */}
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

                {/* Right Side - Forgot Password Form */}
                <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <div className="mb-8 lg:hidden">
                                <div className="mb-4 flex items-center justify-center space-x-3">
                                    <div className="rounded-xl bg-white p-2 shadow-lg">
                                        <AppLogoIcon className="h-12 w-12 rounded-lg" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-2xl font-bold text-rt-red">RT EXPRESS</h1>
                                        <p className="text-sm text-rt-red italic font-medium">On Time, The First Time</p>
                                    </div>
                                </div>
                            </div>

                            <h2 className="mb-2 text-3xl font-bold text-gray-900">Forgot your password?</h2>
                            <p className="text-gray-600">No worries! Enter your email and we'll send you a reset link.</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-800">
                                <CheckCircle className="mr-2 inline h-4 w-4" />
                                {status}
                            </div>
                        )}

                        {/* Forgot Password Form */}
                        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                            <CardContent className="p-8">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            value={data.email}
                                            autoFocus
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter your email address"
                                            className="h-12 text-base"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-medium"
                                        disabled={processing}
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Send password reset link
                                    </Button>
                                </form>

                                <div className="mt-6 text-center text-sm text-gray-600">
                                    <span>Remember your password? </span>
                                    <TextLink href={route('login')} className="font-medium text-blue-600 hover:text-blue-500">
                                        Back to sign in
                                    </TextLink>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
