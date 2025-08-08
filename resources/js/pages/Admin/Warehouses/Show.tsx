import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    CheckCircle,
    Clock,
    Edit,
    Mail,
    MapPin,
    Package,
    Phone,
    TrendingUp,
    Users,
    Warehouse,
} from 'lucide-react';
import { useState } from 'react';

interface Warehouse {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    manager_name: string;
    capacity_sqft: number;
    current_utilization: number;
    latitude: number;
    longitude: number;
    status: string;
    operating_hours: string;
    formatted_operating_hours: string;
    created_at: string;
    updated_at: string;
}

interface WarehouseStats {
    total_shipments: number;
    active_shipments: number;
    monthly_throughput: number;
    avg_processing_time: number;
    staff_count: number;
    utilization_rate: number;
}

interface RecentActivity {
    id: number;
    type: string;
    description: string;
    timestamp: string;
    user: string;
}

interface Props {
    warehouse: Warehouse;
    stats: WarehouseStats;
    recentActivity: RecentActivity[];
    nearbyWarehouses: Warehouse[];
}

export default function WarehouseShow({ warehouse, stats, recentActivity, nearbyWarehouses }: Props) {
    const [activeTab, setActiveTab] = useState('overview');

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Active', variant: 'success' as const, icon: CheckCircle },
            inactive: { label: 'Inactive', variant: 'secondary' as const, icon: AlertTriangle },
            maintenance: { label: 'Maintenance', variant: 'warning' as const, icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const, icon: Warehouse };

        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getUtilizationColor = (rate: number) => {
        if (rate >= 90) return 'text-red-600 bg-red-100';
        if (rate >= 75) return 'text-orange-600 bg-orange-100';
        if (rate >= 50) return 'text-blue-600 bg-blue-100';
        return 'text-green-600 bg-green-100';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Warehouse },
        { id: 'activity', label: 'Recent Activity', icon: Activity },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'nearby', label: 'Nearby Warehouses', icon: MapPin },
    ];

    return (
        <AppLayout>
            <Head title={`Warehouse - ${warehouse?.name || 'Unknown'}`} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/warehouses">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Warehouses
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{warehouse?.name || 'Unknown Warehouse'}</h1>
                                {getStatusBadge(warehouse?.status || 'inactive')}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                {warehouse?.code || 'N/A'} • {warehouse?.city || 'Unknown'}, {warehouse?.state || 'Unknown'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Reports
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={`/admin/warehouses/${warehouse?.id || 0}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Warehouse
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
                                    <p className="text-2xl font-bold">{stats?.total_shipments?.toLocaleString() || '0'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Monthly Throughput</p>
                                    <p className="text-2xl font-bold">{stats?.monthly_throughput?.toLocaleString() || '0'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Staff Count</p>
                                    <p className="text-2xl font-bold">{stats?.staff_count || '0'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
                                    <p className="text-2xl font-bold">{stats?.avg_processing_time || '0'}h</p>
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
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Warehouse Code</p>
                                        <p className="text-sm">{warehouse?.code || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Manager</p>
                                        <p className="text-sm">{warehouse?.manager_name || 'Not assigned'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                        <p className="flex items-center text-sm">
                                            <Phone className="mr-1 h-3 w-3" />
                                            {warehouse?.phone || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="flex items-center text-sm">
                                            <Mail className="mr-1 h-3 w-3" />
                                            {warehouse?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <p className="mb-2 text-sm font-medium text-muted-foreground">Address</p>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p>{warehouse?.address || 'N/A'}</p>
                                            <p>
                                                {warehouse?.city || 'Unknown'}, {warehouse?.state || 'Unknown'} {warehouse?.postal_code || ''}
                                            </p>
                                            <p>{warehouse?.country || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm font-medium text-muted-foreground">Operating Hours</p>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm">{warehouse?.formatted_operating_hours || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Capacity & Utilization */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Capacity & Utilization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-sm font-medium">Storage Capacity</p>
                                        <p className="text-sm text-muted-foreground">{warehouse?.capacity_sqft?.toLocaleString() || '0'} sq ft</p>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-gray-200">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${getUtilizationColor(stats?.utilization_rate || 0)}`}
                                            style={{ width: `${stats?.utilization_rate || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">Current Utilization</p>
                                        <p className={`rounded px-2 py-1 text-xs font-medium ${getUtilizationColor(stats?.utilization_rate || 0)}`}>
                                            {stats?.utilization_rate || 0}%
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-muted p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-600">{stats?.active_shipments || '0'}</p>
                                        <p className="text-sm text-muted-foreground">Active Shipments</p>
                                    </div>
                                    <div className="rounded-lg bg-muted p-4 text-center">
                                        <p className="text-2xl font-bold text-green-600">{stats?.staff_count || '0'}</p>
                                        <p className="text-sm text-muted-foreground">Staff Members</p>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-800">Location Coordinates</p>
                                    </div>
                                    <p className="mt-1 text-sm text-blue-700">
                                        {warehouse?.latitude || 'N/A'}, {warehouse?.longitude || 'N/A'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest operations and updates at this warehouse</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 rounded-lg border p-3">
                                            <Activity className="mt-0.5 h-5 w-5 text-blue-600" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{activity.description}</p>
                                                <div className="mt-1 flex items-center space-x-2">
                                                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                                                    <span className="text-xs text-muted-foreground">•</span>
                                                    <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {activity.type}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                        <p>No recent activity found.</p>
                                    </div>
                                )}
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
                                        <span className="text-sm">Processing Efficiency</span>
                                        <span className="text-sm font-medium">92%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">On-time Dispatch Rate</span>
                                        <span className="text-sm font-medium">96%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Accuracy Rate</span>
                                        <span className="text-sm font-medium">99.2%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Customer Satisfaction</span>
                                        <span className="text-sm font-medium">4.8/5</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="py-8 text-center text-muted-foreground">
                                    <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                    <p>Analytics charts would be displayed here</p>
                                    <p className="mt-2 text-xs">Integration with Chart.js or similar library</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'nearby' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Nearby Warehouses</CardTitle>
                            <CardDescription>Other warehouses in the vicinity for coordination</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Distance</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {nearbyWarehouses.length > 0 ? (
                                            nearbyWarehouses.map((nearby) => (
                                                <TableRow key={nearby.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{nearby.name}</p>
                                                            <p className="text-sm text-muted-foreground">{nearby.code}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm">
                                                            {nearby.city}, {nearby.state}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm">~15 km</p>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(nearby.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/warehouses/${nearby.id}`}>View</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                    <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                                                    <p>No nearby warehouses found.</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
