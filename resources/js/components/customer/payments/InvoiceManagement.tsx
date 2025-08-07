import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    FileText,
    Download,
    Eye,
    CreditCard,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Calendar,
    DollarSign,
    Search,
    Filter,
    RefreshCw,
    Mail,
    Printer,
    ExternalLink
} from 'lucide-react';

interface Invoice {
    id: number;
    invoice_number: string;
    customer_id: number;
    status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
    currency: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    balance_due: number;
    issue_date: string;
    due_date: string;
    payment_terms: string;
    notes?: string;
    items: InvoiceItem[];
    payments: InvoicePayment[];
    created_at: string;
    updated_at: string;
}

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    shipment_id?: number;
    service_type?: string;
}

interface InvoicePayment {
    id: number;
    payment_number: string;
    amount: number;
    method: string;
    gateway: string;
    status: string;
    payment_date: string;
    gateway_transaction_id?: string;
}

interface Props {
    className?: string;
    onInvoiceSelect?: (invoice: Invoice) => void;
    onPaymentInitiate?: (invoice: Invoice) => void;
    showActions?: boolean;
}

export default function InvoiceManagement({ 
    className = '', 
    onInvoiceSelect,
    onPaymentInitiate,
    showActions = true
}: Props) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);

    // Mock data - in real app, would fetch from API
    const mockInvoices: Invoice[] = [
        {
            id: 1,
            invoice_number: 'INV-2024-001',
            customer_id: 1,
            status: 'paid',
            currency: 'USD',
            subtotal: 150.00,
            tax_amount: 15.00,
            discount_amount: 0,
            total_amount: 165.00,
            paid_amount: 165.00,
            balance_due: 0,
            issue_date: '2024-01-15',
            due_date: '2024-02-14',
            payment_terms: 'Net 30',
            items: [
                {
                    id: 1,
                    description: 'Express Shipping - New York to Toronto',
                    quantity: 1,
                    unit_price: 150.00,
                    total: 150.00,
                    shipment_id: 1001,
                    service_type: 'express',
                },
            ],
            payments: [
                {
                    id: 1,
                    payment_number: 'PAY-2024-001',
                    amount: 165.00,
                    method: 'card',
                    gateway: 'stripe',
                    status: 'completed',
                    payment_date: '2024-01-20T14:30:00Z',
                    gateway_transaction_id: 'pi_1234567890',
                },
            ],
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T14:30:00Z',
        },
        {
            id: 2,
            invoice_number: 'INV-2024-002',
            customer_id: 1,
            status: 'overdue',
            currency: 'USD',
            subtotal: 89.50,
            tax_amount: 8.95,
            discount_amount: 5.00,
            total_amount: 93.45,
            paid_amount: 0,
            balance_due: 93.45,
            issue_date: '2024-01-10',
            due_date: '2024-01-25',
            payment_terms: 'Net 15',
            items: [
                {
                    id: 2,
                    description: 'Standard Shipping - Los Angeles to Vancouver',
                    quantity: 1,
                    unit_price: 89.50,
                    total: 89.50,
                    shipment_id: 1002,
                    service_type: 'standard',
                },
            ],
            payments: [],
            created_at: '2024-01-10T09:00:00Z',
            updated_at: '2024-01-10T09:00:00Z',
        },
        {
            id: 3,
            invoice_number: 'INV-2024-003',
            customer_id: 1,
            status: 'partial',
            currency: 'USD',
            subtotal: 275.00,
            tax_amount: 27.50,
            discount_amount: 0,
            total_amount: 302.50,
            paid_amount: 150.00,
            balance_due: 152.50,
            issue_date: '2024-01-18',
            due_date: '2024-02-17',
            payment_terms: 'Net 30',
            items: [
                {
                    id: 3,
                    description: 'International Shipping - Chicago to London',
                    quantity: 1,
                    unit_price: 275.00,
                    total: 275.00,
                    shipment_id: 1003,
                    service_type: 'international',
                },
            ],
            payments: [
                {
                    id: 2,
                    payment_number: 'PAY-2024-002',
                    amount: 150.00,
                    method: 'paypal',
                    gateway: 'paypal',
                    status: 'completed',
                    payment_date: '2024-01-22T16:45:00Z',
                },
            ],
            created_at: '2024-01-18T11:00:00Z',
            updated_at: '2024-01-22T16:45:00Z',
        },
    ];

    useEffect(() => {
        loadInvoices();
    }, []);

    useEffect(() => {
        filterInvoices();
    }, [invoices, searchQuery, statusFilter, dateFilter]);

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            // Use real API call to get only unpaid invoices for payment processing
            const response = await fetch('/customer/api/payments/invoices?status=unpaid', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data); // Debug log

                // Handle different possible response structures
                let invoicesData = [];
                if (data.invoices && data.invoices.data) {
                    invoicesData = data.invoices.data;
                } else if (data.invoices && Array.isArray(data.invoices)) {
                    invoicesData = data.invoices;
                } else if (Array.isArray(data)) {
                    invoicesData = data;
                }

                setInvoices(invoicesData);
            } else {
                console.error('Failed to load invoices:', response.statusText);
                // Fallback to empty array if API fails
                setInvoices([]);
            }
        } catch (error) {
            console.error('Failed to load invoices:', error);
            // Fallback to empty array if API fails
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterInvoices = () => {
        let filtered = [...invoices];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(invoice =>
                invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (invoice.items && invoice.items.some(item =>
                    item.description.toLowerCase().includes(searchQuery.toLowerCase())
                ))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.status === statusFilter);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (dateFilter) {
                case 'last_30_days':
                    filterDate.setDate(now.getDate() - 30);
                    break;
                case 'last_90_days':
                    filterDate.setDate(now.getDate() - 90);
                    break;
                case 'this_year':
                    filterDate.setMonth(0, 1);
                    break;
            }
            
            filtered = filtered.filter(invoice => 
                new Date(invoice.created_at) >= filterDate
            );
        }

        setFilteredInvoices(filtered);
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            draft: <FileText className="h-4 w-4" />,
            sent: <Mail className="h-4 w-4" />,
            viewed: <Eye className="h-4 w-4" />,
            partial: <Clock className="h-4 w-4" />,
            paid: <CheckCircle className="h-4 w-4" />,
            overdue: <AlertTriangle className="h-4 w-4" />,
            cancelled: <XCircle className="h-4 w-4" />,
        };
        return icons[status as keyof typeof icons] || <FileText className="h-4 w-4" />;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800 border-gray-300',
            sent: 'bg-blue-100 text-blue-800 border-blue-300',
            viewed: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            paid: 'bg-green-100 text-green-800 border-green-300',
            overdue: 'bg-red-100 text-red-800 border-red-300',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
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

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowInvoiceDetails(true);
        onInvoiceSelect?.(invoice);
    };

    const handlePayInvoice = (invoice: Invoice) => {
        onPaymentInitiate?.(invoice);
    };

    const handleDownloadInvoice = (invoice: Invoice) => {
        // Simulate PDF download
        console.log('Downloading invoice:', invoice.invoice_number);
    };

    const getInvoiceStats = () => {
        const stats = {
            total: invoices.length,
            paid: invoices.filter(inv => inv.status === 'paid').length,
            overdue: invoices.filter(inv => inv.status === 'overdue').length,
            totalAmount: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
            balanceDue: invoices.reduce((sum, inv) => sum + inv.balance_due, 0),
        };
        return stats;
    };

    const stats = getInvoiceStats();

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg sm:text-xl flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Outstanding Bills
                        </CardTitle>
                        <CardDescription>
                            Pay your unpaid invoices quickly and easily
                        </CardDescription>
                    </div>
                    <Button onClick={loadInvoices} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Invoice Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-600">Paid</p>
                                <p className="text-lg sm:text-xl font-bold text-green-600">{stats.paid}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-600">Overdue</p>
                                <p className="text-lg sm:text-xl font-bold text-red-600">{stats.overdue}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
                                <p className="text-sm sm:text-base font-bold text-blue-600">
                                    {formatCurrency(stats.totalAmount)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-600">Balance Due</p>
                                <p className="text-sm sm:text-base font-bold text-orange-600">
                                    {formatCurrency(stats.balanceDue)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search invoices..."
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="viewed">Viewed</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                            <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                            <SelectItem value="this_year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Invoices List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading invoices...</span>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Found</h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Your invoices will appear here once you start shipping'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(filteredInvoices || []).map((invoice) => (
                            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-medium text-gray-900">
                                                    {invoice.invoice_number}
                                                </h4>
                                                <Badge className={getStatusColor(invoice.status)}>
                                                    {getStatusIcon(invoice.status)}
                                                    <span className="ml-1 capitalize">{invoice.status}</span>
                                                </Badge>
                                                {invoice.status === 'overdue' && (
                                                    <Badge className="bg-red-100 text-red-800 border-red-300">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Overdue
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Amount:</span>
                                                    <p className="font-bold text-gray-900">
                                                        {formatCurrency(invoice.total_amount, invoice.currency)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Balance Due:</span>
                                                    <p className={`font-bold ${
                                                        invoice.balance_due > 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {formatCurrency(invoice.balance_due, invoice.currency)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Issue Date:</span>
                                                    <p>{formatDate(invoice.issue_date)}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Due Date:</span>
                                                    <p className={
                                                        new Date(invoice.due_date) < new Date() && invoice.balance_due > 0
                                                            ? 'text-red-600 font-bold'
                                                            : ''
                                                    }>
                                                        {formatDate(invoice.due_date)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Invoice Items Preview */}
                                            {invoice.items && invoice.items.length > 0 && (
                                                <div className="mt-3 text-sm text-gray-600">
                                                    <span className="font-medium">Services:</span>
                                                    <p className="truncate">
                                                        {invoice.items.map(item => item.description).join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {showActions && (
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewInvoice(invoice)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownloadInvoice(invoice)}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                                {invoice.balance_due > 0 && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handlePayInvoice(invoice)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        Pay Now
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
