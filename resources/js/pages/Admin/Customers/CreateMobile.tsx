import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import {
    MobileForm,
    MobileFormSection,
    MobileFormField,
    MobileInputGroup,
    MobileFormActions,
    MobileSubmitButton
} from '@/components/ui/mobile-form';
import { 
    ArrowLeft,
    Building,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    FileText
} from 'lucide-react';

export default function CustomerCreateMobile() {
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
        country: 'US',
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
            
            <div className="space-y-4 sm:space-y-6 p-4 md:p-6">
                {/* Mobile-First Header */}
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="p-2 h-auto"
                    >
                        <Link href="/admin/customers">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                            Create New Customer
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add a new customer to the system
                        </p>
                    </div>
                </div>

                <MobileForm onSubmit={handleSubmit}>
                    {/* Company Information */}
                    <MobileFormSection 
                        title="Company Information"
                        description="Basic company and contact details"
                        variant="card"
                    >
                        <MobileInputGroup columns={1}>
                            <MobileFormField
                                label="Company Name"
                                required
                                error={errors.company_name}
                            >
                                <Input
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    placeholder="Enter company name"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Contact Person"
                                required
                                error={errors.contact_person}
                            >
                                <Input
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                    placeholder="Enter contact person name"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="Email"
                                required
                                error={errors.email}
                            >
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter email address"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Phone"
                                required
                                error={errors.phone}
                            >
                                <Input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>
                    </MobileFormSection>

                    {/* Address Information */}
                    <MobileFormSection 
                        title="Address Information"
                        description="Company address and location details"
                        variant="card"
                    >
                        <MobileInputGroup columns={1}>
                            <MobileFormField
                                label="Address Line 1"
                                required
                                error={errors.address_line_1}
                            >
                                <Input
                                    value={data.address_line_1}
                                    onChange={(e) => setData('address_line_1', e.target.value)}
                                    placeholder="Enter street address"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Address Line 2"
                                error={errors.address_line_2}
                                description="Suite, apartment, floor, etc. (optional)"
                            >
                                <Input
                                    value={data.address_line_2}
                                    onChange={(e) => setData('address_line_2', e.target.value)}
                                    placeholder="Suite, apartment, floor, etc."
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="City"
                                required
                                error={errors.city}
                            >
                                <Input
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Enter city"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="State/Province"
                                required
                                error={errors.state_province}
                            >
                                <Input
                                    value={data.state_province}
                                    onChange={(e) => setData('state_province', e.target.value)}
                                    placeholder="Enter state/province"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="Postal Code"
                                required
                                error={errors.postal_code}
                            >
                                <Input
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    placeholder="Enter postal code"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Country"
                                required
                                error={errors.country}
                            >
                                <Select 
                                    value={data.country} 
                                    onValueChange={(value) => setData('country', value)}
                                >
                                    <SelectTrigger className="h-11 text-base">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US" className="text-base py-3">United States</SelectItem>
                                        <SelectItem value="CA" className="text-base py-3">Canada</SelectItem>
                                        <SelectItem value="MX" className="text-base py-3">Mexico</SelectItem>
                                        <SelectItem value="GB" className="text-base py-3">United Kingdom</SelectItem>
                                        <SelectItem value="DE" className="text-base py-3">Germany</SelectItem>
                                        <SelectItem value="FR" className="text-base py-3">France</SelectItem>
                                        <SelectItem value="AU" className="text-base py-3">Australia</SelectItem>
                                        <SelectItem value="JP" className="text-base py-3">Japan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </MobileFormField>
                        </MobileInputGroup>
                    </MobileFormSection>

                    {/* Business Settings */}
                    <MobileFormSection 
                        title="Business Settings"
                        description="Payment terms and account settings"
                        variant="card"
                    >
                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="Payment Terms"
                                required
                                error={errors.payment_terms}
                            >
                                <Select 
                                    value={data.payment_terms} 
                                    onValueChange={(value) => setData('payment_terms', value)}
                                >
                                    <SelectTrigger className="h-11 text-base">
                                        <SelectValue placeholder="Select payment terms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="net_15" className="text-base py-3">Net 15 days</SelectItem>
                                        <SelectItem value="net_30" className="text-base py-3">Net 30 days</SelectItem>
                                        <SelectItem value="net_60" className="text-base py-3">Net 60 days</SelectItem>
                                        <SelectItem value="net_90" className="text-base py-3">Net 90 days</SelectItem>
                                        <SelectItem value="cod" className="text-base py-3">Cash on Delivery</SelectItem>
                                        <SelectItem value="prepaid" className="text-base py-3">Prepaid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </MobileFormField>

                            <MobileFormField
                                label="Credit Limit"
                                required
                                error={errors.credit_limit}
                                description="Maximum credit amount in USD"
                            >
                                <Input
                                    type="number"
                                    value={data.credit_limit}
                                    onChange={(e) => setData('credit_limit', parseFloat(e.target.value) || 0)}
                                    placeholder="Enter credit limit"
                                    className="h-11 text-base"
                                    min="0"
                                    step="100"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={1}>
                            <MobileFormField
                                label="Account Status"
                                required
                                error={errors.status}
                            >
                                <Select 
                                    value={data.status} 
                                    onValueChange={(value) => setData('status', value)}
                                >
                                    <SelectTrigger className="h-11 text-base">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active" className="text-base py-3">Active</SelectItem>
                                        <SelectItem value="inactive" className="text-base py-3">Inactive</SelectItem>
                                        <SelectItem value="suspended" className="text-base py-3">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </MobileFormField>

                            <MobileFormField
                                label="Notes"
                                error={errors.notes}
                                description="Additional notes about this customer (optional)"
                            >
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Enter any additional notes..."
                                    rows={4}
                                    className="text-base resize-none"
                                />
                            </MobileFormField>
                        </MobileInputGroup>
                    </MobileFormSection>

                    {/* Form Actions */}
                    <MobileFormActions layout="horizontal">
                        <Button
                            type="button"
                            variant="outline"
                            size="touch"
                            asChild
                            className="w-full sm:w-auto"
                        >
                            <Link href="/admin/customers">
                                Cancel
                            </Link>
                        </Button>
                        
                        <MobileSubmitButton
                            loading={processing}
                            className="bg-rt-red hover:bg-rt-red-700"
                        >
                            Create Customer
                        </MobileSubmitButton>
                    </MobileFormActions>
                </MobileForm>
            </div>
        </AppLayout>
    );
}
