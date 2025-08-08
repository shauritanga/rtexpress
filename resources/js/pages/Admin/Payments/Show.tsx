import { useConfirmationModal } from '@/components/admin/ConfirmationModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    RefreshCw,
    RotateCcw,
    User,
    XCircle,
} from 'lucide-react';

interface Refund {
    id: number;
    amount: number;
    reason?: string;
    status: string;
    created_at: string;
    processed_at?: string;
}

interface Payment {
    id: number;
    payment_number: string;
    invoice: {
        id: number;
        invoice_number: string;
        total_amount: number;
        currency: string;
    };
    customer: {
        id: number;
        name: string;
        email: string;
        phone?: string;
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
    gateway_transaction_id?: string;
    gateway_payment_id?: string;
    gateway_response?: any;
    failure_reason?: string;
    notes?: string;
    refunds: Refund[];
    creator: {
        name: string;
    };
    created_at: string;
    completed_at?: string;
    failed_at?: string;
}

interface Props {
    payment: Payment;
}

export default function ShowPayment({ payment }: Props) {
    const { openModal, ConfirmationModal } = useConfirmationModal();

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
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            processing: { label: 'Processing', variant: 'default' as const, icon: RefreshCw },
            completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
            failed: { label: 'Failed', variant: 'destructive' as const, icon: XCircle },
            refunded: { label: 'Refunded', variant: 'secondary' as const, icon: RotateCcw },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const, icon: AlertTriangle };

        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="mr-1 h-3 w-3" />
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

        const config = gatewayConfig[gateway as keyof typeof gatewayConfig] || { label: gateway, color: 'bg-gray-100 text-gray-800' };

