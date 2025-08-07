import { Head, Link, useForm } from '@inertiajs/react';
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
    Route,
    User,
    Truck,
    Calendar,
    Clock,
    MapPin,
    Package
} from 'lucide-react';

interface Driver {
    id: number;
    name: string;
    driver_id: string;
    vehicle_type: string;
    vehicle_capacity: number;
}

interface Warehouse {
    id: number;
    name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province: string;
}

interface Shipment {
    id: number;
    tracking_number: string;
    customer: {
        company_name: string;
    };
    origin: {
        address: string;
    };
    destination: {
        address: string;
    };
}

interface Props {
    drivers: Driver[];
    warehouses: Warehouse[];
    pendingShipments: Shipment[];
}

export default function RouteCreate({ drivers, warehouses, pendingShipments }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        driver_id: '',
        warehouse_id: '',
        delivery_date: '',
        planned_start_time: '09:00',
        planned_end_time: '17:00',
        notes: '',
        shipments: [] as any[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Route form data being submitted:', data);
        post(route('admin.routes.store'), {
            onSuccess: () => {
                console.log('Route created successfully');
            },
            onError: (errors) => {
                console.log('Route creation errors:', errors);
            },
            onFinish: () => {
                console.log('Route creation finished');
            }
        });
    };

    const addShipmentToRoute = (shipment: Shipment, type: 'pickup' | 'delivery') => {
        setData('shipments', [...data.shipments, {
            shipment_id: shipment.id,
            type: type,
            priority: 'medium', // Default priority
            tracking_number: shipment.tracking_number,
            customer_name: shipment.customer.company_name,
            address: type === 'pickup' ? shipment.origin.address : shipment.destination.address,
        }]);
    };

    const removeShipmentFromRoute = (index: number) => {
        const newShipments = data.shipments.filter((_, i) => i !== index);
        setData('shipments', newShipments);
    };

    return (
        <AppLayout>
            <Head title="Create Route" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/routes">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Routes
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Create New Route
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Plan a new delivery route with driver and shipments
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Error Display */}
                    {errors.error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error creating route
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{errors.error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Route Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Route className="h-5 w-5" />
                                    <span>Route Information</span>
                                </CardTitle>
                                <CardDescription>
                                    Basic route details and scheduling
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="driver_id">Driver *</Label>
                                    <Select 
                                        value={data.driver_id} 
                                        onValueChange={(value) => setData('driver_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {drivers.map((driver) => (
                                                <SelectItem key={driver.id} value={driver.id.toString()}>
                                                    {driver.name} ({driver.driver_id}) - {driver.vehicle_type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.driver_id && (
                                        <p className="text-sm text-red-600">{errors.driver_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="warehouse_id">Starting Warehouse *</Label>
                                    <Select 
                                        value={data.warehouse_id} 
                                        onValueChange={(value) => setData('warehouse_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select starting warehouse" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                    {warehouse.name} - {warehouse.city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.warehouse_id && (
                                        <p className="text-sm text-red-600">{errors.warehouse_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="delivery_date">Delivery Date *</Label>
                                    <Input
                                        id="delivery_date"
                                        type="date"
                                        value={data.delivery_date}
                                        onChange={(e) => setData('delivery_date', e.target.value)}
                                        className={errors.delivery_date ? 'border-red-500' : ''}
                                    />
                                    {errors.delivery_date && (
                                        <p className="text-sm text-red-600">{errors.delivery_date}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="planned_start_time">Start Time</Label>
                                        <Input
                                            id="planned_start_time"
                                            type="time"
                                            value={data.planned_start_time}
                                            onChange={(e) => setData('planned_start_time', e.target.value)}
                                            className={errors.planned_start_time ? 'border-red-500' : ''}
                                        />
                                        {errors.planned_start_time && (
                                            <p className="text-sm text-red-600">{errors.planned_start_time}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="planned_end_time">End Time</Label>
                                        <Input
                                            id="planned_end_time"
                                            type="time"
                                            value={data.planned_end_time}
                                            onChange={(e) => setData('planned_end_time', e.target.value)}
                                            className={errors.planned_end_time ? 'border-red-500' : ''}
                                        />
                                        {errors.planned_end_time && (
                                            <p className="text-sm text-red-600">{errors.planned_end_time}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional notes for this route..."
                                        rows={3}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipment Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Package className="h-5 w-5" />
                                    <span>Available Shipments</span>
                                </CardTitle>
                                <CardDescription>
                                    Select shipments to add to this route
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {pendingShipments.length > 0 ? (
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {pendingShipments.map((shipment) => (
                                            <div key={shipment.id} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-sm">{shipment.tracking_number}</p>
                                                        <p className="text-xs text-muted-foreground">{shipment.customer.company_name}</p>
                                                        <p className="text-xs">From: {shipment.origin.address}</p>
                                                        <p className="text-xs">To: {shipment.destination.address}</p>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => addShipmentToRoute(shipment, 'pickup')}
                                                        >
                                                            Pickup
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => addShipmentToRoute(shipment, 'delivery')}
                                                        >
                                                            Delivery
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No pending shipments available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Selected Shipments */}
                    {data.shipments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Route Stops ({data.shipments.length})</CardTitle>
                                <CardDescription>
                                    Shipments added to this route
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {data.shipments.map((shipment, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    {shipment.type === 'pickup' ? '📦' : '🚚'} {shipment.tracking_number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{shipment.customer_name}</p>
                                                <p className="text-xs">{shipment.address}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Select
                                                    value={shipment.priority}
                                                    onValueChange={(value) => {
                                                        const newShipments = [...data.shipments];
                                                        newShipments[index].priority = value;
                                                        setData('shipments', newShipments);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-24">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                        <SelectItem value="urgent">Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => removeShipmentFromRoute(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href="/admin/routes">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Route'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
