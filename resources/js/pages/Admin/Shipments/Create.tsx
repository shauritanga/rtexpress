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
    Trash2
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
        origin_warehouse_id: '',
        destination_warehouse_id: '',
        estimated_delivery_date: '',
        declared_value: 0,
        weight_kg: 0,
        dimensions_length_cm: 0,
        dimensions_width_cm: 0,
        dimensions_height_cm: 0,
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
        
        // Update total weight and value
        const totalWeight = newItems.reduce((sum, item) => sum + (parseFloat(item.weight.toString()) || 0), 0);
        const totalValue = newItems.reduce((sum, item) => sum + (parseFloat(item.value.toString()) || 0), 0);
        setData('weight_kg', totalWeight);
        setData('declared_value', totalValue);
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
                                >
                                    <Select
                                        value={data.customer_id}
                                        onValueChange={(value) => setData('customer_id', value)}
                                    >
                                        <SelectTrigger className="h-11 text-base">
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem
                                                    key={customer.id}
                                                    value={customer.id.toString()}
                                                    className="text-base py-3"
                                                >
                                                    {customer.name} ({customer.customer_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </MobileFormField>

                                <MobileFormField
                                    label="Service Type"
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
                                            <SelectItem value="standard" className="text-base py-3">Standard</SelectItem>
                                            <SelectItem value="express" className="text-base py-3">Express</SelectItem>
                                            <SelectItem value="overnight" className="text-base py-3">Overnight</SelectItem>
                                            <SelectItem value="economy" className="text-base py-3">Economy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </MobileFormField>

                                <MobileFormField
                                    label="Estimated Delivery Date"
                                    error={errors.estimated_delivery_date}
                                >
                                    <Input
                                        type="date"
                                        value={data.estimated_delivery_date}
                                        onChange={(e) => setData('estimated_delivery_date', e.target.value)}
                                        className="h-11 text-base"
                                    />
                                </MobileFormField>
                            </MobileInputGroup>
                        </MobileFormSection>

                        {/* Shipment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Shipment Details
                                </CardTitle>
                                <CardDescription>
                                    Package dimensions and value
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Total Weight (kg)</Label>
                                        <div className="relative">
                                            <Weight className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="weight"
                                                type="number"
                                                step="0.1"
                                                value={data.weight}
                                                onChange={(e) => setData('weight', parseFloat(e.target.value) || 0)}
                                                className="pl-8"
                                                readOnly
                                            />
                                        </div>
                                        {errors.weight && (
                                            <p className="text-sm text-red-600">{errors.weight}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="declared_value">Total Value ($)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="declared_value"
                                                type="number"
                                                step="0.01"
                                                value={data.declared_value}
                                                onChange={(e) => setData('declared_value', parseFloat(e.target.value) || 0)}
                                                className="pl-8"
                                                readOnly
                                            />
                                        </div>
                                        {errors.declared_value && (
                                            <p className="text-sm text-red-600">{errors.declared_value}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dimensions">Package Dimensions (L x W x H cm)</Label>
                                    <div className="relative">
                                        <Ruler className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="dimensions"
                                            value={data.dimensions}
                                            onChange={(e) => setData('dimensions', e.target.value)}
                                            placeholder="e.g., 30 x 20 x 15"
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.dimensions && (
                                        <p className="text-sm text-red-600">{errors.dimensions}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="special_instructions">Special Instructions</Label>
                                    <Textarea
                                        id="special_instructions"
                                        value={data.special_instructions}
                                        onChange={(e) => setData('special_instructions', e.target.value)}
                                        placeholder="Any special handling instructions..."
                                        rows={3}
                                    />
                                    {errors.special_instructions && (
                                        <p className="text-sm text-red-600">{errors.special_instructions}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Addresses */}
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Origin
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="origin_warehouse_id">Origin Warehouse (Optional)</Label>
                                    <Select 
                                        value={data.origin_warehouse_id} 
                                        onValueChange={(value) => setData('origin_warehouse_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select origin warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">No warehouse</SelectItem>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name} ({warehouse.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="origin_address">Origin Address *</Label>
                                    <Textarea
                                        id="origin_address"
                                        value={data.origin_address}
                                        onChange={(e) => setData('origin_address', e.target.value)}
                                        placeholder="Enter pickup address..."
                                        rows={3}
                                        required
                                    />
                                    {errors.origin_address && (
                                        <p className="text-sm text-red-600">{errors.origin_address}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Destination
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="destination_warehouse_id">Destination Warehouse (Optional)</Label>
                                    <Select 
                                        value={data.destination_warehouse_id} 
                                        onValueChange={(value) => setData('destination_warehouse_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select destination warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">No warehouse</SelectItem>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name} ({warehouse.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="destination_address">Destination Address *</Label>
                                    <Textarea
                                        id="destination_address"
                                        value={data.destination_address}
                                        onChange={(e) => setData('destination_address', e.target.value)}
                                        placeholder="Enter delivery address..."
                                        rows={3}
                                        required
                                    />
                                    {errors.destination_address && (
                                        <p className="text-sm text-red-600">{errors.destination_address}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shipment Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Shipment Items
                                </span>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                Add items included in this shipment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Item {index + 1}</h4>
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        
                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="space-y-2">
                                                <Label>Description *</Label>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    placeholder="Item description"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label>Quantity</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label>Weight (kg)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={item.weight}
                                                    onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label>Value ($)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.value}
                                                    onChange={(e) => updateItem(index, 'value', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label>Dimensions (L x W x H cm)</Label>
                                            <Input
                                                value={item.dimensions}
                                                onChange={(e) => updateItem(index, 'dimensions', e.target.value)}
                                                placeholder="e.g., 30 x 20 x 15"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/shipments">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Package className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Shipment'}
                        </Button>
                    </div>
                </MobileForm>
            </div>
        </AppLayout>
    );
}
