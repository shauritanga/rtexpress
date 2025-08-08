import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Eye,
    FileText,
    Mail,
    MapPin,
    Phone,
    Send,
} from 'lucide-react';

interface Invoice {
    id: number;
    invoice_number: string;
    status: string;
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
    billing_address: {
        city?: string;
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        country?: string;
        postal_code?: string;
    };
    company_address: {
        city?: string;
        name?: string;
        email?: string;
        phone?: string;
        tax_id?: string;
        address?: string;
        country?: string;
        postal_code?: string;
    };
    created_at: string;
    payments?: Array<{
        id: number;
        payment_number: string;
        amount: number;
        payment_date: string;
        method: string;
        status: string;
    }>;
}

interface Props {
    invoice: Invoice;
    customer: {
        id: number;
        company_name: string;
        customer_code: string;
        contact_person: string;
        email: string;
        phone: string;
    };
}

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
    viewed: { label: 'Viewed', color: 'bg-purple-100 text-purple-800', icon: Eye },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export default function InvoiceShow({ invoice, customer }: Props) {
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

    // Handle address fields (they're already arrays from Laravel casts)
    const companyAddress = invoice.company_address || {};
    const billingAddress = invoice.billing_address || {};

    const getStatusInfo = (invoice: Invoice) => {
        if (invoice.status === 'sent' && new Date(invoice.due_date) < new Date()) {
            return statusConfig.overdue;
        }
        return statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
    };

    const statusInfo = getStatusInfo(invoice);
    const StatusIcon = statusInfo.icon;

    return (
        <AppLayout>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/invoices">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Invoices
                            </Button>
                        </Link>
                        <div>
                            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                                Invoice {invoice.invoice_number}
                                <Badge className={statusInfo.color}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {statusInfo.label}
                                </Badge>
                            </h1>
                            <p className="text-gray-600">Issued on {formatDate(invoice.issue_date)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                        {invoice.balance_due > 0 && (
                            <Button>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay Now
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Invoice Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Invoice Header */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Bill From */}
                                    <div>
                                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                                            <Building className="h-4 w-4" />
                                            From
                                        </h3>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p className="font-medium">{companyAddress.name || 'RT Express'}</p>
                                            {companyAddress.address && <p>{companyAddress.address}</p>}
                                            {companyAddress.city && companyAddress.country && (
                                                <p>
                                                    {companyAddress.city}, {companyAddress.country}
                                                </p>
                                            )}
                                            {companyAddress.postal_code && <p>{companyAddress.postal_code}</p>}
                                            {companyAddress.email && (
                                                <p className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {companyAddress.email}
                                                </p>
                                            )}
                                            {companyAddress.phone && (
                                                <p className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {companyAddress.phone}
                                                </p>
                                            )}
                                            {companyAddress.tax_id && <p>Tax ID: {companyAddress.tax_id}</p>}
                                        </div>
                                    </div>

                                    {/* Bill To */}
                                    <div>
                                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                                            <MapPin className="h-4 w-4" />
                                            Bill To
                                        </h3>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p className="font-medium">{customer.company_name}</p>
                                            <p>{billingAddress.name || customer.contact_person}</p>
                                            <p className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {billingAddress.email || customer.email}
                                            </p>
                                            <p className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {billingAddress.phone || customer.phone}
                                            </p>
                                            {billingAddress.address && <p>{billingAddress.address}</p>}
                                            {billingAddress.city && billingAddress.country && (
                                                <p>
                                                    {billingAddress.city}, {billingAddress.country}
                                                </p>
                                            )}
                                            {billingAddress.postal_code && <p>{billingAddress.postal_code}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 border-t pt-6 md:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Invoice Number</p>
                                        <p className="text-sm text-gray-900">{invoice.invoice_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Issue Date</p>
                                        <p className="text-sm text-gray-900">{formatDate(invoice.issue_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Due Date</p>
                                        <p className="text-sm text-gray-900">{formatDate(invoice.due_date)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Invoice Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Items</CardTitle>
                                <CardDescription>Services and charges for this invoice</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="py-8 text-center">
                                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500">Invoice line items will be displayed here</p>
                                    <p className="mt-1 text-sm text-gray-400">Detailed breakdown of services and charges</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment History */}
                        {invoice.payments && invoice.payments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment History</CardTitle>
                                    <CardDescription>Record of payments made for this invoice</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {invoice.payments.map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{payment.payment_number}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(payment.payment_date)} • {payment.method}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-green-600">{formatCurrency(payment.amount, invoice.currency)}</p>
                                                    <Badge variant="outline" className="text-xs">
                                                        {payment.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Invoice Summary */}
                    <div className="space-y-6">
                        {/* Amount Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Amount Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                                </div>
                                {invoice.discount_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="font-medium text-green-600">
                                            -{formatCurrency(invoice.discount_amount, invoice.currency)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="text-lg font-bold">{formatCurrency(invoice.total_amount, invoice.currency)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Paid</span>
                                    <span className="font-medium text-green-600">{formatCurrency(invoice.paid_amount, invoice.currency)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">Balance Due</span>
                                        <span className={`text-lg font-bold ${invoice.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(invoice.balance_due, invoice.currency)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Terms */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Payment Terms
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">{invoice.payment_terms}</p>
                                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                                    <p className="text-sm text-blue-800">
                                        <Clock className="mr-1 inline h-4 w-4" />
                                        Due: {formatDate(invoice.due_date)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {invoice.balance_due > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button className="w-full">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Pay {formatCurrency(invoice.balance_due, invoice.currency)}
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
