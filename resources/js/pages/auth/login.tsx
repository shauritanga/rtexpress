import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, CheckCircle, ArrowRight, Truck, Shield } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

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

            <div className="min-h-screen flex">
                {/* Left Side - Branding & Features */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-20 w-3 h-3 bg-cyan-400 rounded-full animate-float opacity-60"></div>
                        <div className="absolute top-40 right-32 w-2 h-2 bg-blue-300 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
                        <div className="absolute bottom-32 left-32 w-4 h-4 bg-indigo-300 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
                        <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300 rounded-full animate-float opacity-70" style={{animationDelay: '3s'}}></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
                        {/* Logo */}
                        <div className="mb-12">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                    <Truck className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">RT Express</h1>
                                    <p className="text-blue-200 text-sm">Global Shipping Solutions</p>
                                </div>
                            </div>
                        </div>

                        {/* Welcome Message */}
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                                    Welcome to RT Express
                                </h2>
                                <p className="text-xl text-blue-200 mt-4">
                                    Cargo Management System
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <div className="lg:hidden mb-8">
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <div className="bg-blue-600 p-3 rounded-xl">
                                        <Truck className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h1 className="text-2xl font-bold text-gray-900">RT Express</h1>
                                        <p className="text-gray-600 text-sm">Global Shipping Solutions</p>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Sign in to your account
                            </h2>
                            <p className="text-gray-600">
                                Welcome back! Please enter your details.
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm text-center">
                                <CheckCircle className="h-4 w-4 inline mr-2" />
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-8">
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
                                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                                                <Checkbox
                                                    id="remember"
                                                    checked={data.remember}
                                                    onClick={() => setData('remember', !data.remember)}
                                                />
                                                <Label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                                    Remember me
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
                                <Link href="/register/customer" className="text-blue-600 hover:text-blue-800 font-medium">
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
