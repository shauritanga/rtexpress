import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CustomsDocumentation from '@/components/customer/customs/CustomsDocumentation';
import DutyTaxCalculator from '@/components/customer/customs/DutyTaxCalculator';
import ComplianceChecker from '@/components/customer/customs/ComplianceChecker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
    FileText,
    Calculator,
    Shield,
    ArrowLeft,
    Globe,
    Package,
    AlertTriangle,
    CheckCircle,
    DollarSign,
    BookOpen,
    ExternalLink,
    Download
} from 'lucide-react';

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
        commonDestinations: ['CA', 'GB', 'AU', 'DE']
    },
    currentShipment,
    destinationCountry = 'CA'
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
            'CA': 'Canada',
            'GB': 'United Kingdom',
            'AU': 'Australia',
            'DE': 'Germany',
            'FR': 'France',
            'US': 'United States',
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
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Documents</span>
                                </Button>
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <Calculator className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Calculator</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                                <Globe className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-blue-600" />
                                Customs Management
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • International shipping documentation and compliance
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customs Statistics - Mobile First Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Documents</p>
                                    <p className="text-sm sm:text-lg font-bold text-blue-600 truncate">
                                        {customsStats.totalDocuments}
                                    </p>
                                    {customsStats.pendingDocuments > 0 && (
                                        <p className="text-xs text-yellow-600">
                                            {customsStats.pendingDocuments} pending
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Compliance</p>
                                    <p className={`text-sm sm:text-lg font-bold truncate ${getComplianceColor(customsStats.complianceRate)}`}>
                                        {customsStats.complianceRate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Duty</p>
                                    <p className="text-sm sm:text-lg font-bold text-purple-600 truncate">
                                        {customsStats.averageDutyRate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Calculations</p>
                                    <p className="text-sm sm:text-lg font-bold text-orange-600 truncate">
                                        {customsStats.recentCalculations}
                                    </p>
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
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">
                                        Managing customs for: {currentShipment.tracking_number}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {currentShipment.service_type} • To {getCountryName(destinationCountry)}
                                    </p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                    International
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content - Mobile Responsive Tabs */}
                <Tabs defaultValue="documentation" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="documentation" className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Documents</span>
                        </TabsTrigger>
                        <TabsTrigger value="calculator" className="flex items-center">
                            <Calculator className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Calculator</span>
                        </TabsTrigger>
                        <TabsTrigger value="compliance" className="flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
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

                    <TabsContent value="calculator">
                        <DutyTaxCalculator
                            destinationCountry={destinationCountry}
                            originCountry="US"
                            onCalculationComplete={handleCalculationComplete}
                        />
                    </TabsContent>

                    <TabsContent value="compliance">
                        <ComplianceChecker
                            destinationCountry={destinationCountry}
                            originCountry="US"
                            onComplianceCheck={handleComplianceCheck}
                        />
                    </TabsContent>
                </Tabs>

                {/* Results Summary */}
                {(calculationResult || complianceResult) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Summary</CardTitle>
                            <CardDescription>
                                Overview of your customs calculations and compliance checks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {calculationResult && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
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
                                    <div className={`p-4 border rounded-lg ${
                                        complianceResult.status === 'compliant' 
                                            ? 'bg-green-50 border-green-200' 
                                            : complianceResult.status === 'warning'
                                            ? 'bg-yellow-50 border-yellow-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className={`h-4 w-4 ${
                                                complianceResult.status === 'compliant' 
                                                    ? 'text-green-600' 
                                                    : complianceResult.status === 'warning'
                                                    ? 'text-yellow-600'
                                                    : 'text-red-600'
                                            }`} />
                                            <h4 className={`font-medium ${
                                                complianceResult.status === 'compliant' 
                                                    ? 'text-green-900' 
                                                    : complianceResult.status === 'warning'
                                                    ? 'text-yellow-900'
                                                    : 'text-red-900'
                                            }`}>
                                                Compliance Check
                                            </h4>
                                        </div>
                                        <div className={`space-y-1 text-sm ${
                                            complianceResult.status === 'compliant' 
                                                ? 'text-green-800' 
                                                : complianceResult.status === 'warning'
                                                ? 'text-yellow-800'
                                                : 'text-red-800'
                                        }`}>
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
                        <CardDescription>
                            Countries you frequently ship to
                        </CardDescription>
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
                        <CardDescription>
                            Helpful resources for international shipping
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">HS Code Lookup</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Find the correct classification codes for your products
                                    </p>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="h-3 w-3 mr-2" />
                                        Open Tool
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Country Guides</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Detailed import/export guides for different countries
                                    </p>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-3 w-3 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Compliance Alerts</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Stay updated on changing regulations and requirements
                                    </p>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="h-3 w-3 mr-2" />
                                        Subscribe
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <Calculator className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Duty Calculator API</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Integrate duty calculations into your systems
                                    </p>
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="h-3 w-3 mr-2" />
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
