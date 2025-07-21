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
    DollarSign,
    CreditCard,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    RefreshCw,
    Download,
    Filter
} from 'lucide-react';

interface Payment {
    id: number;
    payment_number: string;
    invoice: {
        id: number;
        invoice_number: string;
    };
    customer: {
        id: number;
        name: string;
        email: string;
    };
    status: string;
    type: string;
    method: string;
    gateway: string;
    currency: string;
    amount: number;
    fee_amount: number;
    net_amount: number;
    payment_date: string;
    created_at: string;
    gateway_transaction_id?: string;
}

interface Stats {
    total_payments: number;
    completed_payments: number;
    pending_payments: number;
    failed_payments: number;
    total_amount: number;
    total_fees: number;
}

interface Props {
    payments: {
        data: Payment[];
        meta: any;
        links: any[];
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        gateway?: string;
        date_from?: string;
        date_to?: string;
    };
    gateways: string[];
}

export default function PaymentIndex({ payments, stats, filters, gateways }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedGateway, setSelectedGateway] = useState(filters.gateway || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            processing: { label: 'Processing', variant: 'default' as const, icon: RefreshCw },
            completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
            failed: { label: 'Failed', variant: 'destructive' as const, icon: XCircle },
            refunded: { label: 'Refunded', variant: 'secondary' as const, icon: RefreshCw },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: AlertTriangle };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getGatewayBadge = (gateway: string) => {
        const gatewayConfig = {
            stripe: { label: 'Stripe', color: 'bg-blue-100 text-blue-800' },
            paypal: { label: 'PayPal', color: 'bg-yellow-100 text-yellow-800' },
            clickpesa: { label: 'ClickPesa', color: 'bg-green-100 text-green-800' },
        };

        const config = gatewayConfig[gateway as keyof typeof gatewayConfig] || 
                      { label: gateway, color: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const handleSearch = () => {
        router.get(route('admin.payments.index'), {
            search: searchTerm,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            gateway: selectedGateway !== 'all' ? selectedGateway : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedGateway('all');
        setDateFrom('');
        setDateTo('');
        
        router.get(route('admin.payments.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Payment Management" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payment Management</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Monitor and manage all payment transactions
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(stats.total_amount)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.total_payments} payments
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
                                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold">{stats.completed_payments}</p>
                                    <p className="text-xs text-green-600">
                                        {stats.total_payments > 0 
                                            ? Math.round((stats.completed_payments / stats.total_payments) * 100)
                                            : 0}% success rate
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending_payments}</p>
                                    <p className="text-xs text-orange-600">
                                        Awaiting processing
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Fees</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(stats.total_fees)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Gateway fees
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
                            Filter Payments
                        </CardTitle>
                        <CardDescription>
                            Search and filter payments by various criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Payment number, invoice, customer..."
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
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Gateway</label>
                                <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All gateways" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Gateways</SelectItem>
                                        {gateways.map((gateway) => (
                                            <SelectItem key={gateway} value={gateway}>
                                                {gateway.charAt(0).toUpperCase() + gateway.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                {/* Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Transactions</CardTitle>
                        <CardDescription>
                            All payment transactions and their current status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[180px]">Payment</TableHead>
                                            <TableHead className="min-w-[150px]">Invoice</TableHead>
                                            <TableHead className="min-w-[180px]">Customer</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[100px]">Gateway</TableHead>
                                            <TableHead className="min-w-[120px]">Amount</TableHead>
                                            <TableHead className="min-w-[100px] hidden sm:table-cell">Date</TableHead>
                                            <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.data.length > 0 ? payments.data.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{payment.payment_number}</p>
                                                        <p className="text-sm text-muted-foreground capitalize">
                                                            {payment.method.replace('_', ' ')}
                                                        </p>
                                                        {payment.gateway_transaction_id && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {payment.gateway_transaction_id}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={route('admin.invoices.show', payment.invoice.id)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {payment.invoice.invoice_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{payment.customer.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {payment.customer.email}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(payment.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {getGatewayBadge(payment.gateway)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {formatCurrency(payment.amount, payment.currency)}
                                                        </p>
                                                        {payment.fee_amount > 0 && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Fee: {formatCurrency(payment.fee_amount, payment.currency)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="text-sm">
                                                        {formatDate(payment.payment_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.payments.show', payment.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No payments found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {payments?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing {payments?.meta?.from || 0} to {payments?.meta?.to || 0} of {payments?.meta?.total || 0} payments
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                    {payments?.links?.map((link, index) => (
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
