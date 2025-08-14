import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, Mail, RefreshCw } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

import ParticleBackground from '@/components/ParticleBackground';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VerifyOtpProps {
    user: {
        name: string;
        email: string;
    };
    canResend: boolean;
    cooldownSeconds: number;
    status?: string;
}

export default function VerifyOtp({ user, canResend, cooldownSeconds, status }: VerifyOtpProps) {
    const [countdown, setCountdown] = useState(cooldownSeconds);
    const [canResendOtp, setCanResendOtp] = useState(canResend);
    const otpInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        otp_code: '',
    });

    const { post: resendPost, processing: resendProcessing } = useForm();

    useEffect(() => {
        // Focus on OTP input when component mounts
        if (otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResendOtp(true);
        }
    }, [countdown]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('otp.verify'), {
            onFinish: () => reset('otp_code'),
        });
    };

    const resendOtp = () => {
        resendPost(route('otp.resend'), {
            onSuccess: () => {
                setCountdown(60);
                setCanResendOtp(false);
            },
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Head title="Verify OTP - RT Express" />

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
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">Enter Verification Code</h2>
                        <p className="text-gray-600">Two-factor authentication</p>
                    </div>

                    {/* Status Messages */}
                    {status === 'otp-sent' && (
                        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
                            <Mail className="h-4 w-4" />
                            <AlertDescription>A new verification code has been sent to your email.</AlertDescription>
                        </Alert>
                    )}

                    {/* Main OTP Card */}
                    <Card className="border-0 bg-white shadow-xl">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Email Info */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">We've sent a 6-digit code to your email</p>
                                    <p className="mt-1 font-medium text-gray-900">{user.email}</p>
                                </div>

                                {/* OTP Form */}
                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="otp_code" className="text-sm font-medium text-gray-700">
                                            Verification Code
                                        </Label>
                                        <Input
                                            ref={otpInputRef}
                                            id="otp_code"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            placeholder="Enter 6-digit code"
                                            value={data.otp_code}
                                            onChange={(e) => setData('otp_code', e.target.value.replace(/\D/g, ''))}
                                            className={`mt-1 h-12 text-center font-mono text-xl tracking-widest ${
                                                errors.otp_code
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                            required
                                            autoFocus
                                        />
                                        <InputError message={errors.otp_code} />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing || data.otp_code.length !== 6}
                                        className="bg-rt-red hover:bg-rt-red-700 shadow-rt-red hover:shadow-rt-red-lg h-12 w-full font-medium text-white transition-all duration-200"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify Code'
                                        )}
                                    </Button>
                                </form>

                                {/* Resend Code */}
                                <div className="space-y-3 border-t border-gray-200 pt-4 text-center">
                                    <p className="text-sm text-gray-600">Didn't receive the code?</p>

                                    {canResendOtp ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resendOtp}
                                            disabled={resendProcessing}
                                            className="h-12 w-full"
                                        >
                                            {resendProcessing ? (
                                                <>
                                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Resend Code
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-gray-500">Resend available in {countdown} seconds</p>
                                    )}
                                </div>

                                {/* Help Text */}
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-start space-x-3">
                                        <Mail className="mt-0.5 h-5 w-5 text-blue-600" />
                                        <div className="text-sm text-blue-800">
                                            <p className="mb-1 font-medium">Having trouble?</p>
                                            <p>Check your email inbox and spam folder. The code expires in 5 minutes.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Back to Login */}
                                <div className="pt-4 text-center">
                                    <TextLink href={route('login')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Login
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
