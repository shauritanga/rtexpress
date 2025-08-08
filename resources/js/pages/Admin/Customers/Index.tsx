import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building,
    CreditCard,
    Edit,
    Eye,
    Filter,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    Send,
    Trash2,
    TrendingUp,
    UserCheck,
    UserPlus,
    Users,
    UserX,
} from 'lucide-react';
import { useState } from 'react';

interface Customer {
    id: number;
    customer_code: string;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    tax_number?: string;
    status: string;
    credit_limit: number;
    payment_terms: string;
    created_at: string;
    shipments_count: number;
    has_user_account: boolean;
    creator?: {
        name: string;
    };
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
    countries: string[];
    filters: {
        search?: string;
        status?: string;
        payment_terms?: string;
        country?: string;
    };
}

export default function CustomersIndex({ customers, stats, countries, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPaymentTerms, setSelectedPaymentTerms] = useState(filters.payment_terms || 'all');
    const [selectedCountry, setSelectedCountry] = useState(filters.country || '');

    // Simple delete function using form submission
    const handleDelete = (customerId: number) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) {
            console.error('CSRF token not found');
            alert('Security token not found. Please refresh the page and try again.');
            return;
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('admin.customers.destroy', customerId);

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

    // Simple portal access function
    const handlePortalAccess = (customerId: number, action: string) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrfToken) {
            console.error('CSRF token not found');
            alert('Security token not found. Please refresh the page and try again.');
            return;
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route(`admin.customers.${action}`, customerId);

        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        document.body.appendChild(form);
        form.submit();
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

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Active', variant: 'success' as const, icon: UserCheck },
            inactive: { label: 'Inactive', variant: 'secondary' as const, icon: UserX },
            suspended: { label: 'Suspended', variant: 'destructive' as const, icon: UserX },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const, icon: Users };

        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPaymentTermsBadge = (terms: string) => {
        const colors = {
            net_30: 'bg-blue-100 text-blue-800',
            net_15: 'bg-green-100 text-green-800',
            net_7: 'bg-yellow-100 text-yellow-800',
            cod: 'bg-red-100 text-red-800',
            prepaid: 'bg-purple-100 text-purple-800',
        };

        const color = colors[terms as keyof typeof colors] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}>
                {terms.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const handleSearch = () => {
        router.get(
            route('admin.customers.index'),
            {
                search: searchTerm,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                payment_terms: selectedPaymentTerms !== 'all' ? selectedPaymentTerms : undefined,
                country: selectedCountry || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedPaymentTerms('all');
        setSelectedCountry('');

        router.get(
            route('admin.customers.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleToggleStatus = (customerId: number) => {
        router.post(
            route('admin.customers.toggle-status', customerId),
            {},
            {
                preserveState: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Customer Management" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customer Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage customer accounts and relationships</p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/customers/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Customer
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                                    <p className="text-2xl font-bold">{stats.total_customers}</p>
                                    <p className="text-xs text-muted-foreground">{stats.new_this_month} new this month</p>
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
                                    <p className="text-xs text-green-600">{stats.inactive_customers} inactive</p>
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
                                    <p className="text-xs text-muted-foreground">All time</p>
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
                                    <p className="text-xs text-muted-foreground">Per shipment</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="mr-2 h-5 w-5" />
                            Filter Customers
                        </CardTitle>
                        <CardDescription>Search and filter customers by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
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
                                        <Search className="mr-2 h-4 w-4" />
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
                        <CardDescription>All customer accounts and their information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveTable
                            data={customers.data}
                            columns={[
                                {
                                    key: 'contact_person',
                                    label: 'Customer',
                                    mobileVisible: true,
                                    mobilePriority: 1,
                                    render: (value, customer) => (
                                        <div>
                                            <p className="text-base font-medium">{customer.contact_person}</p>
                                            <p className="text-sm text-muted-foreground">{customer.customer_code}</p>
                                            <div className="mt-1 flex items-center space-x-1">
                                                <Building className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">{customer.company_name}</span>
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    mobileVisible: true,
                                    mobilePriority: 2,
                                    render: (value, customer) => getStatusBadge(customer.status),
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
                                    ),
                                },
                                {
                                    key: 'payment_terms',
                                    label: 'Payment Terms',
                                    mobileVisible: false,
                                    tabletVisible: true,
                                    render: (value, customer) => getPaymentTermsBadge(customer.payment_terms),
                                },
                                {
                                    key: 'has_user_account',
                                    label: 'Portal Access',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, customer) => (
                                        <div className="flex items-center space-x-2">
                                            {customer.has_user_account ? (
                                                <div className="flex items-center space-x-1">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    <span className="text-sm font-medium text-green-700">Active</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-1">
                                                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                                    <span className="text-sm text-gray-500">No Access</span>
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'location',
                                    label: 'Location',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, customer) => (
                                        <div>
                                            <p className="text-sm font-medium">
                                                {customer.city}, {customer.state_province}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{customer.country}</p>
                                        </div>
                                    ),
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
                                    ),
                                },
                                {
                                    key: 'credit_limit',
                                    label: 'Credit Limit',
                                    mobileVisible: false,
                                    desktopVisible: true,
                                    render: (value, customer) => (
                                        <div className="text-right">
                                            <p className="font-medium">{formatCurrency(customer.credit_limit)}</p>
                                            <p className="text-xs text-muted-foreground">{customer.shipments_count} shipments</p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'actions',
                                    label: 'Actions',
                                    mobileVisible: true,
                                    desktopVisible: true,
                                    render: (value, customer) => (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => router.visit(route('admin.customers.show', customer.id))}
                                                    className="cursor-pointer"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => router.visit(route('admin.customers.edit', customer.id))}
                                                    className="cursor-pointer"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Customer
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <ConfirmationDialog
                                                    title={customer.has_user_account ? 'Resend Login Credentials' : 'Create Portal Access'}
                                                    description={
                                                        customer.has_user_account
                                                            ? `Generate new login credentials for ${customer.contact_person} (${customer.company_name})?\n\nThis will:\n• Generate a new temporary password\n• Send new credentials to ${customer.email}\n• Invalidate the current password\n\nThe customer will need to use the new credentials to log in.`
                                                            : `Create portal access for ${customer.contact_person} (${customer.company_name})?\n\nThis will:\n• Create a user account for customer portal\n• Generate temporary login credentials\n• Send welcome email to ${customer.email}\n• Enable customer to access the portal\n\nProceed with account creation?`
                                                    }
                                                    confirmText={customer.has_user_account ? 'Resend Credentials' : 'Create Account'}
                                                    cancelText="Cancel"
                                                    variant="default"
                                                    icon={customer.has_user_account ? 'send' : 'create'}
                                                    onConfirm={() => {
                                                        const action = customer.has_user_account ? 'resend-credentials' : 'create-user-account';
                                                        handlePortalAccess(customer.id, action);
                                                    }}
                                                >
                                                    <DropdownMenuItem
                                                        onSelect={(e) => e.preventDefault()}
                                                        className={`cursor-pointer ${customer.has_user_account ? 'text-blue-600' : 'text-green-600'}`}
                                                    >
                                                        {customer.has_user_account ? (
                                                            <>
                                                                <Send className="mr-2 h-4 w-4" />
                                                                Resend Credentials
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus className="mr-2 h-4 w-4" />
                                                                Create Portal Access
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </ConfirmationDialog>
                                                <DropdownMenuSeparator />
                                                <ConfirmationDialog
                                                    title="Delete Customer"
                                                    description={`Are you sure you want to delete customer ${customer.customer_code} (${customer.company_name})?\n\nThis action will:\n• Delete the customer record\n• Remove their user account and portal access\n• Cannot be undone if they have no active shipments\n\nPlease confirm this action.`}
                                                    confirmText="Delete Customer"
                                                    cancelText="Cancel"
                                                    variant="destructive"
                                                    icon="delete"
                                                    onConfirm={() => {
                                                        handleDelete(customer.id);
                                                    }}
                                                >
                                                    <DropdownMenuItem
                                                        onSelect={(e) => e.preventDefault()}
                                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Customer
                                                    </DropdownMenuItem>
                                                </ConfirmationDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ),
                                },
                            ]}
                            emptyState={{
                                icon: Users,
                                title: 'No customers found',
                                description: 'No customers found matching your criteria.',
                            }}
                            mobileCardStyle="detailed"
                            showMobileSearch={true}
                        />

                        {/* Pagination */}
                        {customers?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <div className="text-center text-sm text-muted-foreground sm:text-left">
                                    Showing {customers?.meta?.from || 0} to {customers?.meta?.to || 0} of {customers?.meta?.total || 0} customers
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                                    {customers?.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
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
