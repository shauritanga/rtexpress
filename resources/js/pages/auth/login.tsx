import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Eye, EyeOff, LoaderCircle, Truck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import GoogleOAuthButton, { OAuthDivider } from '@/components/GoogleOAuthButton';
import InputError from '@/components/input-error';
import ParticleBackground from '@/components/ParticleBackground';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Head title="Sign In - RT Express" />

            <div className="flex min-h-screen">
                {/* Left Side - Pure Particle Animation */}
                <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
                    <ParticleBackground />
                </div>

                {/* Right Side - Login Form */}
                <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <div className="mb-8 lg:hidden">
                                <div className="mb-4 flex items-center justify-center space-x-3">
                                    <div className="rounded-xl bg-blue-600 p-3">
                                        <Truck className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-2xl font-bold text-gray-900">RT Express</h1>
                                        <p className="text-sm text-gray-600">Global Shipping Solutions</p>
                                    </div>
                                </div>
                            </div>

                            <h2 className="mb-2 text-3xl font-bold text-gray-900">Sign in to your account</h2>
                            <p className="text-gray-600">Welcome back! Please enter your details.</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-800">
                                <CheckCircle className="mr-2 inline h-4 w-4" />
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    {/* Google OAuth Button */}
                                    <GoogleOAuthButton variant="login" />

                                    <OAuthDivider />
                                </div>

                                <form className="space-y-6" onSubmit={submit}>
                                    <div className="space-y-5">
                                        <div>
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                autoFocus
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={`mt-1 h-12 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                placeholder="Enter your email"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                    Password
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={route('password.request')}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className={`h-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                    placeholder="Enter your password"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                    ) : (
                                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Checkbox id="remember" checked={data.remember} onClick={() => setData('remember', !data.remember)} />
                                                <Label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                                    Remember me
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-rt-red hover:bg-rt-red-700 shadow-rt-red hover:shadow-rt-red-lg h-12 w-full font-medium text-white transition-all duration-200"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign in
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Register Link */}
                        <div className="text-center">
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <Link href="/register/customer" className="font-medium text-blue-600 hover:text-blue-800">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
