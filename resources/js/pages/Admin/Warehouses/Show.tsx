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
    Warehouse,
    MapPin,
    Phone,
    Mail,
    Clock,
    Package,
    TrendingUp,
    Users,
    Truck,
    Edit,
    ArrowLeft,
    Activity,
    BarChart3,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

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

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: Warehouse };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
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
            minute: '2-digit'
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
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Warehouses
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                    {warehouse?.name || 'Unknown Warehouse'}
                                </h1>
                                {getStatusBadge(warehouse?.status || 'inactive')}
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                {warehouse?.code || 'N/A'} • {warehouse?.city || 'Unknown'}, {warehouse?.state || 'Unknown'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Reports
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={`/admin/warehouses/${warehouse?.id || 0}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Warehouse
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
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
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
                                        <p className="text-sm flex items-center">
                                            <Phone className="h-3 w-3 mr-1" />
                                            {warehouse?.phone || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-sm flex items-center">
                                            <Mail className="h-3 w-3 mr-1" />
                                            {warehouse?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Address</p>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="text-sm">
                                            <p>{warehouse?.address || 'N/A'}</p>
                                            <p>{warehouse?.city || 'Unknown'}, {warehouse?.state || 'Unknown'} {warehouse?.postal_code || ''}</p>
                                            <p>{warehouse?.country || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Operating Hours</p>
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
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-medium">Storage Capacity</p>
                                        <p className="text-sm text-muted-foreground">
                                            {warehouse?.capacity_sqft?.toLocaleString() || '0'} sq ft
                                        </p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all duration-500 ${getUtilizationColor(stats?.utilization_rate || 0)}`}
                                            style={{ width: `${stats?.utilization_rate || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-muted-foreground">Current Utilization</p>
                                        <p className={`text-xs font-medium px-2 py-1 rounded ${getUtilizationColor(stats?.utilization_rate || 0)}`}>
                                            {stats?.utilization_rate || 0}%
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 grid-cols-2">
                                    <div className="text-center p-4 bg-muted rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{stats?.active_shipments || '0'}</p>
                                        <p className="text-sm text-muted-foreground">Active Shipments</p>
                                    </div>
                                    <div className="text-center p-4 bg-muted rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{stats?.staff_count || '0'}</p>
                                        <p className="text-sm text-muted-foreground">Staff Members</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-800">Location Coordinates</p>
                                    </div>
                                    <p className="text-sm text-blue-700 mt-1">
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
                            <CardDescription>
                                Latest operations and updates at this warehouse
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                        <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.description}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <p className="text-xs text-muted-foreground">
                                                    by {activity.user}
                                                </p>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {activity.type}
                                        </Badge>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                        <p>No recent activity found.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'analytics' && (
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Processing Efficiency</span>
                                        <span className="text-sm font-medium">92%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">On-time Dispatch Rate</span>
                                        <span className="text-sm font-medium">96%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Accuracy Rate</span>
                                        <span className="text-sm font-medium">99.2%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
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
                                <div className="text-center py-8 text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                                    <p>Analytics charts would be displayed here</p>
                                    <p className="text-xs mt-2">Integration with Chart.js or similar library</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'nearby' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Nearby Warehouses</CardTitle>
                            <CardDescription>
                                Other warehouses in the vicinity for coordination
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-hidden">
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
                                        {nearbyWarehouses.length > 0 ? nearbyWarehouses.map((nearby) => (
                                            <TableRow key={nearby.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{nearby.name}</p>
                                                        <p className="text-sm text-muted-foreground">{nearby.code}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm">{nearby.city}, {nearby.state}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm">~15 km</p>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(nearby.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/admin/warehouses/${nearby.id}`}>
                                                            View
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
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
