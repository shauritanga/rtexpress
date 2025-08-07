import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Package, 
    Plus, 
    Search, 
    Filter, 
    Download,
    Eye,
    Truck,
    Clock,
    CheckCircle,
    AlertCircle,
    Calendar,
    MapPin
} from 'lucide-react';

interface Shipment {
    id: number;
    tracking_number: string;
    status: string;
    service_type: string;
    sender_name: string;
    recipient_name: string;
    recipient_address: string;
    weight_kg: number;
    total_cost: number;
    estimated_delivery_date: string;
    actual_delivery_date?: string;
    created_at: string;
    origin_warehouse?: {
        name: string;
        city: string;
    };
    destination_warehouse?: {
        name: string;
        city: string;
    };
}

interface Stats {
    total: number;
    pending: number;
    in_transit: number;
    delivered: number;
    this_month: number;
}

interface Props {
    shipments: {
        data: Shipment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        service_type?: string;
        date_from?: string;
        date_to?: string;
    };
    customer: {
        id: number;
        company_name: string;
        customer_code: string;
    };
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    picked_up: { label: 'Picked Up', color: 'bg-blue-100 text-blue-800', icon: Package },
    in_transit: { label: 'In Transit', color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    exception: { label: 'Exception', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const serviceTypeConfig = {
    standard: { label: 'Standard', color: 'bg-gray-100 text-gray-800' },
    express: { label: 'Express', color: 'bg-blue-100 text-blue-800' },
    overnight: { label: 'Overnight', color: 'bg-purple-100 text-purple-800' },
    international: { label: 'International', color: 'bg-green-100 text-green-800' },
};

export default function ShipmentsIndex({ shipments, stats, filters, customer }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [serviceTypeFilter, setServiceTypeFilter] = useState(filters.service_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = () => {
        router.get('/customer/shipments', {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
            service_type: serviceTypeFilter === 'all' ? '' : serviceTypeFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setServiceTypeFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get('/customer/shipments');
    };

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

    return (
        <AppLayout>
            <Head title="My Shipments" />

            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Shipments</h1>
                        <p className="text-gray-600">Manage and track your shipments</p>
                    </div>
                    <Link href="/customer/shipments/create">
                        <Button className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Shipment
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Transit</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.in_transit}</p>
                                </div>
                                <Truck className="w-8 h-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.this_month}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div className="lg:col-span-2">
                                <Input
                                    placeholder="Search by tracking number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="picked_up">Picked Up</SelectItem>
                                    <SelectItem value="in_transit">In Transit</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="exception">Exception</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
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
                            
                            <Input
                                type="date"
                                placeholder="From Date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                            
                            <Input
                                type="date"
                                placeholder="To Date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleSearch} className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Shipments List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Shipments ({shipments.total})</CardTitle>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {shipments.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
                                <p className="text-gray-600 mb-4">
                                    {Object.keys(filters).some(key => filters[key as keyof typeof filters]) 
                                        ? "Try adjusting your filters or search terms."
                                        : "Create your first shipment to get started."
                                    }
                                </p>
                                <Link href="/customer/shipments/create">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Shipment
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {shipments.data.map((shipment) => {
                                    const statusInfo = statusConfig[shipment.status as keyof typeof statusConfig];
                                    const serviceInfo = serviceTypeConfig[shipment.service_type as keyof typeof serviceTypeConfig];
                                    const StatusIcon = statusInfo?.icon || Package;
                                    
                                    return (
                                        <div key={shipment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {shipment.tracking_number}
                                                        </h3>
                                                        <Badge className={statusInfo?.color}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {statusInfo?.label}
                                                        </Badge>
                                                        <Badge variant="outline" className={serviceInfo?.color}>
                                                            {serviceInfo?.label}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                        <div>
                                                            <p><span className="font-medium">From:</span> {shipment.sender_name}</p>
                                                            <p><span className="font-medium">To:</span> {shipment.recipient_name}</p>
                                                            <p className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {shipment.recipient_address}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">Weight:</span> {shipment.weight_kg} kg</p>
                                                            <p><span className="font-medium">Cost:</span> {formatCurrency(shipment.total_cost)}</p>
                                                            <p><span className="font-medium">Created:</span> {formatDate(shipment.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {shipment.estimated_delivery_date && (
                                                        <div className="mt-2 text-sm">
                                                            <span className="font-medium text-gray-700">
                                                                {shipment.actual_delivery_date ? 'Delivered:' : 'Est. Delivery:'}
                                                            </span>
                                                            <span className="ml-1 text-gray-600">
                                                                {formatDate(shipment.actual_delivery_date || shipment.estimated_delivery_date)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <Link href={`/customer/shipments/${shipment.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {shipments.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                            {Array.from({ length: shipments.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === shipments.current_page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => router.get(`/customer/shipments?page=${page}`, filters)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