        return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>{config.label}</span>;
    };

    const handleRefund = () => {
        const maxRefund = payment.amount - payment.refunds.reduce((sum, refund) => (refund.status === 'completed' ? sum + refund.amount : sum), 0);

        if (maxRefund <= 0) {
            return;
        }

        openModal({
            title: 'Process Refund',
            description: `Process refund for payment ${payment.payment_number}? Maximum refundable amount: ${formatCurrency(maxRefund, payment.currency)}`,
            confirmText: 'Process Refund',
            variant: 'warning',
            onConfirm: () => {
                router.post(
                    `/admin/payments/${payment.id}/refund`,
                    {
                        amount: maxRefund,
                        reason: 'Admin initiated refund',
                    },
                    {
                        preserveScroll: true,
                    },
                );
            },
        });
    };

    const totalRefunded = payment.refunds.reduce((sum, refund) => (refund.status === 'completed' ? sum + refund.amount : sum), 0);

    return (
        <AppLayout>
            <Head title={`Payment ${payment.payment_number}`} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/payments">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Back to Payments</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payment {payment.payment_number}</h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                Created on {formatDate(payment.created_at)} by {payment.creator.name}
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                            {payment.status === 'completed' && totalRefunded < payment.amount && (
                                <Button onClick={handleRefund} variant="outline" className="w-full sm:w-auto">
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Process Refund
                                </Button>
                            )}
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Download Receipt</span>
                                <span className="sm:hidden">Receipt</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Status and Overview */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <div className="mt-1">{getStatusBadge(payment.status)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Amount</p>
                                    <p className="text-2xl font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
                                    {payment.fee_amount > 0 && (
                                        <p className="text-sm text-muted-foreground">Fee: {formatCurrency(payment.fee_amount, payment.currency)}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium">Payment Date</p>
                                    <p className="text-lg font-semibold">{formatDate(payment.payment_date)}</p>
                                    <p className="text-sm text-muted-foreground">{formatDateTime(payment.payment_date)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium">Gateway</p>
                                    <div className="mt-1">{getGatewayBadge(payment.gateway)}</div>
                                    <p className="text-sm text-muted-foreground capitalize">{payment.method.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                <p className="font-semibold">{payment.customer.name}</p>
                                <p className="text-sm text-muted-foreground">{payment.customer.email}</p>
                                {payment.customer.phone && <p className="text-sm text-muted-foreground">{payment.customer.phone}</p>}
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Related Invoice</p>
                                <div className="mt-1 flex items-center">
                                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <Link href={route('admin.invoices.show', payment.invoice.id)} className="text-blue-600 hover:underline">
                                        {payment.invoice.invoice_number}
                                    </Link>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Total: {formatCurrency(payment.invoice.total_amount, payment.invoice.currency)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payment Details</p>
                                <div className="mt-1 space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="capitalize">{payment.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Method:</span>
                                        <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Gateway:</span>
                                        <span>{getGatewayBadge(payment.gateway)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Currency:</span>
                                        <span>{payment.currency}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Transaction IDs</p>
                                <div className="mt-1 space-y-1 text-sm">
                                    {payment.gateway_transaction_id && (
                                        <div className="flex justify-between">
                                            <span>Transaction ID:</span>
                                            <span className="font-mono text-xs">{payment.gateway_transaction_id}</span>
                                        </div>
                                    )}
                                    {payment.gateway_payment_id && (
                                        <div className="flex justify-between">
                                            <span>Payment ID:</span>
                                            <span className="font-mono text-xs">{payment.gateway_payment_id}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Amount Breakdown</p>
                                <div className="mt-1 space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Gross Amount:</span>
                                        <span>{formatCurrency(payment.amount, payment.currency)}</span>
                                    </div>
                                    {payment.fee_amount > 0 && (
                                        <div className="flex justify-between text-orange-600">
                                            <span>Gateway Fee:</span>
                                            <span>-{formatCurrency(payment.fee_amount, payment.currency)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-medium">
                                        <span>Net Amount:</span>
                                        <span>{formatCurrency(payment.net_amount, payment.currency)}</span>
                                    </div>
                                    {totalRefunded > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Total Refunded:</span>
                                            <span>-{formatCurrency(totalRefunded, payment.currency)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Refund History */}
                {payment.refunds.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Refund History</CardTitle>
                            <CardDescription>All refunds processed for this payment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payment.refunds.map((refund) => (
                                            <TableRow key={refund.id}>
                                                <TableCell>{formatDate(refund.created_at)}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(refund.amount, payment.currency)}</TableCell>
                                                <TableCell>{refund.reason || 'No reason provided'}</TableCell>
                                                <TableCell>{getStatusBadge(refund.status)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Gateway Response */}
                {payment.gateway_response && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Gateway Response</CardTitle>
                            <CardDescription>Raw response data from the payment gateway</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">{JSON.stringify(payment.gateway_response, null, 2)}</pre>
                        </CardContent>
                    </Card>
                )}

                {/* Payment Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Timeline</CardTitle>
                        <CardDescription>Timeline of payment events and status changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                                <div>
                                    <p className="text-sm font-medium">Payment Created</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDateTime(payment.created_at)} by {payment.creator.name}
                                    </p>
                                </div>
                            </div>

                            {payment.completed_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-600"></div>
                                    <div>
                                        <p className="text-sm font-medium">Payment Completed</p>
                                        <p className="text-sm text-muted-foreground">{formatDateTime(payment.completed_at)}</p>
                                    </div>
                                </div>
                            )}

                            {payment.failed_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-red-600"></div>
                                    <div>
                                        <p className="text-sm font-medium">Payment Failed</p>
                                        <p className="text-sm text-muted-foreground">{formatDateTime(payment.failed_at)}</p>
                                        {payment.failure_reason && <p className="text-sm text-red-600">{payment.failure_reason}</p>}
                                    </div>
                                </div>
                            )}

                            {payment.refunds.map((refund) => (
                                <div key={refund.id} className="flex items-start space-x-3">
                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-600"></div>
                                    <div>
                                        <p className="text-sm font-medium">Refund Processed</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDateTime(refund.created_at)} - {formatCurrency(refund.amount, payment.currency)}
                                        </p>
                                        {refund.reason && <p className="text-sm text-muted-foreground">Reason: {refund.reason}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal />
        </AppLayout>
    );
}
