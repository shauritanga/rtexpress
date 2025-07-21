import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    CreditCard,
    Smartphone,
    Building2,
    Plus,
    Trash2,
    Edit,
    Check,
    X,
    Shield,
    AlertTriangle,
    Info,
    Star,
    Clock,
    DollarSign,
    Zap,
    Globe
} from 'lucide-react';

interface PaymentMethod {
    id: string;
    type: 'card' | 'mobile' | 'bank' | 'digital_wallet';
    gateway: 'stripe' | 'paypal' | 'clickpesa';
    name: string;
    details: {
        last4?: string;
        brand?: string;
        expiry?: string;
        phone?: string;
        bank_name?: string;
        account_type?: string;
        email?: string;
    };
    is_default: boolean;
    is_verified: boolean;
    created_at: string;
    last_used?: string;
}

interface PaymentGateway {
    id: string;
    name: string;
    logo: string;
    methods: string[];
    fees: {
        card?: string;
        mobile?: string;
        bank?: string;
    };
    processing_time: string;
    supported_currencies: string[];
    is_enabled: boolean;
}

interface Props {
    className?: string;
    onPaymentMethodSelect?: (method: PaymentMethod) => void;
    onPaymentMethodAdd?: (method: PaymentMethod) => void;
    onPaymentMethodRemove?: (methodId: string) => void;
    showAddButton?: boolean;
    selectedMethodId?: string;
}

