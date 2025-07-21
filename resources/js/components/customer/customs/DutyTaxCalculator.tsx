import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Calculator,
    DollarSign,
    Globe,
    Info,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Percent,
    FileText,
    ExternalLink,
    RefreshCw
} from 'lucide-react';

interface DutyRate {
    hsCode: string;
    description: string;
    dutyRate: number;
    dutyType: 'ad_valorem' | 'specific' | 'compound';
    preferentialRate?: number;
    tradeAgreement?: string;
}

interface TaxRate {
    type: 'vat' | 'gst' | 'sales_tax' | 'excise';
    name: string;
    rate: number;
    threshold?: number;
    exemptions?: string[];
}

interface CalculationResult {
    itemValue: number;
    dutyAmount: number;
    taxAmount: number;
    totalCharges: number;
    totalCost: number;
    breakdown: {
        customsValue: number;
        dutyRate: number;
        taxRate: number;
        exemptions: string[];
        tradeAgreements: string[];
    };
}

interface Props {
    className?: string;
    destinationCountry?: string;
    originCountry?: string;
    onCalculationComplete?: (result: CalculationResult) => void;
}

export default function DutyTaxCalculator({ 
    className = '', 
    destinationCountry = 'CA',
    originCountry = 'US',
    onCalculationComplete
}: Props) {
    const [itemValue, setItemValue] = useState<number>(0);
    const [hsCode, setHsCode] = useState<string>('');
    const [itemDescription, setItemDescription] = useState<string>('');
    const [currency, setCurrency] = useState<string>('USD');
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    const [dutyRates, setDutyRates] = useState<DutyRate[]>([]);
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    // Mock data for different countries
    const countryData = {
        CA: {
            name: 'Canada',
            currency: 'CAD',
            dutyThreshold: 20,
            taxThreshold: 20,
            taxes: [
                { type: 'gst' as const, name: 'GST', rate: 5, threshold: 20 },
                { type: 'sales_tax' as const, name: 'Provincial Sales Tax', rate: 7, threshold: 20 },
            ],
        },
        GB: {
            name: 'United Kingdom',
            currency: 'GBP',
            dutyThreshold: 135,
            taxThreshold: 15,
            taxes: [
                { type: 'vat' as const, name: 'VAT', rate: 20, threshold: 15 },
            ],
        },
        AU: {
            name: 'Australia',
            currency: 'AUD',
            dutyThreshold: 1000,
            taxThreshold: 1000,
            taxes: [
                { type: 'gst' as const, name: 'GST', rate: 10, threshold: 1000 },
            ],
        },
        DE: {
            name: 'Germany',
            currency: 'EUR',
            dutyThreshold: 150,
            taxThreshold: 22,
            taxes: [
                { type: 'vat' as const, name: 'VAT', rate: 19, threshold: 22 },
            ],
        },
    };

    const mockDutyRates: DutyRate[] = [
        {
            hsCode: '6109',
            description: 'T-shirts, singlets and other vests, knitted or crocheted',
            dutyRate: 18.0,
            dutyType: 'ad_valorem',
            preferentialRate: 0,
            tradeAgreement: 'USMCA',
        },
        {
            hsCode: '6203',
            description: 'Men\'s or boys\' suits, ensembles, jackets, blazers, trousers',
            dutyRate: 16.1,
            dutyType: 'ad_valorem',
            preferentialRate: 0,
            tradeAgreement: 'USMCA',
        },
        {
            hsCode: '8517',
            description: 'Telephone sets, including smartphones',
            dutyRate: 0,
            dutyType: 'ad_valorem',
        },
        {
            hsCode: '9013',
            description: 'Liquid crystal devices; lasers; optical appliances',
            dutyRate: 0,
            dutyType: 'ad_valorem',
        },
        {
            hsCode: '6401',
            description: 'Waterproof footwear with outer soles and uppers of rubber',
            dutyRate: 20.0,
            dutyType: 'ad_valorem',
        },
    ];

    useEffect(() => {
        loadDutyRates();
        loadTaxRates();
    }, [destinationCountry, hsCode]);

    const loadDutyRates = () => {
        // Simulate API call to get duty rates
        setDutyRates(mockDutyRates);
    };

    const loadTaxRates = () => {
        const country = countryData[destinationCountry as keyof typeof countryData];
        if (country) {
            setTaxRates(country.taxes);
        }
    };

    const calculateDutyAndTax = async () => {
        if (!itemValue || !hsCode) {
            setErrors(['Please enter item value and HS code']);
            return;
        }

        setIsCalculating(true);
        setErrors([]);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const country = countryData[destinationCountry as keyof typeof countryData];
            if (!country) {
                throw new Error('Country not supported');
            }

            // Find duty rate for HS code
            const dutyRate = dutyRates.find(rate => hsCode.startsWith(rate.hsCode.substring(0, 4)));
            const applicableDutyRate = dutyRate?.preferentialRate ?? dutyRate?.dutyRate ?? 0;

            // Calculate duty
            const dutyAmount = itemValue >= country.dutyThreshold 
                ? (itemValue * applicableDutyRate) / 100 
                : 0;

            // Calculate tax (on item value + duty)
            const taxableValue = itemValue + dutyAmount;
            let totalTaxAmount = 0;

            country.taxes.forEach(tax => {
                if (itemValue >= tax.threshold) {
                    totalTaxAmount += (taxableValue * tax.rate) / 100;
                }
            });

            const result: CalculationResult = {
                itemValue,
                dutyAmount,
                taxAmount: totalTaxAmount,
                totalCharges: dutyAmount + totalTaxAmount,
                totalCost: itemValue + dutyAmount + totalTaxAmount,
                breakdown: {
                    customsValue: itemValue,
                    dutyRate: applicableDutyRate,
                    taxRate: country.taxes.reduce((sum, tax) => sum + tax.rate, 0),
                    exemptions: itemValue < country.dutyThreshold ? ['Low value exemption'] : [],
                    tradeAgreements: dutyRate?.tradeAgreement ? [dutyRate.tradeAgreement] : [],
                },
            };

            setCalculationResult(result);
            onCalculationComplete?.(result);

        } catch (error) {
            setErrors(['Failed to calculate duty and tax. Please try again.']);
        } finally {
            setIsCalculating(false);
        }
    };

    const getCountryInfo = () => {
        return countryData[destinationCountry as keyof typeof countryData];
    };

    const formatCurrency = (amount: number, currencyCode: string = currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
        }).format(amount);
    };

    const hsCodeSuggestions = [
        { code: '6109', description: 'T-shirts and vests' },
        { code: '6203', description: 'Men\'s suits and trousers' },
        { code: '8517', description: 'Smartphones and phones' },
        { code: '9013', description: 'Optical devices' },
        { code: '6401', description: 'Waterproof footwear' },
        { code: '6204', description: 'Women\'s suits and dresses' },
        { code: '8471', description: 'Computers and laptops' },
        { code: '9018', description: 'Medical instruments' },
    ];

    const countryInfo = getCountryInfo();

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Duty & Tax Calculator
                </CardTitle>
                <CardDescription>
                    Calculate import duties and taxes for {countryInfo?.name || destinationCountry}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Errors */}
                {errors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <h4 className="font-medium text-red-900">Calculation Error</h4>
                        </div>
                        <ul className="text-sm text-red-800 space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Country Information */}
                {countryInfo && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-blue-900">
                                Import to {countryInfo.name}
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <span className="font-medium">Duty threshold:</span> {formatCurrency(countryInfo.dutyThreshold, countryInfo.currency)}
                            </div>
                            <div>
                                <span className="font-medium">Tax threshold:</span> {formatCurrency(countryInfo.taxThreshold, countryInfo.currency)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Input Form */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Item Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="item-value">Item Value *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="item-value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={itemValue || ''}
                                    onChange={(e) => setItemValue(parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="hs-code">HS Code *</Label>
                        <Input
                            id="hs-code"
                            value={hsCode}
                            onChange={(e) => setHsCode(e.target.value)}
                            placeholder="Enter 4-10 digit HS code"
                            maxLength={10}
                        />
                        
                        {/* HS Code Suggestions */}
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-2">Common HS codes:</p>
                            <div className="flex flex-wrap gap-2">
                                {hsCodeSuggestions.slice(0, 4).map((suggestion) => (
                                    <Button
                                        key={suggestion.code}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setHsCode(suggestion.code);
                                            setItemDescription(suggestion.description);
                                        }}
                                        className="text-xs h-auto py-1 px-2"
                                    >
                                        {suggestion.code} - {suggestion.description}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="item-description">Item Description</Label>
                        <Input
                            id="item-description"
                            value={itemDescription}
                            onChange={(e) => setItemDescription(e.target.value)}
                            placeholder="Brief description of the item"
                        />
                    </div>
                </div>

                {/* Calculate Button */}
                <Button 
                    onClick={calculateDutyAndTax} 
                    disabled={isCalculating || !itemValue || !hsCode}
                    className="w-full"
                >
                    {isCalculating ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Calculating...
                        </>
                    ) : (
                        <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Calculate Duty & Tax
                        </>
                    )}
                </Button>

                {/* Calculation Results */}
                {calculationResult && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Calculation Results
                        </h3>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Item Value</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency(calculationResult.itemValue)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Duty</p>
                                        <p className="text-lg font-bold text-blue-600">
                                            {formatCurrency(calculationResult.dutyAmount)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {calculationResult.breakdown.dutyRate}%
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Tax</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {formatCurrency(calculationResult.taxAmount)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {calculationResult.breakdown.taxRate}%
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Total Cost</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(calculationResult.totalCost)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Calculation Breakdown</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Item Value:</span>
                                    <span>{formatCurrency(calculationResult.itemValue)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Import Duty ({calculationResult.breakdown.dutyRate}%):</span>
                                    <span>{formatCurrency(calculationResult.dutyAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes ({calculationResult.breakdown.taxRate}%):</span>
                                    <span>{formatCurrency(calculationResult.taxAmount)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-medium">
                                    <span>Total Import Cost:</span>
                                    <span>{formatCurrency(calculationResult.totalCost)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Exemptions and Trade Agreements */}
                        {(calculationResult.breakdown.exemptions.length > 0 || calculationResult.breakdown.tradeAgreements.length > 0) && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Applied Benefits</h4>
                                <div className="space-y-2">
                                    {calculationResult.breakdown.exemptions.map((exemption, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-green-800">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>{exemption}</span>
                                        </div>
                                    ))}
                                    {calculationResult.breakdown.tradeAgreements.map((agreement, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-green-800">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>Preferential rate under {agreement}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-yellow-900 mb-1">Important Notes</h4>
                                    <ul className="text-sm text-yellow-800 space-y-1">
                                        <li>• Calculations are estimates based on current rates</li>
                                        <li>• Additional fees may apply (brokerage, handling, etc.)</li>
                                        <li>• Exchange rates may affect final amounts</li>
                                        <li>• Consult customs authorities for official calculations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* HS Code Lookup Help */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900 mb-1">Need Help Finding HS Codes?</h4>
                            <p className="text-sm text-blue-800 mb-2">
                                HS (Harmonized System) codes classify products for customs purposes.
                            </p>
                            <Button variant="outline" size="sm" className="text-blue-800 border-blue-300">
                                <ExternalLink className="h-3 w-3 mr-2" />
                                HS Code Lookup Tool
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
