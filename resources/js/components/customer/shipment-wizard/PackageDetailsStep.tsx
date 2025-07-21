import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
    Package,
    Scale,
    Ruler,
    DollarSign,
    ArrowRight,
    ArrowLeft,
    AlertTriangle,
    Info,
    Plus,
    Minus
} from 'lucide-react';

interface PackageDetails {
    weight: number;
    weight_unit: 'lbs' | 'kg';
    length: number;
    width: number;
    height: number;
    dimension_unit: 'in' | 'cm';
    declared_value: number;
    currency: string;
    contents_description: string;
    package_type: string;
    special_handling: string[];
    insurance_required: boolean;
    signature_required: boolean;
}

interface Props {
    data: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
    onPrev: () => void;
}

const PACKAGE_TYPES = [
    { value: 'box', label: 'Box' },
    { value: 'envelope', label: 'Envelope' },
    { value: 'tube', label: 'Tube' },
    { value: 'pak', label: 'Pak' },
    { value: 'pallet', label: 'Pallet' },
    { value: 'other', label: 'Other' },
];

const SPECIAL_HANDLING_OPTIONS = [
    { id: 'fragile', label: 'Fragile', description: 'Handle with extra care' },
    { id: 'hazardous', label: 'Hazardous Materials', description: 'Contains dangerous goods' },
    { id: 'perishable', label: 'Perishable', description: 'Temperature sensitive items' },
    { id: 'liquid', label: 'Liquid', description: 'Contains liquid materials' },
    { id: 'electronics', label: 'Electronics', description: 'Electronic devices' },
    { id: 'documents', label: 'Documents', description: 'Important documents' },
];

