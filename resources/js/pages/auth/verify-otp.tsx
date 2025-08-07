import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Shield, ArrowLeft, RefreshCw, Mail } from 'lucide-react';
import { FormEventHandler, useState, useEffect, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TextLink from '@/components/text-link';
import ParticleBackground from '@/components/ParticleBackground';

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
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Head title="Verify OTP - RT Express" />

            {/* Left side - Particle Background */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <ParticleBackground />
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold mb-6">
                            Secure Access
                        </h1>
                        <p className="text-xl mb-8 text-white/90">
                            Enter the verification code sent to your email to complete the login process.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Shield className="h-5 w-5 text-green-300" />
                                <span>Two-factor authentication enabled</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-blue-300" />
                                <span>Code sent to your email</span>
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
                        <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
                        <p className="text-gray-600">Two-factor authentication</p>
                    </div>

                    {/* Status Messages */}
                    {status === 'otp-sent' && (
                        <Alert className="border-green-200 bg-green-50 text-green-800 mb-6">
                            <Mail className="h-4 w-4" />
                            <AlertDescription>
                                A new verification code has been sent to your email.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Main OTP Card */}
                    <Card className="shadow-xl border-0 bg-white">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {/* Email Info */}
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">
                                        We've sent a 6-digit code to your email
                                    </p>
                                    <p className="font-medium text-gray-900 mt-1">
                                        {user.email}
                                    </p>
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
                                            className={`mt-1 text-center text-xl font-mono tracking-widest h-12 ${
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
                                        className="w-full h-12 bg-rt-red hover:bg-rt-red-700 text-white font-medium shadow-rt-red hover:shadow-rt-red-lg transition-all duration-200"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify Code'
                                        )}
                                    </Button>
                                </form>

                                {/* Resend Code */}
                                <div className="text-center pt-4 border-t border-gray-200 space-y-3">
                                    <p className="text-sm text-gray-600">
                                        Didn't receive the code?
                                    </p>

                                    {canResendOtp ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resendOtp}
                                            disabled={resendProcessing}
                                            className="w-full h-12"
                                        >
                                            {resendProcessing ? (
                                                <>
                                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Resend Code
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Resend available in {countdown} seconds
                                        </p>
                                    )}
                                </div>

                                {/* Help Text */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Having trouble?</p>
                                            <p>Check your email inbox and spam folder. The code expires in 5 minutes.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Back to Login */}
                                <div className="text-center pt-4">
                                    <TextLink
                                        href={route('login')}
                                        className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
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
