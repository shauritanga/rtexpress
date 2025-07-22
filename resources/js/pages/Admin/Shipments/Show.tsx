import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Package,
    MapPin,
    Calendar,
    DollarSign,
    User,
    Truck,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Edit,
    ArrowLeft,
    Phone,
    Mail,
    Building,
    Weight,
    Ruler
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    customer_code: string;
}

interface Warehouse {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
}

interface ShipmentItem {
    id: number;
    description: string;
    quantity: number;
    weight: number;
    dimensions: string;
    value: number;
}

interface ShipmentTracking {
    id: number;
    status: string;
    location: string;
    notes?: string;
    created_at: string;
}

interface Shipment {
    id: number;
    tracking_number: string;
    status: string;
    service_type: string;
    origin_address: string;
    destination_address: string;
    estimated_delivery_date?: string;
    actual_delivery_date?: string;
    declared_value: number;
    weight: number;
    dimensions: string;
    special_instructions?: string;
    created_at: string;
    updated_at: string;
    customer: Customer;
    origin_warehouse?: Warehouse;
    destination_warehouse?: Warehouse;
    items: ShipmentItem[];
    tracking: ShipmentTracking[];
}

interface Props {
    shipment: Shipment;
}

export default function ShipmentShow({ shipment }: Props) {
    const [isUpdating, setIsUpdating] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            picked_up: { label: 'Picked Up', variant: 'default' as const, icon: Package },
            in_transit: { label: 'In Transit', variant: 'default' as const, icon: Truck },
            out_for_delivery: { label: 'Out for Delivery', variant: 'default' as const, icon: Truck },
            delivered: { label: 'Delivered', variant: 'success' as const, icon: CheckCircle },
            exception: { label: 'Exception', variant: 'destructive' as const, icon: AlertTriangle },
            cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: Package };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getServiceTypeBadge = (serviceType: string) => {
        const colors = {
            standard: 'bg-blue-100 text-blue-800',
            express: 'bg-orange-100 text-orange-800',
            overnight: 'bg-red-100 text-red-800',
            economy: 'bg-green-100 text-green-800',
        };

        const color = colors[serviceType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
            </span>
        );
    };

    const handleStatusUpdate = (newStatus: string) => {
        setIsUpdating(true);
        router.post(route('admin.shipments.update-status', shipment?.id || 0), {
            status: newStatus,
        }, {
            onFinish: () => setIsUpdating(false),
        });
    };

    return (
        <AppLayout>
            <Head title={`Shipment ${shipment?.tracking_number || 'Unknown'}`} />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/shipments">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Shipments
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {shipment?.tracking_number || 'Unknown Tracking Number'}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Shipment Details
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" asChild className="w-full sm:w-auto">
                            <Link href={route('admin.shipments.edit', shipment?.id || 0)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Shipment
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Status and Service Info */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(shipment?.status || 'pending')}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                                    <div className="mt-1">
                                        {getServiceTypeBadge(shipment?.service_type || 'standard')}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Declared Value</p>
                                    <p className="text-lg font-bold">
                                        {formatCurrency(shipment?.declared_value || 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Est. Delivery</p>
                                    <p className="text-sm font-medium">
                                        {shipment?.estimated_delivery_date
                                            ? formatDate(shipment.estimated_delivery_date)
                                            : 'Not set'
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                <p className="font-medium">{shipment?.customer?.name || 'Unknown Customer'}</p>
                                <p className="text-sm text-muted-foreground">
                                    Code: {shipment?.customer?.customer_code || 'N/A'}
                                </p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{shipment?.customer?.email || 'N/A'}</span>
                                </div>
                                {shipment?.customer?.phone && (
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{shipment.customer.phone}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                Shipment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Weight</p>
                                    <div className="flex items-center space-x-1">
                                        <Weight className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{shipment?.weight || 0} kg</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
                                    <div className="flex items-center space-x-1">
                                        <Ruler className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{shipment?.dimensions || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <p className="text-sm">{formatDateTime(shipment?.created_at || new Date().toISOString())}</p>
                            </div>
                            {shipment?.actual_delivery_date && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                                    <p className="text-sm">{formatDateTime(shipment.actual_delivery_date)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Addresses */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="h-5 w-5 mr-2" />
                                Origin Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{shipment?.origin_address || 'N/A'}</p>
                            {shipment?.origin_warehouse && (
                                <div className="mt-2 pt-2 border-t">
                                    <div className="flex items-center space-x-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {shipment.origin_warehouse.name}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="h-5 w-5 mr-2" />
                                Destination Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{shipment?.destination_address || 'N/A'}</p>
                            {shipment?.destination_warehouse && (
                                <div className="mt-2 pt-2 border-t">
                                    <div className="flex items-center space-x-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {shipment.destination_warehouse.name}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Special Instructions */}
                {shipment?.special_instructions && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Special Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{shipment.special_instructions}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Tracking Events */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Tracking History
                        </CardTitle>
                        <CardDescription>
                            Complete tracking history for this shipment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {shipment?.tracking_events?.length > 0 ? (
                            <div className="space-y-4">
                                {shipment.tracking_events.map((event, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className={`w-3 h-3 rounded-full mt-1 ${
                                                index === 0 ? 'bg-green-500' : 'bg-gray-300'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">
                                                {event.status || 'Status Update'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {event.location || 'Unknown Location'} • {formatDateTime(event.timestamp || new Date().toISOString())}
                                            </p>
                                            {event.description && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground">
                                    No tracking events available yet
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
