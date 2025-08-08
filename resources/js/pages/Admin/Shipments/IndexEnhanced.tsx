import { AdvancedFilters } from '@/components/ui/advanced-filters';
import { Badge } from '@/components/ui/badge';
import { BulkOperations, BulkSelectCheckbox, commonBulkActions } from '@/components/ui/bulk-operations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Bell, CheckCircle, Clock, DollarSign, Download, Eye, Package, Plus, RefreshCw, Send, Truck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Shipment {
    id: number;
    tracking_number: string;
    customer: {
        company_name: string;
        customer_code: string;
    };
    status: string;
    service_type: string;
    origin_warehouse?: {
        name: string;
        city: string;
    };
    destination_warehouse?: {
        name: string;
        city: string;
    };
    recipient_name: string;
    recipient_address: string;
    declared_value: number;
    weight_kg: number;
    created_at: string;
    estimated_delivery_date?: string;
}

interface ShipmentStats {
    total_shipments: number;
    pending_shipments: number;
    in_transit_shipments: number;
    delivered_shipments: number;
    total_value: number;
    avg_delivery_time: number;
}

interface Props {
    shipments: {
        data: Shipment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: ShipmentStats;
    filters: any;
}

export default function ShipmentsIndexEnhanced({ shipments, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [filterValues, setFilterValues] = useState(filters || {});
    const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

    // Real-time updates simulation
    useEffect(() => {
        if (!isRealTimeEnabled) return;

        const interval = setInterval(() => {
            // Simulate real-time updates
            router.reload({ only: ['shipments', 'stats'] });
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [isRealTimeEnabled]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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
            cancelled: { label: 'Cancelled', variant: 'secondary' as const, icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const, icon: Package };

        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getServiceBadge = (service: string) => {
        const colors = {
            standard: 'bg-blue-100 text-blue-800',
            express: 'bg-orange-100 text-orange-800',
            overnight: 'bg-red-100 text-red-800',
            economy: 'bg-gray-100 text-gray-800',
        };

        const color = colors[service as keyof typeof colors] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}>
                {service.charAt(0).toUpperCase() + service.slice(1)}
            </span>
        );
    };

    // Filter configurations
    const filterConfigs = [
        {
            key: 'search',
            label: 'Search',
            type: 'text' as const,
            placeholder: 'Search by tracking number, customer...',
        },
        {
            key: 'status',
            label: 'Status',
            type: 'multiselect' as const,
            options: [
                { value: 'pending', label: 'Pending', count: stats.pending_shipments },
                { value: 'in_transit', label: 'In Transit', count: stats.in_transit_shipments },
                { value: 'delivered', label: 'Delivered', count: stats.delivered_shipments },
                { value: 'exception', label: 'Exception', count: 5 },
                { value: 'cancelled', label: 'Cancelled', count: 2 },
            ],
        },
        {
            key: 'service_type',
            label: 'Service Type',
            type: 'multiselect' as const,
            options: [
                { value: 'standard', label: 'Standard', count: 45 },
                { value: 'express', label: 'Express', count: 23 },
                { value: 'overnight', label: 'Overnight', count: 12 },
                { value: 'economy', label: 'Economy', count: 8 },
            ],
        },
        {
            key: 'date_range',
            label: 'Date Range',
            type: 'daterange' as const,
        },
        {
            key: 'value_range',
            label: 'Value Range',
            type: 'number' as const,
            placeholder: 'Minimum value',
        },
    ];

    // Bulk actions for shipments
    const bulkActions = [
        ...commonBulkActions,
        {
            id: 'update_status',
            label: 'Update Status',
            icon: RefreshCw,
            variant: 'outline' as const,
        },
        {
            id: 'send_notification',
            label: 'Send Notification',
            icon: Send,
            variant: 'outline' as const,
        },
        {
            id: 'generate_labels',
            label: 'Generate Labels',
            icon: Download,
            variant: 'outline' as const,
        },
    ];

    const handleSelectAll = () => {
        setSelectedItems(shipments.data.map((s) => s.id.toString()));
    };

    const handleSelectNone = () => {
        setSelectedItems([]);
    };

    const handleToggleItem = (id: string) => {
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
        console.log(`Executing ${actionId} on items:`, selectedIds);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Handle different actions
        switch (actionId) {
            case 'delete':
                router.post('/admin/shipments/bulk-delete', { ids: selectedIds });
                break;
            case 'update_status':
                router.post('/admin/shipments/bulk-status', { ids: selectedIds, status: 'in_transit' });
                break;
            case 'send_notification':
                router.post('/admin/shipments/bulk-notify', { ids: selectedIds });
                break;
            case 'export':
                router.post('/admin/shipments/export', { ids: selectedIds });
                break;
            default:
                console.log('Unknown action:', actionId);
        }

        setSelectedItems([]);
    };

    const handleFilterChange = (newFilters: any) => {
        setFilterValues(newFilters);
        router.get('/admin/shipments', newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange({ ...filterValues, search: searchTerm });
    };

    return (
        <AppLayout>
            <Head title="Shipments" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shipments</h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage and track all shipments</p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button
                            variant={isRealTimeEnabled ? 'default' : 'outline'}
                            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                            className="w-full sm:w-auto"
                        >
                            <Bell className="mr-2 h-4 w-4" />
                            {isRealTimeEnabled ? 'Live Updates On' : 'Enable Live Updates'}
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/shipments/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Shipment
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                                    <p className="text-2xl font-bold">{stats.total_shipments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                                    <p className="text-2xl font-bold">{stats.in_transit_shipments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.total_value)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Delivery</p>
                                    <p className="text-2xl font-bold">{stats.avg_delivery_time}d</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Advanced Filters */}
                <AdvancedFilters configs={filterConfigs} values={filterValues} onChange={handleFilterChange} />

                {/* Bulk Operations */}
                <BulkOperations
                    selectedItems={selectedItems}
                    totalItems={shipments.data.length}
                    onSelectAll={handleSelectAll}
                    onSelectNone={handleSelectNone}
                    onToggleItem={handleToggleItem}
                    actions={bulkActions}
                    onAction={handleBulkAction}
                />

                {/* Shipments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipments ({shipments.total})</CardTitle>
                        <CardDescription>
                            Showing {shipments.data.length} of {shipments.total} shipments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-md border">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <BulkSelectCheckbox
                                                    id="all"
                                                    checked={selectedItems.length === shipments.data.length && shipments.data.length > 0}
                                                    onToggle={() =>
                                                        selectedItems.length === shipments.data.length ? handleSelectNone() : handleSelectAll()
                                                    }
                                                />
                                            </TableHead>
                                            <TableHead>Tracking Number</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead className="hidden md:table-cell">Route</TableHead>
                                            <TableHead className="hidden lg:table-cell">Value</TableHead>
                                            <TableHead className="hidden lg:table-cell">Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shipments.data.length > 0 ? (
                                            shipments.data.map((shipment) => (
                                                <TableRow key={shipment.id}>
                                                    <TableCell>
                                                        <BulkSelectCheckbox
                                                            id={shipment.id.toString()}
                                                            checked={selectedItems.includes(shipment.id.toString())}
                                                            onToggle={handleToggleItem}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={`/admin/shipments/${shipment.id}`}
                                                            className="font-medium text-blue-600 hover:underline"
                                                        >
                                                            {shipment.tracking_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{shipment.customer.company_name}</p>
                                                            <p className="text-sm text-muted-foreground">{shipment.customer.customer_code}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                                                    <TableCell>{getServiceBadge(shipment.service_type)}</TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="text-sm">
                                                            <p>{shipment.origin_warehouse?.city || 'N/A'}</p>
                                                            <p className="text-muted-foreground">→ {shipment.recipient_address}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">{formatCurrency(shipment.declared_value)}</TableCell>
                                                    <TableCell className="hidden lg:table-cell">{formatDate(shipment.created_at)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/shipments/${shipment.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                                                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                                    <p>No shipments found.</p>
                                                    <Button variant="outline" size="sm" className="mt-4" asChild>
                                                        <Link href="/admin/shipments/create">Create First Shipment</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