export default function PaymentMethods({ 
    className = '', 
    onPaymentMethodSelect,
    onPaymentMethodAdd,
    onPaymentMethodRemove,
    showAddButton = true,
    selectedMethodId
}: Props) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<string>('');
    const [selectedMethodType, setSelectedMethodType] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Mock data - in real app, would fetch from API
    const mockPaymentMethods: PaymentMethod[] = [
        {
            id: 'pm_1',
            type: 'card',
            gateway: 'stripe',
            name: 'Visa ending in 4242',
            details: {
                last4: '4242',
                brand: 'visa',
                expiry: '12/25',
            },
            is_default: true,
            is_verified: true,
            created_at: '2024-01-15T10:30:00Z',
            last_used: '2024-01-20T14:22:00Z',
        },
        {
            id: 'pm_2',
            type: 'mobile',
            gateway: 'clickpesa',
            name: 'M-Pesa +255 *** 4567',
            details: {
                phone: '+255 *** 4567',
            },
            is_default: false,
            is_verified: true,
            created_at: '2024-01-10T09:15:00Z',
            last_used: '2024-01-18T11:45:00Z',
        },
        {
            id: 'pm_3',
            type: 'digital_wallet',
            gateway: 'paypal',
            name: 'PayPal Account',
            details: {
                email: 'user@example.com',
            },
            is_default: false,
            is_verified: true,
            created_at: '2024-01-05T16:20:00Z',
        },
    ];

    const mockPaymentGateways: PaymentGateway[] = [
        {
            id: 'stripe',
            name: 'Stripe',
            logo: '/images/gateways/stripe.png',
            methods: ['card', 'bank'],
            fees: {
                card: '2.9% + $0.30',
                bank: '0.8%',
            },
            processing_time: 'Instant',
            supported_currencies: ['USD', 'EUR', 'GBP', 'CAD'],
            is_enabled: true,
        },
        {
            id: 'paypal',
            name: 'PayPal',
            logo: '/images/gateways/paypal.png',
            methods: ['digital_wallet', 'card'],
            fees: {
                card: '3.4% + $0.30',
            },
            processing_time: 'Instant',
            supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
            is_enabled: true,
        },
        {
            id: 'clickpesa',
            name: 'ClickPesa',
            logo: '/images/gateways/clickpesa.png',
            methods: ['mobile', 'bank'],
            fees: {
                mobile: '1.5%',
                bank: '1.0%',
            },
            processing_time: '1-5 minutes',
            supported_currencies: ['USD', 'TZS', 'KES', 'UGX'],
            is_enabled: true,
        },
    ];

    useEffect(() => {
        loadPaymentMethods();
        loadPaymentGateways();
    }, []);

    const loadPaymentMethods = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPaymentMethods(mockPaymentMethods);
        } catch (error) {
            console.error('Failed to load payment methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadPaymentGateways = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setPaymentGateways(mockPaymentGateways);
        } catch (error) {
            console.error('Failed to load payment gateways:', error);
        }
    };

    const handleAddPaymentMethod = () => {
        setIsAddingMethod(true);
        setSelectedGateway('');
        setSelectedMethodType('');
        setErrors({});
    };

    const handleSavePaymentMethod = async () => {
        if (!selectedGateway || !selectedMethodType) {
            setErrors({ general: 'Please select a gateway and payment method type' });
            return;
        }

        setIsLoading(true);
        try {
            // Simulate API call to add payment method
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newMethod: PaymentMethod = {
                id: `pm_${Date.now()}`,
                type: selectedMethodType as any,
                gateway: selectedGateway as any,
                name: `New ${selectedMethodType} method`,
                details: {},
                is_default: paymentMethods.length === 0,
                is_verified: false,
                created_at: new Date().toISOString(),
            };

            setPaymentMethods(prev => [...prev, newMethod]);
            setIsAddingMethod(false);
            onPaymentMethodAdd?.(newMethod);
        } catch (error) {
            setErrors({ general: 'Failed to add payment method' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemovePaymentMethod = async (methodId: string) => {
        if (!confirm('Are you sure you want to remove this payment method?')) {
            return;
        }

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
            onPaymentMethodRemove?.(methodId);
        } catch (error) {
            console.error('Failed to remove payment method:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDefault = async (methodId: string) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPaymentMethods(prev => prev.map(method => ({
                ...method,
                is_default: method.id === methodId,
            })));
        } catch (error) {
            console.error('Failed to set default payment method:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getMethodIcon = (type: string) => {
        const icons = {
            card: <CreditCard className="h-5 w-5" />,
            mobile: <Smartphone className="h-5 w-5" />,
            bank: <Building2 className="h-5 w-5" />,
            digital_wallet: <Globe className="h-5 w-5" />,
        };
        return icons[type as keyof typeof icons] || <CreditCard className="h-5 w-5" />;
    };

    const getGatewayColor = (gateway: string) => {
        const colors = {
            stripe: 'bg-purple-100 text-purple-800 border-purple-300',
            paypal: 'bg-blue-100 text-blue-800 border-blue-300',
            clickpesa: 'bg-green-100 text-green-800 border-green-300',
        };
        return colors[gateway as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getAvailableMethodTypes = (gatewayId: string) => {
        const gateway = paymentGateways.find(g => g.id === gatewayId);
        return gateway?.methods || [];
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg sm:text-xl flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Payment Methods
                        </CardTitle>
                        <CardDescription>
                            Manage your payment methods for quick and secure transactions
                        </CardDescription>
                    </div>
                    {showAddButton && (
                        <Button onClick={handleAddPaymentMethod} disabled={isAddingMethod}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Method
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Add Payment Method Form */}
                {isAddingMethod && (
                    <Card className="border-dashed border-2 border-gray-300">
                        <CardContent className="pt-6">
                            <h3 className="font-medium text-gray-900 mb-4">Add New Payment Method</h3>
                            
                            {errors.general && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                                    <p className="text-sm text-red-800">{errors.general}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="gateway">Payment Gateway</Label>
                                    <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment gateway" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentGateways.filter(g => g.is_enabled).map(gateway => (
                                                <SelectItem key={gateway.id} value={gateway.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{gateway.name}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {gateway.processing_time}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedGateway && (
                                    <div>
                                        <Label htmlFor="method-type">Payment Method Type</Label>
                                        <Select value={selectedMethodType} onValueChange={setSelectedMethodType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getAvailableMethodTypes(selectedGateway).map(method => (
                                                    <SelectItem key={method} value={method}>
                                                        <div className="flex items-center gap-2">
                                                            {getMethodIcon(method)}
                                                            <span className="capitalize">{method.replace('_', ' ')}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {selectedGateway && selectedMethodType && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium mb-1">Gateway Information</p>
                                                {(() => {
                                                    const gateway = paymentGateways.find(g => g.id === selectedGateway);
                                                    const fee = gateway?.fees[selectedMethodType as keyof typeof gateway.fees];
                                                    return (
                                                        <div className="space-y-1">
                                                            {fee && <p>Processing fee: {fee}</p>}
                                                            <p>Processing time: {gateway?.processing_time}</p>
                                                            <p>Supported currencies: {gateway?.supported_currencies.join(', ')}</p>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button onClick={handleSavePaymentMethod} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Add Method
                                        </>
                                    )}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsAddingMethod(false)}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Payment Methods List */}
                {isLoading && paymentMethods.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading payment methods...</span>
                    </div>
                ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
                        <p className="text-gray-600 mb-4">Add a payment method to get started with quick payments</p>
                        {showAddButton && (
                            <Button onClick={handleAddPaymentMethod}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Payment Method
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <Card 
                                key={method.id} 
                                className={`cursor-pointer transition-all ${
                                    selectedMethodId === method.id 
                                        ? 'ring-2 ring-blue-500 border-blue-500' 
                                        : 'hover:shadow-md'
                                }`}
                                onClick={() => onPaymentMethodSelect?.(method)}
                            >
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                {getMethodIcon(method.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                                                    {method.is_default && (
                                                        <Badge className="bg-green-100 text-green-800 border-green-300">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Default
                                                        </Badge>
                                                    )}
                                                    {!method.is_verified && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                            Unverified
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                    <Badge className={getGatewayColor(method.gateway)}>
                                                        {method.gateway}
                                                    </Badge>
                                                    <span>Added {formatDate(method.created_at)}</span>
                                                    {method.last_used && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Last used {formatDate(method.last_used)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {method.is_verified && (
                                                <div className="p-1 bg-green-100 text-green-600 rounded-full">
                                                    <Shield className="h-3 w-3" />
                                                </div>
                                            )}
                                            {!method.is_default && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSetDefault(method.id);
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    Set Default
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemovePaymentMethod(method.id);
                                                }}
                                                disabled={isLoading}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Payment Gateways Information */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Available Payment Gateways</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {paymentGateways.filter(g => g.is_enabled).map((gateway) => (
                            <div key={gateway.id} className="p-3 bg-white rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                        <span className="text-xs font-bold">{gateway.name[0]}</span>
                                    </div>
                                    <span className="font-medium text-sm">{gateway.name}</span>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div className="flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        <span>{gateway.processing_time}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        <span>From {Object.values(gateway.fees)[0]}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
