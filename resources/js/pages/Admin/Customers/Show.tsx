import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    ArrowLeft,
    User,
    Building,
    MapPin,
    Mail,
    Phone,
    CreditCard,
    Edit,
    Package,
    DollarSign,
    Calendar,
    TrendingUp,
    UserCheck,
    UserX,
    AlertTriangle
} from 'lucide-react';

interface Shipment {
    id: number;
    tracking_number: string;
    status: string;
    service_type: string;
    destination_address: string;
    declared_value: number;
    created_at: string;
}

interface Customer {
    id: number;
    customer_code: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    payment_terms: string;
    credit_limit: number;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    shipments: Shipment[];
    total_spent: number;
    shipments_count: number;
}

interface Props {
    customer: Customer;
}

export default function CustomerShow({ customer }: Props) {
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

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Active', variant: 'success' as const, icon: UserCheck },
            inactive: { label: 'Inactive', variant: 'secondary' as const, icon: UserX },
            suspended: { label: 'Suspended', variant: 'destructive' as const, icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: User };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getPaymentTermsBadge = (terms: string) => {
        const colors = {
            'net_30': 'bg-blue-100 text-blue-800',
            'net_15': 'bg-green-100 text-green-800',
            'net_7': 'bg-yellow-100 text-yellow-800',
            'cod': 'bg-red-100 text-red-800',
            'prepaid': 'bg-purple-100 text-purple-800',
        };

        const color = colors[terms as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {terms.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const getShipmentStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            picked_up: 'bg-blue-100 text-blue-800',
            in_transit: 'bg-blue-100 text-blue-800',
            out_for_delivery: 'bg-orange-100 text-orange-800',
            delivered: 'bg-green-100 text-green-800',
            exception: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };

        const color = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </span>
        );
    };

    const handleToggleStatus = () => {
        router.post(route('admin.customers.toggle-status', customer?.id || 0));
    };

    return (
        <AppLayout>
            <Head title={`Customer ${customer?.customer_code || 'Unknown'}`} />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/customers">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Customers
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {customer?.company_name || 'Unknown Company'}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Customer Code: {customer?.customer_code || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" asChild className="w-full sm:w-auto">
                            <Link href={route('admin.customers.edit', customer?.id || 0)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Customer
                            </Link>
                        </Button>
                        <Button
                            variant={customer?.status === 'active' ? 'destructive' : 'default'}
                            onClick={handleToggleStatus}
                            className="w-full sm:w-auto"
                        >
                            {customer?.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                </div>

                {/* Status and Stats Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(customer?.status || 'inactive')}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                                    <p className="text-2xl font-bold">{customer?.shipments_count || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                                    <p className="text-2xl font-bold">{formatCurrency(customer?.total_spent || 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Credit Limit</p>
                                    <p className="text-2xl font-bold">{formatCurrency(customer?.credit_limit || 0)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                                <p className="font-medium">{customer?.contact_person || 'N/A'}</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{customer?.email || 'N/A'}</span>
                                </div>
                                {customer?.phone && (
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{customer.phone}</span>
                                    </div>
                                )}
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payment Terms</p>
                                <div className="mt-1">
                                    {getPaymentTermsBadge(customer?.payment_terms || 'net_30')}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="h-5 w-5 mr-2" />
                                Address Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Business Address</p>
                                <div className="mt-1">
                                    <p className="text-sm">{customer?.address_line_1 || 'N/A'}</p>
                                    {customer?.address_line_2 && (
                                        <p className="text-sm">{customer.address_line_2}</p>
                                    )}
                                    <p className="text-sm">
                                        {customer?.city || 'Unknown'}, {customer?.state_province || 'Unknown'} {customer?.postal_code || ''}
                                    </p>
                                    <p className="text-sm font-medium">{customer?.country || 'Unknown'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{formatDate(customer?.created_at || new Date().toISOString())}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notes */}
                {customer?.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Shipments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                Recent Shipments
                            </span>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/shipments?customer_id=${customer?.id || 0}`}>
                                    View All
                                </Link>
                            </Button>
                        </CardTitle>
                        <CardDescription>
                            Latest shipments for this customer
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customer?.shipments?.length > 0 ? (
                            <div className="rounded-md border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tracking Number</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Destination</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customer?.shipments?.slice(0, 5).map((shipment) => (
                                                <TableRow key={shipment.id}>
                                                    <TableCell>
                                                        <Link 
                                                            href={route('admin.shipments.show', shipment.id)}
                                                            className="font-medium text-blue-600 hover:underline"
                                                        >
                                                            {shipment.tracking_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getShipmentStatusBadge(shipment.status)}
                                                    </TableCell>
                                                    <TableCell className="capitalize">
                                                        {shipment.service_type}
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm truncate max-w-[200px]">
                                                            {shipment.destination_address}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(shipment.declared_value)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(shipment.created_at)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                <p>No shipments found for this customer.</p>
                                <Button variant="outline" size="sm" className="mt-4" asChild>
                                    <Link href={`/admin/shipments/create?customer_id=${customer?.id || 0}`}>
                                        Create First Shipment
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
