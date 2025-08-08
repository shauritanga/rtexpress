import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Download, FileText, Loader2, MapPin, Package, Printer } from 'lucide-react';
import { useState } from 'react';

interface Shipment {
    id: number;
    tracking_number: string;
    sender_name: string;
    sender_company: string;
    sender_address: string;
    sender_city: string;
    sender_state: string;
    sender_postal_code: string;
    sender_country: string;
    recipient_name: string;
    recipient_company?: string;
    recipient_address: string;
    recipient_city: string;
    recipient_state: string;
    recipient_postal_code: string;
    recipient_country: string;
    service_type: string;
    weight: number;
    declared_value: number;
    estimated_delivery_date: string;
    status: string;
    created_at: string;
}

interface Props {
    shipment: Shipment;
    className?: string;
}

const LABEL_FORMATS = [
    { value: '4x6', label: '4" × 6" (Standard)', description: 'Most common shipping label size' },
    { value: '4x6.75', label: '4" × 6.75" (Large)', description: 'Extra space for international shipments' },
    { value: '8.5x11', label: '8.5" × 11" (Letter)', description: 'Full page format for office printers' },
];

const LABEL_OPTIONS = [
    { id: 'qr_code', label: 'Include QR Code', description: 'For mobile scanning and tracking' },
    { id: 'return_label', label: 'Generate Return Label', description: 'Include prepaid return shipping label' },
    { id: 'customs_form', label: 'Customs Declaration', description: 'Required for international shipments' },
    { id: 'handling_instructions', label: 'Handling Instructions', description: 'Special handling requirements' },
];

export default function ShippingLabelGenerator({ shipment, className = '' }: Props) {
    const [labelFormat, setLabelFormat] = useState('4x6');
    const [selectedOptions, setSelectedOptions] = useState<string[]>(['qr_code']);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLabel, setGeneratedLabel] = useState<string | null>(null);

    const handleOptionChange = (optionId: string, checked: boolean) => {
        setSelectedOptions((prev) => (checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)));
    };

    const generateLabel = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/customer/shipments/${shipment.id}/label`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    format: labelFormat,
                    options: selectedOptions,
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                setGeneratedLabel(url);
            } else {
                throw new Error('Failed to generate label');
            }
        } catch (error) {
            console.error('Error generating label:', error);
            alert('Failed to generate shipping label. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadLabel = () => {
        if (generatedLabel) {
            const link = document.createElement('a');
            link.href = generatedLabel;
            link.download = `shipping-label-${shipment.tracking_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const printLabel = () => {
        if (generatedLabel) {
            const printWindow = window.open(generatedLabel);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        }
    };

    const getServiceTypeColor = (serviceType: string) => {
        const colors = {
            express: 'bg-red-100 text-red-800',
            standard: 'bg-blue-100 text-blue-800',
            overnight: 'bg-purple-100 text-purple-800',
            international: 'bg-green-100 text-green-800',
        };
        return colors[serviceType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            picked_up: 'bg-blue-100 text-blue-800',
            in_transit: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            exception: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Shipment Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="mr-2 h-5 w-5" />
                        Shipment Details
                    </CardTitle>
                    <CardDescription>Review shipment information before generating label</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Sender */}
                        <div>
                            <h4 className="mb-3 flex items-center font-medium text-gray-900">
                                <MapPin className="mr-1 h-4 w-4" />
                                From
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p className="font-medium">{shipment.sender_company}</p>
                                <p>{shipment.sender_name}</p>
                                <p>{shipment.sender_address}</p>
                                <p>
                                    {shipment.sender_city}, {shipment.sender_state} {shipment.sender_postal_code}
                                </p>
                                <p>{shipment.sender_country}</p>
                            </div>
                        </div>

                        {/* Recipient */}
                        <div>
                            <h4 className="mb-3 flex items-center font-medium text-gray-900">
                                <MapPin className="mr-1 h-4 w-4" />
                                To
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                                {shipment.recipient_company && <p className="font-medium">{shipment.recipient_company}</p>}
                                <p className="font-medium">{shipment.recipient_name}</p>
                                <p>{shipment.recipient_address}</p>
                                <p>
                                    {shipment.recipient_city}, {shipment.recipient_state} {shipment.recipient_postal_code}
                                </p>
                                <p>{shipment.recipient_country}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 md:grid-cols-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                            <p className="font-mono text-lg">{shipment.tracking_number}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Service Type</p>
                            <Badge className={getServiceTypeColor(shipment.service_type)}>{shipment.service_type}</Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Weight</p>
                            <p className="text-lg">{shipment.weight} lbs</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Status</p>
                            <Badge className={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Label Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Label Configuration
                    </CardTitle>
                    <CardDescription>Choose label format and additional options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Label Format */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Label Format</Label>
                        <Select value={labelFormat} onValueChange={setLabelFormat}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LABEL_FORMATS.map((format) => (
                                    <SelectItem key={format.value} value={format.value}>
                                        <div>
                                            <div className="font-medium">{format.label}</div>
                                            <div className="text-xs text-gray-500">{format.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Label Options */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Additional Options</Label>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {LABEL_OPTIONS.map((option) => (
                                <div key={option.id} className="flex items-start space-x-3 rounded-lg border p-3">
                                    <Checkbox
                                        id={option.id}
                                        checked={selectedOptions.includes(option.id)}
                                        onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor={option.id} className="cursor-pointer font-medium">
                                            {option.label}
                                        </Label>
                                        <p className="mt-1 text-xs text-gray-600">{option.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* International Shipping Notice */}
                    {shipment.recipient_country !== shipment.sender_country && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                                <div>
                                    <h4 className="font-medium text-yellow-800">International Shipment</h4>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        Customs declaration form is required for international shipments. This option has been automatically selected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generate Label */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Printer className="mr-2 h-5 w-5" />
                        Generate Shipping Label
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!generatedLabel ? (
                        <div className="py-6 text-center">
                            <Button onClick={generateLabel} disabled={isGenerating} size="lg" className="min-w-48">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Label...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate Label
                                    </>
                                )}
                            </Button>
                            <p className="mt-2 text-sm text-gray-500">This will create a PDF shipping label ready for printing</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center rounded-lg border border-green-200 bg-green-50 p-6">
                                <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                                <span className="font-medium text-green-800">Label generated successfully!</span>
                            </div>

                            <div className="flex flex-col justify-center gap-3 sm:flex-row">
                                <Button onClick={downloadLabel} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Button onClick={printLabel}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Label
                                </Button>
                                <Button onClick={() => setGeneratedLabel(null)} variant="ghost">
                                    Generate New Label
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
