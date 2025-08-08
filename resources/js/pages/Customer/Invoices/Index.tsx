import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Banknote,
    CheckCircle,
    Clock,
    CreditCard,
    Download,
    ExternalLink,
    Eye,
    FileText,
    Filter,
    Search,
    Send,
    Smartphone,
} from 'lucide-react';
import { useState } from 'react';

interface Invoice {
    id: number;
    invoice_number: string;
    status: string;
    currency: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    balance_due: number;
    issue_date: string;
    due_date: string;
    payment_terms: string;
    created_at: string;
}

interface Stats {
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    total_amount: number;
    paid_amount: number;
    balance_due: number;
}

interface Props {
    invoices: {
        data: Invoice[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
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
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
    viewed: { label: 'Viewed', color: 'bg-purple-100 text-purple-800', icon: Eye },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export default function InvoicesIndex({ invoices, stats, filters, customer }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('clickpesa');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const handleSearch = () => {
        router.get(
            '/customer/invoices',
            {
                search: searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                date_from: dateFrom,
                date_to: dateTo,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFrom('');
        setDateTo('');
        router.get('/customer/invoices');
    };

    const handlePayment = async (invoice: Invoice) => {
        // Validate phone number for ClickPesa
        if (paymentMethod === 'clickpesa' && !phoneNumber.trim()) {
            alert('Please enter your mobile number for ClickPesa payment.');
            return;
        }

        // Validate phone number format
        if (paymentMethod === 'clickpesa') {
            const phoneRegex = /^(\+255|0)[67]\d{8}$/;
            if (!phoneRegex.test(phoneNumber.trim())) {
                alert('Please enter a valid Tanzanian mobile number (e.g., +255700000000 or 0700000000).');
                return;
            }
        }

        setIsProcessingPayment(true);

        try {
            // Process payment through ClickPesa
            router.post(
                '/customer/invoices/pay',
                {
                    invoice_id: invoice.id,
                    payment_method: paymentMethod,
                    phone_number: phoneNumber.trim(),
                    amount: invoice.balance_due,
                },
                {
                    onSuccess: () => {
                        // Payment was successful, close modal and reset form
                        setSelectedInvoice(null);
                        setPhoneNumber('');
                        // The success message will be shown via the flash message from the backend
                    },
                    onError: (errors) => {
                        console.error('Payment failed:', errors);
                        // Errors will be displayed via the form validation from the backend
                    },
                    onFinish: () => {
                        setIsProcessingPayment(false);
                    },
                },
            );
        } catch (error) {
            console.error('Payment error:', error);
            setIsProcessingPayment(false);
        }
    };

    const formatCurrency = (amount: number, currency: string = 'TZS') => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: currency,
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

    const getStatusInfo = (invoice: Invoice) => {
        if (invoice.status === 'sent' && new Date(invoice.due_date) < new Date()) {
            return statusConfig.overdue;
        }
        return statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
    };

    return (
        <AppLayout>
            <Head title="Invoices & Payments" />

            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
                        <p className="text-gray-600">View your invoices and pay them directly through ClickPesa</p>
                    </div>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export All
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Paid</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Billed</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.total_amount)}</p>
                                </div>
                                <Banknote className="h-6 w-6 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Paid</p>
                                    <p className="text-xl font-bold text-green-600">{formatCurrency(stats.paid_amount)}</p>
                                </div>
                                <CheckCircle className="h-6 w-6 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                                    <p className="text-xl font-bold text-red-600">{formatCurrency(stats.balance_due)}</p>
                                </div>
                                <AlertCircle className="h-6 w-6 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                                <Input
                                    placeholder="Search by invoice number..."
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
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input type="date" placeholder="From Date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />

                            <Input type="date" placeholder="To Date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleSearch} className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Invoices ({invoices.total})</CardTitle>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No invoices found</h3>
                                <p className="mb-4 text-gray-600">
                                    {Object.keys(filters).some((key) => filters[key as keyof typeof filters])
                                        ? 'Try adjusting your filters or search terms.'
                                        : 'Your invoices will appear here once they are generated.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {invoices.data.map((invoice) => {
                                    const statusInfo = getStatusInfo(invoice);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <div key={invoice.id} className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                                                        <Badge className={statusInfo.color}>
                                                            <StatusIcon className="mr-1 h-3 w-3" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                                                        <div>
                                                            <p>
                                                                <span className="font-medium">Amount:</span>{' '}
                                                                {formatCurrency(invoice.total_amount, invoice.currency)}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">Paid:</span>{' '}
                                                                {formatCurrency(invoice.paid_amount, invoice.currency)}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">Balance:</span>{' '}
                                                                {formatCurrency(invoice.balance_due, invoice.currency)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p>
                                                                <span className="font-medium">Issue Date:</span> {formatDate(invoice.issue_date)}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}
                                                            </p>
                                                            <p>
                                                                <span className="font-medium">Terms:</span> {invoice.payment_terms}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link href={`/customer/invoices/${invoice.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        PDF
                                                    </Button>
                                                    {invoice.status !== 'paid' && invoice.balance_due > 0 && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    onClick={() => setSelectedInvoice(invoice)}
                                                                >
                                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                                    Pay Now
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle>Pay Invoice {invoice.invoice_number}</DialogTitle>
                                                                    <DialogDescription>
                                                                        Choose your payment method to pay{' '}
                                                                        {formatCurrency(invoice.balance_due, invoice.currency)}
                                                                    </DialogDescription>
                                                                </DialogHeader>

                                                                <div className="space-y-4">
                                                                    <div className="rounded-lg bg-gray-50 p-4">
                                                                        <h4 className="mb-2 font-medium">Invoice Details</h4>
                                                                        <div className="space-y-1 text-sm">
                                                                            <p>
                                                                                <span className="font-medium">Invoice:</span> {invoice.invoice_number}
                                                                            </p>
                                                                            <p>
                                                                                <span className="font-medium">Amount Due:</span>{' '}
                                                                                {formatCurrency(invoice.balance_due, invoice.currency)}
                                                                            </p>
                                                                            <p>
                                                                                <span className="font-medium">Due Date:</span>{' '}
                                                                                {formatDate(invoice.due_date)}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <h4 className="font-medium">Payment Method</h4>
                                                                        <div className="grid gap-3">
                                                                            <div
                                                                                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                                                                    paymentMethod === 'clickpesa'
                                                                                        ? 'border-blue-500 bg-blue-50'
                                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                                }`}
                                                                                onClick={() => setPaymentMethod('clickpesa')}
                                                                            >
                                                                                <div className="flex items-center space-x-3">
                                                                                    <Smartphone className="h-5 w-5 text-blue-600" />
                                                                                    <div>
                                                                                        <p className="font-medium">Mobile Money</p>
                                                                                        <p className="text-sm text-gray-600">
                                                                                            Pay with M-Pesa, Tigo Pesa, Airtel Money
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div
                                                                                className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                                                                    paymentMethod === 'card'
                                                                                        ? 'border-blue-500 bg-blue-50'
                                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                                }`}
                                                                                onClick={() => setPaymentMethod('card')}
                                                                            >
                                                                                <div className="flex items-center space-x-3">
                                                                                    <CreditCard className="h-5 w-5 text-green-600" />
                                                                                    <div>
                                                                                        <p className="font-medium">Credit/Debit Card</p>
                                                                                        <p className="text-sm text-gray-600">
                                                                                            Pay with Visa, Mastercard
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Phone Number Input for ClickPesa */}
                                                                    {paymentMethod === 'clickpesa' && (
                                                                        <div className="space-y-2">
                                                                            <label htmlFor="phone-number" className="text-sm font-medium">
                                                                                Mobile Number *
                                                                            </label>
                                                                            <input
                                                                                id="phone-number"
                                                                                type="tel"
                                                                                value={phoneNumber}
                                                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                                                placeholder="+255700000000 or 0700000000"
                                                                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                                                required
                                                                            />
                                                                            <p className="text-xs text-gray-500">
                                                                                Enter your M-Pesa, Tigo Pesa, or Airtel Money number
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    <Separator />

                                                                    <div className="flex gap-3">
                                                                        <Button
                                                                            variant="outline"
                                                                            className="flex-1"
                                                                            onClick={() => {
                                                                                setSelectedInvoice(null);
                                                                                setPhoneNumber('');
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                                                            onClick={() => handlePayment(invoice)}
                                                                            disabled={isProcessingPayment}
                                                                        >
                                                                            {isProcessingPayment ? (
                                                                                <>
                                                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                                                    Processing...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                                                    Pay {formatCurrency(invoice.balance_due, invoice.currency)}
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
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
                {invoices.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                            {Array.from({ length: invoices.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === invoices.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => router.get(`/customer/invoices?page=${page}`, filters)}
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
