import { ExportModal } from '@/components/admin/ExportModal';
import { MobileTable } from '@/components/admin/mobile-table';
import { ServiceBadge, StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Edit, Eye, Filter, Package, Plus, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';

interface Shipment {
    id: number;
    tracking_number: string;
    customer: {
        company_name: string;
        customer_code: string;
    };
    status: string;
    service_type: string;
    origin_warehouse: {
        name: string;
        city: string;
    };
    destination_warehouse?: {
        name: string;
        city: string;
    };
    recipient_name: string;
    weight_kg: number;
    declared_value: number;
    created_at: string;
    estimated_delivery_date?: string;
}

interface Props {
    shipments?: {
        data: Shipment[];
        links: any[];
        meta: any;
    };
    customers?: any[];
    warehouses?: any[];
    filters?: {
        search?: string;
        status?: string;
        service_type?: string;
        customer_id?: string;
    };
    stats?: {
        total: number;
        pending: number;
        in_transit: number;
        delivered: number;
        overdue: number;
        today: number;
    };
}

export default function ShipmentsIndex({
    shipments = { data: [], links: [], meta: { total: 0 } },
    customers = [],
    warehouses = [],
    filters = {},
    stats = { total: 0, pending: 0, in_transit: 0, delivered: 0, overdue: 0, today: 0 },
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [selectedServiceType, setSelectedServiceType] = useState(filters?.service_type || 'all');

    const handleSearch = () => {
        router.get(
            '/admin/shipments',
            {
                search: searchTerm,
                status: selectedStatus === 'all' ? '' : selectedStatus,
                service_type: selectedServiceType === 'all' ? '' : selectedServiceType,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Define table columns for mobile-responsive table
    const columns = [
        {
            key: 'tracking_number',
            label: 'Tracking #',
            render: (value: string, row: Shipment) => (
                <Link href={`/admin/shipments/${row.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {value}
                </Link>
            ),
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (customer: any) => (
                <div>
                    <p className="font-medium">{customer.company_name}</p>
                    <p className="text-sm text-muted-foreground">{customer.customer_code}</p>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (status: string) => <StatusBadge status={status} />,
        },
        {
            key: 'service_type',
            label: 'Service',
            tabletHidden: true,
            render: (serviceType: string) => <ServiceBadge serviceType={serviceType} />,
        },
        {
            key: 'route',
            label: 'Route',
            tabletHidden: true,
            render: (_: any, row: Shipment) => (
                <div className="text-sm">
                    <p>{row.origin_warehouse.city}</p>
                    <p className="text-muted-foreground">→ {row.destination_warehouse?.city || row.recipient_name}</p>
                </div>
            ),
        },
        {
            key: 'weight_kg',
            label: 'Weight',
            tabletHidden: true,
            render: (weight: number) => `${weight} kg`,
        },
        {
            key: 'declared_value',
            label: 'Value',
            desktopOnly: true,
            render: (value: number) =>
                new Intl.NumberFormat('sw-TZ', {
                    style: 'currency',
                    currency: 'TZS',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(value),
        },
        {
            key: 'created_at',
            label: 'Created',
            desktopOnly: true,
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
    ];

    const actions = [
        {
            label: 'View',
            href: '/admin/shipments/:id',
            icon: Eye,
        },
        {
            label: 'Update Status',
            href: '/admin/shipments/:id#status-update',
            icon: RefreshCw,
            variant: 'default' as const,
        },
        {
            label: 'Edit',
            href: '/admin/shipments/:id/edit',
            icon: Edit,
        },
    ];

    const statsCards = [
        { title: 'Total', value: stats?.total || 0, color: 'text-blue-600' },
        { title: 'Pending', value: stats?.pending || 0, color: 'text-yellow-600' },
        { title: 'In Transit', value: stats?.in_transit || 0, color: 'text-purple-600' },
        { title: 'Delivered', value: stats?.delivered || 0, color: 'text-green-600' },
        { title: 'Overdue', value: stats?.overdue || 0, color: 'text-red-600' },
        { title: 'Today', value: stats?.today || 0, color: 'text-blue-600' },
    ];

    return (
        <AppLayout>
            <Head title="Shipments Management" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Shipments</h1>
                        <p className="text-muted-foreground">Manage and track all shipments</p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <ExportModal
                            type="shipments"
                            filters={{
                                search: searchTerm,
                                status: selectedStatus === 'all' ? '' : selectedStatus,
                                service_type: selectedServiceType === 'all' ? '' : selectedServiceType,
                            }}
                            trigger={
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            }
                        />
                        <Button size="sm" asChild>
                            <Link href="/admin/shipments/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Shipment
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {statsCards.map((stat) => (
                        <Card key={stat.title}>
                            <CardContent className="p-4">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filters</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search shipments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="picked_up">Picked Up</SelectItem>
                                    <SelectItem value="in_transit">In Transit</SelectItem>
                                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="exception">Exception</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Services" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Services</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="express">Express</SelectItem>
                                    <SelectItem value="overnight">Overnight</SelectItem>
                                    <SelectItem value="international">International</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleSearch} className="w-full">
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipments List</CardTitle>
                        <CardDescription>{shipments?.meta?.total || 0} total shipments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MobileTable
                            data={shipments?.data || []}
                            columns={columns}
                            actions={actions}
                            emptyState={{
                                icon: Package,
                                title: 'No shipments found',
                                description: 'Try adjusting your filters or create a new shipment',
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
