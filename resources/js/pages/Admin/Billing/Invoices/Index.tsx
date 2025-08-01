import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    FileText, 
    Plus, 
    Search, 
    Filter,
    MoreHorizontal,
    Eye,
    Send,
    DollarSign,
    Calendar,
    Download,
    Edit,
    Trash2
} from 'lucide-react';
import { useConfirmationModal } from '@/components/admin/ConfirmationModal';

interface Invoice {
    id: number;
    invoice_number: string;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    shipment?: {
        id: number;
        tracking_number: string;
    };
    status: string;
    total_amount: number;
    balance_due: number;
    paid_amount: number;
    currency: string;
    due_date: string;
    issue_date: string;
    created_at: string;
    payments_count: number;
}

interface Customer {
    id: number;
    name: string;
}

interface InvoiceStats {
    total: number;
    draft: number;
    sent: number;
    viewed: number;
    paid: number;
    overdue: number;
    cancelled: number;
    total_amount: number;
    paid_amount: number;
    outstanding_amount: number;
}

interface Props {
    invoices: {
        data: Invoice[];
        links: any[];
        meta: any;
    };
    customers: Customer[];
    filters: {
        search?: string;
        status?: string;
        customer_id?: string;
        date_from?: string;
        date_to?: string;
    };
    stats: InvoiceStats;
}

export default function InvoicesIndex({ 
    invoices = { data: [], links: [], meta: { total: 0, from: 0, to: 0, last_page: 1 } }, 
    customers = [], 
    filters = {}, 
    stats = { 
        total: 0, draft: 0, sent: 0, viewed: 0, paid: 0, overdue: 0, cancelled: 0,
        total_amount: 0, paid_amount: 0, outstanding_amount: 0 
    } 
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedCustomer, setSelectedCustomer] = useState(filters.customer_id || 'all');
    const { openModal, ConfirmationModal } = useConfirmationModal();

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedCustomer !== 'all') params.set('customer_id', selectedCustomer);
        
        router.get('/admin/billing/invoices', Object.fromEntries(params));
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedCustomer('all');
        router.get('/admin/billing/invoices');
    };

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

    const getStatusBadge = (status: string, dueDate?: string) => {
        // Check if overdue
        const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'paid' && status !== 'cancelled';
        
        if (isOverdue) {
            return <Badge variant="destructive">Overdue</Badge>;
        }

        const statusConfig = {
            draft: { label: 'Draft', variant: 'secondary' as const },
            sent: { label: 'Sent', variant: 'default' as const },
            viewed: { label: 'Viewed', variant: 'default' as const },
            paid: { label: 'Paid', variant: 'success' as const },
            cancelled: { label: 'Cancelled', variant: 'secondary' as const },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleSendInvoice = (invoice: Invoice) => {
        openModal({
            title: 'Send Invoice',
            description: `Send invoice ${invoice.invoice_number} to ${invoice.customer.name}?`,
            confirmText: 'Send Invoice',
            variant: 'default',
            onConfirm: () => {
                router.post(`/admin/invoices/${invoice.id}/send`, {}, {
                    preserveScroll: true,
                });
            },
        });
    };

    const handleCancelInvoice = (invoice: Invoice) => {
        openModal({
            title: 'Cancel Invoice',
            description: `Are you sure you want to cancel invoice ${invoice.invoice_number}? This action cannot be undone.`,
            confirmText: 'Cancel Invoice',
            variant: 'destructive',
            onConfirm: () => {
                router.post(`/admin/invoices/${invoice.id}/cancel`, {}, {
                    preserveScroll: true,
                });
            },
        });
    };

    // Stats cards data
    const statsCards = [
        {
            title: 'Total Invoices',
            value: stats.total.toString(),
            description: `${stats.draft} draft, ${stats.sent} sent`,
            icon: FileText,
            color: 'text-blue-600',
        },
        {
            title: 'Total Amount',
            value: formatCurrency(stats.total_amount),
            description: `${stats.paid} paid invoices`,
            icon: DollarSign,
            color: 'text-green-600',
        },
        {
            title: 'Outstanding',
            value: formatCurrency(stats.outstanding_amount),
            description: `${stats.overdue} overdue invoices`,
            icon: Calendar,
            color: 'text-orange-600',
        },
        {
            title: 'Collection Rate',
            value: `${stats.total_amount > 0 ? Math.round((stats.paid_amount / stats.total_amount) * 100) : 0}%`,
            description: `${formatCurrency(stats.paid_amount)} collected`,
            icon: DollarSign,
            color: 'text-purple-600',
        },
    ];

    return (
        <AppLayout>
            <Head title="Invoice Management" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Invoice Management</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Create, send, and manage customer invoices
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/invoices/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Invoice
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((card, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Invoice number, customer..."
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
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="viewed">Viewed</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Customer</label>
                                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All customers" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Customers</SelectItem>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.name}
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

                {/* Invoice Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoices ({invoices?.meta?.total || 0})</CardTitle>
                        <CardDescription>
                            Manage and track all customer invoices
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Invoice</TableHead>
                                            <TableHead className="min-w-[180px]">Customer</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Amount</TableHead>
                                            <TableHead className="min-w-[100px] hidden sm:table-cell">Due Date</TableHead>
                                            <TableHead className="min-w-[80px] hidden md:table-cell">Payments</TableHead>
                                            <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                <TableBody>
                                    {invoices?.data?.length > 0 ? invoices.data.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{invoice.invoice_number}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(invoice.issue_date)}
                                                    </div>
                                                    {invoice.shipment && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Shipment: {invoice.shipment.tracking_number}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{invoice.customer.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {invoice.customer.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(invoice.status, invoice.due_date)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {formatCurrency(invoice.total_amount, invoice.currency)}
                                                    </div>
                                                    {invoice.balance_due > 0 && (
                                                        <div className="text-sm text-orange-600">
                                                            Due: {formatCurrency(invoice.balance_due, invoice.currency)}
                                                        </div>
                                                    )}
                                                    {invoice.paid_amount > 0 && (
                                                        <div className="text-sm text-green-600">
                                                            Paid: {formatCurrency(invoice.paid_amount, invoice.currency)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <div className="text-sm">
                                                    {formatDate(invoice.due_date)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="text-sm">
                                                    {invoice.payments_count} payment{invoice.payments_count !== 1 ? 's' : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/invoices/${invoice.id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {invoice.status === 'draft' && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleSendInvoice(invoice)}
                                                            >
                                                                <Send className="h-4 w-4 mr-2" />
                                                                Send Invoice
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem>
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Download PDF
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {['draft', 'sent', 'viewed'].includes(invoice.status) && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleCancelInvoice(invoice)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Cancel Invoice
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>No invoices found</p>
                                                <Button asChild className="mt-4">
                                                    <Link href="/admin/invoices/create">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Create First Invoice
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {invoices?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing {invoices?.meta?.from || 0} to {invoices?.meta?.to || 0} of {invoices?.meta?.total || 0} invoices
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                    {invoices?.links?.map((link, index) => (
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

            {/* Confirmation Modal */}
            <ConfirmationModal />
        </AppLayout>
    );
}
