import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertTriangle,
    BarChart3,
    Building2,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    History,
    RefreshCw,
    Search,
    Smartphone,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentRecord {
    id: number;
    payment_number: string;
    invoice_number: string;
    amount: number;
    currency: string;
    method: string;
    gateway: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    payment_date: string;
    description: string;
    fee_amount: number;
    net_amount: number;
    gateway_transaction_id?: string;
    refund_amount?: number;
    refund_date?: string;
}

interface PaymentStats {
    totalPayments: number;
    totalAmount: number;
    totalFees: number;
    averagePayment: number;
    successRate: number;
    monthlyGrowth: number;
    preferredMethod: string;
    preferredGateway: string;
}

interface MonthlyData {
    month: string;
    amount: number;
    count: number;
    fees: number;
}

interface Props {
    className?: string;
    showAnalytics?: boolean;
    dateRange?: 'last_30_days' | 'last_90_days' | 'last_year' | 'all_time';
}

export default function PaymentHistory({ className = '', showAnalytics = true, dateRange = 'last_90_days' }: Props) {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
    const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');
    const [selectedDateRange, setSelectedDateRange] = useState(dateRange);

    // Mock data - in real app, would fetch from API
    const mockPayments: PaymentRecord[] = [
        {
            id: 1,
            payment_number: 'PAY-2024-001',
            invoice_number: 'INV-2024-001',
            amount: 165.0,
            currency: 'USD',
            method: 'card',
            gateway: 'stripe',
            status: 'completed',
            payment_date: '2024-01-20T14:30:00Z',
            description: 'Express Shipping - New York to Toronto',
            fee_amount: 5.1,
            net_amount: 159.9,
            gateway_transaction_id: 'pi_1234567890',
        },
        {
            id: 2,
            payment_number: 'PAY-2024-002',
            invoice_number: 'INV-2024-003',
            amount: 150.0,
            currency: 'USD',
            method: 'paypal',
            gateway: 'paypal',
            status: 'completed',
            payment_date: '2024-01-22T16:45:00Z',
            description: 'International Shipping - Chicago to London (Partial)',
            fee_amount: 4.65,
            net_amount: 145.35,
        },
        {
            id: 3,
            payment_number: 'PAY-2024-003',
            invoice_number: 'INV-2024-004',
            amount: 75.0,
            currency: 'USD',
            method: 'mpesa',
            gateway: 'clickpesa',
            status: 'pending',
            payment_date: '2024-01-25T10:15:00Z',
            description: 'Standard Shipping - Miami to Nairobi',
            fee_amount: 1.13,
            net_amount: 73.87,
        },
        {
            id: 4,
            payment_number: 'PAY-2024-004',
            invoice_number: 'INV-2024-005',
            amount: 200.0,
            currency: 'USD',
            method: 'card',
            gateway: 'stripe',
            status: 'failed',
            payment_date: '2024-01-26T09:20:00Z',
            description: 'Express International - Boston to Sydney',
            fee_amount: 0,
            net_amount: 0,
        },
        {
            id: 5,
            payment_number: 'PAY-2024-005',
            invoice_number: 'INV-2024-006',
            amount: 125.0,
            currency: 'USD',
            method: 'bank_transfer',
            gateway: 'stripe',
            status: 'completed',
            payment_date: '2024-01-28T11:30:00Z',
            description: 'Standard Shipping - Seattle to Vancouver',
            fee_amount: 1.0,
            net_amount: 124.0,
        },
    ];

    const mockMonthlyData: MonthlyData[] = [
        { month: 'Oct 2023', amount: 1250.0, count: 8, fees: 38.5 },
        { month: 'Nov 2023', amount: 1680.0, count: 12, fees: 52.2 },
        { month: 'Dec 2023', amount: 2100.0, count: 15, fees: 65.8 },
        { month: 'Jan 2024', amount: 2450.0, count: 18, fees: 76.3 },
    ];

    useEffect(() => {
        loadPaymentHistory();
    }, [selectedDateRange]);

    useEffect(() => {
        filterPayments();
        calculateStats();
    }, [payments, searchQuery, statusFilter, methodFilter]);

    const loadPaymentHistory = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setPayments(mockPayments);
            setMonthlyData(mockMonthlyData);
        } catch (error) {
            console.error('Failed to load payment history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterPayments = () => {
        let filtered = [...payments];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (payment) =>
                    payment.payment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    payment.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    payment.gateway_transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((payment) => payment.status === statusFilter);
        }

        // Method filter
        if (methodFilter !== 'all') {
            filtered = filtered.filter((payment) => payment.method === methodFilter);
        }

        setFilteredPayments(filtered);
    };

    const calculateStats = () => {
        const completedPayments = payments.filter((p) => p.status === 'completed');
        const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalFees = completedPayments.reduce((sum, p) => sum + p.fee_amount, 0);

        // Calculate method and gateway preferences
        const methodCounts = payments.reduce(
            (acc, p) => {
                acc[p.method] = (acc[p.method] || 0) + 1;
                return acc;
            },
            {} as { [key: string]: number },
        );

        const gatewayCounts = payments.reduce(
            (acc, p) => {
                acc[p.gateway] = (acc[p.gateway] || 0) + 1;
                return acc;
            },
            {} as { [key: string]: number },
        );

        const preferredMethod = Object.entries(methodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'card';
        const preferredGateway = Object.entries(gatewayCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'stripe';

        const stats: PaymentStats = {
            totalPayments: payments.length,
            totalAmount,
            totalFees,
            averagePayment: completedPayments.length > 0 ? totalAmount / completedPayments.length : 0,
            successRate: payments.length > 0 ? (completedPayments.length / payments.length) * 100 : 0,
            monthlyGrowth: 15.8, // Mock growth rate
            preferredMethod,
            preferredGateway,
        };

        setPaymentStats(stats);
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            completed: <CheckCircle className="h-4 w-4" />,
            pending: <Clock className="h-4 w-4" />,
            failed: <XCircle className="h-4 w-4" />,
            refunded: <AlertTriangle className="h-4 w-4" />,
        };
        return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            completed: 'bg-green-100 text-green-800 border-green-300',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            failed: 'bg-red-100 text-red-800 border-red-300',
            refunded: 'bg-orange-100 text-orange-800 border-orange-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getMethodIcon = (method: string) => {
        const icons = {
            card: <CreditCard className="h-4 w-4" />,
            paypal: <CreditCard className="h-4 w-4" />,
            mpesa: <Smartphone className="h-4 w-4" />,
            tigopesa: <Smartphone className="h-4 w-4" />,
            airtelmoney: <Smartphone className="h-4 w-4" />,
            bank_transfer: <Building2 className="h-4 w-4" />,
        };
        return icons[method as keyof typeof icons] || <CreditCard className="h-4 w-4" />;
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const exportPaymentHistory = () => {
        // Simulate CSV export
        console.log('Exporting payment history...');
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center text-lg sm:text-xl">
                            <History className="mr-2 h-5 w-5" />
                            Payment History & Analytics
                        </CardTitle>
                        <CardDescription>Track your payment history and analyze spending patterns</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportPaymentHistory}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={loadPaymentHistory} disabled={isLoading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Analytics Dashboard */}
                {showAnalytics && paymentStats && (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-600 sm:text-sm">Total Payments</p>
                                            <p className="text-lg font-bold text-gray-900 sm:text-xl">{paymentStats.totalPayments}</p>
                                        </div>
                                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                            <DollarSign className="h-4 w-4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-600 sm:text-sm">Total Amount</p>
                                            <p className="text-sm font-bold text-green-600 sm:text-base">
                                                {formatCurrency(paymentStats.totalAmount)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-green-100 p-2 text-green-600">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-600 sm:text-sm">Success Rate</p>
                                            <p className="text-lg font-bold text-blue-600 sm:text-xl">{paymentStats.successRate.toFixed(1)}%</p>
                                        </div>
                                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-600 sm:text-sm">Avg Payment</p>
                                            <p className="text-sm font-bold text-purple-600 sm:text-base">
                                                {formatCurrency(paymentStats.averagePayment)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                                            <BarChart3 className="h-4 w-4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Monthly Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Monthly Payment Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {monthlyData.map((data, index) => (
                                        <div key={data.month} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 text-sm text-gray-600">{data.month}</div>
                                                <div className="h-2 flex-1 rounded-full bg-gray-200">
                                                    <div
                                                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                                        style={{
                                                            width: `${(data.amount / Math.max(...monthlyData.map((d) => d.amount))) * 100}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">{formatCurrency(data.amount)}</p>
                                                <p className="text-xs text-gray-600">{data.count} payments</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method Breakdown */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Preferred Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        {getMethodIcon(paymentStats.preferredMethod)}
                                        <div>
                                            <p className="font-medium capitalize">{paymentStats.preferredMethod.replace('_', ' ')}</p>
                                            <p className="text-sm text-gray-600">Most used payment method</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Preferred Gateway</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-gray-100 p-2">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium capitalize">{paymentStats.preferredGateway}</p>
                                            <p className="text-sm text-gray-600">Most used gateway</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search payments..."
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Payment History List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading payment history...</span>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="py-8 text-center">
                        <History className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">No Payment History</h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' || methodFilter !== 'all'
                                ? 'No payments match your current filters'
                                : 'Your payment history will appear here once you make payments'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPayments.map((payment) => (
                            <Card key={payment.id} className="transition-shadow hover:shadow-md">
                                <CardContent className="pt-4">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h4 className="font-medium text-gray-900">{payment.payment_number}</h4>
                                                <Badge className={getStatusColor(payment.status)}>
                                                    {getStatusIcon(payment.status)}
                                                    <span className="ml-1 capitalize">{payment.status}</span>
                                                </Badge>
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    {getMethodIcon(payment.method)}
                                                    <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                                                </Badge>
                                            </div>

                                            <div className="mb-2 grid grid-cols-1 gap-4 text-sm text-gray-600 sm:grid-cols-3">
                                                <div>
                                                    <span className="font-medium">Amount:</span>
                                                    <p className="font-bold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Fee:</span>
                                                    <p className="text-red-600">-{formatCurrency(payment.fee_amount, payment.currency)}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Net Amount:</span>
                                                    <p className="font-bold text-green-600">{formatCurrency(payment.net_amount, payment.currency)}</p>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                <p className="mb-1">
                                                    <span className="font-medium">Invoice:</span> {payment.invoice_number}
                                                </p>
                                                <p className="mb-1">
                                                    <span className="font-medium">Description:</span> {payment.description}
                                                </p>
                                                <p className="mb-1">
                                                    <span className="font-medium">Gateway:</span>
                                                    <Badge variant="outline" className="ml-2 capitalize">
                                                        {payment.gateway}
                                                    </Badge>
                                                </p>
                                                {payment.gateway_transaction_id && (
                                                    <p className="text-xs text-gray-500">Transaction ID: {payment.gateway_transaction_id}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="mb-1 text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                                            {payment.status === 'refunded' && payment.refund_amount && (
                                                <p className="text-xs text-orange-600">
                                                    Refunded: {formatCurrency(payment.refund_amount, payment.currency)}
                                                </p>
                                            )}
                                        </div>
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
