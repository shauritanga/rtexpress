import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import {
    Search,
    Plus,
    Warehouse,
    Package,
    MapPin,
    Eye,
    Edit,
    Filter,
    Building,
    Users,
    TrendingUp,
    Activity,
    MoreHorizontal,
    Clock,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface Warehouse {
    id: number;
    warehouse_code: string;
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    phone?: string;
    email?: string;
    manager_name?: string;
    status: string;
    capacity: number;
    current_utilization: number;
    created_at: string;
    shipments_count: number;
    inventory_count: number;
    formatted_operating_hours: string;
    short_operating_hours: string;
}

interface Stats {
    total_warehouses: number;
    active_warehouses: number;
    total_capacity: number;
    avg_utilization: number;
    total_inventory: number;
    total_shipments: number;
}

interface Props {
    warehouses: {
        data: Warehouse[];
        meta: any;
        links: any[];
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        type?: string;
        country?: string;
    };
}

export default function WarehousesIndex({ warehouses, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');

    // Simple delete function using form submission
    const handleDelete = (warehouseId: number) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) {
            console.error('CSRF token not found');
            alert('Security token not found. Please refresh the page and try again.');
            return;
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('admin.warehouses.destroy', warehouseId);

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Add method override for DELETE
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'DELETE';
        form.appendChild(methodInput);

        document.body.appendChild(form);
        form.submit();
    };
    const [selectedCountry, setSelectedCountry] = useState(filters.country || '');

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
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
            active: { label: 'Active', variant: 'success' as const, icon: Activity },
            inactive: { label: 'Inactive', variant: 'secondary' as const, icon: Activity },
            maintenance: { label: 'Maintenance', variant: 'destructive' as const, icon: Activity },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: Activity };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        const colors = {
            distribution: 'bg-blue-100 text-blue-800',
            fulfillment: 'bg-green-100 text-green-800',
            storage: 'bg-purple-100 text-purple-800',
            cross_dock: 'bg-orange-100 text-orange-800',
        };

        const color = colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
            </span>
        );
    };

    const getUtilizationColor = (utilization: number) => {
        if (utilization >= 90) return 'text-red-600';
        if (utilization >= 75) return 'text-orange-600';
        if (utilization >= 50) return 'text-yellow-600';
        return 'text-green-600';
    };

    const handleSearch = () => {
        router.get(route('admin.warehouses.index'), {
            search: searchTerm,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            type: selectedType !== 'all' ? selectedType : undefined,
            country: selectedCountry || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedType('all');
        setSelectedCountry('');
        
        router.get(route('admin.warehouses.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Warehouse Management" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Warehouse Management</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Manage warehouse facilities and operations
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/warehouses/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Warehouse
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Warehouse className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Warehouses</p>
                                    <p className="text-2xl font-bold">{stats.total_warehouses}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.active_warehouses} active
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Building className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                                    <p className="text-2xl font-bold">{formatNumber(stats.total_capacity)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.avg_utilization}% avg utilization
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Inventory</p>
                                    <p className="text-2xl font-bold">{formatNumber(stats.total_inventory)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Items stored
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                                    <p className="text-2xl font-bold">{formatNumber(stats.total_shipments)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        All time
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filter Warehouses
                        </CardTitle>
                        <CardDescription>
                            Search and filter warehouses by various criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Name, code, location..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="distribution">Distribution</SelectItem>
                                        <SelectItem value="fulfillment">Fulfillment</SelectItem>
                                        <SelectItem value="storage">Storage</SelectItem>
                                        <SelectItem value="cross_dock">Cross Dock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Actions</label>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                    <Button onClick={handleSearch} className="flex-1">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                    <Button variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-none">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Warehouses Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Warehouses</CardTitle>
                        <CardDescription>
                            All warehouse facilities and their operational status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveTable
                            data={warehouses.data}
                            columns={[
                                {
                                    key: 'name',
                                    label: 'Warehouse',
                                    mobileVisible: true,
                                    mobilePriority: 1,
                                    render: (value, warehouse) => (
                                        <div>
                                            <p className="font-medium text-base">{warehouse.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {warehouse.warehouse_code}
                                            </p>
                                        </div>
                                    )
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    mobileVisible: true,
                                    mobilePriority: 2,
                                    render: (value, warehouse) => getStatusBadge(warehouse.status)
                                },
                                {
                                    key: 'type',
                                    label: 'Type',
                                    mobileVisible: false,
                                    tabletVisible: true,
                                    render: (value, warehouse) => getTypeBadge(warehouse.type)
                                },
                                {
                                    key: 'location',
                                    label: 'Location',
                                    mobileVisible: false,
                                    tabletVisible: true,
                                    render: (value, warehouse) => (
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {warehouse.city}, {warehouse.state}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {warehouse.country}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    key: 'utilization',
                                    label: 'Utilization',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, warehouse) => (
                                        <div>
                                            <p className={`text-sm font-medium ${getUtilizationColor(warehouse.current_utilization)}`}>
                                                {warehouse.current_utilization}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                of {formatNumber(warehouse.capacity)}
                                            </p>
                                        </div>
                                    )
                                },
                                {
                                    key: 'inventory_count',
                                    label: 'Inventory',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, warehouse) => (
                                        <div className="text-center">
                                            <p className="text-lg font-bold">{formatNumber(warehouse.inventory_count)}</p>
                                            <p className="text-xs text-muted-foreground">items</p>
                                        </div>
                                    )
                                },
                                {
                                    key: 'manager_name',
                                    label: 'Manager',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, warehouse) => (
                                        <div className="flex items-center space-x-1">
                                            <Users className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">
                                                {warehouse.manager_name || 'Not assigned'}
                                            </span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'short_operating_hours',
                                    label: 'Operating Hours',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, warehouse) => (
                                        <div className="flex items-center space-x-2 text-sm">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {warehouse.short_operating_hours || '24/7'}
                                            </span>
                                        </div>
                                    )
                                },
                                {
                                    key: 'actions',
                                    label: 'Actions',
                                    mobileVisible: true,
                                    desktopVisible: true,
                                    render: (value, warehouse) => (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => router.visit(route('admin.warehouses.show', warehouse.id))}
                                                    className="cursor-pointer"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.visit(route('admin.warehouses.edit', warehouse.id))}
                                                    className="cursor-pointer"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Warehouse
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <ConfirmationDialog
                                                    title="Delete Warehouse"
                                                    description={`Are you sure you want to delete warehouse ${warehouse.code} (${warehouse.name})?\n\nThis action will:\n• Delete the warehouse record\n• Remove all associated inventory\n• Cannot be undone if there are no active shipments\n\nPlease confirm this action.`}
                                                    confirmText="Delete Warehouse"
                                                    cancelText="Cancel"
                                                    variant="destructive"
                                                    icon="delete"
                                                    onConfirm={() => {
                                                        handleDelete(warehouse.id);
                                                    }}
                                                >
                                                    <DropdownMenuItem
                                                        onSelect={(e) => e.preventDefault()}
                                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Warehouse
                                                    </DropdownMenuItem>
                                                </ConfirmationDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )
                                }
                            ]}
                            emptyState={{
                                icon: Building,
                                title: 'No warehouses found',
                                description: 'No warehouses found matching your criteria.'
                            }}
                            mobileCardStyle="detailed"
                            showMobileSearch={true}
                        />

                        {/* Pagination */}
                        {warehouses?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing {warehouses?.meta?.from || 0} to {warehouses?.meta?.to || 0} of {warehouses?.meta?.total || 0} warehouses
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                    {warehouses?.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="min-w-[40px]"
                                        />
                                    )) || []}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
