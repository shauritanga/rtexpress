import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { router } from '@inertiajs/react';
import { AlertTriangle, Building2, CreditCard, DollarSign, Loader2, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaymentMethod {
    id: string;
    name: string;
    icon: any;
    gateway: string;
}

interface Invoice {
    id: number;
    invoice_number: string;
    balance_due: number;
    currency: string;
    customer: {
        name: string;
        email: string;
    };
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
}

export default function PaymentModal({ isOpen, onClose, invoice }: Props) {
    const [selectedGateway, setSelectedGateway] = useState<string>('');
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [amount, setAmount] = useState<string>(invoice.balance_due.toString());
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [reference, setReference] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [fees, setFees] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});

    const paymentMethods: PaymentMethod[] = [
        { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, gateway: 'stripe' },
        { id: 'paypal', name: 'PayPal', icon: CreditCard, gateway: 'paypal' },
        { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, gateway: 'clickpesa' },
        { id: 'tigopesa', name: 'Tigo Pesa', icon: Smartphone, gateway: 'clickpesa' },
        { id: 'airtelmoney', name: 'Airtel Money', icon: Smartphone, gateway: 'clickpesa' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, gateway: 'stripe' },
    ];

    const gateways = [
        { id: 'stripe', name: 'Stripe', methods: ['card', 'bank_transfer'] },
        { id: 'paypal', name: 'PayPal', methods: ['paypal', 'card'] },
        { id: 'clickpesa', name: 'ClickPesa', methods: ['mpesa', 'tigopesa', 'airtelmoney', 'bank_transfer'] },
    ];

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const calculateFees = async () => {
        if (!selectedGateway || !amount) return;

        try {
            const response = await fetch('/admin/payments/calculate-fees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    gateway: selectedGateway,
                    amount: parseFloat(amount),
                    currency: invoice.currency,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setFees(data.fees);
            }
        } catch (error) {
            console.error('Failed to calculate fees:', error);
        }
    };

    useEffect(() => {
        calculateFees();
    }, [selectedGateway, amount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrors({});

        const paymentData = {
            gateway: selectedGateway,
            method: selectedMethod,
            amount: parseFloat(amount),
            phone_number: phoneNumber || undefined,
            reference: reference || undefined,
        };

        router.post(`/admin/invoices/${invoice.id}/process-payment`, paymentData, {
            onError: (errors) => {
                setErrors(errors);
                setIsProcessing(false);
            },
            onSuccess: () => {
                setIsProcessing(false);
                onClose();
            },
        });
    };

    const handleCreatePaymentIntent = async () => {
        setIsProcessing(true);

        try {
            const response = await fetch(`/admin/invoices/${invoice.id}/payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    gateway: selectedGateway,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.payment_url) {
                    window.open(data.data.payment_url, '_blank');
                }
            }
        } catch (error) {
            console.error('Failed to create payment intent:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const availableMethods = paymentMethods.filter((method) => (selectedGateway ? method.gateway === selectedGateway : true));

    const requiresPhoneNumber = ['mpesa', 'tigopesa', 'airtelmoney', 'halopesa'].includes(selectedMethod);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Process Payment
                    </DialogTitle>
                    <DialogDescription>Process payment for invoice {invoice.invoice_number}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Invoice Summary */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Customer:</span>
                                    <span className="text-sm font-medium">{invoice.customer.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Invoice:</span>
                                    <span className="text-sm font-medium">{invoice.invoice_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Balance Due:</span>
                                    <span className="text-lg font-bold">{formatCurrency(invoice.balance_due, invoice.currency)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Gateway */}
                    <div className="space-y-2">
                        <Label htmlFor="gateway">Payment Gateway *</Label>
                        <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment gateway" />
                            </SelectTrigger>
                            <SelectContent>
                                {gateways.map((gateway) => (
                                    <SelectItem key={gateway.id} value={gateway.id}>
                                        {gateway.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.gateway && <p className="text-sm text-red-600">{errors.gateway}</p>}
                    </div>

                    {/* Payment Method */}
                    {selectedGateway && (
                        <div className="space-y-2">
                            <Label htmlFor="method">Payment Method *</Label>
                            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMethods.map((method) => (
                                        <SelectItem key={method.id} value={method.id}>
                                            <div className="flex items-center">
                                                <method.icon className="mr-2 h-4 w-4" />
                                                {method.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.method && <p className="text-sm text-red-600">{errors.method}</p>}
                        </div>
                    )}

                    {/* Payment Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Payment Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0.01"
                            max={invoice.balance_due}
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter payment amount"
                            required
                        />
                        {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                    </div>

                    {/* Phone Number for Mobile Money */}
                    {requiresPhoneNumber && (
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number *</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+255 XXX XXX XXX"
                                required
                            />
                            {errors.phone_number && <p className="text-sm text-red-600">{errors.phone_number}</p>}
                        </div>
                    )}

                    {/* Reference */}
                    <div className="space-y-2">
                        <Label htmlFor="reference">Reference (Optional)</Label>
                        <Input
                            id="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Payment reference or note"
                        />
                    </div>

                    {/* Fee Information */}
                    {fees && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Payment Amount:</span>
                                        <span className="text-sm">{formatCurrency(parseFloat(amount), invoice.currency)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Gateway Fee:</span>
                                        <span className="text-sm text-orange-600">{formatCurrency(fees.fee_amount, invoice.currency)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-medium">
                                        <span className="text-sm">Net Amount:</span>
                                        <span className="text-sm">{formatCurrency(fees.net_amount, invoice.currency)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Error Messages */}
                    {errors.payment && (
                        <div className="flex items-center space-x-2 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">{errors.payment}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
                            Cancel
                        </Button>

                        {['stripe', 'paypal'].includes(selectedGateway) && selectedMethod !== 'bank_transfer' && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCreatePaymentIntent}
                                disabled={isProcessing || !selectedGateway || !selectedMethod}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Pay Online'
                                )}
                            </Button>
                        )}

                        <Button type="submit" disabled={isProcessing || !selectedGateway || !selectedMethod}>
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Process Payment'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
