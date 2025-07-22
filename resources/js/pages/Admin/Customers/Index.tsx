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
    Users,
    UserCheck,
    UserX,
    Eye,
    Edit,
    Filter,
    Mail,
    Phone,
    Building,
    CreditCard,
    TrendingUp
} from 'lucide-react';

interface Customer {
    id: number;
    customer_code: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    country: string;
    status: string;
    credit_limit: number;
    payment_terms: string;
    created_at: string;
    shipments_count: number;
    total_spent: number;
}

interface Stats {
    total_customers: number;
    active_customers: number;
    inactive_customers: number;
    new_this_month: number;
    total_revenue: number;
    avg_order_value: number;
}

interface Props {
    customers: {
        data: Customer[];
        meta: any;
        links: any[];
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        payment_terms?: string;
        country?: string;
    };
}

export default function CustomersIndex({ customers, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPaymentTerms, setSelectedPaymentTerms] = useState(filters.payment_terms || 'all');
    const [selectedCountry, setSelectedCountry] = useState(filters.country || '');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
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
            active: { label: 'Active', variant: 'success' as const, icon: UserCheck },
            inactive: { label: 'Inactive', variant: 'secondary' as const, icon: UserX },
            suspended: { label: 'Suspended', variant: 'destructive' as const, icon: UserX },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: Users };
        
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

    const handleSearch = () => {
        router.get(route('admin.customers.index'), {
            search: searchTerm,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            payment_terms: selectedPaymentTerms !== 'all' ? selectedPaymentTerms : undefined,
            country: selectedCountry || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedPaymentTerms('all');
        setSelectedCountry('');
        
        router.get(route('admin.customers.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (customerId: number) => {
        router.post(route('admin.customers.toggle-status', customerId), {}, {
            preserveState: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Customer Management" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customer Management</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Manage customer accounts and relationships
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/customers/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Customer
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                                    <p className="text-2xl font-bold">{stats.total_customers}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.new_this_month} new this month
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <UserCheck className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold">{stats.active_customers}</p>
                                    <p className="text-xs text-green-600">
                                        {stats.inactive_customers} inactive
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
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
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.avg_order_value)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Per shipment
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
                            Filter Customers
                        </CardTitle>
                        <CardDescription>
                            Search and filter customers by various criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Name, email, customer code..."
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
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Terms</label>
                                <Select value={selectedPaymentTerms} onValueChange={setSelectedPaymentTerms}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All terms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Terms</SelectItem>
                                        <SelectItem value="net_30">Net 30</SelectItem>
                                        <SelectItem value="net_15">Net 15</SelectItem>
                                        <SelectItem value="net_7">Net 7</SelectItem>
                                        <SelectItem value="cod">COD</SelectItem>
                                        <SelectItem value="prepaid">Prepaid</SelectItem>
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

                {/* Customers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customers</CardTitle>
                        <CardDescription>
                            All customer accounts and their information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveTable
                            data={customers.data}
                            columns={[
                                {
                                    key: 'name',
                                    label: 'Customer',
                                    mobileVisible: true,
                                    mobilePriority: 1,
                                    render: (value, customer) => (
                                        <div>
                                            <p className="font-medium text-base">{customer.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {customer.customer_code}
                                            </p>
                                            {customer.company && (
                                                <div className="flex items-center space-x-1 mt-1">
                                                    <Building className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {customer.company}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    mobileVisible: true,
                                    mobilePriority: 2,
                                    render: (value, customer) => getStatusBadge(customer.status)
                                },
                                {
                                    key: 'contact',
                                    label: 'Contact',
                                    mobileVisible: false,
                                    tabletVisible: true,
                                    render: (value, customer) => (
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-1">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs">{customer.email}</span>
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center space-x-1">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs">{customer.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'payment_terms',
                                    label: 'Payment Terms',
                                    mobileVisible: false,
                                    tabletVisible: true,
                                    render: (value, customer) => getPaymentTermsBadge(customer.payment_terms)
                                },
                                {
                                    key: 'location',
                                    label: 'Location',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, customer) => (
                                        <div>
                                            <p className="text-sm font-medium">
                                                {customer.city}, {customer.state}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {customer.country}
                                            </p>
                                        </div>
                                    )
                                },
                                {
                                    key: 'shipments_count',
                                    label: 'Shipments',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, customer) => (
                                        <div className="text-center">
                                            <p className="text-lg font-bold">{customer.shipments_count}</p>
                                            <p className="text-xs text-muted-foreground">shipments</p>
                                        </div>
                                    )
                                },
                                {
                                    key: 'total_spent',
                                    label: 'Total Spent',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, customer) => (
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {formatCurrency(customer.total_spent)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Limit: {formatCurrency(customer.credit_limit)}
                                            </p>
                                        </div>
                                    )
                                }
                            ]}
                            actions={[
                                {
                                    label: 'View',
                                    icon: Eye,
                                    onClick: (customer) => router.visit(route('admin.customers.show', customer.id)),
                                    variant: 'ghost'
                                },
                                {
                                    label: 'Edit',
                                    icon: Edit,
                                    onClick: (customer) => router.visit(route('admin.customers.edit', customer.id)),
                                    variant: 'ghost'
                                }
                            ]}
                            emptyState={{
                                icon: Users,
                                title: 'No customers found',
                                description: 'No customers found matching your criteria.'
                            }}
                            mobileCardStyle="detailed"
                            showMobileSearch={true}
                        />

                        {/* Pagination */}
                        {customers?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing {customers?.meta?.from || 0} to {customers?.meta?.to || 0} of {customers?.meta?.total || 0} customers
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                    {customers?.links?.map((link, index) => (
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
