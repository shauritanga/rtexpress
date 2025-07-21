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
    Package,
    User,
    MapPin,
    Truck,
    DollarSign,
    Weight,
    Calendar
} from 'lucide-react';

interface Shipment {
    id: number;
    tracking_number: string;
    customer_id: number;
    origin_warehouse_id: number;
    destination_warehouse_id?: number;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    service_type: string;
    status: string;
    declared_value: number;
    weight_kg: number;
    dimensions_length?: number;
    dimensions_width?: number;
    dimensions_height?: number;
    special_instructions?: string;
    estimated_delivery_date?: string;
    assigned_to?: number;
}

interface Customer {
    id: number;
    customer_code: string;
    company_name: string;
}

interface Warehouse {
    id: number;
    code: string;
    name: string;
    city: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    shipment: Shipment;
    customers: Customer[];
    warehouses: Warehouse[];
    users: User[];
}

export default function ShipmentEdit({ shipment, customers, warehouses, users }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: shipment.customer_id,
        origin_warehouse_id: shipment.origin_warehouse_id,
        destination_warehouse_id: shipment.destination_warehouse_id || 0,
        recipient_name: shipment.recipient_name,
        recipient_phone: shipment.recipient_phone,
        recipient_address: shipment.recipient_address,
        service_type: shipment.service_type,
        status: shipment.status,
        declared_value: shipment.declared_value,
        weight_kg: shipment.weight_kg,
        dimensions_length: shipment.dimensions_length || '',
        dimensions_width: shipment.dimensions_width || '',
        dimensions_height: shipment.dimensions_height || '',
        special_instructions: shipment.special_instructions || '',
        estimated_delivery_date: shipment.estimated_delivery_date || '',
        assigned_to: shipment.assigned_to || 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.shipments.update', shipment.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Shipment - ${shipment.tracking_number}`} />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/shipments/${shipment.id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Shipment
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Edit Shipment
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Update shipment details and delivery information
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Shipment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Package className="h-5 w-5" />
                                    <span>Shipment Details</span>
                                </CardTitle>
                                <CardDescription>
                                    Basic shipment information and service details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Tracking Number</Label>
                                    <Input
                                        value={shipment.tracking_number}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Tracking number cannot be changed
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customer_id">Customer *</Label>
                                    <Select 
                                        value={data.customer_id.toString()} 
                                        onValueChange={(value) => setData('customer_id', parseInt(value))}
                                    >
                                        <SelectTrigger className={errors.customer_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.company_name} ({customer.customer_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && (
                                        <p className="text-sm text-red-600">{errors.customer_id}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="service_type">Service Type *</Label>
                                        <Select value={data.service_type} onValueChange={(value) => setData('service_type', value)}>
                                            <SelectTrigger className={errors.service_type ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard</SelectItem>
                                                <SelectItem value="express">Express</SelectItem>
                                                <SelectItem value="overnight">Overnight</SelectItem>
                                                <SelectItem value="economy">Economy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.service_type && (
                                            <p className="text-sm text-red-600">{errors.service_type}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="picked_up">Picked Up</SelectItem>
                                                <SelectItem value="in_transit">In Transit</SelectItem>
                                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="exception">Exception</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600">{errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="declared_value">Declared Value *</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="declared_value"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.declared_value}
                                                onChange={(e) => setData('declared_value', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className={`pl-8 ${errors.declared_value ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.declared_value && (
                                            <p className="text-sm text-red-600">{errors.declared_value}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="weight_kg">Weight (kg) *</Label>
                                        <div className="relative">
                                            <Weight className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="weight_kg"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={data.weight_kg}
                                                onChange={(e) => setData('weight_kg', parseFloat(e.target.value) || 0)}
                                                placeholder="0.0"
                                                className={`pl-8 ${errors.weight_kg ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.weight_kg && (
                                            <p className="text-sm text-red-600">{errors.weight_kg}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimated_delivery_date">Estimated Delivery Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="estimated_delivery_date"
                                            type="date"
                                            value={data.estimated_delivery_date}
                                            onChange={(e) => setData('estimated_delivery_date', e.target.value)}
                                            className={`pl-8 ${errors.estimated_delivery_date ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.estimated_delivery_date && (
                                        <p className="text-sm text-red-600">{errors.estimated_delivery_date}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recipient & Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Recipient & Location</span>
                                </CardTitle>
                                <CardDescription>
                                    Delivery recipient and address information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipient_name">Recipient Name *</Label>
                                    <Input
                                        id="recipient_name"
                                        type="text"
                                        value={data.recipient_name}
                                        onChange={(e) => setData('recipient_name', e.target.value)}
                                        placeholder="Full name of recipient"
                                        className={errors.recipient_name ? 'border-red-500' : ''}
                                    />
                                    {errors.recipient_name && (
                                        <p className="text-sm text-red-600">{errors.recipient_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recipient_phone">Recipient Phone *</Label>
                                    <Input
                                        id="recipient_phone"
                                        type="tel"
                                        value={data.recipient_phone}
                                        onChange={(e) => setData('recipient_phone', e.target.value)}
                                        placeholder="Phone number"
                                        className={errors.recipient_phone ? 'border-red-500' : ''}
                                    />
                                    {errors.recipient_phone && (
                                        <p className="text-sm text-red-600">{errors.recipient_phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recipient_address">Delivery Address *</Label>
                                    <Textarea
                                        id="recipient_address"
                                        value={data.recipient_address}
                                        onChange={(e) => setData('recipient_address', e.target.value)}
                                        placeholder="Complete delivery address"
                                        className={errors.recipient_address ? 'border-red-500' : ''}
                                        rows={3}
                                    />
                                    {errors.recipient_address && (
                                        <p className="text-sm text-red-600">{errors.recipient_address}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="origin_warehouse_id">Origin Warehouse *</Label>
                                        <Select 
                                            value={data.origin_warehouse_id.toString()} 
                                            onValueChange={(value) => setData('origin_warehouse_id', parseInt(value))}
                                        >
                                            <SelectTrigger className={errors.origin_warehouse_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select origin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {warehouses.map((warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                        {warehouse.name} ({warehouse.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.origin_warehouse_id && (
                                            <p className="text-sm text-red-600">{errors.origin_warehouse_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="destination_warehouse_id">Destination Warehouse</Label>
                                        <Select
                                            value={data.destination_warehouse_id.toString()}
                                            onValueChange={(value) => setData('destination_warehouse_id', value === '0' ? null : parseInt(value))}
                                        >
                                            <SelectTrigger className={errors.destination_warehouse_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select destination (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">None</SelectItem>
                                                {warehouses.map((warehouse) => (
                                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                        {warehouse.name} ({warehouse.code})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.destination_warehouse_id && (
                                            <p className="text-sm text-red-600">{errors.destination_warehouse_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="assigned_to">Assigned To</Label>
                                    <Select
                                        value={data.assigned_to.toString()}
                                        onValueChange={(value) => setData('assigned_to', value === '0' ? null : parseInt(value))}
                                    >
                                        <SelectTrigger className={errors.assigned_to ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Assign to user (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Unassigned</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.assigned_to && (
                                        <p className="text-sm text-red-600">{errors.assigned_to}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                            <CardDescription>
                                Package dimensions and special instructions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="dimensions_length">Length (cm)</Label>
                                    <Input
                                        id="dimensions_length"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={data.dimensions_length}
                                        onChange={(e) => setData('dimensions_length', parseFloat(e.target.value) || '')}
                                        placeholder="0.0"
                                        className={errors.dimensions_length ? 'border-red-500' : ''}
                                    />
                                    {errors.dimensions_length && (
                                        <p className="text-sm text-red-600">{errors.dimensions_length}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dimensions_width">Width (cm)</Label>
                                    <Input
                                        id="dimensions_width"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={data.dimensions_width}
                                        onChange={(e) => setData('dimensions_width', parseFloat(e.target.value) || '')}
                                        placeholder="0.0"
                                        className={errors.dimensions_width ? 'border-red-500' : ''}
                                    />
                                    {errors.dimensions_width && (
                                        <p className="text-sm text-red-600">{errors.dimensions_width}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dimensions_height">Height (cm)</Label>
                                    <Input
                                        id="dimensions_height"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={data.dimensions_height}
                                        onChange={(e) => setData('dimensions_height', parseFloat(e.target.value) || '')}
                                        placeholder="0.0"
                                        className={errors.dimensions_height ? 'border-red-500' : ''}
                                    />
                                    {errors.dimensions_height && (
                                        <p className="text-sm text-red-600">{errors.dimensions_height}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="special_instructions">Special Instructions</Label>
                                <Textarea
                                    id="special_instructions"
                                    value={data.special_instructions}
                                    onChange={(e) => setData('special_instructions', e.target.value)}
                                    placeholder="Any special handling or delivery instructions..."
                                    className={errors.special_instructions ? 'border-red-500' : ''}
                                    rows={3}
                                />
                                {errors.special_instructions && (
                                    <p className="text-sm text-red-600">{errors.special_instructions}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/admin/shipments/${shipment.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Shipment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
