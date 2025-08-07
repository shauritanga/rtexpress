import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
    MobileForm,
    MobileFormSection,
    MobileFormField,
    MobileInputGroup,
    MobileFormActions,
    MobileSubmitButton
} from '@/components/ui/mobile-form';
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    Truck,
    DollarSign,
    Weight,
    Ruler,
    Plus,
    Trash2,
    X
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    customer_code: string;
}

interface Warehouse {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
}

interface Props {
    customers: Customer[];
    warehouses: Warehouse[];
}

export default function ShipmentCreate({ customers, warehouses }: Props) {
    const [items, setItems] = useState([
        { description: '', quantity: 1, weight: 0, dimensions: '', value: 0 }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        service_type: 'standard',
        package_type: 'package',
        sender_name: '',
        sender_phone: '',
        sender_address: '',
        recipient_name: '',
        recipient_phone: '',
        recipient_address: '',
        origin_address: '',
        destination_address: '',
        origin_warehouse_id: '',
        destination_warehouse_id: '',
        estimated_delivery_date: '',
        declared_value: 0,
        weight_kg: 0,
        dimensions_length_cm: 0,
        dimensions_width_cm: 0,
        dimensions_height_cm: 0,
        dimensions: '', // Combined dimensions field for display
        special_instructions: '',
        items: items,
    });

    const addItem = () => {
        const newItems = [...items, { description: '', quantity: 1, weight: 0, dimensions: '', value: 0 }];
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

        // Update total weight and value automatically
        const totalWeight = newItems.reduce((sum, item) => sum + (parseFloat(item.weight.toString()) || 0), 0);
        const totalValue = newItems.reduce((sum, item) => sum + (parseFloat(item.value.toString()) || 0), 0);

        // Only update if the current values are 0 or match the calculated values (auto-calculation mode)
        if (data.weight_kg === 0 || Math.abs(data.weight_kg - (items.reduce((sum, item) => sum + (parseFloat(item.weight.toString()) || 0), 0))) < 0.01) {
            setData('weight_kg', totalWeight);
        }
        if (data.declared_value === 0 || Math.abs(data.declared_value - (items.reduce((sum, item) => sum + (parseFloat(item.value.toString()) || 0), 0))) < 0.01) {
            setData('declared_value', totalValue);
        }
    };

    const handleDimensionsChange = (value: string) => {
        setData('dimensions', value);

        // Try to parse dimensions like "30 x 20 x 15" into individual fields
        const parts = value.split(/[x×\s]+/).map(part => parseFloat(part.trim())).filter(num => !isNaN(num));
        if (parts.length >= 3) {
            setData('dimensions_length_cm', parts[0]);
            setData('dimensions_width_cm', parts[1]);
            setData('dimensions_height_cm', parts[2]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.shipments.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Shipment" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Mobile-First Header */}
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="p-2 h-auto"
                    >
                        <Link href="/admin/shipments">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                            Create New Shipment
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create a new shipment for a customer
                        </p>
                    </div>
                </div>

                <MobileForm onSubmit={handleSubmit}>
                    <div className="space-y-4 sm:space-y-6">
                        {/* Customer & Service Details */}
                        <MobileFormSection
                            title="Customer & Service"
                            description="Select customer and service type"
                            variant="card"
                        >
                            <MobileInputGroup columns={1}>
                                <MobileFormField
                                    label="Customer"
                                    required
                                    error={errors.customer_id}
                                    description="Select the customer for this shipment"
                                >
                                    <Select
                                        value={data.customer_id}
                                        onValueChange={(value) => setData('customer_id', value)}
                                    >
                                        <SelectTrigger className="h-11 text-base">
                                            <SelectValue placeholder="Choose customer..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem
                                                    key={customer.id}
                                                    value={customer.id.toString()}
                                                    className="text-base py-3"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{customer.name}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {customer.customer_code} • {customer.email}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </MobileFormField>

                                <MobileFormField
                                    label="Service Type"
                                    required
                                    error={errors.service_type}
                                    description="Delivery speed and priority level"
                                >
                                    <Select
                                        value={data.service_type}
                                        onValueChange={(value) => setData('service_type', value)}
                                    >
                                        <SelectTrigger className="h-11 text-base">
                                            <SelectValue placeholder="Select service..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="economy" className="text-base py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Economy</span>
                                                    <span className="text-xs text-muted-foreground">5-7 business days • Lowest cost</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="standard" className="text-base py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Standard</span>
                                                    <span className="text-xs text-muted-foreground">3-5 business days • Most popular</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="express" className="text-base py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Express</span>
                                                    <span className="text-xs text-muted-foreground">1-2 business days • Fast delivery</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="overnight" className="text-base py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Overnight</span>
                                                    <span className="text-xs text-muted-foreground">Next business day • Premium</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </MobileFormField>

                                <MobileFormField
                                    label="Package Type"
                                    error={errors.package_type}
                                    description="Type of package being shipped"
                                >
                                    <Select
                                        value={data.package_type}
                                        onValueChange={(value) => setData('package_type', value)}
                                    >
                                        <SelectTrigger className="h-11 text-base">
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="document" className="text-base py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Document</span>
                                                    <span className="text-xs text-muted-foreground">Papers, letters, contracts</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="package" className="text-base py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Package</span>
                                                    <span className="text-xs text-muted-foreground">Standard boxes and parcels</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="pallet" className="text-base py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Pallet</span>
                                                    <span className="text-xs text-muted-foreground">Large freight on pallets</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="container" className="text-base py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">Container</span>
                                                    <span className="text-xs text-muted-foreground">Full container loads</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </MobileFormField>

                                <MobileFormField
                                    label="Estimated Delivery Date"
                                    error={errors.estimated_delivery_date}
                                    description="Target delivery date (optional)"
                                >
                                    <Input
                                        type="date"
                                        value={data.estimated_delivery_date}
                                        onChange={(e) => setData('estimated_delivery_date', e.target.value)}
                                        className="h-11 text-base"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </MobileFormField>
                            </MobileInputGroup>
                        </MobileFormSection>

                        {/* Sender & Recipient Information */}
                        <MobileFormSection
                            title="Contact Information"
                            icon={User}
                            description="Sender and recipient details"
                            variant="card"
                        >
                            <div className="space-y-6">
                                {/* Sender Details */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-foreground flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        Sender Information
                                    </h4>
                                    <MobileInputGroup columns={2}>
                                        <MobileFormField
                                            label="Sender Name"
                                            required
                                            error={errors.sender_name}
                                        >
                                            <Input
                                                value={data.sender_name}
                                                onChange={(e) => setData('sender_name', e.target.value)}
                                                placeholder="Full name"
                                                className="h-11 text-base"
                                                required
                                            />
                                        </MobileFormField>

                                        <MobileFormField
                                            label="Sender Phone"
                                            required
                                            error={errors.sender_phone}
                                        >
                                            <Input
                                                type="tel"
                                                value={data.sender_phone}
                                                onChange={(e) => setData('sender_phone', e.target.value)}
                                                placeholder="+255 123 456 789"
                                                className="h-11 text-base"
                                                required
                                            />
                                        </MobileFormField>
                                    </MobileInputGroup>

                                    <MobileFormField
                                        label="Sender Address"
                                        required
                                        error={errors.sender_address}
                                    >
                                        <Textarea
                                            value={data.sender_address}
                                            onChange={(e) => setData('sender_address', e.target.value)}
                                            placeholder="Complete pickup address with street, city, and postal code"
                                            rows={2}
                                            required
                                        />
                                    </MobileFormField>
                                </div>

                                {/* Recipient Details */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-foreground flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Recipient Information
                                    </h4>
                                    <MobileInputGroup columns={2}>
                                        <MobileFormField
                                            label="Recipient Name"
                                            required
                                            error={errors.recipient_name}
                                        >
                                            <Input
                                                value={data.recipient_name}
                                                onChange={(e) => setData('recipient_name', e.target.value)}
                                                placeholder="Full name"
                                                className="h-11 text-base"
                                                required
                                            />
                                        </MobileFormField>

                                        <MobileFormField
                                            label="Recipient Phone"
                                            required
                                            error={errors.recipient_phone}
                                        >
                                            <Input
                                                type="tel"
                                                value={data.recipient_phone}
                                                onChange={(e) => setData('recipient_phone', e.target.value)}
                                                placeholder="+255 123 456 789"
                                                className="h-11 text-base"
                                                required
                                            />
                                        </MobileFormField>
                                    </MobileInputGroup>

                                    <MobileFormField
                                        label="Recipient Address"
                                        required
                                        error={errors.recipient_address}
                                    >
                                        <Textarea
                                            value={data.recipient_address}
                                            onChange={(e) => setData('recipient_address', e.target.value)}
                                            placeholder="Complete delivery address with street, city, and postal code"
                                            rows={2}
                                            required
                                        />
                                    </MobileFormField>
                                </div>
                            </div>
                        </MobileFormSection>

                        {/* Package Details */}
                        <MobileFormSection
                            title="Package Details"
                            icon={Package}
                            description="Weight, dimensions, and value information"
                            variant="card"
                        >
                            <MobileInputGroup columns={2}>
                                <MobileFormField
                                    label="Total Weight (kg)"
                                    required
                                    error={errors.weight_kg}
                                    description="Auto-calculated from items, or enter manually"
                                >
                                    <div className="relative">
                                        <Weight className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="weight_kg"
                                            type="number"
                                            step="0.1"
                                            min="0.01"
                                            value={data.weight_kg}
                                            onChange={(e) => setData('weight_kg', parseFloat(e.target.value) || 0)}
                                            className="pl-8 h-11 text-base"
                                            placeholder="0.0"
                                        />
                                    </div>
                                </MobileFormField>

                                <MobileFormField
                                    label="Total Value (TSh)"
                                    required
                                    error={errors.declared_value}
                                    description="Auto-calculated from items, or enter manually"
                                >
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="declared_value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.declared_value}
                                            onChange={(e) => setData('declared_value', parseFloat(e.target.value) || 0)}
                                            className="pl-8 h-11 text-base"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </MobileFormField>
                            </MobileInputGroup>

                            <MobileFormField
                                label="Package Dimensions (L x W x H cm)"
                                error={errors.dimensions}
                                description="Enter dimensions separated by 'x' (e.g., 30 x 20 x 15)"
                            >
                                <div className="relative">
                                    <Ruler className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="dimensions"
                                        value={data.dimensions}
                                        onChange={(e) => handleDimensionsChange(e.target.value)}
                                        placeholder="e.g., 30 x 20 x 15"
                                        className="pl-8 h-11 text-base"
                                    />
                                </div>
                            </MobileFormField>

                            <MobileFormField
                                label="Special Instructions"
                                error={errors.special_instructions}
                                description="Any special handling requirements (optional)"
                            >
                                <Textarea
                                    id="special_instructions"
                                    value={data.special_instructions}
                                    onChange={(e) => setData('special_instructions', e.target.value)}
                                    placeholder="Fragile items, delivery instructions, etc."
                                    rows={3}
                                />
                            </MobileFormField>
                        </MobileFormSection>

                        {/* Pickup & Delivery Locations */}
                        <MobileFormSection
                            title="Pickup & Delivery"
                            icon={Truck}
                            description="Warehouse and address information"
                            variant="card"
                        >
                            <div className="space-y-6">
                                {/* Origin Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-foreground flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Pickup Location
                                    </h4>

                                    <MobileFormField
                                        label="Origin Warehouse"
                                        error={errors.origin_warehouse_id}
                                        description="Select warehouse for pickup (optional)"
                                    >
                                        <Select
                                            value={data.origin_warehouse_id}
                                            onValueChange={(value) => setData('origin_warehouse_id', value)}
                                        >
                                            <SelectTrigger className="h-11 text-base">
                                                <SelectValue placeholder="Select warehouse..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no-warehouse">No warehouse</SelectItem>
                                                {warehouses.map((warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{warehouse.name}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {warehouse.code} • {warehouse.city}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </MobileFormField>

                                    <MobileFormField
                                        label="Pickup Address"
                                        required
                                        error={errors.origin_address}
                                        description="Complete address where package will be picked up"
                                    >
                                        <Textarea
                                            id="origin_address"
                                            value={data.origin_address}
                                            onChange={(e) => setData('origin_address', e.target.value)}
                                            placeholder="Street address, building, city, postal code..."
                                            rows={2}
                                            required
                                        />
                                    </MobileFormField>
                                </div>

                                {/* Destination Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-foreground flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Delivery Location
                                    </h4>

                                    <MobileFormField
                                        label="Destination Warehouse"
                                        error={errors.destination_warehouse_id}
                                        description="Select warehouse for delivery (optional)"
                                    >
                                        <Select
                                            value={data.destination_warehouse_id}
                                            onValueChange={(value) => setData('destination_warehouse_id', value)}
                                        >
                                            <SelectTrigger className="h-11 text-base">
                                                <SelectValue placeholder="Select warehouse..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no-warehouse">No warehouse</SelectItem>
                                                {warehouses.map((warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{warehouse.name}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {warehouse.code} • {warehouse.city}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </MobileFormField>

                                    <MobileFormField
                                        label="Delivery Address"
                                        required
                                        error={errors.destination_address}
                                        description="Complete address where package will be delivered"
                                    >
                                        <Textarea
                                            id="destination_address"
                                            value={data.destination_address}
                                            onChange={(e) => setData('destination_address', e.target.value)}
                                            placeholder="Street address, building, city, postal code..."
                                            rows={2}
                                            required
                                        />
                                    </MobileFormField>
                                </div>
                            </div>
                        </MobileFormSection>

                        {/* Shipment Items */}
                        <MobileFormSection
                            title="Shipment Items"
                            icon={Package}
                            description="Add items included in this shipment"
                            variant="card"
                            action={
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            }
                        >
                            <div className="space-y-6">
                                {items.map((item, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-foreground flex items-center">
                                                <Package className="h-4 w-4 mr-2" />
                                                Item {index + 1}
                                            </h4>
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <MobileFormField
                                                label="Item Description"
                                                required
                                                description="What is being shipped?"
                                            >
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    placeholder="e.g., Electronics, Documents, Clothing..."
                                                    className="h-11 text-base"
                                                    required
                                                />
                                            </MobileFormField>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                    label="Weight (kg)"
                                                    required
                                                >
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        value={item.weight}
                                                        onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                                                        className="h-11 text-base"
                                                        placeholder="0.0"
                                                    />
                                                </MobileFormField>

                                                <MobileFormField
                                                    label="Value (TSh)"
                                                    required
                                                >
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.value}
                                                        onChange={(e) => updateItem(index, 'value', parseFloat(e.target.value) || 0)}
                                                        className="h-11 text-base"
                                                        placeholder="0.00"
                                                    />
                                                </MobileFormField>
                                            </div>

                                            <MobileFormField
                                                label="Dimensions (L x W x H cm)"
                                                description="Optional - item dimensions"
                                            >
                                                <Input
                                                    value={item.dimensions}
                                                    onChange={(e) => updateItem(index, 'dimensions', e.target.value)}
                                                    placeholder="e.g., 30 x 20 x 15"
                                                    className="h-11 text-base"
                                                />
                                            </MobileFormField>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </MobileFormSection>

                        {/* Submit Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                            <Button type="button" variant="outline" className="flex-1 h-11" asChild>
                                <Link href="/admin/shipments">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="flex-1 h-11">
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating Shipment...
                                    </>
                                ) : (
                                    <>
                                        <Package className="h-4 w-4 mr-2" />
                                        Create Shipment
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </MobileForm>
            </div>
        </AppLayout>
    );
}
