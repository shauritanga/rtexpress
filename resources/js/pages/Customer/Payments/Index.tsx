import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import PaymentMethods from '@/components/customer/payments/PaymentMethods';
import InvoiceManagement from '@/components/customer/payments/InvoiceManagement';
import PaymentHistory from '@/components/customer/payments/PaymentHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    CreditCard,
    FileText,
    History,
    ArrowLeft,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Plus,
    Download,
    Settings
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
    email: string;
}

interface PaymentStats {
    totalPayments: number;
    totalAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    successRate: number;
    averagePayment: number;
    preferredMethod: string;
    lastPaymentDate: string;
}

interface Props {
    customer: Customer;
    paymentStats?: PaymentStats;
    recentInvoices?: any[];
    paymentMethods?: any[];
}

export default function PaymentsIndex({ 
    customer, 
    paymentStats = {
        totalPayments: 24,
        totalAmount: 4850.00,
        pendingAmount: 245.95,
        overdueAmount: 93.45,
        successRate: 96.8,
        averagePayment: 202.08,
        preferredMethod: 'card',
        lastPaymentDate: '2024-01-28T11:30:00Z'
    },
    recentInvoices = [],
    paymentMethods = []
}: Props) {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<any>(null);
    const [selectedInvoice, setSelectedInvoice] = React.useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const [selectedGateway, setSelectedGateway] = React.useState<string>('stripe');
    const [paymentAmount, setPaymentAmount] = React.useState<string>('');
    const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);

    const handlePaymentMethodSelect = (method: any) => {
        setSelectedPaymentMethod(method);
        console.log('Payment method selected:', method);
    };

    const handlePaymentMethodAdd = (method: any) => {
        console.log('Payment method added:', method);
        // In a real app, this would refresh the payment methods list
    };

    const handlePaymentMethodRemove = (methodId: string) => {
        console.log('Payment method removed:', methodId);
        // In a real app, this would remove the method from the list
    };

    const handleInvoiceSelect = (invoice: any) => {
        setSelectedInvoice(invoice);
        console.log('Invoice selected:', invoice);
    };

    const handlePaymentInitiate = (invoice: any) => {
        setSelectedInvoice(invoice);
        setPaymentAmount(invoice.balance_due.toString());
        setSelectedGateway('stripe');
        setShowPaymentModal(true);
        console.log('Payment initiated for invoice:', invoice);
    };

    const processPayment = async () => {
        if (!selectedInvoice || !paymentAmount) return;

        setIsProcessingPayment(true);
        try {
            const response = await fetch(`/customer/api/payments/${selectedInvoice.id}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    payment_method_id: `${selectedGateway}_default`,
                    amount: parseFloat(paymentAmount),
                    gateway: selectedGateway,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`Payment of $${paymentAmount} processed successfully for ${selectedInvoice.invoice_number}!`);
                setShowPaymentModal(false);
                // Refresh the page to show updated invoice status
                window.location.reload();
            } else {
                alert(`Payment failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            alert('Payment processing failed. Please try again.');
        } finally {
            setIsProcessingPayment(false);
        }
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

    const getStatusColor = (amount: number) => {
        if (amount === 0) return 'text-green-600';
        if (amount > 0) return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <AppLayout>
            <Head title="Payments & Billing" />
            
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header - Mobile Optimized */}
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            
                            {/* Quick Actions - Mobile Responsive */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Add Method</span>
                                </Button>
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Export</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-blue-600" />
                                Payments & Billing
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • Manage payments, invoices, and billing information
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Statistics - Mobile First Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Paid</p>
                                    <p className="text-sm sm:text-lg font-bold text-green-600 truncate">
                                        {formatCurrency(paymentStats.totalAmount)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {paymentStats.totalPayments} payments
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                                    <p className={`text-sm sm:text-lg font-bold truncate ${getStatusColor(paymentStats.pendingAmount)}`}>
                                        {formatCurrency(paymentStats.pendingAmount)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Overdue</p>
                                    <p className={`text-sm sm:text-lg font-bold truncate ${getStatusColor(paymentStats.overdueAmount)}`}>
                                        {formatCurrency(paymentStats.overdueAmount)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Success Rate</p>
                                    <p className="text-sm sm:text-lg font-bold text-blue-600 truncate">
                                        {paymentStats.successRate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Summary */}
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">Payment Summary</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600 mt-1">
                                    <span>Average payment: {formatCurrency(paymentStats.averagePayment)}</span>
                                    <span>Preferred method: {paymentStats.preferredMethod}</span>
                                    <span>Last payment: {formatDate(paymentStats.lastPaymentDate)}</span>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                                Active
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content - Mobile Responsive Tabs */}
                <Tabs defaultValue="methods" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="methods" className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Methods</span>
                        </TabsTrigger>
                        <TabsTrigger value="invoices" className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Pay Bills</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center">
                            <History className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">History</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="methods">
                        <PaymentMethods 
                            onPaymentMethodSelect={handlePaymentMethodSelect}
                            onPaymentMethodAdd={handlePaymentMethodAdd}
                            onPaymentMethodRemove={handlePaymentMethodRemove}
                            selectedMethodId={selectedPaymentMethod?.id}
                        />
                    </TabsContent>

                    <TabsContent value="invoices">
                        <InvoiceManagement
                            onInvoiceSelect={handleInvoiceSelect}
                            onPaymentInitiate={handlePaymentInitiate}
                        />
                    </TabsContent>

                    <TabsContent value="history">
                        <PaymentHistory 
                            showAnalytics={true}
                            dateRange="last_90_days"
                        />
                    </TabsContent>
                </Tabs>

                {/* Payment Gateway Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Supported Payment Methods</CardTitle>
                        <CardDescription>
                            We support multiple payment gateways for your convenience
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Stripe</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Credit cards, bank transfers, and digital wallets
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        <p>• Processing fee: 2.9% + $0.30</p>
                                        <p>• Instant processing</p>
                                        <p>• Supports USD, EUR, GBP, CAD</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">PayPal</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        PayPal balance, cards, and bank accounts
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        <p>• Processing fee: 3.4% + $0.30</p>
                                        <p>• Instant processing</p>
                                        <p>• Global currency support</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">ClickPesa</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        M-Pesa, Tigo Pesa, Airtel Money, bank transfers
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        <p>• Processing fee: 1.5% mobile, 1.0% bank</p>
                                        <p>• 1-5 minutes processing</p>
                                        <p>• East African currencies</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                            Security & Compliance
                        </CardTitle>
                        <CardDescription>
                            Your payment information is protected with industry-standard security
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">PCI DSS Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">256-bit SSL Encryption</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">Fraud Protection</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">24/7 Monitoring</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pay Invoice</DialogTitle>
                        <DialogDescription>
                            {selectedInvoice && (
                                <>Process payment for invoice {selectedInvoice.invoice_number}</>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Invoice Number:</span>
                                    <span>{selectedInvoice.invoice_number}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Total Amount:</span>
                                    <span>{formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Amount Paid:</span>
                                    <span className="text-green-600">{formatCurrency(selectedInvoice.paid_amount, selectedInvoice.currency)}</span>
                                </div>
                                <div className="flex justify-between items-center border-t pt-2">
                                    <span className="font-semibold">Balance Due:</span>
                                    <span className="font-semibold text-red-600">{formatCurrency(selectedInvoice.balance_due, selectedInvoice.currency)}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="gateway">Payment Gateway</Label>
                                    <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment gateway" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="stripe">Stripe (Credit/Debit Card)</SelectItem>
                                            <SelectItem value="paypal">PayPal</SelectItem>
                                            <SelectItem value="clickpesa">ClickPesa (M-Pesa)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="amount">Payment Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={selectedInvoice?.balance_due}
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="Enter payment amount"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Maximum: {formatCurrency(selectedInvoice?.balance_due || 0, selectedInvoice?.currency)}
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-700">
                                        <CreditCard className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {selectedGateway === 'stripe' && 'Secure payment via Stripe'}
                                            {selectedGateway === 'paypal' && 'Pay with your PayPal account'}
                                            {selectedGateway === 'clickpesa' && 'Mobile money via ClickPesa'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={processPayment}
                            disabled={isProcessingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {isProcessingPayment ? 'Processing...' : 'Process Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
