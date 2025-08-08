import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, BookOpen, CheckCircle, ExternalLink, FileText, Flag, Info, Search, Shield, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RestrictedItem {
    id: string;
    name: string;
    category: string;
    restriction: 'prohibited' | 'restricted' | 'regulated' | 'license_required';
    description: string;
    countries: string[];
    requirements?: string[];
    penalties?: string;
    alternatives?: string[];
}

interface ComplianceRule {
    id: string;
    country: string;
    category: string;
    rule: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    requirements: string[];
    documentation: string[];
    penalties: string;
}

interface ComplianceResult {
    status: 'compliant' | 'warning' | 'violation';
    issues: {
        type: 'prohibited' | 'restricted' | 'documentation' | 'license';
        severity: 'high' | 'medium' | 'low';
        message: string;
        recommendation: string;
    }[];
    requiredDocuments: string[];
    additionalRequirements: string[];
}

interface Props {
    className?: string;
    destinationCountry?: string;
    originCountry?: string;
    onComplianceCheck?: (result: ComplianceResult) => void;
}

export default function ComplianceChecker({ className = '', destinationCountry = 'CA', originCountry = 'US', onComplianceCheck }: Props) {
    const [itemDescription, setItemDescription] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [itemValue, setItemValue] = useState<number>(0);
    const [isChecking, setIsChecking] = useState(false);
    const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [restrictedItems, setRestrictedItems] = useState<RestrictedItem[]>([]);
    const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);

    const mockRestrictedItems: RestrictedItem[] = [
        {
            id: 'weapons',
            name: 'Weapons and Firearms',
            category: 'Dangerous Goods',
            restriction: 'prohibited',
            description: 'All types of weapons, firearms, ammunition, and related accessories',
            countries: ['CA', 'GB', 'AU', 'DE', 'FR'],
            penalties: 'Criminal charges, confiscation, heavy fines',
            alternatives: ['Sporting goods (non-weapon)', 'Collectible replicas (clearly marked)'],
        },
        {
            id: 'lithium-batteries',
            name: 'Lithium Batteries',
            category: 'Dangerous Goods',
            restriction: 'regulated',
            description: 'Lithium metal and lithium-ion batteries',
            countries: ['CA', 'GB', 'AU', 'DE'],
            requirements: [
                'UN3480/UN3481 packaging requirements',
                'Proper labeling and documentation',
                'Quantity limitations apply',
                'Must be declared as dangerous goods',
            ],
            penalties: 'Package rejection, fines up to $10,000',
        },
        {
            id: 'food-products',
            name: 'Food and Agricultural Products',
            category: 'Agricultural',
            restriction: 'restricted',
            description: 'Fresh, dried, or processed food items',
            countries: ['CA', 'AU', 'GB'],
            requirements: [
                'Import permit required',
                'Health certificate from origin country',
                'Ingredient list and nutritional information',
                'Facility registration may be required',
            ],
            penalties: 'Confiscation, quarantine fees, fines',
        },
        {
            id: 'pharmaceuticals',
            name: 'Pharmaceuticals and Medicines',
            category: 'Medical',
            restriction: 'license_required',
            description: 'Prescription drugs, over-the-counter medications, supplements',
            countries: ['CA', 'GB', 'AU', 'DE'],
            requirements: [
                'Import license from health authority',
                'Prescription or medical certificate',
                'Manufacturer registration',
                'Good Manufacturing Practice certification',
            ],
            penalties: 'Criminal charges, confiscation, heavy fines',
        },
        {
            id: 'tobacco-alcohol',
            name: 'Tobacco and Alcohol',
            category: 'Controlled Substances',
            restriction: 'regulated',
            description: 'Cigarettes, cigars, alcoholic beverages',
            countries: ['CA', 'GB', 'AU'],
            requirements: ['Excise tax payment', 'Age verification of recipient', 'Quantity limitations', 'Special labeling requirements'],
            penalties: 'Heavy taxes, confiscation, fines',
        },
    ];

    const mockComplianceRules: ComplianceRule[] = [
        {
            id: 'ca-value-limit',
            country: 'CA',
            category: 'Value Limits',
            rule: 'Personal exemption limit',
            severity: 'medium',
            description: 'Personal items valued over CAD $20 are subject to duties and taxes',
            requirements: ['Accurate value declaration', 'Proper customs forms'],
            documentation: ['Commercial invoice', 'Customs declaration'],
            penalties: 'Duties, taxes, and potential penalties for undervaluation',
        },
        {
            id: 'ca-prohibited-items',
            country: 'CA',
            category: 'Prohibited Items',
            rule: 'Prohibited and restricted goods',
            severity: 'high',
            description: 'Certain items are prohibited or require special permits',
            requirements: ['Item verification', 'Permit acquisition if required'],
            documentation: ['Import permits', 'Certificates'],
            penalties: 'Confiscation, fines, criminal charges',
        },
    ];

    useEffect(() => {
        setRestrictedItems(mockRestrictedItems);
        setComplianceRules(mockComplianceRules.filter((rule) => rule.country === destinationCountry));
    }, [destinationCountry]);

    const checkCompliance = async () => {
        if (!itemDescription) {
            return;
        }

        setIsChecking(true);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const issues: ComplianceResult['issues'] = [];
            const requiredDocuments: string[] = ['Commercial Invoice', 'Customs Declaration'];
            const additionalRequirements: string[] = [];

            // Check for restricted items
            const matchingRestrictions = restrictedItems.filter(
                (item) => itemDescription.toLowerCase().includes(item.name.toLowerCase()) || itemCategory === item.category,
            );

            matchingRestrictions.forEach((restriction) => {
                if (restriction.restriction === 'prohibited') {
                    issues.push({
                        type: 'prohibited',
                        severity: 'high',
                        message: `${restriction.name} is prohibited for import to ${destinationCountry}`,
                        recommendation: `Consider alternatives: ${restriction.alternatives?.join(', ') || 'Contact customs for guidance'}`,
                    });
                } else if (restriction.restriction === 'restricted' || restriction.restriction === 'regulated') {
                    issues.push({
                        type: 'restricted',
                        severity: 'medium',
                        message: `${restriction.name} requires special handling and documentation`,
                        recommendation: `Required: ${restriction.requirements?.join(', ') || 'Additional permits may be required'}`,
                    });

                    if (restriction.requirements) {
                        additionalRequirements.push(...restriction.requirements);
                    }
                } else if (restriction.restriction === 'license_required') {
                    issues.push({
                        type: 'license',
                        severity: 'high',
                        message: `${restriction.name} requires import license`,
                        recommendation: `Obtain proper licensing before shipping: ${restriction.requirements?.join(', ') || 'Contact relevant authorities'}`,
                    });
                }
            });

            // Check value-based rules
            if (itemValue > 1000) {
                issues.push({
                    type: 'documentation',
                    severity: 'medium',
                    message: 'High-value items require additional documentation',
                    recommendation: 'Ensure accurate valuation and consider insurance',
                });
                requiredDocuments.push('Insurance Certificate', 'Detailed Item Description');
            }

            // Determine overall status
            let status: ComplianceResult['status'] = 'compliant';
            if (issues.some((issue) => issue.severity === 'high')) {
                status = 'violation';
            } else if (issues.length > 0) {
                status = 'warning';
            }

            const result: ComplianceResult = {
                status,
                issues,
                requiredDocuments: [...new Set(requiredDocuments)],
                additionalRequirements: [...new Set(additionalRequirements)],
            };

            setComplianceResult(result);
            onComplianceCheck?.(result);
        } catch (error) {
            console.error('Compliance check failed:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            compliant: <CheckCircle className="h-5 w-5 text-green-600" />,
            warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
            violation: <XCircle className="h-5 w-5 text-red-600" />,
        };
        return icons[status as keyof typeof icons];
    };

    const getStatusColor = (status: string) => {
        const colors = {
            compliant: 'bg-green-100 text-green-800 border-green-300',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            violation: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status as keyof typeof colors];
    };

    const getSeverityColor = (severity: string) => {
        const colors = {
            high: 'bg-red-100 text-red-800 border-red-300',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            low: 'bg-blue-100 text-blue-800 border-blue-300',
        };
        return colors[severity as keyof typeof colors];
    };

    const getRestrictionColor = (restriction: string) => {
        const colors = {
            prohibited: 'bg-red-100 text-red-800 border-red-300',
            restricted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            regulated: 'bg-blue-100 text-blue-800 border-blue-300',
            license_required: 'bg-purple-100 text-purple-800 border-purple-300',
        };
        return colors[restriction as keyof typeof colors];
    };

    const filteredRestrictedItems = restrictedItems.filter(
        (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const categories = [
        'Electronics',
        'Clothing & Textiles',
        'Food & Beverages',
        'Medical & Pharmaceuticals',
        'Dangerous Goods',
        'Agricultural Products',
        'Automotive Parts',
        'Jewelry & Precious Metals',
        'Books & Media',
        'Sporting Goods',
    ];

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Shield className="mr-2 h-5 w-5" />
                    Compliance Checker
                </CardTitle>
                <CardDescription>Verify compliance for shipping to {destinationCountry}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Item Information Form */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Item Information</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="item-description">Item Description *</Label>
                            <Input
                                id="item-description"
                                value={itemDescription}
                                onChange={(e) => setItemDescription(e.target.value)}
                                placeholder="Describe the item you want to ship"
                            />
                        </div>
                        <div>
                            <Label htmlFor="item-category">Category</Label>
                            <Select value={itemCategory} onValueChange={setItemCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="item-value">Item Value (USD)</Label>
                            <Input
                                id="item-value"
                                type="number"
                                min="0"
                                step="0.01"
                                value={itemValue || ''}
                                onChange={(e) => setItemValue(parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={checkCompliance} disabled={isChecking || !itemDescription} className="w-full">
                                {isChecking ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Check Compliance
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Compliance Results */}
                {complianceResult && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {getStatusIcon(complianceResult.status)}
                            <h3 className="font-medium text-gray-900">Compliance Status</h3>
                            <Badge className={getStatusColor(complianceResult.status)}>
                                {complianceResult.status.charAt(0).toUpperCase() + complianceResult.status.slice(1)}
                            </Badge>
                        </div>

                        {/* Issues */}
                        {complianceResult.issues.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Issues Found</h4>
                                {complianceResult.issues.map((issue, index) => (
                                    <div key={index} className="rounded-lg border p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {issue.severity === 'high' ? (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                ) : (
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <Badge className={getSeverityColor(issue.severity)}>{issue.severity} severity</Badge>
                                                    <Badge variant="outline">{issue.type}</Badge>
                                                </div>
                                                <p className="mb-1 font-medium text-gray-900">{issue.message}</p>
                                                <p className="text-sm text-gray-600">{issue.recommendation}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Required Documents */}
                        {complianceResult.requiredDocuments.length > 0 && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <h4 className="mb-2 font-medium text-blue-900">Required Documents</h4>
                                <ul className="space-y-1">
                                    {complianceResult.requiredDocuments.map((doc, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-blue-800">
                                            <FileText className="h-3 w-3" />
                                            <span>{doc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Additional Requirements */}
                        {complianceResult.additionalRequirements.length > 0 && (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                <h4 className="mb-2 font-medium text-yellow-900">Additional Requirements</h4>
                                <ul className="space-y-1">
                                    {complianceResult.additionalRequirements.map((req, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-yellow-800">
                                            <Info className="h-3 w-3" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Restricted Items Database */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Restricted Items Database</h3>
                        <Badge variant="outline">{filteredRestrictedItems.length} items</Badge>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search restricted items..."
                            className="pl-10"
                        />
                    </div>

                    {/* Items List */}
                    <div className="max-h-96 space-y-3 overflow-y-auto">
                        {filteredRestrictedItems.map((item) => (
                            <div key={item.id} className="rounded-lg border p-4">
                                <div className="mb-2 flex items-start justify-between">
                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                    <Badge className={getRestrictionColor(item.restriction)}>{item.restriction.replace('_', ' ')}</Badge>
                                </div>
                                <p className="mb-2 text-sm text-gray-600">{item.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Flag className="h-3 w-3" />
                                    <span>Applies to: {item.countries.join(', ')}</span>
                                </div>
                                {item.requirements && (
                                    <div className="mt-2">
                                        <p className="mb-1 text-xs font-medium text-gray-700">Requirements:</p>
                                        <ul className="space-y-1 text-xs text-gray-600">
                                            {item.requirements.slice(0, 2).map((req, index) => (
                                                <li key={index}>• {req}</li>
                                            ))}
                                            {item.requirements.length > 2 && <li>• +{item.requirements.length - 2} more requirements</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Country-Specific Rules */}
                <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 font-medium text-gray-900">{destinationCountry} Import Regulations</h4>
                    <div className="space-y-3">
                        {complianceRules.map((rule) => (
                            <div key={rule.id} className="flex items-start gap-3">
                                <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                                <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{rule.rule}</h5>
                                    <p className="text-sm text-gray-600">{rule.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Help Resources */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <BookOpen className="mt-0.5 h-5 w-5 text-blue-600" />
                        <div>
                            <h4 className="mb-1 font-medium text-blue-900">Need More Information?</h4>
                            <p className="mb-3 text-sm text-blue-800">
                                For official regulations and detailed requirements, consult the customs authorities.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" className="border-blue-300 text-blue-800">
                                    <ExternalLink className="mr-2 h-3 w-3" />
                                    Customs Authority
                                </Button>
                                <Button variant="outline" size="sm" className="border-blue-300 text-blue-800">
                                    <FileText className="mr-2 h-3 w-3" />
                                    Import Guide
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
