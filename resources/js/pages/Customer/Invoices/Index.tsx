import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Search, 
    Filter, 
    Download,
    Eye,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Send
} from 'lucide-react';

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
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export default function InvoicesIndex({ invoices, stats, filters, customer }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = () => {
        router.get('/customer/invoices', {
            search: searchTerm,
            status: statusFilter === 'all' ? '' : statusFilter,
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
        setDateFrom('');
        setDateTo('');
        router.get('/customer/invoices');
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

    const getStatusInfo = (invoice: Invoice) => {
        if (invoice.status === 'sent' && new Date(invoice.due_date) < new Date()) {
            return statusConfig.overdue;
        }
        return statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
    };

    return (
        <AppLayout>
            <Head title="My Invoices" />
            
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
                        <p className="text-gray-600">View and manage your invoices and billing</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export All
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <FileText className="w-8 h-8 text-gray-400" />
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
                                <Clock className="w-8 h-8 text-blue-400" />
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
                                <CheckCircle className="w-8 h-8 text-green-400" />
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
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Billed</p>
                                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.total_amount)}</p>
                                </div>
                                <DollarSign className="w-6 h-6 text-gray-400" />
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
                                <CheckCircle className="w-6 h-6 text-green-400" />
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
                                <AlertCircle className="w-6 h-6 text-red-400" />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

                {/* Invoices List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Invoices ({invoices.total})</CardTitle>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                                <p className="text-gray-600 mb-4">
                                    {Object.keys(filters).some(key => filters[key as keyof typeof filters]) 
                                        ? "Try adjusting your filters or search terms."
                                        : "Your invoices will appear here once they are generated."
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {invoices.data.map((invoice) => {
                                    const statusInfo = getStatusInfo(invoice);
                                    const StatusIcon = statusInfo.icon;
                                    
                                    return (
                                        <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {invoice.invoice_number}
                                                        </h3>
                                                        <Badge className={statusInfo.color}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                        <div>
                                                            <p><span className="font-medium">Amount:</span> {formatCurrency(invoice.total_amount, invoice.currency)}</p>
                                                            <p><span className="font-medium">Paid:</span> {formatCurrency(invoice.paid_amount, invoice.currency)}</p>
                                                            <p><span className="font-medium">Balance:</span> {formatCurrency(invoice.balance_due, invoice.currency)}</p>
                                                        </div>
                                                        <div>
                                                            <p><span className="font-medium">Issue Date:</span> {formatDate(invoice.issue_date)}</p>
                                                            <p><span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}</p>
                                                            <p><span className="font-medium">Terms:</span> {invoice.payment_terms}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <Link href={`/customer/invoices/${invoice.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        PDF
                                                    </Button>
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
                                    variant={page === invoices.current_page ? "default" : "outline"}
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
