import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Shield, ArrowRight, RefreshCw, Smartphone } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VerifyOtpProps {
    user: {
        name: string;
        phone: string;
    };
    canResend: boolean;
    cooldownSeconds: number;
}

export default function VerifyOtp({ user, canResend, cooldownSeconds }: VerifyOtpProps) {
    const [countdown, setCountdown] = useState(cooldownSeconds);
    const [canResendOtp, setCanResendOtp] = useState(canResend);
    
    const { data, setData, post, processing, errors } = useForm({
        otp_code: '',
    });

    const { post: resendPost, processing: resendProcessing } = useForm();

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
        post(route('otp.verify'));
    };

    const resendOtp = () => {
        resendPost(route('otp.resend'), {
            onSuccess: () => {
                setCountdown(60);
                setCanResendOtp(false);
            }
        });
    };

    const formatPhone = (phone: string) => {
        if (phone.length >= 4) {
            return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
        }
        return phone;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
            <Head title="Verify OTP - RT Express" />
            
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Verify Your Identity
                    </h1>
                    <p className="text-gray-600">
                        We've sent a verification code to
                    </p>
                    <p className="text-blue-600 font-medium">
                        {formatPhone(user.phone)}
                    </p>
                </div>

                {/* OTP Form */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            Enter Verification Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="otp_code" className="text-sm font-medium text-gray-700">
                                    6-Digit Code
                                </Label>
                                <Input
                                    id="otp_code"
                                    type="text"
                                    maxLength={6}
                                    required
                                    autoFocus
                                    value={data.otp_code}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setData('otp_code', value);
                                    }}
                                    className={`mt-1 h-12 text-center text-lg font-mono tracking-widest ${
                                        errors.otp_code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="000000"
                                />
                                <InputError message={errors.otp_code} />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={processing || data.otp_code.length !== 6} 
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify Code
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Resend OTP */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 mb-3">
                                Didn't receive the code?
                            </p>
                            
                            {canResendOtp ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resendOtp}
                                    disabled={resendProcessing}
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
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
                                <p className="text-sm text-gray-500">
                                    Resend available in {countdown} seconds
                                </p>
                            )}
                        </div>

                        {/* Help Text */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Having trouble?</p>
                                    <p>Make sure your phone can receive SMS messages. The code expires in 5 minutes.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Notice */}
                <div className="text-center mt-6">
                    <div className="inline-flex items-center space-x-2 text-gray-500 text-xs">
                        <Shield className="h-3 w-3" />
                        <span>Secured with bank-level encryption</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
