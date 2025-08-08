import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, Download, Edit, FileText, Globe, Info, Package, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CustomsItem {
    id: string;
    description: string;
    hsCode: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
    weight: number;
    countryOfOrigin: string;
    purpose: 'gift' | 'commercial' | 'sample' | 'personal' | 'return';
}

interface CustomsDocument {
    id: string;
    type: 'commercial_invoice' | 'customs_declaration' | 'certificate_origin' | 'packing_list';
    status: 'draft' | 'completed' | 'submitted' | 'approved';
    items: CustomsItem[];
    totalValue: number;
    currency: string;
    incoterms: string;
    exportReason: string;
    importerInfo: {
        name: string;
        address: string;
        taxId: string;
        phone: string;
        email: string;
    };
    exporterInfo: {
        name: string;
        address: string;
        taxId: string;
        phone: string;
        email: string;
    };
}

interface Props {
    className?: string;
    shipmentId?: string;
    destinationCountry?: string;
    onDocumentSave?: (document: CustomsDocument) => void;
    onDocumentGenerate?: (documentType: string) => void;
}

export default function CustomsDocumentation({ className = '', shipmentId, destinationCountry = 'CA', onDocumentSave, onDocumentGenerate }: Props) {
    const [customsDocument, setCustomsDocument] = useState<CustomsDocument>({
        id: '',
        type: 'commercial_invoice',
        status: 'draft',
        items: [],
        totalValue: 0,
        currency: 'USD',
        incoterms: 'DDP',
        exportReason: 'Sale',
        importerInfo: {
            name: '',
            address: '',
            taxId: '',
            phone: '',
            email: '',
        },
        exporterInfo: {
            name: 'RT Express Customer',
            address: '123 Business St, New York, NY 10019',
            taxId: 'US123456789',
            phone: '+1 (555) 123-4567',
            email: 'customer@rtexpress.com',
        },
    });

    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<Partial<CustomsItem>>({
        description: '',
        hsCode: '',
        quantity: 1,
        unitValue: 0,
        weight: 0,
        countryOfOrigin: 'US',
        purpose: 'commercial',
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    useEffect(() => {
        calculateTotalValue();
    }, [customsDocument.items]);

    const calculateTotalValue = () => {
        const total = customsDocument.items.reduce((sum, item) => sum + item.totalValue, 0);
        setCustomsDocument((prev) => ({ ...prev, totalValue: total }));
    };

    const addCustomsItem = () => {
        if (!newItem.description || !newItem.hsCode || !newItem.unitValue) {
            setValidationErrors(['Please fill in all required fields']);
            return;
        }

        const item: CustomsItem = {
            id: `item-${Date.now()}`,
            description: newItem.description!,
            hsCode: newItem.hsCode!,
            quantity: newItem.quantity || 1,
            unitValue: newItem.unitValue || 0,
            totalValue: (newItem.quantity || 1) * (newItem.unitValue || 0),
            weight: newItem.weight || 0,
            countryOfOrigin: newItem.countryOfOrigin || 'US',
            purpose: newItem.purpose || 'commercial',
        };

        setCustomsDocument((prev) => ({
            ...prev,
            items: [...prev.items, item],
        }));

        setNewItem({
            description: '',
            hsCode: '',
            quantity: 1,
            unitValue: 0,
            weight: 0,
            countryOfOrigin: 'US',
            purpose: 'commercial',
        });
        setValidationErrors([]);
    };

    const removeCustomsItem = (itemId: string) => {
        setCustomsDocument((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
        }));
    };

    const updateCustomsItem = (itemId: string, updates: Partial<CustomsItem>) => {
        setCustomsDocument((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId
                    ? {
                          ...item,
                          ...updates,
                          totalValue: (updates.quantity || item.quantity) * (updates.unitValue || item.unitValue),
                      }
                    : item,
            ),
        }));
    };

    const validateDocument = (): string[] => {
        const errors: string[] = [];

        if (customsDocument.items.length === 0) {
            errors.push('At least one customs item is required');
        }

        if (!customsDocument.importerInfo.name) {
            errors.push('Importer name is required');
        }

        if (!customsDocument.importerInfo.address) {
            errors.push('Importer address is required');
        }

        customsDocument.items.forEach((item, index) => {
            if (!item.description) {
                errors.push(`Item ${index + 1}: Description is required`);
            }
            if (!item.hsCode) {
                errors.push(`Item ${index + 1}: HS Code is required`);
            }
            if (item.unitValue <= 0) {
                errors.push(`Item ${index + 1}: Unit value must be greater than 0`);
            }
        });

        return errors;
    };

    const handleSaveDocument = () => {
        const errors = validateDocument();
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);
        onDocumentSave?.(customsDocument);
    };

    const handleGenerateDocument = async (documentType: string) => {
        const errors = validateDocument();
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsGenerating(true);
        try {
            // Simulate document generation
            await new Promise((resolve) => setTimeout(resolve, 2000));
            onDocumentGenerate?.(documentType);
        } finally {
            setIsGenerating(false);
        }
    };

    const getDocumentTypeIcon = (type: string) => {
        const icons = {
            commercial_invoice: <FileText className="h-4 w-4" />,
            customs_declaration: <Globe className="h-4 w-4" />,
            certificate_origin: <CheckCircle className="h-4 w-4" />,
            packing_list: <Package className="h-4 w-4" />,
        };
        return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800 border-gray-300',
            completed: 'bg-blue-100 text-blue-800 border-blue-300',
            submitted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const purposeOptions = [
        { value: 'commercial', label: 'Commercial Sale' },
        { value: 'gift', label: 'Gift' },
        { value: 'sample', label: 'Sample' },
        { value: 'personal', label: 'Personal Use' },
        { value: 'return', label: 'Return/Repair' },
    ];

    const incotermOptions = [
        { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
        { value: 'DDU', label: 'DDU - Delivered Duty Unpaid' },
        { value: 'EXW', label: 'EXW - Ex Works' },
        { value: 'FOB', label: 'FOB - Free on Board' },
        { value: 'CIF', label: 'CIF - Cost, Insurance & Freight' },
    ];

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                    <FileText className="mr-2 h-5 w-5" />
                    Customs Documentation
                </CardTitle>
                <CardDescription>Create and manage customs documents for international shipping to {destinationCountry}</CardDescription>

                <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(customsDocument.status)}>
                        {customsDocument.status.charAt(0).toUpperCase() + customsDocument.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                        {getDocumentTypeIcon(customsDocument.type)}
                        <span className="ml-1 capitalize">{customsDocument.type.replace('_', ' ')}</span>
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <h4 className="font-medium text-red-900">Validation Errors</h4>
                        </div>
                        <ul className="space-y-1 text-sm text-red-800">
                            {validationErrors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Document Settings */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="document-type">Document Type</Label>
                        <Select
                            value={customsDocument.type}
                            onValueChange={(value) => setCustomsDocument((prev) => ({ ...prev, type: value as any }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="commercial_invoice">Commercial Invoice</SelectItem>
                                <SelectItem value="customs_declaration">Customs Declaration</SelectItem>
                                <SelectItem value="certificate_origin">Certificate of Origin</SelectItem>
                                <SelectItem value="packing_list">Packing List</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="incoterms">Incoterms</Label>
                        <Select
                            value={customsDocument.incoterms}
                            onValueChange={(value) => setCustomsDocument((prev) => ({ ...prev, incoterms: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {incotermOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Importer Information */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Importer Information</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="importer-name">Company/Name *</Label>
                            <Input
                                id="importer-name"
                                value={customsDocument.importerInfo.name}
                                onChange={(e) =>
                                    setCustomsDocument((prev) => ({
                                        ...prev,
                                        importerInfo: { ...prev.importerInfo, name: e.target.value },
                                    }))
                                }
                                placeholder="Importer company name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="importer-tax-id">Tax ID/VAT Number</Label>
                            <Input
                                id="importer-tax-id"
                                value={customsDocument.importerInfo.taxId}
                                onChange={(e) =>
                                    setCustomsDocument((prev) => ({
                                        ...prev,
                                        importerInfo: { ...prev.importerInfo, taxId: e.target.value },
                                    }))
                                }
                                placeholder="Tax identification number"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Label htmlFor="importer-address">Address *</Label>
                            <Textarea
                                id="importer-address"
                                value={customsDocument.importerInfo.address}
                                onChange={(e) =>
                                    setCustomsDocument((prev) => ({
                                        ...prev,
                                        importerInfo: { ...prev.importerInfo, address: e.target.value },
                                    }))
                                }
                                placeholder="Complete importer address"
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="importer-phone">Phone</Label>
                            <Input
                                id="importer-phone"
                                value={customsDocument.importerInfo.phone}
                                onChange={(e) =>
                                    setCustomsDocument((prev) => ({
                                        ...prev,
                                        importerInfo: { ...prev.importerInfo, phone: e.target.value },
                                    }))
                                }
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div>
                            <Label htmlFor="importer-email">Email</Label>
                            <Input
                                id="importer-email"
                                type="email"
                                value={customsDocument.importerInfo.email}
                                onChange={(e) =>
                                    setCustomsDocument((prev) => ({
                                        ...prev,
                                        importerInfo: { ...prev.importerInfo, email: e.target.value },
                                    }))
                                }
                                placeholder="importer@example.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Customs Items */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Customs Items</h3>
                        <Badge variant="outline">
                            {customsDocument.items.length} item{customsDocument.items.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    {/* Add New Item Form */}
                    <div className="rounded-lg border border-dashed border-gray-300 p-4">
                        <h4 className="mb-3 font-medium text-gray-900">Add New Item</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <Label htmlFor="item-description">Description *</Label>
                                <Input
                                    id="item-description"
                                    value={newItem.description || ''}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Item description"
                                />
                            </div>
                            <div>
                                <Label htmlFor="item-hs-code">HS Code *</Label>
                                <Input
                                    id="item-hs-code"
                                    value={newItem.hsCode || ''}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, hsCode: e.target.value }))}
                                    placeholder="123456"
                                />
                            </div>
                            <div>
                                <Label htmlFor="item-quantity">Quantity</Label>
                                <Input
                                    id="item-quantity"
                                    type="number"
                                    min="1"
                                    value={newItem.quantity || 1}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="item-unit-value">Unit Value (USD) *</Label>
                                <Input
                                    id="item-unit-value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newItem.unitValue || ''}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, unitValue: parseFloat(e.target.value) || 0 }))}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label htmlFor="item-weight">Weight (kg)</Label>
                                <Input
                                    id="item-weight"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newItem.weight || ''}
                                    onChange={(e) => setNewItem((prev) => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label htmlFor="item-purpose">Purpose</Label>
                                <Select
                                    value={newItem.purpose || 'commercial'}
                                    onValueChange={(value) => setNewItem((prev) => ({ ...prev, purpose: value as any }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {purposeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={addCustomsItem} className="mt-3">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>

                    {/* Items List */}
                    {customsDocument.items.length > 0 && (
                        <div className="space-y-3">
                            {customsDocument.items.map((item, index) => (
                                <div key={item.id} className="rounded-lg border p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                                <Label className="text-xs text-gray-500">Description</Label>
                                                <p className="font-medium">{item.description}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">HS Code</Label>
                                                <p className="font-mono text-sm">{item.hsCode}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Quantity × Unit Value</Label>
                                                <p>
                                                    {item.quantity} × ${item.unitValue.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Total Value</Label>
                                                <p className="font-bold text-green-600">${item.totalValue.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeCustomsItem(item.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                        <span>Weight: {item.weight}kg</span>
                                        <span>Origin: {item.countryOfOrigin}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {purposeOptions.find((p) => p.value === item.purpose)?.label}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Total Summary */}
                    {customsDocument.items.length > 0 && (
                        <div className="rounded-lg bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Total Declared Value</span>
                                <span className="text-xl font-bold text-green-600">
                                    ${customsDocument.totalValue.toFixed(2)} {customsDocument.currency}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <Button onClick={handleSaveDocument} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Save Document
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateDocument(customsDocument.type)} disabled={isGenerating} className="flex-1">
                        {isGenerating ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-gray-600"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Generate PDF
                            </>
                        )}
                    </Button>
                </div>

                {/* Help Information */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                        <div>
                            <h4 className="mb-1 font-medium text-blue-900">Customs Documentation Tips</h4>
                            <ul className="space-y-1 text-sm text-blue-800">
                                <li>• Ensure all item descriptions are detailed and accurate</li>
                                <li>• HS codes must match the actual product classification</li>
                                <li>• Declared values should reflect the actual commercial value</li>
                                <li>• Keep copies of all customs documents for your records</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
