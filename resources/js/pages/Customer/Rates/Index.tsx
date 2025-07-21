import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import RateCalculator from '@/components/customer/rates/RateCalculator';
import DiscountManager from '@/components/customer/rates/DiscountManager';
import CostOptimizer from '@/components/customer/rates/CostOptimizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Calculator,
    ArrowLeft,
    DollarSign,
    Percent,
    Target,
    TrendingDown,
    Package,
    Clock,
    Star,
    Zap
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
    total_spend?: number;
    total_shipments?: number;
    loyalty_tier?: string;
}

interface RateOption {
    id: string;
    service: string;
    serviceType: 'standard' | 'express' | 'overnight' | 'international' | 'economy';
    price: number;
    originalPrice?: number;
    discount?: number;
    transitTime: string;
    deliveryDate: string;
    features: string[];
    icon: React.ReactNode;
    popular?: boolean;
    eco?: boolean;
    guaranteed?: boolean;
}

interface Props {
    customer: Customer;
    recentRates?: RateOption[];
    savingsThisMonth?: number;
    averageDiscount?: number;
}

export default function RatesIndex({ 
    customer, 
    recentRates = [], 
    savingsThisMonth = 245.67,
    averageDiscount = 12.5
}: Props) {
    const handleRateSelect = (rate: RateOption) => {
        // In a real app, this would navigate to shipment creation with pre-filled rate
        console.log('Selected rate:', rate);
    };

    const handleDiscountApply = (discount: any) => {
        console.log('Applied discount:', discount);
    };

    const handleDiscountRemove = (discountId: string) => {
        console.log('Removed discount:', discountId);
    };

    const handleOptimizationApply = (suggestion: any) => {
        console.log('Applied optimization:', suggestion);
    };

    return (
        <AppLayout>
            <Head title="Rate Quotes & Discounts" />
            
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
                                    <Calculator className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Quick Quote</span>
                                </Button>
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <Percent className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Discounts</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-green-600" />
                                Rate Quotes & Discounts
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • Get the best shipping rates and maximize your savings
                            </p>
                        </div>
                    </div>
                </div>

                {/* Savings Summary - Mobile First Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                                    <p className="text-sm sm:text-lg font-bold text-green-600 truncate">
                                        ${savingsThisMonth.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Discount</p>
                                    <p className="text-sm sm:text-lg font-bold text-blue-600 truncate">
                                        {averageDiscount.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Tier</p>
                                    <p className="text-sm sm:text-lg font-bold text-yellow-600 capitalize truncate">
                                        {customer.loyalty_tier || 'Gold'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Shipments</p>
                                    <p className="text-sm sm:text-lg font-bold text-purple-600">
                                        {customer.total_shipments || 48}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Mobile Responsive Tabs */}
                <Tabs defaultValue="calculator" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="calculator" className="flex items-center">
                            <Calculator className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Calculator</span>
                        </TabsTrigger>
                        <TabsTrigger value="discounts" className="flex items-center">
                            <Percent className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Discounts</span>
                        </TabsTrigger>
                        <TabsTrigger value="optimizer" className="flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Optimizer</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calculator">
                        <RateCalculator 
                            onRateSelect={handleRateSelect}
                        />
                    </TabsContent>

                    <TabsContent value="discounts">
                        <DiscountManager
                            currentSpend={customer.total_spend || 2450}
                            totalShipments={customer.total_shipments || 48}
                            onDiscountApply={handleDiscountApply}
                            onDiscountRemove={handleDiscountRemove}
                        />
                    </TabsContent>

                    <TabsContent value="optimizer">
                        <CostOptimizer
                            onOptimizationApply={handleOptimizationApply}
                        />
                    </TabsContent>
                </Tabs>

                {/* Recent Rates - Mobile Optimized */}
                {recentRates.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                Recent Rate Quotes
                            </CardTitle>
                            <CardDescription>
                                Your recently calculated shipping rates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentRates.slice(0, 3).map((rate, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                {rate.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{rate.service}</h4>
                                                <p className="text-sm text-gray-600">{rate.transitTime}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">${rate.price.toFixed(2)}</div>
                                            {rate.discount && (
                                                <div className="text-xs text-green-600">
                                                    {rate.discount.toFixed(1)}% off
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Tips */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Money-Saving Tips</CardTitle>
                        <CardDescription>
                            Maximize your shipping savings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <TrendingDown className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Volume Discounts</h4>
                                    <p className="text-sm text-gray-600">
                                        Ship 25+ packages monthly for automatic 10% discount
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Flexible Timing</h4>
                                    <p className="text-sm text-gray-600">
                                        Allow extra delivery time for up to 30% savings
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Package className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Smart Packaging</h4>
                                    <p className="text-sm text-gray-600">
                                        Optimize package size to reduce dimensional weight charges
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                    <Star className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Loyalty Benefits</h4>
                                    <p className="text-sm text-gray-600">
                                        Reach higher tiers for better discounts and perks
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
