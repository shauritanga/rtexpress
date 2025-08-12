import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle, LoaderCircle, MapPin, User } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomerLayout from '@/layouts/customer-layout';
import { Customer, User as UserType } from '@/types';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type ProfileCompleteForm = {
    phone: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    company_name: string;
};

interface ProfileCompleteProps {
    user: UserType;
    customer: Customer;
    countries: Record<string, string>;
}

export default function ProfileComplete({ user, customer, countries }: ProfileCompleteProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ProfileCompleteForm>({
        phone: customer.phone || '',
        address_line_1: customer.address_line_1 || '',
        address_line_2: customer.address_line_2 || '',
        city: customer.city || '',
        state_province: customer.state_province || '',
        postal_code: customer.postal_code || '',
        country: customer.country || 'Tanzania',
        company_name: customer.company_name || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('customer.profile.complete.store'));
    };

    return (
        <CustomerLayout>
            <Head title="Complete Your Profile" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                            <User className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Welcome {user.name}! Please complete your profile to start using RT Express services.
                        </p>
                    </div>

                    {/* Success Message */}
                    <div className="mb-6 rounded-lg bg-green-50 p-4">
                        <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    Your Google account has been successfully linked! Just a few more details needed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Completion Form */}
                    <Card className="shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center text-xl">
                                <MapPin className="mr-2 h-5 w-5" />
                                Contact & Address Information
                            </CardTitle>
                            <CardDescription>
                                This information is required to process your shipments and deliveries.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Company Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                                    <div>
                                        <Label htmlFor="company_name">Company Name (Optional)</Label>
                                        <Input
                                            id="company_name"
                                            type="text"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            className="mt-1"
                                            placeholder="Your company name"
                                        />
                                        <InputError message={errors.company_name} />
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                                    <div>
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <PhoneInput
                                            international
                                            defaultCountry="TZ"
                                            value={data.phone}
                                            onChange={(value) => setData('phone', value || '')}
                                            className="mt-1"
                                            placeholder="Enter phone number"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                                    
                                    <div>
                                        <Label htmlFor="address_line_1">Address Line 1 *</Label>
                                        <Input
                                            id="address_line_1"
                                            type="text"
                                            required
                                            value={data.address_line_1}
                                            onChange={(e) => setData('address_line_1', e.target.value)}
                                            className="mt-1"
                                            placeholder="Street address, P.O. Box, etc."
                                        />
                                        <InputError message={errors.address_line_1} />
                                    </div>

                                    <div>
                                        <Label htmlFor="address_line_2">Address Line 2</Label>
                                        <Input
                                            id="address_line_2"
                                            type="text"
                                            value={data.address_line_2}
                                            onChange={(e) => setData('address_line_2', e.target.value)}
                                            className="mt-1"
                                            placeholder="Apartment, suite, unit, building, floor, etc."
                                        />
                                        <InputError message={errors.address_line_2} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                type="text"
                                                required
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                className="mt-1"
                                                placeholder="City"
                                            />
                                            <InputError message={errors.city} />
                                        </div>

                                        <div>
                                            <Label htmlFor="state_province">State/Province *</Label>
                                            <Input
                                                id="state_province"
                                                type="text"
                                                required
                                                value={data.state_province}
                                                onChange={(e) => setData('state_province', e.target.value)}
                                                className="mt-1"
                                                placeholder="State or Province"
                                            />
                                            <InputError message={errors.state_province} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="postal_code">Postal Code *</Label>
                                            <Input
                                                id="postal_code"
                                                type="text"
                                                required
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                                className="mt-1"
                                                placeholder="Postal code"
                                            />
                                            <InputError message={errors.postal_code} />
                                        </div>

                                        <div>
                                            <Label htmlFor="country">Country *</Label>
                                            <Select value={data.country} onValueChange={(value) => setData('country', value)}>
                                                <SelectTrigger className="mt-1">
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
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-6">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-rt-red hover:bg-rt-red-700 min-w-[200px] text-white"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                Completing Profile...
                                            </>
                                        ) : (
                                            <>
                                                Complete Profile
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Help Text */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Need help? Contact our support team at{' '}
                            <a href="mailto:support@rtexpress.co.tz" className="text-blue-600 hover:text-blue-800">
                                support@rtexpress.co.tz
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
