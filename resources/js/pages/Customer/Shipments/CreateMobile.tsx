import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft,
    Package,
    MapPin,
    Truck,
    DollarSign,
    Weight,
    Ruler,
    Plus,
    Trash2,
    Calculator
} from 'lucide-react';

interface Package {
    id: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    description: string;
}

export default function CustomerShipmentCreateMobile() {
    const [packages, setPackages] = useState<Package[]>([
        { id: '1', weight: 0, length: 0, width: 0, height: 0, description: '' }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        service_type: 'standard',
        sender_name: '',
        sender_phone: '',
        sender_address: '',
        sender_city: '',
        sender_state: '',
        sender_postal_code: '',
        sender_country: 'US',
        recipient_name: '',
        recipient_phone: '',
        recipient_address: '',
        recipient_city: '',
        recipient_state: '',
        recipient_postal_code: '',
        recipient_country: 'US',
        packages: packages,
        special_instructions: '',
        insurance_value: 0,
        signature_required: false,
        delivery_confirmation: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('packages', packages);
        post(route('customer.shipments.store'));
    };

    const addPackage = () => {
        const newPackage: Package = {
            id: Date.now().toString(),
            weight: 0,
            length: 0,
            width: 0,
            height: 0,
            description: ''
        };
        setPackages([...packages, newPackage]);
    };

    const removePackage = (id: string) => {
        if (packages.length > 1) {
            setPackages(packages.filter(pkg => pkg.id !== id));
        }
    };

    const updatePackage = (id: string, field: keyof Package, value: any) => {
        setPackages(packages.map(pkg => 
            pkg.id === id ? { ...pkg, [field]: value } : pkg
        ));
    };

    const calculateTotalWeight = () => {
        return packages.reduce((total, pkg) => total + (pkg.weight || 0), 0);
    };

    return (
        <AppLayout>
            <Head title="Create Shipment" />
            
            <div className="space-y-4 sm:space-y-6 p-4 md:p-6">
                {/* Mobile-First Header */}
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="p-2 h-auto"
                    >
                        <Link href="/customer/shipments">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                            Create New Shipment
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Send a package with RT Express
                        </p>
                    </div>
                </div>

                <MobileForm onSubmit={handleSubmit}>
                    {/* Service Selection */}
                    <MobileFormSection 
                        title="Service Type"
                        description="Choose your shipping service"
                        variant="card"
                    >
                        <MobileInputGroup columns={1}>
                            <MobileFormField
                                label="Shipping Service"
                                required
                                error={errors.service_type}
                            >
                                <Select 
                                    value={data.service_type} 
                                    onValueChange={(value) => setData('service_type', value)}
                                >
                                    <SelectTrigger className="h-11 text-base">
                                        <SelectValue placeholder="Select service type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="economy" className="text-base py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">Economy</span>
                                                <span className="text-xs text-muted-foreground">5-7 business days</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="standard" className="text-base py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">Standard</span>
                                                <span className="text-xs text-muted-foreground">3-5 business days</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="express" className="text-base py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">Express</span>
                                                <span className="text-xs text-muted-foreground">1-2 business days</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="overnight" className="text-base py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium">Overnight</span>
                                                <span className="text-xs text-muted-foreground">Next business day</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </MobileFormField>
                        </MobileInputGroup>
                    </MobileFormSection>

                    {/* Sender Information */}
                    <MobileFormSection 
                        title="From (Sender)"
                        description="Your pickup address"
                        variant="card"
                    >
                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="Sender Name"
                                required
                                error={errors.sender_name}
                            >
                                <Input
                                    value={data.sender_name}
                                    onChange={(e) => setData('sender_name', e.target.value)}
                                    placeholder="Enter sender name"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Phone Number"
                                required
                                error={errors.sender_phone}
                            >
                                <Input
                                    type="tel"
                                    value={data.sender_phone}
                                    onChange={(e) => setData('sender_phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={1}>
                            <MobileFormField
                                label="Address"
                                required
                                error={errors.sender_address}
                            >
                                <Input
                                    value={data.sender_address}
                                    onChange={(e) => setData('sender_address', e.target.value)}
                                    placeholder="Enter street address"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="City"
                                required
                                error={errors.sender_city}
                            >
                                <Input
                                    value={data.sender_city}
                                    onChange={(e) => setData('sender_city', e.target.value)}
                                    placeholder="Enter city"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="State"
                                required
                                error={errors.sender_state}
                            >
                                <Input
                                    value={data.sender_state}
                                    onChange={(e) => setData('sender_state', e.target.value)}
                                    placeholder="Enter state"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="Postal Code"
                                required
                                error={errors.sender_postal_code}
                            >
                                <Input
                                    value={data.sender_postal_code}
                                    onChange={(e) => setData('sender_postal_code', e.target.value)}
                                    placeholder="Enter postal code"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Country"
                                required
                                error={errors.sender_country}
                            >
                                <Select 
                                    value={data.sender_country} 
                                    onValueChange={(value) => setData('sender_country', value)}
                                >
                                    <SelectTrigger className="h-11 text-base">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US" className="text-base py-3">United States</SelectItem>
                                        <SelectItem value="CA" className="text-base py-3">Canada</SelectItem>
                                        <SelectItem value="MX" className="text-base py-3">Mexico</SelectItem>
                                    </SelectContent>
                                </Select>
                            </MobileFormField>
                        </MobileInputGroup>
                    </MobileFormSection>

                    {/* Recipient Information */}
                    <MobileFormSection 
                        title="To (Recipient)"
                        description="Delivery destination"
                        variant="card"
                    >
                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="Recipient Name"
                                required
                                error={errors.recipient_name}
                            >
                                <Input
                                    value={data.recipient_name}
                                    onChange={(e) => setData('recipient_name', e.target.value)}
                                    placeholder="Enter recipient name"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Phone Number"
                                required
                                error={errors.recipient_phone}
                            >
                                <Input
                                    type="tel"
                                    value={data.recipient_phone}
                                    onChange={(e) => setData('recipient_phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={1}>
                            <MobileFormField
                                label="Address"
                                required
                                error={errors.recipient_address}
                            >
                                <Input
                                    value={data.recipient_address}
                                    onChange={(e) => setData('recipient_address', e.target.value)}
                                    placeholder="Enter street address"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="City"
                                required
                                error={errors.recipient_city}
                            >
                                <Input
                                    value={data.recipient_city}
                                    onChange={(e) => setData('recipient_city', e.target.value)}
                                    placeholder="Enter city"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="State"
                                required
                                error={errors.recipient_state}
                            >
                                <Input
                                    value={data.recipient_state}
                                    onChange={(e) => setData('recipient_state', e.target.value)}
                                    placeholder="Enter state"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>
                        </MobileInputGroup>

                        <MobileInputGroup columns={2}>
                            <MobileFormField
                                label="Postal Code"
                                required
                                error={errors.recipient_postal_code}
                            >
                                <Input
                                    value={data.recipient_postal_code}
                                    onChange={(e) => setData('recipient_postal_code', e.target.value)}
                                    placeholder="Enter postal code"
                                    className="h-11 text-base"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Country"
                                required
                                error={errors.recipient_country}
                            >
                                <Select 
                                    value={data.recipient_country} 
                                    onValueChange={(value) => setData('recipient_country', value)}
                                >
                                    <SelectTrigger className="h-11 text-base">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US" className="text-base py-3">United States</SelectItem>
                                        <SelectItem value="CA" className="text-base py-3">Canada</SelectItem>
                                        <SelectItem value="MX" className="text-base py-3">Mexico</SelectItem>
                                    </SelectContent>
                                </Select>
                            </MobileFormField>
                        </MobileInputGroup>
                    </MobileFormSection>

                    {/* Package Information */}
                    <MobileFormSection 
                        title="Package Details"
                        description={`${packages.length} package(s) • Total weight: ${calculateTotalWeight()} lbs`}
                        variant="card"
                    >
                        <div className="space-y-4">
                            {packages.map((pkg, index) => (
                                <div key={pkg.id} className="border border-border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">
                                            Package {index + 1}
                                        </h4>
                                        {packages.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePackage(pkg.id)}
                                                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <MobileInputGroup columns={1}>
                                        <MobileFormField
                                            label="Package Description"
                                            required
                                        >
                                            <Input
                                                value={pkg.description}
                                                onChange={(e) => updatePackage(pkg.id, 'description', e.target.value)}
                                                placeholder="What's in this package?"
                                                className="h-11 text-base"
                                            />
                                        </MobileFormField>
                                    </MobileInputGroup>

                                    <MobileInputGroup columns={2}>
                                        <MobileFormField
                                            label="Weight (lbs)"
                                            required
                                        >
                                            <Input
                                                type="number"
                                                value={pkg.weight || ''}
                                                onChange={(e) => updatePackage(pkg.id, 'weight', parseFloat(e.target.value) || 0)}
                                                placeholder="0.0"
                                                className="h-11 text-base"
                                                min="0"
                                                step="0.1"
                                            />
                                        </MobileFormField>

                                        <MobileFormField
                                            label="Length (in)"
                                            required
                                        >
                                            <Input
                                                type="number"
                                                value={pkg.length || ''}
                                                onChange={(e) => updatePackage(pkg.id, 'length', parseFloat(e.target.value) || 0)}
                                                placeholder="0.0"
                                                className="h-11 text-base"
                                                min="0"
                                                step="0.1"
                                            />
                                        </MobileFormField>
                                    </MobileInputGroup>

                                    <MobileInputGroup columns={2}>
                                        <MobileFormField
                                            label="Width (in)"
                                            required
                                        >
                                            <Input
                                                type="number"
                                                value={pkg.width || ''}
                                                onChange={(e) => updatePackage(pkg.id, 'width', parseFloat(e.target.value) || 0)}
                                                placeholder="0.0"
                                                className="h-11 text-base"
                                                min="0"
                                                step="0.1"
                                            />
                                        </MobileFormField>

                                        <MobileFormField
                                            label="Height (in)"
                                            required
                                        >
                                            <Input
                                                type="number"
                                                value={pkg.height || ''}
                                                onChange={(e) => updatePackage(pkg.id, 'height', parseFloat(e.target.value) || 0)}
                                                placeholder="0.0"
                                                className="h-11 text-base"
                                                min="0"
                                                step="0.1"
                                            />
                                        </MobileFormField>
                                    </MobileInputGroup>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={addPackage}
                                className="w-full h-11 text-base"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Package
                            </Button>
                        </div>
                    </MobileFormSection>

                    {/* Additional Options */}
                    <MobileFormSection 
                        title="Additional Options"
                        description="Special instructions and services"
                        variant="card"
                    >
                        <MobileInputGroup columns={1}>
                            <MobileFormField
                                label="Special Instructions"
                                description="Any special handling or delivery instructions"
                            >
                                <Textarea
                                    value={data.special_instructions}
                                    onChange={(e) => setData('special_instructions', e.target.value)}
                                    placeholder="Enter any special instructions..."
                                    rows={3}
                                    className="text-base resize-none"
                                />
                            </MobileFormField>

                            <MobileFormField
                                label="Insurance Value (USD)"
                                description="Declared value for insurance purposes"
                            >
                                <Input
                                    type="number"
                                    value={data.insurance_value || ''}
                                    onChange={(e) => setData('insurance_value', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="h-11 text-base"
                                    min="0"
                                    step="0.01"
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
                            <Link href="/customer/shipments">
                                Cancel
                            </Link>
                        </Button>
                        
                        <MobileSubmitButton
                            loading={processing}
                            className="bg-rt-red hover:bg-rt-red-700"
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Get Quote & Create
                        </MobileSubmitButton>
                    </MobileFormActions>
                </MobileForm>
            </div>
        </AppLayout>
    );
}
