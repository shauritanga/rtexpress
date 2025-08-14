import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import ParticleBackground from '@/components/ParticleBackground';
import AppLogoIcon from '@/components/app-logo-icon';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Head title="Reset Password - RT Express" />

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

                {/* Right Side - Reset Password Form */}
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

                            <h2 className="mb-2 text-3xl font-bold text-gray-900">Reset your password</h2>
                            <p className="text-gray-600">Please enter your new password below.</p>
                        </div>

                        {/* Reset Password Form */}
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
                                            className="h-12 text-base bg-gray-50"
                                            readOnly
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                            New password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                autoComplete="new-password"
                                                value={data.password}
                                                className="h-12 text-base pr-12"
                                                autoFocus
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Enter your new password"
                                                disabled={processing}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                            Confirm new password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                value={data.password_confirmation}
                                                className="h-12 text-base pr-12"
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="Confirm your new password"
                                                disabled={processing}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                            >
                                                {showPasswordConfirmation ? (
                                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-medium"
                                        disabled={processing}
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Reset password
                                    </Button>
                                </form>

                                <div className="mt-6 text-center text-sm text-gray-600">
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
