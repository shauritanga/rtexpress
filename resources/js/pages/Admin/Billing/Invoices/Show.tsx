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
    ArrowLeft,
    Send,
    Download,
    DollarSign,
    Calendar,
    User,
    Package,
    FileText,
    CreditCard,
    Eye,
    CheckCircle,
    AlertTriangle,
    Trash2
} from 'lucide-react';
import { useConfirmationModal } from '@/components/admin/ConfirmationModal';
import PaymentModal from '@/components/admin/PaymentModal';

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    unit: string;
    item_code?: string;
    type: string;
    discount_percentage: number;
    discount_amount: number;
    line_total: number;
    tax_rate: number;
    tax_amount: number;
    notes?: string;
}

interface Payment {
    id: number;
    payment_number: string;
    status: string;
    method: string;
    amount: number;
    currency: string;
    payment_date: string;
    processor?: {
        name: string;
    };
    notes?: string;
}

interface Invoice {
    id: number;
    invoice_number: string;
    customer: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
    shipment?: {
        id: number;
        tracking_number: string;
        recipient_name: string;
    };
    status: string;
    type: string;
    issue_date: string;
    due_date: string;
    paid_date?: string;
    currency: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    balance_due: number;
    tax_rate: number;
    tax_type?: string;
    billing_address: {
        name: string;
        address: string;
        city: string;
        country: string;
    };
    company_address: {
        name: string;
        address: string;
        city: string;
        country: string;
        phone: string;
        email: string;
        tax_id: string;
    };
    notes?: string;
    terms_conditions?: string;
    payment_terms?: string;
    items: InvoiceItem[];
    payments: Payment[];
    creator: {
        name: string;
    };
    sender?: {
        name: string;
    };
    sent_at?: string;
    viewed_at?: string;
    view_count: number;
    created_at: string;
}

interface Props {
    invoice: Invoice;
}