export default function PackageDetailsStep({ data, onUpdate, onNext, onPrev }: Props) {
    const [packageDetails, setPackageDetails] = useState<PackageDetails>(data.packageDetails || {
        weight: 0,
        weight_unit: 'lbs',
        length: 0,
        width: 0,
        height: 0,
        dimension_unit: 'in',
        declared_value: 0,
        currency: 'USD',
        contents_description: '',
        package_type: 'box',
        special_handling: [],
        insurance_required: false,
        signature_required: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [volumetricWeight, setVolumetricWeight] = useState(0);

    // Calculate volumetric weight
    useEffect(() => {
        const { length, width, height, dimension_unit } = packageDetails;
        if (length > 0 && width > 0 && height > 0) {
            let volume = length * width * height;
            
            // Convert to cubic inches if needed
            if (dimension_unit === 'cm') {
                volume = volume / 16.387; // Convert cm³ to in³
            }
            
            // Volumetric weight = Volume (in³) / 166 (for domestic) or 139 (for international)
            const divisor = 166; // Using domestic divisor for simplicity
            setVolumetricWeight(Math.round((volume / divisor) * 100) / 100);
        } else {
            setVolumetricWeight(0);
        }
    }, [packageDetails.length, packageDetails.width, packageDetails.height, packageDetails.dimension_unit]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!packageDetails.weight || packageDetails.weight <= 0) {
            newErrors.weight = 'Weight must be greater than 0';
        }
        if (!packageDetails.length || packageDetails.length <= 0) {
            newErrors.length = 'Length must be greater than 0';
        }
        if (!packageDetails.width || packageDetails.width <= 0) {
            newErrors.width = 'Width must be greater than 0';
        }
        if (!packageDetails.height || packageDetails.height <= 0) {
            newErrors.height = 'Height must be greater than 0';
        }
        if (!packageDetails.declared_value || packageDetails.declared_value <= 0) {
            newErrors.declared_value = 'Declared value must be greater than 0';
        }
        if (!packageDetails.contents_description.trim()) {
            newErrors.contents_description = 'Contents description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            onUpdate({ packageDetails });
            onNext();
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setPackageDetails(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSpecialHandlingChange = (optionId: string, checked: boolean) => {
        setPackageDetails(prev => ({
            ...prev,
            special_handling: checked
                ? [...(prev.special_handling || []), optionId]
                : (prev.special_handling || []).filter(id => id !== optionId)
        }));
    };

    const billingWeight = Math.max(packageDetails.weight, volumetricWeight);

    return (
        <div className="space-y-6">
            {/* Package Dimensions & Weight */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        Package Dimensions & Weight
                    </CardTitle>
                    <CardDescription>
                        Accurate measurements ensure proper pricing and handling
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Weight */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="weight" className="flex items-center">
                                <Scale className="h-4 w-4 mr-1" />
                                Weight *
                            </Label>
                            <Input
                                id="weight"
                                type="number"
                                step="0.1"
                                min="0"
                                value={packageDetails.weight || ''}
                                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                                placeholder="0.0"
                                className={errors.weight ? 'border-red-500' : ''}
                            />
                            {errors.weight && (
                                <p className="text-sm text-red-600">{errors.weight}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Unit</Label>
                            <Select
                                value={packageDetails.weight_unit}
                                onValueChange={(value: 'lbs' | 'kg') => handleInputChange('weight_unit', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-4">
                        <Label className="flex items-center">
                            <Ruler className="h-4 w-4 mr-1" />
                            Dimensions (L × W × H) *
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="length">Length</Label>
                                <Input
                                    id="length"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={packageDetails.length || ''}
                                    onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
                                    placeholder="0.0"
                                    className={errors.length ? 'border-red-500' : ''}
                                />
                                {errors.length && (
                                    <p className="text-sm text-red-600">{errors.length}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="width">Width</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={packageDetails.width || ''}
                                    onChange={(e) => handleInputChange('width', parseFloat(e.target.value) || 0)}
                                    placeholder="0.0"
                                    className={errors.width ? 'border-red-500' : ''}
                                />
                                {errors.width && (
                                    <p className="text-sm text-red-600">{errors.width}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Height</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={packageDetails.height || ''}
                                    onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                                    placeholder="0.0"
                                    className={errors.height ? 'border-red-500' : ''}
                                />
                                {errors.height && (
                                    <p className="text-sm text-red-600">{errors.height}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Unit</Label>
                                <Select
                                    value={packageDetails.dimension_unit}
                                    onValueChange={(value: 'in' | 'cm') => handleInputChange('dimension_unit', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in">Inches (in)</SelectItem>
                                        <SelectItem value="cm">Centimeters (cm)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Weight Calculation Info */}
                    {volumetricWeight > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-2">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="space-y-2">
                                    <h4 className="font-medium text-blue-900">Weight Calculation</h4>
                                    <div className="text-sm text-blue-800 space-y-1">
                                        <p>Actual Weight: {packageDetails.weight} {packageDetails.weight_unit}</p>
                                        <p>Volumetric Weight: {volumetricWeight} {packageDetails.weight_unit}</p>
                                        <p className="font-medium">Billing Weight: {billingWeight} {packageDetails.weight_unit}</p>
                                        <p className="text-xs">*Billing weight is the greater of actual or volumetric weight</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Package Details & Value
                    </CardTitle>
                    <CardDescription>
                        Provide package contents and declared value for customs and insurance
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="package_type">Package Type</Label>
                            <Select
                                value={packageDetails.package_type}
                                onValueChange={(value) => handleInputChange('package_type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PACKAGE_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="declared_value">Declared Value *</Label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                                    $
                                </span>
                                <Input
                                    id="declared_value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={packageDetails.declared_value || ''}
                                    onChange={(e) => handleInputChange('declared_value', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className={`rounded-l-none ${errors.declared_value ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.declared_value && (
                                <p className="text-sm text-red-600">{errors.declared_value}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contents_description">Contents Description *</Label>
                        <Textarea
                            id="contents_description"
                            value={packageDetails.contents_description}
                            onChange={(e) => handleInputChange('contents_description', e.target.value)}
                            placeholder="Describe the contents of your package (e.g., Electronics, Clothing, Documents)"
                            rows={3}
                            className={errors.contents_description ? 'border-red-500' : ''}
                        />
                        {errors.contents_description && (
                            <p className="text-sm text-red-600">{errors.contents_description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            Accurate description helps with customs clearance and proper handling
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Special Handling */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Special Handling & Options
                    </CardTitle>
                    <CardDescription>
                        Select any special handling requirements for your package
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SPECIAL_HANDLING_OPTIONS.map((option) => (
                            <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                <Checkbox
                                    id={option.id}
                                    checked={packageDetails.special_handling?.includes(option.id) || false}
                                    onCheckedChange={(checked) => handleSpecialHandlingChange(option.id, checked as boolean)}
                                />
                                <div className="flex-1">
                                    <Label htmlFor={option.id} className="font-medium cursor-pointer">
                                        {option.label}
                                    </Label>
                                    <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="insurance_required"
                                checked={packageDetails.insurance_required}
                                onCheckedChange={(checked) => handleInputChange('insurance_required', checked)}
                            />
                            <Label htmlFor="insurance_required" className="cursor-pointer">
                                Add Insurance Coverage
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="signature_required"
                                checked={packageDetails.signature_required}
                                onCheckedChange={(checked) => handleInputChange('signature_required', checked)}
                            />
                            <Label htmlFor="signature_required" className="cursor-pointer">
                                Require Signature on Delivery
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={onPrev}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button onClick={handleNext} className="min-w-32">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
