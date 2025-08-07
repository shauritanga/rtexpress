import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import {
    ArrowLeft,
    FileText,
    Package,
    MapPin,
    Banknote,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Upload,
    Download,
    Send,
    Eye
} from 'lucide-react';

interface Shipment {
    id: number;
    tracking_number: string;
    customer: {
        name: string;
        customer_code: string;
    };
}

interface CustomsItem {
    id: number;
    description: string;
    quantity: number;
    unit_value: number;
    total_value: number;
    weight: number;
    hs_code?: string;
    country_of_origin: string;
}

interface CustomsDocument {
    id: number;
    document_type: string;
    file_name: string;
    file_path: string;
    uploaded_at: string;
}

interface CustomsDeclaration {
    id: number;
    declaration_number: string;
    shipment: Shipment;
    declaration_type: string;
    customs_value: number;
    currency: string;
    origin_country: string;
    destination_country: string;
    status: string;
    submitted_at?: string;
    approved_at?: string;
    cleared_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
    customs_duty: number;
    taxes: number;
    fees: number;
    total_charges: number;
    created_at: string;
    updated_at: string;
    items: CustomsItem[];
    documents: CustomsDocument[];
    notes?: string;
}

interface Props {
    declaration: CustomsDeclaration;
}

export default function CustomsShow({ declaration }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatCurrency = (amount: number, currency: string = 'TZS') => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
            submitted: { label: 'Submitted', variant: 'default' as const, icon: Send },
            under_review: { label: 'Under Review', variant: 'default' as const, icon: Eye },
            approved: { label: 'Approved', variant: 'success' as const, icon: CheckCircle },
            rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
            cleared: { label: 'Cleared', variant: 'success' as const, icon: CheckCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: FileText };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getDeclarationTypeBadge = (type: string) => {
        const colors = {
            import: 'bg-blue-100 text-blue-800',
            export: 'bg-green-100 text-green-800',
            transit: 'bg-yellow-100 text-yellow-800',
        };

        const color = colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        );
    };

    const handleSubmit = () => {
        if (declaration.status !== 'draft') return;

        setIsSubmitting(true);
        router.post(route('admin.customs.submit', declaration.id), {}, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleApprove = () => {
        router.post(route('admin.customs.approve', declaration.id));
    };

    const handleReject = () => {
        const reason = prompt('Please provide a rejection reason:');
        if (reason) {
            router.post(route('admin.customs.reject', declaration.id), {
                rejection_reason: reason,
            });
        }
    };

    const handleClear = () => {
        router.post(route('admin.customs.clear', declaration.id));
    };

    return (
        <AppLayout>
            <Head title={`Customs Declaration ${declaration.declaration_number}`} />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/customs">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Customs
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {declaration.declaration_number}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Customs Declaration Details
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        {declaration.status === 'draft' && (
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Submitting...' : 'Submit Declaration'}
                            </Button>
                        )}
                        {declaration.status === 'submitted' && (
                            <>
                                <Button 
                                    variant="outline" 
                                    onClick={handleReject}
                                    className="w-full sm:w-auto"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                                <Button 
                                    onClick={handleApprove}
                                    className="w-full sm:w-auto"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            </>
                        )}
                        {declaration.status === 'approved' && (
                            <Button 
                                onClick={handleClear}
                                className="w-full sm:w-auto"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Clear Customs
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status and Info Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(declaration.status)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <div className="mt-1">
                                        {getDeclarationTypeBadge(declaration.declaration_type)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Banknote className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Customs Value</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(declaration.customs_value, declaration.currency)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Banknote className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Charges</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(declaration.total_charges, declaration.currency)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Declaration Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Declaration Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Shipment</p>
                                <Link 
                                    href={route('admin.shipments.show', declaration.shipment.id)}
                                    className="font-medium text-blue-600 hover:underline"
                                >
                                    {declaration.shipment.tracking_number}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    {declaration.shipment.customer.name} ({declaration.shipment.customer.customer_code})
                                </p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Origin Country</p>
                                    <p className="font-medium">{declaration.origin_country}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Destination Country</p>
                                    <p className="font-medium">{declaration.destination_country}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Currency</p>
                                <p className="font-medium">{declaration.currency}</p>
                            </div>
                            {declaration.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                        <p className="text-sm whitespace-pre-wrap">{declaration.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Charges Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Banknote className="h-5 w-5 mr-2" />
                                Charges Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">Customs Duty</span>
                                    <span className="font-medium">
                                        {formatCurrency(declaration.customs_duty, declaration.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Taxes</span>
                                    <span className="font-medium">
                                        {formatCurrency(declaration.taxes, declaration.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Processing Fees</span>
                                    <span className="font-medium">
                                        {formatCurrency(declaration.fees, declaration.currency)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total Charges</span>
                                    <span>
                                        {formatCurrency(declaration.total_charges, declaration.currency)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Declaration Timeline
                        </CardTitle>
                        <CardDescription>
                            Track the customs declaration progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Declaration Created</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDateTime(declaration.created_at)}
                                    </p>
                                </div>
                            </div>

                            {declaration.submitted_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <Send className="h-4 w-4 text-yellow-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Submitted for Review</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(declaration.submitted_at)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {declaration.approved_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Approved</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(declaration.approved_at)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {declaration.rejected_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Rejected</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(declaration.rejected_at)}
                                        </p>
                                        {declaration.rejection_reason && (
                                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                                <p className="text-sm text-red-700">{declaration.rejection_reason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {declaration.cleared_at && (
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Customs Cleared</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(declaration.cleared_at)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Declaration Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            Declaration Items
                        </CardTitle>
                        <CardDescription>
                            Items included in this customs declaration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Value</TableHead>
                                            <TableHead>Total Value</TableHead>
                                            <TableHead>Weight (kg)</TableHead>
                                            <TableHead>HS Code</TableHead>
                                            <TableHead>Origin</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {declaration.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.description}
                                                </TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>
                                                    {formatCurrency(item.unit_value, declaration.currency)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(item.total_value, declaration.currency)}
                                                </TableCell>
                                                <TableCell>{item.weight}</TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                                        {item.hs_code || 'N/A'}
                                                    </code>
                                                </TableCell>
                                                <TableCell>{item.country_of_origin}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents */}
                {declaration.documents.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Upload className="h-5 w-5 mr-2" />
                                Supporting Documents
                            </CardTitle>
                            <CardDescription>
                                Documents attached to this declaration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {declaration.documents.map((document) => (
                                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{document.file_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {document.document_type} • Uploaded {formatDateTime(document.uploaded_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={document.file_path} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
