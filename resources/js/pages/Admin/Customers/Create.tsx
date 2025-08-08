import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileForm } from '@/components/ui/mobile-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { countries } from '@/lib/countries';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building, CreditCard, Mail, MapPin, Phone, User, Users } from 'lucide-react';

export default function CustomerCreate() {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        payment_terms: 'net_30',
        credit_limit: 5000,
        status: 'active',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.customers.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Customer" />

            <div className="space-y-4 p-4 sm:space-y-6 md:p-6">
                {/* Mobile-First Header */}
                <div className="mb-4 flex items-center space-x-3 sm:mb-6">
                    <Button variant="ghost" size="sm" asChild className="h-auto p-2">
                        <Link href="/admin/customers">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Create New Customer</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Add a new customer to the system</p>
                    </div>
                </div>

                <MobileForm onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Company Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Building className="mr-2 h-5 w-5" />
                                    Company Information
                                </CardTitle>
                                <CardDescription>Basic company and contact details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name *</Label>
                                    <Input
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Enter company name"
                                        required
                                    />
                                    {errors.company_name && <p className="text-sm text-red-600">{errors.company_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_person">Contact Person *</Label>
                                    <div className="relative">
                                        <User className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="contact_person"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                            placeholder="Enter contact person name"
                                            className="pl-8"
                                            required
                                        />
                                    </div>
                                    {errors.contact_person && <p className="text-sm text-red-600">{errors.contact_person}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <div className="relative">
                                        <Mail className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter email address"
                                            className="pl-8"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    Business Settings
                                </CardTitle>
                                <CardDescription>Payment terms and account settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_terms">Payment Terms</Label>
                                    <Select value={data.payment_terms} onValueChange={(value) => setData('payment_terms', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment terms" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="net_30">Net 30 Days</SelectItem>
                                            <SelectItem value="net_15">Net 15 Days</SelectItem>
                                            <SelectItem value="net_7">Net 7 Days</SelectItem>
                                            <SelectItem value="cod">Cash on Delivery</SelectItem>
                                            <SelectItem value="prepaid">Prepaid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_terms && <p className="text-sm text-red-600">{errors.payment_terms}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="credit_limit">Credit Limit ($)</Label>
                                    <Input
                                        id="credit_limit"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.credit_limit}
                                        onChange={(e) => setData('credit_limit', parseFloat(e.target.value) || 0)}
                                        placeholder="Enter credit limit"
                                    />
                                    {errors.credit_limit && <p className="text-sm text-red-600">{errors.credit_limit}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Account Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional notes about this customer..."
                                        rows={3}
                                    />
                                    {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5" />
                                Address Information
                            </CardTitle>
                            <CardDescription>Primary business address for this customer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                    <Label htmlFor="address_line_1">Address Line 1 *</Label>
                                    <Input
                                        id="address_line_1"
                                        value={data.address_line_1}
                                        onChange={(e) => setData('address_line_1', e.target.value)}
                                        placeholder="Enter street address"
                                        required
                                    />
                                    {errors.address_line_1 && <p className="text-sm text-red-600">{errors.address_line_1}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line_2">Address Line 2</Label>
                                    <Input
                                        id="address_line_2"
                                        value={data.address_line_2}
                                        onChange={(e) => setData('address_line_2', e.target.value)}
                                        placeholder="Apt, suite, etc."
                                    />
                                    {errors.address_line_2 && <p className="text-sm text-red-600">{errors.address_line_2}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Enter city"
                                        required
                                    />
                                    {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state_province">State/Province *</Label>
                                    <Input
                                        id="state_province"
                                        value={data.state_province}
                                        onChange={(e) => setData('state_province', e.target.value)}
                                        placeholder="Enter state or province"
                                        required
                                    />
                                    {errors.state_province && <p className="text-sm text-red-600">{errors.state_province}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code *</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="Enter postal code"
                                        required
                                    />
                                    {errors.postal_code && <p className="text-sm text-red-600">{errors.postal_code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country *</Label>
                                    <Select value={data.country} onValueChange={(value) => setData('country', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {countries.map((country) => (
                                                <SelectItem key={country.code} value={country.name}>
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/customers">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Users className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Customer'}
                        </Button>
                    </div>
                </MobileForm>
            </div>
        </AppLayout>
    );
}
