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
    MapPin,
    Clock,
    CheckCircle,
    AlertTriangle,
    Truck,
    Eye,
    Filter,
    Calendar,
    Route,
    Navigation,
    MoreHorizontal,
    Edit,
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

interface Driver {
    id: number;
    name: string;
    driver_id: string;
}

interface Warehouse {
    id: number;
    name: string;
}

interface RouteStop {
    id: number;
    stop_order: number;
    status: string;
    customer_name: string;
    type: string;
}

interface DeliveryRoute {
    id: number;
    route_number: string;
    delivery_date: string;
    status: string;
    planned_start_time: string;
    planned_end_time: string;
    actual_start_time?: string;
    actual_end_time?: string;
    total_distance: number;
    total_stops: number;
    completed_stops: number;
    driver: Driver;
    warehouse: Warehouse;
    stops: RouteStop[];
}

interface Stats {
    total_routes: number;
    active_routes: number;
    completed_today: number;
    overdue_stops: number;
    avg_completion_rate: number;
    total_distance_today: number;
}

interface Props {
    routes: {
        data: DeliveryRoute[];
        meta: any;
        links: any[];
    };
    stats: Stats;
    drivers: Driver[];
    warehouses: Warehouse[];
    filters: {
        search?: string;
        status?: string;
        driver_id?: string;
        warehouse_id?: string;
        date?: string;
    };
}

export default function RoutesIndex({ routes, stats, drivers, warehouses, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedDriver, setSelectedDriver] = useState(filters.driver_id || 'all');
    const [selectedWarehouse, setSelectedWarehouse] = useState(filters.warehouse_id || 'all');
    const [selectedDate, setSelectedDate] = useState(filters.date || '');

    // Simple delete function using form submission
    const handleDelete = (routeId: number) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) {
            console.error('CSRF token not found');
            alert('Security token not found. Please refresh the page and try again.');
            return;
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('admin.routes.destroy', routeId);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return 'N/A';
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            planned: { label: 'Planned', variant: 'secondary' as const, icon: Calendar },
            in_progress: { label: 'In Progress', variant: 'default' as const, icon: Truck },
            completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
            cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: MapPin };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getProgressPercentage = (route: DeliveryRoute) => {
        if (route.total_stops === 0) return 0;
        return Math.round((route.completed_stops / route.total_stops) * 100);
    };

    const handleSearch = () => {
        router.get(route('admin.routes.index'), {
            search: searchTerm,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            driver_id: selectedDriver !== 'all' ? selectedDriver : undefined,
            warehouse_id: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
            date: selectedDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedDriver('all');
        setSelectedWarehouse('all');
        setSelectedDate('');
        
        router.get(route('admin.routes.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Route Management" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Route Management</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Plan, optimize, and track delivery routes
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/routes/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Route
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Route className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Routes</p>
                                    <p className="text-2xl font-bold">{stats.total_routes}</p>
                                    <p className="text-xs text-muted-foreground">
                                        All time
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Routes</p>
                                    <p className="text-2xl font-bold">{stats.active_routes}</p>
                                    <p className="text-xs text-orange-600">
                                        In progress
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                                    <p className="text-2xl font-bold">{stats.completed_today}</p>
                                    <p className="text-xs text-green-600">
                                        {stats.total_distance_today ? Number(stats.total_distance_today).toFixed(1) : '0.0'} km
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Navigation className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                                    <p className="text-2xl font-bold">{stats.avg_completion_rate}%</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.overdue_stops} overdue stops
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
                            Filter Routes
                        </CardTitle>
                        <CardDescription>
                            Search and filter delivery routes by various criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Route number, driver name..."
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
                                        <SelectItem value="planned">Planned</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Driver</label>
                                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All drivers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Drivers</SelectItem>
                                        {drivers.map((driver) => (
                                            <SelectItem key={driver.id} value={driver.id.toString()}>
                                                {driver.name} ({driver.driver_id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
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

                {/* Routes Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Routes</CardTitle>
                        <CardDescription>
                            All delivery routes and their current status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Route</TableHead>
                                            <TableHead className="min-w-[120px]">Driver</TableHead>
                                            <TableHead className="min-w-[100px]">Date</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Progress</TableHead>
                                            <TableHead className="min-w-[100px] hidden sm:table-cell">Time</TableHead>
                                            <TableHead className="min-w-[100px] hidden md:table-cell">Distance</TableHead>
                                            <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {routes.data.length > 0 ? routes.data.map((deliveryRoute) => (
                                            <TableRow key={deliveryRoute.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{deliveryRoute.route_number}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {deliveryRoute.warehouse.name}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{deliveryRoute.driver.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {deliveryRoute.driver.driver_id}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(deliveryRoute.delivery_date)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(deliveryRoute.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${getProgressPercentage(deliveryRoute)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {getProgressPercentage(deliveryRoute)}%
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {deliveryRoute.completed_stops}/{deliveryRoute.total_stops} stops
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div>
                                                        <p className="text-sm">
                                                            {formatTime(deliveryRoute.planned_start_time)} - {formatTime(deliveryRoute.planned_end_time)}
                                                        </p>
                                                        {deliveryRoute.actual_start_time && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Started: {formatTime(deliveryRoute.actual_start_time)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span className="text-sm">
                                                        {deliveryRoute.total_distance ? Number(deliveryRoute.total_distance).toFixed(1) : '0.0'} km
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Open menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem
                                                                onClick={() => router.visit(route('admin.routes.show', deliveryRoute.id))}
                                                                className="cursor-pointer"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => router.visit(route('admin.routes.edit', deliveryRoute.id))}
                                                                className="cursor-pointer"
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Route
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <ConfirmationDialog
                                                                title="Delete Route"
                                                                description={`Are you sure you want to delete route ${deliveryRoute.route_number}?\n\nThis action will:\n• Delete the route record\n• Remove all route stops\n• Make the driver available again\n• Cannot be undone for planned routes\n\nPlease confirm this action.`}
                                                                confirmText="Delete Route"
                                                                cancelText="Cancel"
                                                                variant="destructive"
                                                                icon="delete"
                                                                onConfirm={() => {
                                                                    handleDelete(deliveryRoute.id);
                                                                }}
                                                            >
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete Route
                                                                </DropdownMenuItem>
                                                            </ConfirmationDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No delivery routes found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {routes?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing {routes?.meta?.from || 0} to {routes?.meta?.to || 0} of {routes?.meta?.total || 0} routes
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                    {routes?.links?.map((link, index) => (
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
