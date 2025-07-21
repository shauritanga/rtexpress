import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    DollarSign, 
    FileText, 
    CreditCard, 
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Plus,
    Eye,
    Send,
    Clock,
    CheckCircle
} from 'lucide-react';

interface BillingStats {
    total_revenue: {
        current: number;
        previous: number;
    };
    outstanding_amount: number;
    total_invoices: {
        current: number;
        previous: number;
    };
    overdue_invoices: number;
    pending_payments: number;
    payment_success_rate: number;
}

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
    currency: string;
    due_date: string;
    issue_date: string;
}

interface Payment {
    id: number;
    payment_number: string;
    invoice: {
        id: number;
        invoice_number: string;
        customer: {
            name: string;
        };
    };
    customer: {
        name: string;
    };
    status: string;
    method: string;
    amount: number;
    currency: string;
    payment_date: string;
}

interface Props {
    stats: BillingStats;
    recentInvoices: Invoice[];
    recentPayments: Payment[];
    overdueInvoices: Invoice[];
}

export default function BillingIndex({ stats, recentInvoices, recentPayments, overdueInvoices }: Props) {
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

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: 'Draft', variant: 'secondary' as const },
            sent: { label: 'Sent', variant: 'default' as const },
            viewed: { label: 'Viewed', variant: 'default' as const },
            paid: { label: 'Paid', variant: 'success' as const },
            overdue: { label: 'Overdue', variant: 'destructive' as const },
            cancelled: { label: 'Cancelled', variant: 'secondary' as const },
            pending: { label: 'Pending', variant: 'secondary' as const },
            processing: { label: 'Processing', variant: 'default' as const },
            completed: { label: 'Completed', variant: 'success' as const },
            failed: { label: 'Failed', variant: 'destructive' as const },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculatePercentageChange(stats.total_revenue.current, stats.total_revenue.previous);
    const invoiceChange = calculatePercentageChange(stats.total_invoices.current, stats.total_invoices.previous);

    // Stats cards data
    const statsCards = [
        {
            title: 'Monthly Revenue',
            value: formatCurrency(stats.total_revenue.current),
            description: `${revenueChange >= 0 ? '+' : ''}${Number(revenueChange).toFixed(1)}% from last month`,
            icon: DollarSign,
            color: 'text-green-600',
            trend: revenueChange >= 0 ? 'up' : 'down',
        },
        {
            title: 'Outstanding Amount',
            value: formatCurrency(stats.outstanding_amount),
            description: `${stats.overdue_invoices} overdue invoices`,
            icon: AlertTriangle,
            color: 'text-orange-600',
        },
        {
            title: 'Monthly Invoices',
            value: stats.total_invoices.current.toString(),
            description: `${invoiceChange >= 0 ? '+' : ''}${Number(invoiceChange).toFixed(1)}% from last month`,
            icon: FileText,
            color: 'text-blue-600',
            trend: invoiceChange >= 0 ? 'up' : 'down',
        },
        {
            title: 'Payment Success Rate',
            value: `${stats.payment_success_rate}%`,
            description: `${stats.pending_payments} pending payments`,
            icon: CreditCard,
            color: 'text-purple-600',
        },
    ];

    return (
        <AppLayout>
            <Head title="Billing & Invoicing" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing & Invoicing</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Manage invoices, payments, and financial operations
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
                                <p className="text-xs text-muted-foreground flex items-center">
                                    {card.trend && (
                                        card.trend === 'up' ? (
                                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                                        )
                                    )}
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Invoice Management
                            </CardTitle>
                            <CardDescription>
                                Create, send, and manage customer invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button asChild className="w-full">
                                    <Link href="/admin/billing/invoices">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View All Invoices
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/admin/invoices/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create New Invoice
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CreditCard className="h-5 w-5 mr-2" />
                                Payment Tracking
                            </CardTitle>
                            <CardDescription>
                                Monitor payments and transaction history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button asChild className="w-full">
                                    <Link href="/admin/billing/payments">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View All Payments
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/admin/billing/payments?status=pending">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Pending Payments
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                Overdue Management
                            </CardTitle>
                            <CardDescription>
                                Handle overdue invoices and collections
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button asChild variant="destructive" className="w-full">
                                    <Link href="/admin/billing/invoices?status=overdue">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        View Overdue ({stats.overdue_invoices})
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/admin/billing/invoices?status=sent">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Reminders
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
