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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Plus,
    Trash2,
    DollarSign,
    Truck,
    User,
    MapPin
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
}

interface Warehouse {
    id: number;
    name: string;
    city: string;
}

interface Shipment {
    id: number;
    tracking_number: string;
    status: string;
    customer: Customer;
    destinationWarehouse?: Warehouse;
    originWarehouse?: Warehouse;
    total_cost?: number | string;
    weight_kg: number | string;
    declared_value?: number | string;
}

interface Props {
    shipment?: Shipment;
    pendingShipments: Shipment[];
}

export default function CustomsCreate({ shipment, pendingShipments }: Props) {
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(shipment || null);
    const [items, setItems] = useState([
        {
            description: '',
            hs_code: '',
            country_of_origin: '',
            quantity: 1,
            unit_value: 0,
            unit_weight: 0,
            unit_of_measure: 'piece',
            manufacturer: '',
            brand: '',
            model: '',
            material: '',
            purpose: ''
        }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        shipment_id: shipment?.id || '',
        declaration_type: 'export',
        shipment_type: 'commercial',
        origin_country: 'TZA',
        destination_country: '',
        currency: 'USD',
        total_value: 0,
        insurance_value: 0,
        freight_charges: 0,
        description_of_goods: '',
        reason_for_export: '',
        contains_batteries: false,
        contains_liquids: false,
        contains_dangerous_goods: false,
        dangerous_goods_details: '',
        exporter_details: {
            name: '',
            address: '',
            phone: '',
            email: '',
            tax_id: ''
        },
        importer_details: {
            name: '',
            address: '',
            phone: '',
            email: '',
            tax_id: ''
        },
        consignee_details: {
            name: '',
            address: '',
            phone: '',
            email: ''
        },
        incoterms: '',
        items: items,
    });

    const addItem = () => {
        const newItems = [...items, {
            description: '',
            hs_code: '',
            country_of_origin: '',
            quantity: 1,
            unit_value: 0,
            unit_weight: 0,
            unit_of_measure: 'piece',
            manufacturer: '',
            brand: '',
            model: '',
            material: '',
            purpose: ''
        }];
        setItems(newItems);
        setData('items', newItems);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
        setData('items', newItems);
        
        // Update total value
        const totalValue = newItems.reduce((sum, item) => sum + (item.quantity * item.unit_value), 0);
        setData('total_value', totalValue);
    };

    const selectShipment = (shipment: Shipment) => {
        setSelectedShipment(shipment);
        setData('shipment_id', shipment.id);
        const declaredValue = typeof shipment.declared_value === 'number' ? shipment.declared_value :
                             typeof shipment.declared_value === 'string' ? parseFloat(shipment.declared_value) || 0 : 0;
        setData('total_value', declaredValue);
        setData('description_of_goods', `Shipment ${shipment.tracking_number}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.customs.store'));
    };

    const countries = [
        { code: 'TZA', name: 'Tanzania' },
        { code: 'KEN', name: 'Kenya' },
        { code: 'UGA', name: 'Uganda' },
        { code: 'RWA', name: 'Rwanda' },
        { code: 'BDI', name: 'Burundi' },
        { code: 'USA', name: 'United States' },
        { code: 'GBR', name: 'United Kingdom' },
        { code: 'CHN', name: 'China' },
        { code: 'IND', name: 'India' },
        { code: 'DEU', name: 'Germany' },
        { code: 'FRA', name: 'France' },
        { code: 'JPN', name: 'Japan' },
        { code: 'ZAF', name: 'South Africa' },
        { code: 'ARE', name: 'United Arab Emirates' }
    ];

    return (
        <AppLayout>
            <Head title="Create Customs Declaration" />

            <div className="min-h-screen bg-gray-50 sm:bg-white">
                {/* Mobile Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('admin.customs.index')}
                            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                                Create Customs Declaration
                            </h1>
                            <p className="text-sm text-gray-500 hidden sm:block">
                                Create a new customs declaration for shipment processing
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="px-4 py-4 sm:px-6 sm:py-6">

                    <MobileForm onSubmit={handleSubmit}>
                        {/* Shipment Selection */}
                        <MobileFormSection
                            title="Shipment Selection"
                            description="Choose a shipment that requires customs declaration"
                            variant="card"
                        >
                            <MobileInputGroup columns={1}>
                                <MobileFormField
                                    label="Select Shipment"
                                    required
                                    error={errors.shipment_id}
                                    description="Choose from pending shipments that need customs declarations"
                                >
                                    <Select
                                        value={data.shipment_id.toString()}
                                        onValueChange={(value) => {
                                            const shipment = pendingShipments.find(s => s.id.toString() === value);
                                            if (shipment) {
                                                selectShipment(shipment);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-11 text-base">
                                            <SelectValue placeholder="Select a shipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pendingShipments.length > 0 ? (
                                                pendingShipments.map((shipment) => (
                                                    <SelectItem
                                                        key={shipment.id}
                                                        value={shipment.id.toString()}
                                                        className="text-base py-3"
                                                    >
                                                        <div className="flex flex-col space-y-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-medium">{shipment.tracking_number}</span>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    ${typeof shipment.declared_value === 'number' ? shipment.declared_value.toFixed(2) : '0.00'}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {shipment.customer.company_name} → {shipment.destinationWarehouse?.city || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="" disabled className="text-base py-3">
                                                    No pending shipments available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </MobileFormField>
                            </MobileInputGroup>
                        </MobileFormSection>

                        {/* Selected Shipment Info */}
                        {selectedShipment && (
                            <MobileFormSection
                                title="Selected Shipment Details"
                                description="Review the shipment information"
                                variant="card"
                            >
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <Truck className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tracking</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {selectedShipment.tracking_number}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {selectedShipment.customer.company_name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <MapPin className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Destination</p>
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {selectedShipment.destinationWarehouse?.city || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <DollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Value</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    ${typeof selectedShipment.declared_value === 'number' ? selectedShipment.declared_value.toFixed(2) : '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </MobileFormSection>
                        )}

                        {/* Declaration Details */}
                        {selectedShipment && (
                            <>
                                <MobileFormSection
                                    title="Declaration Details"
                                    description="Provide customs declaration information"
                                    variant="card"
                                >
                                    <MobileInputGroup columns={1}>
                                        <MobileFormField
                                            label="Declaration Type"
                                            required
                                            error={errors.declaration_type}
                                        >
                                            <Select
                                                value={data.declaration_type}
                                                onValueChange={(value) => setData('declaration_type', value)}
                                            >
                                                <SelectTrigger className="h-11 text-base">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="export" className="text-base py-3">Export</SelectItem>
                                                    <SelectItem value="import" className="text-base py-3">Import</SelectItem>
                                                    <SelectItem value="transit" className="text-base py-3">Transit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </MobileFormField>

                                        <MobileFormField
                                            label="Shipment Type"
                                            required
                                            error={errors.shipment_type}
                                        >
                                            <Select
                                                value={data.shipment_type}
                                                onValueChange={(value) => setData('shipment_type', value)}
                                            >
                                                <SelectTrigger className="h-11 text-base">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="commercial" className="text-base py-3">Commercial</SelectItem>
                                                    <SelectItem value="gift" className="text-base py-3">Gift</SelectItem>
                                                    <SelectItem value="sample" className="text-base py-3">Sample</SelectItem>
                                                    <SelectItem value="return" className="text-base py-3">Return</SelectItem>
                                                    <SelectItem value="personal" className="text-base py-3">Personal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </MobileFormField>
                                    </MobileInputGroup>

                                    <MobileInputGroup columns={2}>
                                        <MobileFormField
                                            label="Origin Country"
                                            required
                                            error={errors.origin_country}
                                        >
                                            <Select
                                                value={data.origin_country}
                                                onValueChange={(value) => setData('origin_country', value)}
                                            >
                                                <SelectTrigger className="h-11 text-base">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map((country) => (
                                                        <SelectItem key={country.code} value={country.code} className="text-base py-3">
                                                            {country.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </MobileFormField>

                                        <MobileFormField
                                            label="Destination Country"
                                            required
                                            error={errors.destination_country}
                                        >
                                            <Select
                                                value={data.destination_country}
                                                onValueChange={(value) => setData('destination_country', value)}
                                            >
                                                <SelectTrigger className="h-11 text-base">
                                                    <SelectValue placeholder="Select destination" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countries.map((country) => (
                                                        <SelectItem key={country.code} value={country.code} className="text-base py-3">
                                                            {country.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </MobileFormField>
                                    </MobileInputGroup>

                                    <MobileInputGroup columns={2}>
                                        <MobileFormField
                                            label="Currency"
                                            required
                                            error={errors.currency}
                                        >
                                            <Select
                                                value={data.currency}
                                                onValueChange={(value) => setData('currency', value)}
                                            >
                                                <SelectTrigger className="h-11 text-base">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD" className="text-base py-3">USD - US Dollar</SelectItem>
                                                    <SelectItem value="EUR" className="text-base py-3">EUR - Euro</SelectItem>
                                                    <SelectItem value="TZS" className="text-base py-3">TZS - Tanzanian Shilling</SelectItem>
                                                    <SelectItem value="KES" className="text-base py-3">KES - Kenyan Shilling</SelectItem>
                                                    <SelectItem value="UGX" className="text-base py-3">UGX - Ugandan Shilling</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </MobileFormField>

                                        <MobileFormField
                                            label="Total Value"
                                            required
                                            error={errors.total_value}
                                        >
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.total_value}
                                                onChange={(e) => setData('total_value', parseFloat(e.target.value) || 0)}
                                                className="h-11 text-base"
                                                placeholder="0.00"
                                            />
                                        </MobileFormField>
                                    </MobileInputGroup>

                                    <MobileInputGroup columns={1}>
                                        <MobileFormField
                                            label="Description of Goods"
                                            required
                                            error={errors.description_of_goods}
                                            description="Detailed description of the goods being shipped"
                                        >
                                            <Textarea
                                                value={data.description_of_goods}
                                                onChange={(e) => setData('description_of_goods', e.target.value)}
                                                placeholder="Detailed description of the goods being shipped"
                                                className="text-base resize-none"
                                                rows={3}
                                            />
                                        </MobileFormField>

                                        <MobileFormField
                                            label="Reason for Export"
                                            error={errors.reason_for_export}
                                        >
                                            <Input
                                                value={data.reason_for_export}
                                                onChange={(e) => setData('reason_for_export', e.target.value)}
                                                placeholder="e.g., Sale, Gift, Sample, Return"
                                                className="h-11 text-base"
                                            />
                                        </MobileFormField>
                                    </MobileInputGroup>
                                </MobileFormSection>

                                {/* Special Conditions */}
                                <MobileFormSection
                                    title="Special Conditions"
                                    description="Indicate if the shipment contains any special items"
                                    variant="card"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Checkbox
                                                id="contains_batteries"
                                                checked={data.contains_batteries}
                                                onCheckedChange={(checked) => (setData as any)('contains_batteries', !!checked)}
                                                className="h-5 w-5"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="contains_batteries" className="text-base font-medium cursor-pointer">
                                                    Contains batteries
                                                </label>
                                                <p className="text-sm text-gray-500">Lithium batteries or battery-powered devices</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Checkbox
                                                id="contains_liquids"
                                                checked={data.contains_liquids}
                                                onCheckedChange={(checked) => (setData as any)('contains_liquids', !!checked)}
                                                className="h-5 w-5"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="contains_liquids" className="text-base font-medium cursor-pointer">
                                                    Contains liquids
                                                </label>
                                                <p className="text-sm text-gray-500">Any liquid substances or solutions</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <Checkbox
                                                id="contains_dangerous_goods"
                                                checked={data.contains_dangerous_goods}
                                                onCheckedChange={(checked) => (setData as any)('contains_dangerous_goods', !!checked)}
                                                className="h-5 w-5"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="contains_dangerous_goods" className="text-base font-medium cursor-pointer">
                                                    Contains dangerous goods
                                                </label>
                                                <p className="text-sm text-gray-500">Hazardous materials requiring special handling</p>
                                            </div>
                                        </div>

                                        {data.contains_dangerous_goods && (
                                            <MobileFormField
                                                label="Dangerous Goods Details"
                                                required
                                                description="Provide specific details about the dangerous goods"
                                            >
                                                <Textarea
                                                    value={data.dangerous_goods_details}
                                                    onChange={(e) => setData('dangerous_goods_details', e.target.value)}
                                                    placeholder="Provide details about dangerous goods"
                                                    className="text-base resize-none"
                                                    rows={3}
                                                />
                                            </MobileFormField>
                                        )}
                                    </div>
                                </MobileFormSection>

                                {/* Items */}
                                <MobileFormSection
                                    title="Declaration Items"
                                    description="Add items included in this customs declaration"
                                    variant="card"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                {items.length} item{items.length !== 1 ? 's' : ''} added
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addItem}
                                                className="h-9 px-3 text-sm"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Item
                                            </Button>
                                        </div>

                                        {items.map((item, index) => (
                                            <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-base">Item {index + 1}</h4>
                                                    {items.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeItem(index)}
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <MobileInputGroup columns={1}>
                                                    <MobileFormField
                                                        label="Description"
                                                        required
                                                    >
                                                        <Input
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                            placeholder="Item description"
                                                            className="h-11 text-base"
                                                        />
                                                    </MobileFormField>
                                                </MobileInputGroup>

                                                <MobileInputGroup columns={2}>
                                                    <MobileFormField
                                                        label="Quantity"
                                                        required
                                                    >
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="h-11 text-base"
                                                            placeholder="1"
                                                        />
                                                    </MobileFormField>

                                                    <MobileFormField
                                                        label="Unit Weight (kg)"
                                                        required
                                                    >
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.unit_weight}
                                                            onChange={(e) => updateItem(index, 'unit_weight', parseFloat(e.target.value) || 0)}
                                                            className="h-11 text-base"
                                                            placeholder="0.00"
                                                        />
                                                    </MobileFormField>
                                                </MobileInputGroup>

                                                <MobileInputGroup columns={2}>
                                                    <MobileFormField
                                                        label="Unit Value"
                                                        required
                                                    >
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={item.unit_value}
                                                            onChange={(e) => updateItem(index, 'unit_value', parseFloat(e.target.value) || 0)}
                                                            className="h-11 text-base"
                                                            placeholder="0.00"
                                                        />
                                                    </MobileFormField>

                                                    <MobileFormField
                                                        label="HS Code"
                                                        description="Harmonized System Code"
                                                    >
                                                        <Input
                                                            value={item.hs_code}
                                                            onChange={(e) => updateItem(index, 'hs_code', e.target.value)}
                                                            placeholder="e.g., 8517.12.00"
                                                            className="h-11 text-base"
                                                        />
                                                    </MobileFormField>
                                                </MobileInputGroup>

                                                <MobileInputGroup columns={1}>
                                                    <MobileFormField
                                                        label="Country of Origin"
                                                        required
                                                    >
                                                        <Select
                                                            value={item.country_of_origin}
                                                            onValueChange={(value) => updateItem(index, 'country_of_origin', value)}
                                                        >
                                                            <SelectTrigger className="h-11 text-base">
                                                                <SelectValue placeholder="Select country" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {countries.map((country) => (
                                                                    <SelectItem key={country.code} value={country.code} className="text-base py-3">
                                                                        {country.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </MobileFormField>
                                                </MobileInputGroup>
                                            </div>
                                        ))}
                                    </div>
                                </MobileFormSection>

                            <MobileFormActions>
                                <Link
                                    href={route('admin.customs.index')}
                                    className="flex-1 h-12 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center text-base font-medium"
                                >
                                    Cancel
                                </Link>
                                <MobileSubmitButton
                                    disabled={processing || !selectedShipment}
                                    loading={processing}
                                >
                                    {processing ? 'Creating...' : 'Create Declaration'}
                                </MobileSubmitButton>
                            </MobileFormActions>
                        </>
                    )}
                    </MobileForm>
                </div>
            </div>
        </AppLayout>
    );
}
