import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Percent,
    Gift,
    Star,
    Trophy,
    Target,
    TrendingUp,
    Calendar,
    Check,
    X,
    Plus,
    Info,
    Sparkles,
    Award,
    Zap
} from 'lucide-react';

interface Discount {
    id: string;
    type: 'volume' | 'loyalty' | 'promotional' | 'corporate' | 'seasonal';
    title: string;
    description: string;
    discountPercent: number;
    discountAmount?: number;
    minSpend?: number;
    minShipments?: number;
    validUntil?: string;
    code?: string;
    active: boolean;
    applied: boolean;
    icon: React.ReactNode;
    color: string;
}

interface LoyaltyTier {
    id: string;
    name: string;
    minSpend: number;
    discountPercent: number;
    benefits: string[];
    current: boolean;
    next?: boolean;
}

interface Props {
    className?: string;
    currentSpend?: number;
    totalShipments?: number;
    onDiscountApply?: (discount: Discount) => void;
    onDiscountRemove?: (discountId: string) => void;
}

export default function DiscountManager({ 
    className = '', 
    currentSpend = 2450,
    totalShipments = 48,
    onDiscountApply,
    onDiscountRemove
}: Props) {
    const [promoCode, setPromoCode] = useState('');
    const [isApplyingCode, setIsApplyingCode] = useState(false);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [appliedDiscounts, setAppliedDiscounts] = useState<string[]>(['volume-tier-2']);

    const loyaltyTiers: LoyaltyTier[] = [
        {
            id: 'bronze',
            name: 'Bronze',
            minSpend: 0,
            discountPercent: 0,
            benefits: ['Standard support', 'Basic tracking'],
            current: false,
        },
        {
            id: 'silver',
            name: 'Silver',
            minSpend: 1000,
            discountPercent: 5,
            benefits: ['5% discount', 'Priority support', 'Extended tracking'],
            current: false,
        },
        {
            id: 'gold',
            name: 'Gold',
            minSpend: 2500,
            discountPercent: 10,
            benefits: ['10% discount', 'Dedicated support', 'Free packaging'],
            current: true,
        },
        {
            id: 'platinum',
            name: 'Platinum',
            minSpend: 5000,
            discountPercent: 15,
            benefits: ['15% discount', 'Account manager', 'Custom solutions'],
            current: false,
            next: true,
        },
    ];

    const availableDiscounts: Discount[] = [
        {
            id: 'volume-tier-2',
            type: 'volume',
            title: 'Volume Discount - Tier 2',
            description: 'Automatic 10% discount for 25+ shipments this month',
            discountPercent: 10,
            minShipments: 25,
            active: true,
            applied: true,
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'bg-blue-100 text-blue-800 border-blue-300',
        },
        {
            id: 'loyalty-gold',
            type: 'loyalty',
            title: 'Gold Member Discount',
            description: 'Loyalty program benefit - 10% off all shipments',
            discountPercent: 10,
            minSpend: 2500,
            active: true,
            applied: false,
            icon: <Star className="h-4 w-4" />,
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        },
        {
            id: 'new-year-2024',
            type: 'seasonal',
            title: 'New Year Special',
            description: 'Limited time offer - 20% off express services',
            discountPercent: 20,
            validUntil: '2024-01-31',
            code: 'NEWYEAR20',
            active: true,
            applied: false,
            icon: <Sparkles className="h-4 w-4" />,
            color: 'bg-purple-100 text-purple-800 border-purple-300',
        },
        {
            id: 'corporate-rate',
            type: 'corporate',
            title: 'Corporate Account Rate',
            description: 'Special pricing for corporate customers',
            discountPercent: 15,
            active: true,
            applied: false,
            icon: <Award className="h-4 w-4" />,
            color: 'bg-green-100 text-green-800 border-green-300',
        },
        {
            id: 'first-time',
            type: 'promotional',
            title: 'First Time Customer',
            description: 'Welcome bonus - $10 off your first shipment',
            discountAmount: 10,
            discountPercent: 0,
            minSpend: 25,
            active: false,
            applied: false,
            icon: <Gift className="h-4 w-4" />,
            color: 'bg-pink-100 text-pink-800 border-pink-300',
        },
    ];

    const currentTier = loyaltyTiers.find(tier => tier.current);
    const nextTier = loyaltyTiers.find(tier => tier.next);
    const progressToNext = nextTier ? (currentSpend / nextTier.minSpend) * 100 : 100;
    const remainingToNext = nextTier ? Math.max(0, nextTier.minSpend - currentSpend) : 0;

    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) {
            setCodeError('Please enter a promo code');
            return;
        }

        setIsApplyingCode(true);
        setCodeError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if code exists in available discounts
            const discount = availableDiscounts.find(d => d.code === promoCode.toUpperCase());
            
            if (discount) {
                if (appliedDiscounts.includes(discount.id)) {
                    setCodeError('This discount is already applied');
                } else {
                    setAppliedDiscounts(prev => [...prev, discount.id]);
                    onDiscountApply?.(discount);
                    setPromoCode('');
                }
            } else {
                setCodeError('Invalid promo code');
            }
        } catch (error) {
            setCodeError('Failed to apply promo code');
        } finally {
            setIsApplyingCode(false);
        }
    };

    const handleRemoveDiscount = (discountId: string) => {
        setAppliedDiscounts(prev => prev.filter(id => id !== discountId));
        onDiscountRemove?.(discountId);
    };

    const handleApplyDiscount = (discount: Discount) => {
        if (!appliedDiscounts.includes(discount.id)) {
            setAppliedDiscounts(prev => [...prev, discount.id]);
            onDiscountApply?.(discount);
        }
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            volume: <TrendingUp className="h-4 w-4" />,
            loyalty: <Star className="h-4 w-4" />,
            promotional: <Gift className="h-4 w-4" />,
            corporate: <Award className="h-4 w-4" />,
            seasonal: <Sparkles className="h-4 w-4" />,
        };
        return icons[type as keyof typeof icons] || <Percent className="h-4 w-4" />;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Loyalty Status */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                        Loyalty Status
                    </CardTitle>
                    <CardDescription>
                        Your current tier and progress to the next level
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Tier */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-yellow-900">{currentTier?.name} Member</h3>
                                <p className="text-sm text-yellow-700">
                                    {currentTier?.discountPercent}% discount on all shipments
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Current Tier
                        </Badge>
                    </div>

                    {/* Progress to Next Tier */}
                    {nextTier && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Progress to {nextTier.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                    ${currentSpend.toLocaleString()} / ${nextTier.minSpend.toLocaleString()}
                                </span>
                            </div>
                            <Progress value={Math.min(progressToNext, 100)} className="h-2" />
                            <p className="text-sm text-gray-600">
                                Spend ${remainingToNext.toLocaleString()} more to unlock {nextTier.discountPercent}% discount
                            </p>
                        </div>
                    )}

                    {/* Tier Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentTier?.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Promo Code Entry */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center">
                        <Gift className="h-5 w-5 mr-2 text-pink-600" />
                        Promo Code
                    </CardTitle>
                    <CardDescription>
                        Enter a promotional code to get additional discounts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <Input
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="Enter promo code"
                                className="text-base sm:text-sm"
                                disabled={isApplyingCode}
                            />
                        </div>
                        <Button
                            onClick={handleApplyPromoCode}
                            disabled={isApplyingCode || !promoCode.trim()}
                        >
                            {isApplyingCode ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Applying...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Apply
                                </>
                            )}
                        </Button>
                    </div>
                    {codeError && (
                        <p className="text-sm text-red-600 mt-2">{codeError}</p>
                    )}
                </CardContent>
            </Card>

            {/* Available Discounts */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center">
                        <Percent className="h-5 w-5 mr-2 text-green-600" />
                        Available Discounts
                    </CardTitle>
                    <CardDescription>
                        Discounts you can apply to your shipments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {availableDiscounts.filter(d => d.active).map((discount) => {
                            const isApplied = appliedDiscounts.includes(discount.id);
                            
                            return (
                                <div
                                    key={discount.id}
                                    className={`p-4 border rounded-lg transition-all ${
                                        isApplied 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`p-2 rounded-lg ${discount.color}`}>
                                                {discount.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-gray-900">{discount.title}</h4>
                                                    <Badge className={discount.color}>
                                                        {getTypeIcon(discount.type)}
                                                        <span className="ml-1 capitalize">{discount.type}</span>
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{discount.description}</p>
                                                
                                                {/* Discount Details */}
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                    {discount.discountPercent > 0 && (
                                                        <span>Save {discount.discountPercent}%</span>
                                                    )}
                                                    {discount.discountAmount && (
                                                        <span>Save ${discount.discountAmount}</span>
                                                    )}
                                                    {discount.minSpend && (
                                                        <span>Min spend: ${discount.minSpend}</span>
                                                    )}
                                                    {discount.minShipments && (
                                                        <span>Min {discount.minShipments} shipments</span>
                                                    )}
                                                    {discount.validUntil && (
                                                        <span>Valid until {new Date(discount.validUntil).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            {isApplied ? (
                                                <>
                                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Applied
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveDiscount(discount.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleApplyDiscount(discount)}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Apply
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Discount Summary */}
                    {appliedDiscounts.length > 0 && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Active Discounts</h4>
                            <div className="space-y-1">
                                {appliedDiscounts.map(discountId => {
                                    const discount = availableDiscounts.find(d => d.id === discountId);
                                    if (!discount) return null;
                                    
                                    return (
                                        <div key={discountId} className="flex items-center justify-between text-sm">
                                            <span className="text-green-800">{discount.title}</span>
                                            <span className="font-medium text-green-900">
                                                {discount.discountPercent > 0 && `-${discount.discountPercent}%`}
                                                {discount.discountAmount && `-$${discount.discountAmount}`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
