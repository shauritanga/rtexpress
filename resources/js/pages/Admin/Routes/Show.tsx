import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    CheckCircle,
    Clock,
    Edit,
    MapPin,
    Navigation,
    Package,
    Pause,
    Phone,
    Play,
    Route as RouteIcon,
    Truck,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Route {
    id: number;
    route_number: string;
    driver: {
        id: number;
        name: string;
        driver_id: string;
        phone: string;
        email: string;
    };
    warehouse: {
        id: number;
        name: string;
        address: string;
    };
    delivery_date: string;
    status: string;
    planned_start_time: string;
    planned_end_time: string;
    actual_start_time?: string;
    actual_end_time?: string;
    total_distance: number;
    estimated_duration: number;
    completed_stops: number;
    total_stops: number;
    created_at: string;
    updated_at: string;
}

interface RouteStop {
    id: number;
    sequence: number;
    shipment: {
        tracking_number: string;
        recipient_name: string;
        recipient_address: string;
    };
    status: string;
    estimated_arrival: string;
    actual_arrival?: string;
    delivery_notes?: string;
}

interface Props {
    route: Route;
    stops: RouteStop[];
    routeStats: {
        on_time_percentage: number;
        avg_stop_duration: number;
        total_packages: number;
        completed_deliveries: number;
    };
}

export default function RouteShow({ route, stops, routeStats }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            planned: { label: 'Planned', variant: 'secondary' as const, icon: Clock },
            in_progress: { label: 'In Progress', variant: 'default' as const, icon: Truck },
            completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
            cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const, icon: RouteIcon };

        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getStopStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const },
            en_route: { label: 'En Route', variant: 'default' as const },
            delivered: { label: 'Delivered', variant: 'success' as const },
            failed: { label: 'Failed', variant: 'destructive' as const },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };

        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getProgressPercentage = () => {
        if (route.total_stops === 0) return 0;
        return Math.round((route.completed_stops / route.total_stops) * 100);
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: RouteIcon },
        { id: 'stops', label: 'Route Stops', icon: MapPin },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    return (
        <AppLayout>
            <Head title={`Route - ${route.route_number}`} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/routes">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Routes
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Route {route.route_number}</h1>
                                {getStatusBadge(route.status)}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                {formatDate(route.delivery_date)} • {route.driver.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        {route.status === 'planned' && (
                            <Button size="sm">
                                <Play className="mr-2 h-4 w-4" />
                                Start Route
                            </Button>
                        )}
                        {route.status === 'in_progress' && (
                            <Button variant="outline" size="sm">
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Route
                            </Button>
                        )}
                        <Button variant="outline" size="sm">
                            <Navigation className="mr-2 h-4 w-4" />
                            Track Live
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={`/admin/routes/${route.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Route
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Route Progress</span>
                                <span className="text-sm text-muted-foreground">
                                    {route.completed_stops} of {route.total_stops} stops completed
                                </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-gray-200">
                                <div
                                    className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                                    style={{ width: `${getProgressPercentage()}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {route.planned_start_time ? formatTime(route.planned_start_time) : 'Not started'}
                                </span>
                                <span className="text-xs font-medium">{getProgressPercentage()}% Complete</span>
                                <span className="text-xs text-muted-foreground">
                                    {route.planned_end_time ? formatTime(route.planned_end_time) : 'Not scheduled'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Packages</p>
                                    <p className="text-2xl font-bold">{routeStats.total_packages}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold">{routeStats.completed_deliveries}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Stop Time</p>
                                    <p className="text-2xl font-bold">{routeStats.avg_stop_duration}m</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Navigation className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Distance</p>
                                    <p className="text-2xl font-bold">{route.total_distance.toFixed(1)} km</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="border-b">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
                                    }`}
                                >
                                    <IconComponent className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Route Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Route Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Route Number</p>
                                        <p className="text-sm">{route.route_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Delivery Date</p>
                                        <p className="text-sm">{formatDate(route.delivery_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Planned Duration</p>
                                        <p className="text-sm">{route.estimated_duration} hours</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Distance</p>
                                        <p className="text-sm">{route.total_distance.toFixed(1)} km</p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <p className="mb-2 text-sm font-medium text-muted-foreground">Origin Warehouse</p>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-medium">{route.warehouse.name}</p>
                                            <p className="text-muted-foreground">{route.warehouse.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm font-medium text-muted-foreground">Schedule</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">Planned Start: {formatTime(route.planned_start_time)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-red-600" />
                                            <span className="text-sm">Planned End: {formatTime(route.planned_end_time)}</span>
                                        </div>
                                        {route.actual_start_time && (
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm">Actual Start: {formatTime(route.actual_start_time)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Driver Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Driver Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{route.driver.name}</p>
                                        <p className="text-sm text-muted-foreground">Driver ID: {route.driver.driver_id}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{route.driver.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{route.driver.email}</span>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <p className="text-sm font-medium text-green-800">Driver Status</p>
                                    </div>
                                    <p className="mt-1 text-sm text-green-700">
                                        {route.status === 'in_progress' ? 'Currently on route' : 'Available'}
                                    </p>
                                </div>

                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Phone className="mr-2 h-4 w-4" />
                                        Call Driver
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Navigation className="mr-2 h-4 w-4" />
                                        Track Location
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'stops' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Route Stops ({stops.length})</CardTitle>
                            <CardDescription>Delivery stops in sequence order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">#</TableHead>
                                            <TableHead>Shipment</TableHead>
                                            <TableHead>Recipient</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>ETA</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stops.length > 0 ? (
                                            stops.map((stop) => (
                                                <TableRow key={stop.id}>
                                                    <TableCell>
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                                                            {stop.sequence}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium">{stop.shipment.tracking_number}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium">{stop.shipment.recipient_name}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm">{stop.shipment.recipient_address}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm">{formatTime(stop.estimated_arrival)}</p>
                                                        {stop.actual_arrival && (
                                                            <p className="text-xs text-muted-foreground">Actual: {formatTime(stop.actual_arrival)}</p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{getStopStatusBadge(stop.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                    <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                                    <p>No stops found for this route.</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">On-time Delivery Rate</span>
                                        <span className="text-sm font-medium">{routeStats.on_time_percentage}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Average Stop Duration</span>
                                        <span className="text-sm font-medium">{routeStats.avg_stop_duration} minutes</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Completion Rate</span>
                                        <span className="text-sm font-medium">{getProgressPercentage()}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Efficiency Score</span>
                                        <span className="text-sm font-medium">8.5/10</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Route Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="py-8 text-center text-muted-foreground">
                                    <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                    <p>Route analytics charts would be displayed here</p>
                                    <p className="mt-2 text-xs">Integration with mapping and analytics services</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
