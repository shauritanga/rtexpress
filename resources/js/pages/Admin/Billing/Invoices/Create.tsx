import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    FileText, 
    Plus, 
    Trash2,
    ArrowLeft,
    Calculator,
    Save,
    Send
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

interface Shipment {
    id: number;
    tracking_number: string;
    recipient_name: string;
    service_type: string;
    total_amount?: number;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
    unit: string;
    item_code?: string;
    type: string;
    discount_percentage: number;
    tax_rate: number;
    notes?: string;
}

interface Props {
    customers: Customer[];
    shipments: Shipment[];
    selectedShipment?: Shipment & { customer: Customer };
    preselected?: {
        customer_id?: string;
        shipment_id?: string;
    };
}

export default function CreateInvoice({
    customers = [],
    shipments = [],
    selectedShipment,
    preselected = {}
}: Props) {
    const { toast } = useToast();
    const [availableShipments, setAvailableShipments] = useState<Shipment[]>(shipments);
    const [loadingShipments, setLoadingShipments] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: preselected.customer_id || '',
        shipment_id: preselected.shipment_id || '',
        type: 'standard',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        currency: 'TZS',
        tax_rate: 18, // Default VAT rate
        tax_type: 'VAT',
        discount_amount: 0,
        notes: '',
        terms_conditions: 'Payment is due within 30 days of invoice date.',
        payment_terms: 'Net 30',
        payment_methods: ['bank_transfer', 'credit_card'],
        billing_address: {
            name: '',
            address: '',
            city: '',
            country: 'Tanzania',
        }
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        {
            description: 'Shipping Service',
            quantity: 1,
            unit_price: 0,
            unit: 'service',
            type: 'service',
            discount_percentage: 0,
            tax_rate: 18,
        }
    ]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update billing address when customer changes
    useEffect(() => {
        if (formData.customer_id) {
            const customer = customers.find(c => c.id.toString() === formData.customer_id);
            if (customer) {
                setFormData(prev => ({
                    ...prev,
                    billing_address: {
                        ...prev.billing_address,
                        name: customer.name,
                        address: customer.address || '',
                    }
                }));
            }
        }
    }, [formData.customer_id, customers]);

    // Load shipment data if pre-selected
    useEffect(() => {
        if (selectedShipment) {
            setFormData(prev => ({
                ...prev,
                customer_id: selectedShipment.customer.id.toString(),
                billing_address: {
                    ...prev.billing_address,
                    name: selectedShipment.customer.name,
                    address: selectedShipment.customer.address || '',
                }
            }));

            if (selectedShipment.total_amount) {
                setItems([{
                    description: `Shipping Service - ${selectedShipment.tracking_number}`,
                    quantity: 1,
                    unit_price: selectedShipment.total_amount,
                    unit: 'service',
                    type: 'shipping',
                    discount_percentage: 0,
                    tax_rate: 18,
                }]);
            }
        }
    }, [selectedShipment]);

    // Load shipments if customer is pre-selected
    useEffect(() => {
        if (formData.customer_id && !selectedShipment) {
            fetchCustomerShipments(formData.customer_id);
        }
    }, []); // Only run on mount

    // Fetch customer shipments when customer is selected
    const fetchCustomerShipments = async (customerId: string) => {
        if (!customerId) {
            setAvailableShipments([]);
            return;
        }

        setLoadingShipments(true);
        try {
            const response = await fetch(`/admin/api/invoices/customer-shipments?customer_id=${customerId}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const shipments = await response.json();
                setAvailableShipments(shipments);
            } else {
                console.error('Failed to fetch customer shipments');
                setAvailableShipments([]);
            }
        } catch (error) {
            console.error('Error fetching customer shipments:', error);
            setAvailableShipments([]);
        } finally {
            setLoadingShipments(false);
        }
    };

    // Handle customer selection change
    const handleCustomerChange = (customerId: string) => {
        setFormData(prev => ({
            ...prev,
            customer_id: customerId,
            shipment_id: '' // Reset shipment selection
        }));

        // Fetch shipments for the selected customer
        fetchCustomerShipments(customerId);
    };

    const addItem = () => {
        setItems([...items, {
            description: '',
            quantity: 1,
            unit_price: 0,
            unit: 'pcs',
            type: 'service',
            discount_percentage: 0,
            tax_rate: formData.tax_rate,
        }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateItemTotal = (item: InvoiceItem) => {
        const lineTotal = item.quantity * item.unit_price;
        const discountAmount = lineTotal * (item.discount_percentage / 100);
        const afterDiscount = lineTotal - discountAmount;
        const taxAmount = afterDiscount * (item.tax_rate / 100);
        return afterDiscount + taxAmount;
    };

    const formatCurrency = (amount: number, currency: string) => {
        if (currency === 'TZS') {
            return new Intl.NumberFormat('sw-TZ', {
                style: 'currency',
                currency: 'TZS',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.quantity * item.unit_price);
        }, 0);

        const totalDiscount = items.reduce((sum, item) => {
            const lineTotal = item.quantity * item.unit_price;
            return sum + (lineTotal * (item.discount_percentage / 100));
        }, 0) + formData.discount_amount;

        const afterDiscount = subtotal - totalDiscount;
        const taxAmount = items.reduce((sum, item) => {
            const lineTotal = item.quantity * item.unit_price;
            const discountAmount = lineTotal * (item.discount_percentage / 100);
            const afterItemDiscount = lineTotal - discountAmount;
            return sum + (afterItemDiscount * (item.tax_rate / 100));
        }, 0);

        const total = afterDiscount + taxAmount;

        return {
            subtotal,
            totalDiscount,
            taxAmount,
            total
        };
    };

    const totals = calculateTotals();

    const handleSubmit = async (e: React.FormEvent, action: 'save' | 'send' = 'save') => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const submitData = {
            ...formData,
            shipment_id: formData.shipment_id === 'none' ? null : formData.shipment_id,
            items: items.map((item, index) => ({ ...item, sort_order: index })),
            action
        };

        try {
            router.post('/admin/invoices', submitData, {
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);

                    // Show error toast
                    toast({
                        title: "Error Creating Invoice",
                        description: "Please check the form for errors and try again.",
                        variant: "destructive",
                    });
                },
                onSuccess: (page) => {
                    setIsSubmitting(false);

                    // Show success toast
                    const actionText = action === 'send' ? 'created and sent' : 'created';
                    toast({
                        title: "Invoice Created Successfully!",
                        description: `Invoice has been ${actionText}. ${action === 'send' ? 'Customer has been notified.' : ''}`,
                        variant: "success",
                    });

                    // Navigate to invoices list after a short delay
                    setTimeout(() => {
                        router.visit('/admin/invoices');
                    }, 1500);
                }
            });
        } catch (error) {
            setIsSubmitting(false);
            toast({
                title: "Unexpected Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Create Invoice" />

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
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Invoice</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Generate a new invoice for customer billing
                        </p>
                    </div>
                </div>

                <form onSubmit={(e) => handleSubmit(e, 'save')} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Information</CardTitle>
                            <CardDescription>
                                Basic invoice details and customer information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_id">Customer *</Label>
                                    <Select
                                        value={formData.customer_id}
                                        onValueChange={handleCustomerChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.name} - {customer.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && (
                                        <p className="text-sm text-red-600">{errors.customer_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shipment_id">Related Shipment (Optional)</Label>
                                    <Select
                                        value={formData.shipment_id}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, shipment_id: value }))}
                                        disabled={!formData.customer_id || loadingShipments}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                !formData.customer_id
                                                    ? "Select customer first"
                                                    : loadingShipments
                                                        ? "Loading shipments..."
                                                        : "Select shipment"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No shipment</SelectItem>
                                            {availableShipments.map((shipment) => (
                                                <SelectItem key={shipment.id} value={shipment.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{shipment.tracking_number}</span>
                                                        <span className="text-sm text-gray-500">
                                                            {shipment.recipient_name} • {shipment.service_type}
                                                            {shipment.total_amount && ` • TSh ${shipment.total_amount.toLocaleString()}`}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {availableShipments.length === 0 && formData.customer_id && !loadingShipments && (
                                                <SelectItem value="no-shipments" disabled>
                                                    No uninvoiced shipments found
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {formData.customer_id && availableShipments.length === 0 && !loadingShipments && (
                                        <p className="text-sm text-gray-500">
                                            This customer has no uninvoiced shipments
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="issue_date">Issue Date *</Label>
                                    <Input
                                        id="issue_date"
                                        type="date"
                                        value={formData.issue_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                                        required
                                    />
                                    {errors.issue_date && (
                                        <p className="text-sm text-red-600">{errors.issue_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Due Date *</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                        required
                                    />
                                    {errors.due_date && (
                                        <p className="text-sm text-red-600">{errors.due_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency *</Label>
                                    <Select 
                                        value={formData.currency} 
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Billing Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Address</CardTitle>
                            <CardDescription>
                                Customer billing information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="billing_name">Name *</Label>
                                    <Input
                                        id="billing_name"
                                        value={formData.billing_address.name}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            billing_address: { ...prev.billing_address, name: e.target.value }
                                        }))}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_city">City *</Label>
                                    <Input
                                        id="billing_city"
                                        value={formData.billing_address.city}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            billing_address: { ...prev.billing_address, city: e.target.value }
                                        }))}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="billing_address">Address *</Label>
                                <Textarea
                                    id="billing_address"
                                    value={formData.billing_address.address}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        billing_address: { ...prev.billing_address, address: e.target.value }
                                    }))}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="billing_country">Country *</Label>
                                <Select
                                    value={formData.billing_address.country}
                                    onValueChange={(value) => setFormData(prev => ({
                                        ...prev,
                                        billing_address: { ...prev.billing_address, country: value }
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                                        <SelectItem value="Kenya">Kenya</SelectItem>
                                        <SelectItem value="Uganda">Uganda</SelectItem>
                                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                                        <SelectItem value="Burundi">Burundi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Invoice Items</span>
                                <Button type="button" onClick={addItem} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                Add services, products, or charges to this invoice
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                                            <div className="sm:col-span-2 lg:col-span-2 space-y-2">
                                                <Label>Description *</Label>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    placeholder="Service or product description"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Quantity *</Label>
                                                <Input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Unit Price *</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Tax Rate (%)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={item.tax_rate}
                                                    onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Total</Label>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm sm:text-base">
                                                        {formatCurrency(calculateItemTotal(item), formData.currency)}
                                                    </span>
                                                    {items.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-600 hover:text-red-700 ml-2"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-4">
                                            <div className="space-y-2">
                                                <Label>Unit</Label>
                                                <Input
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                    placeholder="pcs, kg, hours, etc."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Item Code</Label>
                                                <Input
                                                    value={item.item_code || ''}
                                                    onChange={(e) => updateItem(index, 'item_code', e.target.value)}
                                                    placeholder="SKU or service code"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <Select
                                                    value={item.type}
                                                    onValueChange={(value) => updateItem(index, 'type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="service">Service</SelectItem>
                                                        <SelectItem value="product">Product</SelectItem>
                                                        <SelectItem value="shipping">Shipping</SelectItem>
                                                        <SelectItem value="tax">Tax</SelectItem>
                                                        <SelectItem value="discount">Discount</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {item.notes !== undefined && (
                                            <div className="mt-4 space-y-2">
                                                <Label>Notes</Label>
                                                <Textarea
                                                    value={item.notes}
                                                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                    placeholder="Additional notes for this item"
                                                    rows={2}
                                                />
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>

                            {/* Invoice Totals */}
                            <Card className="mt-6">
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(totals.subtotal, formData.currency)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Discount:</span>
                                            <span>-{formatCurrency(totals.totalDiscount, formData.currency)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>{formatCurrency(totals.taxAmount, formData.currency)}</span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total:</span>
                                                <span>{formatCurrency(totals.total, formData.currency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>

                    {/* Additional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                            <CardDescription>
                                Terms, conditions, and payment information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional notes or instructions"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                                <Textarea
                                    id="terms_conditions"
                                    value={formData.terms_conditions}
                                    onChange={(e) => setFormData(prev => ({ ...prev, terms_conditions: e.target.value }))}
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_terms">Payment Terms</Label>
                                    <Select
                                        value={formData.payment_terms}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                                            <SelectItem value="Net 15">Net 15</SelectItem>
                                            <SelectItem value="Net 30">Net 30</SelectItem>
                                            <SelectItem value="Net 60">Net 60</SelectItem>
                                            <SelectItem value="Net 90">Net 90</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="discount_amount">Invoice Discount</Label>
                                    <Input
                                        id="discount_amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.discount_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-4">
                                <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                                    <Link href="/admin/billing/invoices">
                                        Cancel
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    onClick={(e) => handleSubmit(e, 'save')}
                                    className="w-full sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Draft
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={(e) => handleSubmit(e, 'send')}
                                    className="w-full sm:w-auto"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Save & Send
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
