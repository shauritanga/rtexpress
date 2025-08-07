import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    ArrowLeft,
    Save,
    User,
    Building,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    FileText
} from 'lucide-react';
import { countries } from '@/lib/countries';

interface Customer {
    id: number;
    customer_code: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    tax_number?: string;
    credit_limit: number;
    payment_terms: string;
    status: string;
}

interface Props {
    customer: Customer;
}

export default function CustomerEdit({ customer }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        company_name: customer.company_name,
        contact_person: customer.contact_person,
        email: customer.email,
        phone: customer.phone,
        address_line_1: customer.address_line_1,
        address_line_2: customer.address_line_2 || '',
        city: customer.city,
        state_province: customer.state_province,
        postal_code: customer.postal_code,
        country: customer.country,
        tax_number: customer.tax_number || '',
        credit_limit: customer.credit_limit,
        payment_terms: customer.payment_terms,
        status: customer.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.customers.update', customer.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Customer - ${customer.company_name}`} />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/customers/${customer.id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Customer
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Edit Customer
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Update customer information and settings
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Company Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building className="h-5 w-5" />
                                    <span>Company Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Basic company details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name *</Label>
                                    <Input
                                        id="company_name"
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Enter company name"
                                        className={errors.company_name ? 'border-red-500' : ''}
                                    />
                                    {errors.company_name && (
                                        <p className="text-sm text-red-600">{errors.company_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_person">Contact Person *</Label>
                                    <div className="relative">
                                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="contact_person"
                                            type="text"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                            placeholder="Primary contact person"
                                            className={`pl-8 ${errors.contact_person ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.contact_person && (
                                        <p className="text-sm text-red-600">{errors.contact_person}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="company@example.com"
                                                className={`pl-8 ${errors.email ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Phone number"
                                                className={`pl-8 ${errors.phone ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_number">Tax Number</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="tax_number"
                                                type="text"
                                                value={data.tax_number}
                                                onChange={(e) => setData('tax_number', e.target.value)}
                                                placeholder="Tax identification number"
                                                className={`pl-8 ${errors.tax_number ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.tax_number && (
                                            <p className="text-sm text-red-600">{errors.tax_number}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600">{errors.status}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Address Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>Address Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Company address and location details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address_line_1">Address Line 1 *</Label>
                                    <Input
                                        id="address_line_1"
                                        type="text"
                                        value={data.address_line_1}
                                        onChange={(e) => setData('address_line_1', e.target.value)}
                                        placeholder="Street address"
                                        className={errors.address_line_1 ? 'border-red-500' : ''}
                                    />
                                    {errors.address_line_1 && (
                                        <p className="text-sm text-red-600">{errors.address_line_1}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line_2">Address Line 2</Label>
                                    <Input
                                        id="address_line_2"
                                        type="text"
                                        value={data.address_line_2}
                                        onChange={(e) => setData('address_line_2', e.target.value)}
                                        placeholder="Apartment, suite, etc. (optional)"
                                        className={errors.address_line_2 ? 'border-red-500' : ''}
                                    />
                                    {errors.address_line_2 && (
                                        <p className="text-sm text-red-600">{errors.address_line_2}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="City"
                                            className={errors.city ? 'border-red-500' : ''}
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-600">{errors.city}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state_province">State/Province *</Label>
                                        <Input
                                            id="state_province"
                                            type="text"
                                            value={data.state_province}
                                            onChange={(e) => setData('state_province', e.target.value)}
                                            placeholder="State or Province"
                                            className={errors.state_province ? 'border-red-500' : ''}
                                        />
                                        {errors.state_province && (
                                            <p className="text-sm text-red-600">{errors.state_province}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code *</Label>
                                        <Input
                                            id="postal_code"
                                            type="text"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            placeholder="Postal/ZIP code"
                                            className={errors.postal_code ? 'border-red-500' : ''}
                                        />
                                        {errors.postal_code && (
                                            <p className="text-sm text-red-600">{errors.postal_code}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country *</Label>
                                        <Select
                                            value={data.country}
                                            onValueChange={(value) => setData('country', value)}
                                        >
                                            <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
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
                                        {errors.country && (
                                            <p className="text-sm text-red-600">{errors.country}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5" />
                                <span>Financial Information</span>
                            </CardTitle>
                            <CardDescription>
                                Credit limits and payment terms
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="credit_limit">Credit Limit *</Label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-2.5 text-sm text-muted-foreground">$</span>
                                        <Input
                                            id="credit_limit"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.credit_limit}
                                            onChange={(e) => setData('credit_limit', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className={`pl-6 ${errors.credit_limit ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.credit_limit && (
                                        <p className="text-sm text-red-600">{errors.credit_limit}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payment_terms">Payment Terms *</Label>
                                    <Select value={data.payment_terms} onValueChange={(value) => setData('payment_terms', value)}>
                                        <SelectTrigger className={errors.payment_terms ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select payment terms" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="net_15">Net 15 Days</SelectItem>
                                            <SelectItem value="net_30">Net 30 Days</SelectItem>
                                            <SelectItem value="net_60">Net 60 Days</SelectItem>
                                            <SelectItem value="net_90">Net 90 Days</SelectItem>
                                            <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_terms && (
                                        <p className="text-sm text-red-600">{errors.payment_terms}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/admin/customers/${customer.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Customer'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