export default function ShowInvoice({ invoice }: Props) {
    const { openModal, ConfirmationModal } = useConfirmationModal();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
            month: 'long',
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
        const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && 
                         status !== 'paid' && status !== 'cancelled';
        
        if (isOverdue) {
            return <Badge variant="destructive" className="flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
            </Badge>;
        }

        const statusConfig = {
            draft: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
            sent: { label: 'Sent', variant: 'default' as const, icon: Send },
            viewed: { label: 'Viewed', variant: 'default' as const, icon: Eye },
            paid: { label: 'Paid', variant: 'success' as const, icon: CheckCircle },
            cancelled: { label: 'Cancelled', variant: 'secondary' as const, icon: Trash2 },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: FileText };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const },
            processing: { label: 'Processing', variant: 'default' as const },
            completed: { label: 'Completed', variant: 'success' as const },
            failed: { label: 'Failed', variant: 'destructive' as const },
            refunded: { label: 'Refunded', variant: 'secondary' as const },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const };
        
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleSendInvoice = () => {
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

    const handleMarkAsPaid = () => {
        openModal({
            title: 'Mark as Paid',
            description: `Mark invoice ${invoice.invoice_number} as paid for ${formatCurrency(invoice.balance_due, invoice.currency)}?`,
            confirmText: 'Mark as Paid',
            variant: 'success',
            onConfirm: () => {
                router.post(`/admin/invoices/${invoice.id}/mark-paid`, {
                    amount: invoice.balance_due,
                    payment_date: new Date().toISOString().split('T')[0],
                    notes: 'Manually marked as paid by admin'
                }, {
                    preserveScroll: true,
                });
            },
        });
    };

    const handleCancelInvoice = () => {
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

    const handleCancelDraftInvoice = () => {
        openModal({
            title: 'Cancel Draft Invoice',
            description: `Are you sure you want to cancel draft invoice ${invoice.invoice_number}? This will mark the invoice as cancelled and it cannot be sent to the customer.`,
            confirmText: 'Cancel Invoice',
            variant: 'destructive',
            onConfirm: () => {
                router.post(`/admin/invoices/${invoice.id}/cancel`, {}, {
                    onSuccess: () => {
                        // Navigation will be handled by the controller
                    },
                });
            },
        });
    };

    const getDaysUntilDue = () => {
        const today = new Date();
        const dueDate = new Date(invoice.due_date);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilDue = getDaysUntilDue();

    return (
        <AppLayout>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/invoices">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Back to Invoices</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Invoice {invoice.invoice_number}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Created on {formatDate(invoice.created_at)} by {invoice.creator.name}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                            {invoice.status === 'draft' && (
                                <Button onClick={handleSendInvoice} className="w-full sm:w-auto">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Invoice
                                </Button>
                            )}
                            {invoice.balance_due > 0 && invoice.status !== 'cancelled' && (
                                <>
                                    <Button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="w-full sm:w-auto"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Process Payment</span>
                                        <span className="sm:hidden">Pay</span>
                                    </Button>
                                    <Button onClick={handleMarkAsPaid} variant="outline" className="w-full sm:w-auto">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Mark as Paid</span>
                                        <span className="sm:hidden">Mark Paid</span>
                                    </Button>
                                </>
                            )}
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Download className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Download PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </Button>
                            {invoice.status === 'draft' && (
                                <Button onClick={handleCancelDraftInvoice} variant="destructive" className="w-full sm:w-auto">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Cancel Invoice</span>
                                    <span className="sm:hidden">Cancel</span>
                                </Button>
                            )}
                            {['sent', 'viewed'].includes(invoice.status) && (
                                <Button onClick={handleCancelInvoice} variant="destructive" className="w-full sm:w-auto">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Cancel Invoice</span>
                                    <span className="sm:hidden">Cancel</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status and Overview */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(invoice.status)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Total Amount</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(invoice.total_amount, invoice.currency)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium">Due Date</p>
                                    <p className="text-lg font-semibold">
                                        {formatDate(invoice.due_date)}
                                    </p>
                                    {daysUntilDue < 0 && invoice.status !== 'paid' && (
                                        <p className="text-sm text-red-600">
                                            {Math.abs(daysUntilDue)} days overdue
                                        </p>
                                    )}
                                    {daysUntilDue >= 0 && invoice.status !== 'paid' && (
                                        <p className="text-sm text-muted-foreground">
                                            {daysUntilDue} days remaining
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium">Balance Due</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(invoice.balance_due, invoice.currency)}
                                    </p>
                                    {invoice.paid_amount > 0 && (
                                        <p className="text-sm text-green-600">
                                            {formatCurrency(invoice.paid_amount, invoice.currency)} paid
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice Details */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                <p className="font-semibold">{invoice.customer.name}</p>
                                <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
                                {invoice.customer.phone && (
                                    <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Billing Address</p>
                                <div className="mt-1 text-sm">
                                    <p>{invoice.billing_address.name}</p>
                                    <p>{invoice.billing_address.address}</p>
                                    <p>{invoice.billing_address.city}, {invoice.billing_address.country}</p>
                                </div>
                            </div>

                            {invoice.shipment && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Related Shipment</p>
                                        <div className="flex items-center mt-1">
                                            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <Link
                                                href={`/admin/shipments/${invoice.shipment.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {invoice.shipment.tracking_number}
                                            </Link>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            To: {invoice.shipment.recipient_name}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-semibold">{invoice.company_address.name}</p>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    <p>{invoice.company_address.address}</p>
                                    <p>{invoice.company_address.city}, {invoice.company_address.country}</p>
                                    <p>{invoice.company_address.phone}</p>
                                    <p>{invoice.company_address.email}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tax ID</p>
                                <p className="text-sm">{invoice.company_address.tax_id}</p>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Invoice Details</p>
                                <div className="mt-1 space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Issue Date:</span>
                                        <span>{formatDate(invoice.issue_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Due Date:</span>
                                        <span>{formatDate(invoice.due_date)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Payment Terms:</span>
                                        <span>{invoice.payment_terms || 'Net 30'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Currency:</span>
                                        <span>{invoice.currency}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Items</CardTitle>
                        <CardDescription>
                            Services and products included in this invoice
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Tax</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{item.description}</p>
                                                    {item.item_code && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Code: {item.item_code}
                                                        </p>
                                                    )}
                                                    {item.notes && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.quantity} {item.unit}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(item.unit_price, invoice.currency)}
                                                {item.discount_percentage > 0 && (
                                                    <div className="text-sm text-orange-600">
                                                        -{item.discount_percentage}% discount
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.tax_rate > 0 ? (
                                                    <div>
                                                        <div>{item.tax_rate}%</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatCurrency(item.tax_amount, invoice.currency)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.line_total + item.tax_amount, invoice.currency)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Invoice Totals */}
                        <div className="mt-6 flex justify-end">
                            <div className="w-full max-w-sm space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                                </div>
                                {invoice.discount_amount > 0 && (
                                    <div className="flex justify-between text-orange-600">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(invoice.discount_amount, invoice.currency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Tax ({invoice.tax_type || 'VAT'}):</span>
                                    <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>{formatCurrency(invoice.total_amount, invoice.currency)}</span>
                                </div>
                                {invoice.paid_amount > 0 && (
                                    <>
                                        <div className="flex justify-between text-green-600">
                                            <span>Paid:</span>
                                            <span>-{formatCurrency(invoice.paid_amount, invoice.currency)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Balance Due:</span>
                                            <span>{formatCurrency(invoice.balance_due, invoice.currency)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment History */}
                {invoice.payments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>
                                All payments received for this invoice
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Payment #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="font-medium">
                                                    {payment.payment_number}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(payment.payment_date)}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {payment.method.replace('_', ' ')}
                                                </TableCell>
                                                <TableCell>
                                                    {getPaymentStatusBadge(payment.status)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(payment.amount, payment.currency)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Information */}
                {(invoice.notes || invoice.terms_conditions) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {invoice.notes && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-sm mt-1">{invoice.notes}</p>
                                </div>
                            )}

                            {invoice.terms_conditions && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Terms & Conditions</p>
                                    <p className="text-sm mt-1 whitespace-pre-line">{invoice.terms_conditions}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Invoice Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Activity</CardTitle>
                        <CardDescription>
                            Timeline of invoice events and interactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium">Invoice Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateTime(invoice.created_at)} by {invoice.creator.name}
                                    </p>
                                </div>
                            </div>

                            {invoice.sent_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Invoice Sent</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(invoice.sent_at)}
                                            {invoice.sender && ` by ${invoice.sender.name}`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {invoice.viewed_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Invoice Viewed</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(invoice.viewed_at)}
                                            ({invoice.view_count} time{invoice.view_count !== 1 ? 's' : ''})
                                        </p>
                                    </div>
                                </div>
                            )}

                            {invoice.paid_date && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium">Invoice Paid</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(invoice.paid_date)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                invoice={invoice}
            />
        </AppLayout>
    );
}
