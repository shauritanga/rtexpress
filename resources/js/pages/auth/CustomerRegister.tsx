import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    User,
    Building,
    MapPin,
    Settings,
    CheckCircle,
    ArrowLeft,
    Eye,
    EyeOff
} from 'lucide-react';

interface Props {
    countries: Record<string, string>;
    industries: Record<string, string>;
}

export default function CustomerRegister({ countries, industries }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        // Personal Information
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        
        // Company Information
        company_name: '',
        industry: '',
        company_size: '',
        website: '',
        
        // Address Information
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        
        // Preferences
        monthly_volume: '',
        primary_service: '',
        hear_about_us: '',
        
        // Terms
        terms_accepted: false,
        marketing_emails: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register/customer');
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const steps = [
        { number: 1, title: 'Personal Info', icon: User },
        { number: 2, title: 'Company Details', icon: Building },
        { number: 3, title: 'Address', icon: MapPin },
        { number: 4, title: 'Preferences', icon: Settings },
    ];

    return (
        <MarketingLayout>
            <Head title="Create Your Account - RT Express" />
            
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            Create Your RT Express Account
                        </h1>
                        <p className="text-xl text-gray-600">
                            Join thousands of businesses shipping with confidence
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-4 sm:space-x-8">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.number;
                                const isCompleted = currentStep > step.number;
                                
                                return (
                                    <div key={step.number} className="flex items-center">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                            isCompleted 
                                                ? 'bg-green-500 border-green-500 text-white' 
                                                : isActive 
                                                    ? 'bg-blue-500 border-blue-500 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-500'
                                        }`}>
                                            {isCompleted ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <Icon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="ml-2 hidden sm:block">
                                            <div className={`text-sm font-medium ${
                                                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                                {step.title}
                                            </div>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-8 sm:w-16 h-0.5 mx-4 ${
                                                isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                            }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form */}
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Step {currentStep} of 4</CardTitle>
                            <CardDescription>
                                {currentStep === 1 && "Let's start with your personal information"}
                                {currentStep === 2 && "Tell us about your company"}
                                {currentStep === 3 && "Where should we send your packages?"}
                                {currentStep === 4 && "Almost done! Just a few preferences"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Step 1: Personal Information */}
                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="first_name">First Name *</Label>
                                                <Input
                                                    id="first_name"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    className={errors.first_name ? 'border-red-500' : ''}
                                                />
                                                {errors.first_name && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="last_name">Last Name *</Label>
                                                <Input
                                                    id="last_name"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    className={errors.last_name ? 'border-red-500' : ''}
                                                />
                                                {errors.last_name && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="password">Password *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className={errors.password ? 'border-red-500' : ''}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {errors.password && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3"
                                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    >
                                                        {showPasswordConfirmation ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {errors.password_confirmation && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.password_confirmation}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Company Information */}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="company_name">Company Name *</Label>
                                            <Input
                                                id="company_name"
                                                value={data.company_name}
                                                onChange={(e) => setData('company_name', e.target.value)}
                                                className={errors.company_name ? 'border-red-500' : ''}
                                            />
                                            {errors.company_name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.company_name}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="industry">Industry *</Label>
                                                <Select value={data.industry} onValueChange={(value) => setData('industry', value)}>
                                                    <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select industry" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(industries).map(([key, value]) => (
                                                            <SelectItem key={key} value={key}>{value}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.industry && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.industry}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="company_size">Company Size *</Label>
                                                <Select value={data.company_size} onValueChange={(value) => setData('company_size', value)}>
                                                    <SelectTrigger className={errors.company_size ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select size" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1-10">1-10 employees</SelectItem>
                                                        <SelectItem value="11-50">11-50 employees</SelectItem>
                                                        <SelectItem value="51-200">51-200 employees</SelectItem>
                                                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                                                        <SelectItem value="1000+">1000+ employees</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.company_size && (
                                                    <p className="text-sm text-red-600 mt-1">{errors.company_size}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="website">Company Website</Label>
                                            <Input
                                                id="website"
                                                type="url"
                                                placeholder="https://www.example.com"
                                                value={data.website}
                                                onChange={(e) => setData('website', e.target.value)}
                                                className={errors.website ? 'border-red-500' : ''}
                                            />
                                            {errors.website && (
                                                <p className="text-sm text-red-600 mt-1">{errors.website}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-6">
                                    {currentStep > 1 ? (
                                        <Button type="button" variant="outline" onClick={prevStep}>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {currentStep < 4 ? (
                                        <Button type="button" onClick={nextStep}>
                                            Next
                                        </Button>
                                    ) : (
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating Account...' : 'Create Account'}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Login Link */}
                    <div className="text-center mt-8">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
