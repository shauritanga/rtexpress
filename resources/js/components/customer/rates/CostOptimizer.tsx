import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
    Target,
    TrendingDown,
    Lightbulb,
    Leaf,
    Clock,
    Package,
    MapPin,
    DollarSign,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
    Calendar,
    Truck,
    Plane,
    Ship,
    Zap
} from 'lucide-react';

interface OptimizationSuggestion {
    id: string;
    type: 'service' | 'packaging' | 'timing' | 'consolidation' | 'green';
    title: string;
    description: string;
    currentCost: number;
    optimizedCost: number;
    savings: number;
    savingsPercent: number;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    icon: React.ReactNode;
    details: string[];
    actionRequired: string;
}

interface GreenOption {
    id: string;
    name: string;
    description: string;
    carbonReduction: number;
    costImpact: number;
    enabled: boolean;
}

interface Props {
    className?: string;
    currentShipment?: {
        weight: number;
        dimensions: { length: number; width: number; height: number };
        service: string;
        cost: number;
        origin: string;
        destination: string;
    };
    onOptimizationApply?: (suggestion: OptimizationSuggestion) => void;
}

export default function CostOptimizer({ 
    className = '', 
    currentShipment,
    onOptimizationApply
}: Props) {
    const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
    const [greenOptions, setGreenOptions] = useState<GreenOption[]>([
        {
            id: 'carbon-neutral',
            name: 'Carbon Neutral Shipping',
            description: 'Offset carbon emissions through verified environmental projects',
            carbonReduction: 100,
            costImpact: 2.50,
            enabled: false,
        },
        {
            id: 'ground-preferred',
            name: 'Ground Preferred',
            description: 'Choose ground shipping when possible to reduce emissions',
            carbonReduction: 75,
            costImpact: -5.00,
            enabled: true,
        },
        {
            id: 'consolidated-delivery',
            name: 'Consolidated Delivery',
            description: 'Combine multiple packages for more efficient delivery',
            carbonReduction: 40,
            costImpact: -3.00,
            enabled: false,
        },
    ]);

    const optimizationSuggestions: OptimizationSuggestion[] = [
        {
            id: 'service-downgrade',
            type: 'service',
            title: 'Switch to Standard Service',
            description: 'Change from Express to Standard service for non-urgent deliveries',
            currentCost: 29.99,
            optimizedCost: 18.99,
            savings: 11.00,
            savingsPercent: 36.7,
            effort: 'low',
            impact: 'high',
            icon: <Truck className="h-4 w-4" />,
            details: [
                'Delivery time increases by 1-2 days',
                'Same tracking and insurance coverage',
                'Perfect for non-urgent shipments'
            ],
            actionRequired: 'Select Standard service during checkout',
        },
        {
            id: 'packaging-optimization',
            type: 'packaging',
            title: 'Optimize Package Size',
            description: 'Use smaller packaging to reduce dimensional weight charges',
            currentCost: 18.99,
            optimizedCost: 15.49,
            savings: 3.50,
            savingsPercent: 18.4,
            effort: 'medium',
            impact: 'medium',
            icon: <Package className="h-4 w-4" />,
            details: [
                'Reduce package dimensions by 20%',
                'Use appropriate packaging materials',
                'Avoid oversized boxes for small items'
            ],
            actionRequired: 'Repackage using smaller box or envelope',
        },
        {
            id: 'timing-optimization',
            type: 'timing',
            title: 'Flexible Delivery Date',
            description: 'Allow 1-2 extra days for delivery to access lower rates',
            currentCost: 18.99,
            optimizedCost: 12.99,
            savings: 6.00,
            savingsPercent: 31.6,
            effort: 'low',
            impact: 'high',
            icon: <Calendar className="h-4 w-4" />,
            details: [
                'Delivery window extends by 1-2 days',
                'Access to economy pricing tiers',
                'Same service quality and tracking'
            ],
            actionRequired: 'Select flexible delivery option',
        },
        {
            id: 'consolidation',
            type: 'consolidation',
            title: 'Consolidate Multiple Shipments',
            description: 'Combine 3 pending shipments into one package',
            currentCost: 56.97, // 3 x 18.99
            optimizedCost: 24.99,
            savings: 31.98,
            savingsPercent: 56.1,
            effort: 'high',
            impact: 'high',
            icon: <Target className="h-4 w-4" />,
            details: [
                'Combine items going to same destination',
                'Significant savings on multiple shipments',
                'May require coordination with recipients'
            ],
            actionRequired: 'Repackage multiple items together',
        },
        {
            id: 'green-shipping',
            type: 'green',
            title: 'Eco-Friendly Ground Service',
            description: 'Choose ground shipping to reduce environmental impact and costs',
            currentCost: 29.99,
            optimizedCost: 16.99,
            savings: 13.00,
            savingsPercent: 43.3,
            effort: 'low',
            impact: 'high',
            icon: <Leaf className="h-4 w-4" />,
            details: [
                '75% reduction in carbon emissions',
                'Ground transportation is more efficient',
                'Longer transit time but lower cost'
            ],
            actionRequired: 'Select ground shipping option',
        },
    ];

    const totalPotentialSavings = optimizationSuggestions
        .filter(s => selectedSuggestions.includes(s.id))
        .reduce((sum, s) => sum + s.savings, 0);

    const handleSuggestionToggle = (suggestionId: string) => {
        setSelectedSuggestions(prev => 
            prev.includes(suggestionId)
                ? prev.filter(id => id !== suggestionId)
                : [...prev, suggestionId]
        );
    };

    const handleGreenOptionToggle = (optionId: string) => {
        setGreenOptions(prev => 
            prev.map(option => 
                option.id === optionId 
                    ? { ...option, enabled: !option.enabled }
                    : option
            )
        );
    };

    const handleApplyOptimizations = () => {
        selectedSuggestions.forEach(suggestionId => {
            const suggestion = optimizationSuggestions.find(s => s.id === suggestionId);
            if (suggestion) {
                onOptimizationApply?.(suggestion);
            }
        });
    };

    const getEffortColor = (effort: string) => {
        const colors = {
            low: 'bg-green-100 text-green-800 border-green-300',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            high: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[effort as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getImpactColor = (impact: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800 border-gray-300',
            medium: 'bg-blue-100 text-blue-800 border-blue-300',
            high: 'bg-purple-100 text-purple-800 border-purple-300',
        };
        return colors[impact as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Cost Optimization Overview */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-600" />
                        Cost Optimization
                    </CardTitle>
                    <CardDescription>
                        Smart suggestions to reduce your shipping costs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {totalPotentialSavings > 0 && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-green-900">Potential Savings</h3>
                                    <p className="text-sm text-green-700">
                                        {selectedSuggestions.length} optimization{selectedSuggestions.length !== 1 ? 's' : ''} selected
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-900">
                                        ${totalPotentialSavings.toFixed(2)}
                                    </div>
                                    <Button onClick={handleApplyOptimizations} className="mt-2">
                                        Apply Optimizations
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {optimizationSuggestions.map((suggestion) => {
                            const isSelected = selectedSuggestions.includes(suggestion.id);
                            
                            return (
                                <div
                                    key={suggestion.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                        isSelected 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleSuggestionToggle(suggestion.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                {suggestion.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                                                    <Badge className={getEffortColor(suggestion.effort)}>
                                                        {suggestion.effort} effort
                                                    </Badge>
                                                    <Badge className={getImpactColor(suggestion.impact)}>
                                                        {suggestion.impact} impact
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                                                
                                                {/* Cost Comparison */}
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Current: </span>
                                                        <span className="line-through">${suggestion.currentCost.toFixed(2)}</span>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                                    <div className="text-sm">
                                                        <span className="text-gray-500">Optimized: </span>
                                                        <span className="font-medium text-green-600">
                                                            ${suggestion.optimizedCost.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm font-medium text-green-600">
                                                        Save ${suggestion.savings.toFixed(2)} ({suggestion.savingsPercent.toFixed(1)}%)
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-1">
                                                    {suggestion.details.map((detail, index) => (
                                                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                            <span>{detail}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                                                    <strong>Action required:</strong> {suggestion.actionRequired}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSuggestionToggle(suggestion.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Green Shipping Options */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center">
                        <Leaf className="h-5 w-5 mr-2 text-green-600" />
                        Eco-Friendly Options
                    </CardTitle>
                    <CardDescription>
                        Reduce your environmental impact while saving money
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {greenOptions.map((option) => (
                            <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-start gap-3 flex-1">
                                    <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{option.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span>Carbon reduction: {option.carbonReduction}%</span>
                                            <span>
                                                Cost impact: {option.costImpact > 0 ? '+' : ''}${option.costImpact.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Switch
                                    checked={option.enabled}
                                    onCheckedChange={() => handleGreenOptionToggle(option.id)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Environmental Impact Summary */}
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Your Environmental Impact</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-800">
                                    {greenOptions.filter(o => o.enabled).reduce((sum, o) => sum + o.carbonReduction, 0) / greenOptions.filter(o => o.enabled).length || 0}%
                                </div>
                                <div className="text-green-600">Carbon Reduction</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-800">
                                    ${greenOptions.filter(o => o.enabled).reduce((sum, o) => sum + o.costImpact, 0).toFixed(2)}
                                </div>
                                <div className="text-green-600">Cost Impact</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-800">
                                    {greenOptions.filter(o => o.enabled).length}
                                </div>
                                <div className="text-green-600">Active Options</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
