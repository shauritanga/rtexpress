import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, LoaderCircle, Truck } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

import GoogleOAuthButton, { OAuthDivider } from '@/components/GoogleOAuthButton';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type CustomerRegisterForm = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    company_name: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    terms_accepted: boolean;
};

interface CustomerRegisterProps {
    countries?: Record<string, string>;
}

// Particle animation component
const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle system
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
            color: string;
        }> = [];

        const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899'];

        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, index) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off edges
                if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
                if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();

                // Draw connections
                particles.forEach((otherParticle, otherIndex) => {
                    if (index !== otherIndex) {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 100) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.strokeStyle = particle.color;
                            ctx.globalAlpha = ((100 - distance) / 100) * 0.2;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        />
    );
};

export default function CustomerRegisterSimple({ countries = {} }: CustomerRegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm<CustomerRegisterForm>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        company_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        terms_accepted: false,
    });

    const validateStep1 = () => {
        const step1Fields = ['first_name', 'last_name', 'email', 'phone', 'company_name', 'password', 'password_confirmation'];
        const allFieldsFilled = step1Fields.every((field) => {
            const value = data[field as keyof CustomerRegisterForm];
            return value && value.toString().trim() !== '';
        });

        // Enhanced password validation
        const passwordsMatch = data.password === data.password_confirmation;
        const passwordLongEnough = data.password.length >= 12;
        const hasUpperCase = /[A-Z]/.test(data.password);
        const hasLowerCase = /[a-z]/.test(data.password);
        const hasNumbers = /\d/.test(data.password);
        const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);

        const passwordValid = passwordLongEnough && hasUpperCase && hasLowerCase && hasNumbers && hasSymbols;

        return allFieldsFilled && passwordsMatch && passwordValid;
    };

    const nextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('customer.register.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <Head title="Create Account - RT Express" />

            <style>{`
                .phone-input .PhoneInputInput {
                    height: 2.5rem !important;
                    border: 1px solid #d1d5db !important;
                    border-radius: 0.375rem !important;
                    padding: 0.5rem 0.75rem !important;
                    font-size: 0.875rem !important;
                    line-height: 1.25rem !important;
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
                }

                .phone-input .PhoneInputInput:focus {
                    outline: none !important;
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                }

                .phone-input-error .PhoneInputInput {
                    border-color: #ef4444 !important;
                }

                .phone-input-error .PhoneInputInput:focus {
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
                }

                .phone-input .PhoneInputCountrySelect {
                    height: 2.5rem !important;
                    border: 1px solid #d1d5db !important;
                    border-right: none !important;
                    border-radius: 0.375rem 0 0 0.375rem !important;
                    background-color: #f9fafb !important;
                    padding: 0 0.5rem !important;
                }

                .phone-input .PhoneInputCountrySelect:focus {
                    outline: none !important;
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                }

                .phone-input .PhoneInputInput {
                    border-left: none !important;
                    border-radius: 0 0.375rem 0.375rem 0 !important;
                }
            `}</style>

            <div className="flex min-h-screen">
                {/* Left Side - Pure Particle Animation */}
                <div className="relative hidden overflow-hidden lg:flex lg:flex-1">
                    {/* Particle Background */}
                    <ParticleBackground />
                </div>

                {/* Right Side - Registration Form */}
                <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-lg space-y-8">
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

                            <h2 className="mb-2 text-3xl font-bold text-gray-900">Create your account</h2>
                            <p className="mb-4 text-gray-600">
                                {currentStep === 1 ? "Let's start with your basic information" : 'Complete your account setup'}
                            </p>

                            {/* Step Indicator */}
                            <div className="mb-6 flex items-center justify-center space-x-4">
                                <div className="flex items-center">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        1
                                    </div>
                                    <span className={`ml-2 text-sm ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Basic Info</span>
                                </div>
                                <div className={`h-0.5 w-8 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                <div className="flex items-center">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}
                                    >
                                        2
                                    </div>
                                    <span className={`ml-2 text-sm ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Complete Setup</span>
                                </div>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                            <CardContent className="p-8">
                                {/* Google OAuth Button */}
                                <div className="mb-6">
                                    <GoogleOAuthButton variant="register" />
                                    <OAuthDivider />
                                </div>

                                <form className="space-y-6" onSubmit={submit}>
                                    {currentStep === 1 && (
                                        <div className="space-y-5">
                                            {/* Step 1: Personal Information */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                                                        First Name
                                                    </Label>
                                                    <Input
                                                        id="first_name"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        value={data.first_name}
                                                        onChange={(e) => setData('first_name', e.target.value)}
                                                        className={`mt-1 h-10 ${errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                        placeholder="John"
                                                    />
                                                    <InputError message={errors.first_name} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                                                        Last Name
                                                    </Label>
                                                    <Input
                                                        id="last_name"
                                                        type="text"
                                                        required
                                                        value={data.last_name}
                                                        onChange={(e) => setData('last_name', e.target.value)}
                                                        className={`mt-1 h-10 ${errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                        placeholder="Doe"
                                                    />
                                                    <InputError message={errors.last_name} />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                    Email address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={`mt-1 h-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                    placeholder="john@company.com"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div>
                                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                                    Phone Number
                                                </Label>
                                                <PhoneInput
                                                    international
                                                    defaultCountry="US"
                                                    value={data.phone}
                                                    onChange={(value) => setData('phone', value || '')}
                                                    className={`phone-input mt-1 ${errors.phone ? 'phone-input-error' : ''}`}
                                                    inputComponent={Input}
                                                    style={
                                                        {
                                                            '--PhoneInputCountryFlag-height': '1em',
                                                            '--PhoneInput-color--focus': '#3b82f6',
                                                        } as React.CSSProperties
                                                    }
                                                />
                                                <InputError message={errors.phone} />
                                            </div>

                                            <div>
                                                <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                                                    Company Name
                                                </Label>
                                                <Input
                                                    id="company_name"
                                                    type="text"
                                                    required
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    className={`mt-1 h-10 ${errors.company_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                    placeholder="Your Company Inc."
                                                />
                                                <InputError message={errors.company_name} />
                                            </div>

                                            {/* Password Fields */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                        Password
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            required
                                                            value={data.password}
                                                            onChange={(e) => setData('password', e.target.value)}
                                                            className={`mt-1 h-10 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                            placeholder="Create password"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 mt-1 flex items-center pr-3"
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

                                                <div>
                                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                                        Confirm Password
                                                    </Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password_confirmation"
                                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                                            required
                                                            value={data.password_confirmation}
                                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                                            className={`mt-1 h-10 pr-12 ${errors.password_confirmation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                            placeholder="Confirm password"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 mt-1 flex items-center pr-3"
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
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 1 Navigation */}
                                    {currentStep === 1 && (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!validateStep1()}
                                            className="h-10 w-full bg-blue-600 font-medium text-white transition-all duration-200 hover:bg-blue-700"
                                        >
                                            Continue
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-5">
                                            {/* Step 2: Address Information */}
                                            <div>
                                                <Label htmlFor="address_line_1" className="text-sm font-medium text-gray-700">
                                                    Address
                                                </Label>
                                                <Input
                                                    id="address_line_1"
                                                    type="text"
                                                    required
                                                    value={data.address_line_1}
                                                    onChange={(e) => setData('address_line_1', e.target.value)}
                                                    className={`mt-1 h-10 ${errors.address_line_1 ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                    placeholder="123 Main Street"
                                                />
                                                <InputError message={errors.address_line_1} />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                                                        City
                                                    </Label>
                                                    <Input
                                                        id="city"
                                                        type="text"
                                                        required
                                                        value={data.city}
                                                        onChange={(e) => setData('city', e.target.value)}
                                                        className={`mt-1 h-10 ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                        placeholder="New York"
                                                    />
                                                    <InputError message={errors.city} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="state_province" className="text-sm font-medium text-gray-700">
                                                        State
                                                    </Label>
                                                    <Input
                                                        id="state_province"
                                                        type="text"
                                                        required
                                                        value={data.state_province}
                                                        onChange={(e) => setData('state_province', e.target.value)}
                                                        className={`mt-1 h-10 ${errors.state_province ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                        placeholder="NY"
                                                    />
                                                    <InputError message={errors.state_province} />
                                                </div>

                                                <div>
                                                    <Label htmlFor="postal_code" className="text-sm font-medium text-gray-700">
                                                        ZIP Code
                                                    </Label>
                                                    <Input
                                                        id="postal_code"
                                                        type="text"
                                                        required
                                                        value={data.postal_code}
                                                        onChange={(e) => setData('postal_code', e.target.value)}
                                                        className={`mt-1 h-10 ${errors.postal_code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                        placeholder="10001"
                                                    />
                                                    <InputError message={errors.postal_code} />
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                                                    Country
                                                </Label>
                                                <Select value={data.country} onValueChange={(value) => setData('country', value)}>
                                                    <SelectTrigger
                                                        className={`mt-1 h-10 ${errors.country ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                                                    >
                                                        <SelectValue placeholder="Select country" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(countries).map(([code, name]) => (
                                                            <SelectItem key={code} value={code}>
                                                                {name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.country} />
                                            </div>

                                            {/* Terms and Marketing */}
                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <Checkbox
                                                        id="terms_accepted"
                                                        checked={data.terms_accepted}
                                                        onCheckedChange={(checked) => setData('terms_accepted', !!checked)}
                                                        className="mt-1"
                                                    />
                                                    <Label htmlFor="terms_accepted" className="ml-3 text-sm text-gray-700">
                                                        I agree to the{' '}
                                                        <Link href="#" className="font-medium text-blue-600 hover:text-blue-800">
                                                            Terms of Service
                                                        </Link>{' '}
                                                        and{' '}
                                                        <Link href="#" className="font-medium text-blue-600 hover:text-blue-800">
                                                            Privacy Policy
                                                        </Link>
                                                    </Label>
                                                </div>
                                                <InputError message={errors.terms_accepted} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2 Navigation */}
                                    {currentStep === 2 && (
                                        <div className="flex space-x-4">
                                            <Button
                                                type="button"
                                                onClick={prevStep}
                                                variant="outline"
                                                className="h-10 flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                            >
                                                <ArrowLeft className="mr-2 h-5 w-5" />
                                                Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-rt-red hover:bg-rt-red-700 shadow-rt-red hover:shadow-rt-red-lg h-10 flex-1 font-medium text-white transition-all duration-200"
                                            >
                                                {processing ? (
                                                    <>
                                                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                                        Creating account...
                                                    </>
                                                ) : (
                                                    <>
                                                        Create account
                                                        <CheckCircle className="ml-2 h-5 w-5" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link href={route('login')} className="font-medium text-blue-600 hover:text-blue-800">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
