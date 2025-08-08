import { Head, useForm } from '@inertiajs/react';
import { Building, LoaderCircle, Lock, MapPin } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    terms: boolean;
};

export default function RegisterCustomer() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        terms: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create Customer Account" description="Join RT Express to manage your shipments and track deliveries">
            <Head title="Customer Registration" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    {/* Company Information */}
                    <div className="space-y-4">
                        <h3 className="flex items-center text-lg font-medium text-gray-900">
                            <Building className="mr-2 h-5 w-5" />
                            Company Information
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="company_name">Company Name *</Label>
                                <Input
                                    id="company_name"
                                    type="text"
                                    required
                                    autoFocus
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    disabled={processing}
                                    placeholder="Enter company name"
                                />
                                <InputError message={errors.company_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contact_person">Contact Person *</Label>
                                <Input
                                    id="contact_person"
                                    type="text"
                                    required
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                    disabled={processing}
                                    placeholder="Primary contact person"
                                />
                                <InputError message={errors.contact_person} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="username"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="company@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    disabled={processing}
                                    placeholder="Phone number"
                                />
                                <InputError message={errors.phone} />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                        <h3 className="flex items-center text-lg font-medium text-gray-900">
                            <MapPin className="mr-2 h-5 w-5" />
                            Company Address
                        </h3>

                        <div className="grid gap-2">
                            <Label htmlFor="address_line_1">Address Line 1 *</Label>
                            <Input
                                id="address_line_1"
                                type="text"
                                required
                                value={data.address_line_1}
                                onChange={(e) => setData('address_line_1', e.target.value)}
                                disabled={processing}
                                placeholder="Street address"
                            />
                            <InputError message={errors.address_line_1} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address_line_2">Address Line 2</Label>
                            <Input
                                id="address_line_2"
                                type="text"
                                value={data.address_line_2}
                                onChange={(e) => setData('address_line_2', e.target.value)}
                                disabled={processing}
                                placeholder="Apartment, suite, etc. (optional)"
                            />
                            <InputError message={errors.address_line_2} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    required
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    disabled={processing}
                                    placeholder="City"
                                />
                                <InputError message={errors.city} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="state_province">State/Province *</Label>
                                <Input
                                    id="state_province"
                                    type="text"
                                    required
                                    value={data.state_province}
                                    onChange={(e) => setData('state_province', e.target.value)}
                                    disabled={processing}
                                    placeholder="State or Province"
                                />
                                <InputError message={errors.state_province} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="postal_code">Postal Code *</Label>
                                <Input
                                    id="postal_code"
                                    type="text"
                                    required
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    disabled={processing}
                                    placeholder="Postal/ZIP code"
                                />
                                <InputError message={errors.postal_code} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="country">Country *</Label>
                            <Input
                                id="country"
                                type="text"
                                required
                                value={data.country}
                                onChange={(e) => setData('country', e.target.value)}
                                disabled={processing}
                                placeholder="Country"
                            />
                            <InputError message={errors.country} />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-4">
                        <h3 className="flex items-center text-lg font-medium text-gray-900">
                            <Lock className="mr-2 h-5 w-5" />
                            Account Security
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                    placeholder="Create password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                    placeholder="Confirm password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="terms"
                            checked={data.terms}
                            onCheckedChange={(checked) => setData('terms', checked as boolean)}
                            disabled={processing}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="terms" className="text-sm font-normal">
                                I agree to the{' '}
                                <TextLink href="/terms" className="text-blue-600 hover:text-blue-500">
                                    Terms of Service
                                </TextLink>{' '}
                                and{' '}
                                <TextLink href="/privacy" className="text-blue-600 hover:text-blue-500">
                                    Privacy Policy
                                </TextLink>
                            </Label>
                            <InputError message={errors.terms} />
                        </div>
                    </div>
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Create Customer Account
                </Button>
            </form>

            <div className="text-center text-sm">
                Already have an account?{' '}
                <TextLink href={route('login')} className="underline">
                    Sign in
                </TextLink>
            </div>
        </AuthLayout>
    );
}
