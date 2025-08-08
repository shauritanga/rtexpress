import CustomsDocumentation from '@/components/customer/customs/CustomsDocumentation';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React from 'react';

import ComplianceChecker from '@/components/customer/customs/ComplianceChecker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, DollarSign, Download, ExternalLink, FileText, Globe, Package, Shield } from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
}

interface CustomsStats {
    totalDocuments: number;
    pendingDocuments: number;
    complianceRate: number;
    averageDutyRate: number;
    recentCalculations: number;
    commonDestinations: string[];
}

interface Props {
    customer: Customer;
    customsStats?: CustomsStats;
    currentShipment?: any;
    destinationCountry?: string;
}

export default function CustomsIndex({
    customer,
    customsStats = {
        totalDocuments: 24,
        pendingDocuments: 3,
        complianceRate: 96.8,
        averageDutyRate: 8.5,
        recentCalculations: 12,
        commonDestinations: ['CA', 'GB', 'AU', 'DE'],
    },
    currentShipment,
    destinationCountry = 'CA',
}: Props) {
    const [selectedDocument, setSelectedDocument] = React.useState<any>(null);
    const [calculationResult, setCalculationResult] = React.useState<any>(null);
    const [complianceResult, setComplianceResult] = React.useState<any>(null);

    const handleDocumentSave = (document: any) => {
        console.log('Document saved:', document);
        // In a real app, this would save to the backend
    };

    const handleDocumentGenerate = (documentType: string) => {
        console.log('Generating document:', documentType);
        // In a real app, this would generate and download the document
    };

    const handleCalculationComplete = (result: any) => {
        setCalculationResult(result);
        console.log('Calculation completed:', result);
    };

    const handleComplianceCheck = (result: any) => {
        setComplianceResult(result);
        console.log('Compliance check completed:', result);
    };

    const getCountryName = (code: string) => {
        const countries: { [key: string]: string } = {
            CA: 'Canada',
            GB: 'United Kingdom',
            AU: 'Australia',
            DE: 'Germany',
            FR: 'France',
            US: 'United States',
        };
        return countries[code] || code;
    };

    const getComplianceColor = (rate: number) => {
        if (rate >= 95) return 'text-green-600';
        if (rate >= 85) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AppLayout>
            <Head title="Customs Management" />

            <div className="space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
                {/* Header - Mobile Optimized */}
                <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>

                            {/* Quick Actions - Mobile Responsive */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <FileText className="h-4 w-4" />
                                    <span className="ml-2 hidden sm:inline">Documents</span>
                                </Button>
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <Calculator className="h-4 w-4" />
                                    <span className="ml-2 hidden sm:inline">Calculator</span>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h1 className="flex items-center text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
                                <Globe className="mr-3 h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
                                Customs Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 sm:text-base">
                                {customer.company_name} • International shipping documentation and compliance
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customs Statistics - Mobile First Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Documents</p>
                                    <p className="truncate text-sm font-bold text-blue-600 sm:text-lg">{customsStats.totalDocuments}</p>
                                    {customsStats.pendingDocuments > 0 && (
                                        <p className="text-xs text-yellow-600">{customsStats.pendingDocuments} pending</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Compliance</p>
                                    <p className={`truncate text-sm font-bold sm:text-lg ${getComplianceColor(customsStats.complianceRate)}`}>
                                        {customsStats.complianceRate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Avg Duty</p>
                                    <p className="truncate text-sm font-bold text-purple-600 sm:text-lg">{customsStats.averageDutyRate}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Calculator className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Calculations</p>
                                    <p className="truncate text-sm font-bold text-orange-600 sm:text-lg">{customsStats.recentCalculations}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Shipment Context */}
                {currentShipment && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">Managing customs for: {currentShipment.tracking_number}</h3>
                                    <p className="text-sm text-gray-600">
                                        {currentShipment.service_type} • To {getCountryName(destinationCountry)}
                                    </p>
                                </div>
                                <Badge className="border-blue-300 bg-blue-100 text-blue-800">International</Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content - Mobile Responsive Tabs */}
                <Tabs defaultValue="documentation" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="documentation" className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Documents</span>
                        </TabsTrigger>
                        <TabsTrigger value="compliance" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Compliance</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="documentation">
                        <CustomsDocumentation
                            shipmentId={currentShipment?.id}
                            destinationCountry={destinationCountry}
                            onDocumentSave={handleDocumentSave}
                            onDocumentGenerate={handleDocumentGenerate}
                        />
                    </TabsContent>

                    <TabsContent value="compliance">
                        <ComplianceChecker destinationCountry={destinationCountry} originCountry="US" onComplianceCheck={handleComplianceCheck} />
                    </TabsContent>
                </Tabs>

                {/* Results Summary */}
                {(calculationResult || complianceResult) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Summary</CardTitle>
                            <CardDescription>Overview of your customs calculations and compliance checks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {calculationResult && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Calculator className="h-4 w-4 text-green-600" />
                                            <h4 className="font-medium text-green-900">Duty & Tax Calculation</h4>
                                        </div>
                                        <div className="space-y-1 text-sm text-green-800">
                                            <div className="flex justify-between">
                                                <span>Item Value:</span>
                                                <span>${calculationResult.itemValue?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Total Charges:</span>
                                                <span>${calculationResult.totalCharges?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium">
                                                <span>Total Cost:</span>
                                                <span>${calculationResult.totalCost?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {complianceResult && (
                                    <div
                                        className={`rounded-lg border p-4 ${
                                            complianceResult.status === 'compliant'
                                                ? 'border-green-200 bg-green-50'
                                                : complianceResult.status === 'warning'
                                                  ? 'border-yellow-200 bg-yellow-50'
                                                  : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <Shield
                                                className={`h-4 w-4 ${
                                                    complianceResult.status === 'compliant'
                                                        ? 'text-green-600'
                                                        : complianceResult.status === 'warning'
                                                          ? 'text-yellow-600'
                                                          : 'text-red-600'
                                                }`}
                                            />
                                            <h4
                                                className={`font-medium ${
                                                    complianceResult.status === 'compliant'
                                                        ? 'text-green-900'
                                                        : complianceResult.status === 'warning'
                                                          ? 'text-yellow-900'
                                                          : 'text-red-900'
                                                }`}
                                            >
                                                Compliance Check
                                            </h4>
                                        </div>
                                        <div
                                            className={`space-y-1 text-sm ${
                                                complianceResult.status === 'compliant'
                                                    ? 'text-green-800'
                                                    : complianceResult.status === 'warning'
                                                      ? 'text-yellow-800'
                                                      : 'text-red-800'
                                            }`}
                                        >
                                            <div className="flex justify-between">
                                                <span>Status:</span>
                                                <span className="capitalize">{complianceResult.status}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Issues:</span>
                                                <span>{complianceResult.issues?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Required Docs:</span>
                                                <span>{complianceResult.requiredDocuments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Common Destinations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Common Destinations</CardTitle>
                        <CardDescription>Countries you frequently ship to</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {customsStats.commonDestinations.map((country) => (
                                <Badge key={country} variant="outline" className="flex items-center gap-2">
                                    <Globe className="h-3 w-3" />
                                    {getCountryName(country)}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Customs Resources */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Customs Resources</CardTitle>
                        <CardDescription>Helpful resources for international shipping</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">HS Code Lookup</h4>
                                    <p className="mb-2 text-sm text-gray-600">Find the correct classification codes for your products</p>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="mr-2 h-3 w-3" />
                                        Open Tool
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Country Guides</h4>
                                    <p className="mb-2 text-sm text-gray-600">Detailed import/export guides for different countries</p>
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-3 w-3" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Compliance Alerts</h4>
                                    <p className="mb-2 text-sm text-gray-600">Stay updated on changing regulations and requirements</p>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="mr-2 h-3 w-3" />
                                        Subscribe
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                                    <Calculator className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Duty Calculator API</h4>
                                    <p className="mb-2 text-sm text-gray-600">Integrate duty calculations into your systems</p>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="mr-2 h-3 w-3" />
                                        API Docs
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
