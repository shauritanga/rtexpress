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
    Activity
} from 'lucide-react';

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
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Warehouse</TableHead>
                                            <TableHead className="min-w-[100px]">Type</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Location</TableHead>
                                            <TableHead className="min-w-[100px] hidden sm:table-cell">Utilization</TableHead>
                                            <TableHead className="min-w-[100px] hidden md:table-cell">Inventory</TableHead>
                                            <TableHead className="min-w-[100px] hidden lg:table-cell">Manager</TableHead>
                                            <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {warehouses.data.length > 0 ? warehouses.data.map((warehouse) => (
                                            <TableRow key={warehouse.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{warehouse.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {warehouse.warehouse_code}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getTypeBadge(warehouse.type)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(warehouse.status)}
                                                </TableCell>
                                                <TableCell>
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
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div>
                                                        <p className={`text-sm font-medium ${getUtilizationColor(warehouse.current_utilization)}`}>
                                                            {warehouse.current_utilization}%
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            of {formatNumber(warehouse.capacity)}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="text-center">
                                                        <p className="text-lg font-bold">{formatNumber(warehouse.inventory_count)}</p>
                                                        <p className="text-xs text-muted-foreground">items</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {warehouse.manager_name || 'Not assigned'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-1">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('admin.warehouses.show', warehouse.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={route('admin.warehouses.edit', warehouse.id)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No warehouses found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

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
