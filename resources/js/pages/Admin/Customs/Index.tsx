import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    Search,
    Plus,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Eye,
    Filter,
    Calendar,
    Globe,
    DollarSign,
    TrendingUp
} from 'lucide-react';

interface Shipment {
    id: number;
    tracking_number: string;
}

interface User {
    id: number;
    name: string;
}

interface CustomsDeclaration {
    id: number;
    declaration_number: string;
    declaration_type: string;
    shipment_type: string;
    origin_country: string;
    destination_country: string;
    status: string;
    total_value: number;
    currency: string;
    submitted_at?: string;
    approved_at?: string;
    cleared_at?: string;
    created_at: string;
    shipment: Shipment;
    created_by: User;
}

interface Stats {
    total_declarations: number;
    pending_declarations: number;
    cleared_today: number;
    high_value_declarations: number;
    avg_processing_time: number;
    compliance_rate: number;
}

interface Props {
    declarations: {
        data: CustomsDeclaration[];
        meta: any;
        links: any[];
    };
    stats: Stats;
    filters: {
        search?: string;
        status?: string;
        declaration_type?: string;
        country?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function CustomsIndex({ declarations, stats, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedType, setSelectedType] = useState(filters.declaration_type || 'all');
    const [selectedCountry, setSelectedCountry] = useState(filters.country || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const formatCurrency = (amount: number, currency: string = 'TZS') => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
            submitted: { label: 'Submitted', variant: 'default' as const, icon: Clock },
            processing: { label: 'Processing', variant: 'default' as const, icon: Clock },
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
        const typeConfig = {
            export: { label: 'Export', color: 'bg-blue-100 text-blue-800' },
            import: { label: 'Import', color: 'bg-green-100 text-green-800' },
            transit: { label: 'Transit', color: 'bg-purple-100 text-purple-800' },
        };

        const config = typeConfig[type as keyof typeof typeConfig] || 
                      { label: type, color: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getShipmentTypeBadge = (type: string) => {
        const typeConfig = {
            commercial: { label: 'Commercial', color: 'bg-indigo-100 text-indigo-800' },
            gift: { label: 'Gift', color: 'bg-pink-100 text-pink-800' },
            sample: { label: 'Sample', color: 'bg-yellow-100 text-yellow-800' },
            return: { label: 'Return', color: 'bg-orange-100 text-orange-800' },
            personal: { label: 'Personal', color: 'bg-teal-100 text-teal-800' },
        };

        const config = typeConfig[type as keyof typeof typeConfig] || 
                      { label: type, color: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const handleSearch = () => {
        router.get(route('admin.customs.index'), {
            search: searchTerm,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            declaration_type: selectedType !== 'all' ? selectedType : undefined,
            country: selectedCountry || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedType('all');
        setSelectedCountry('');
        setDateFrom('');
        setDateTo('');
        
        router.get(route('admin.customs.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Customs & Compliance" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customs & Compliance</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Manage customs declarations and compliance documentation
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/customs/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Declaration
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Declarations</p>
                                    <p className="text-2xl font-bold">{stats.total_declarations}</p>
                                    <p className="text-xs text-muted-foreground">
                                        All time
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending_declarations}</p>
                                    <p className="text-xs text-orange-600">
                                        Awaiting processing
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Cleared Today</p>
                                    <p className="text-2xl font-bold">{stats.cleared_today}</p>
                                    <p className="text-xs text-green-600">
                                        {stats.compliance_rate}% compliance rate
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
                                    <p className="text-2xl font-bold">{stats.avg_processing_time}h</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.high_value_declarations} high-value
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filter Declarations
                        </CardTitle>
                        <CardDescription>
                            Search and filter customs declarations by various criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Declaration number, tracking number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="cleared">Cleared</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="export">Export</SelectItem>
                                        <SelectItem value="import">Import</SelectItem>
                                        <SelectItem value="transit">Transit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Country</label>
                                <Input
                                    placeholder="Country code (e.g., USA)"
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <label className="text-sm font-medium">Actions</label>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                    <Button onClick={handleSearch} className="flex-1">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                    <Button variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-none">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Declarations Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customs Declarations</CardTitle>
                        <CardDescription>
                            All customs declarations and their current status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Declaration</TableHead>
                                            <TableHead className="min-w-[120px]">Shipment</TableHead>
                                            <TableHead className="min-w-[100px]">Type</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Countries</TableHead>
                                            <TableHead className="min-w-[100px] hidden sm:table-cell">Value</TableHead>
                                            <TableHead className="min-w-[100px] hidden md:table-cell">Created</TableHead>
                                            <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {declarations.data.length > 0 ? declarations.data.map((declaration) => (
                                            <TableRow key={declaration.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{declaration.declaration_number}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            {getDeclarationTypeBadge(declaration.declaration_type)}
                                                            {getShipmentTypeBadge(declaration.shipment_type)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{declaration.shipment.tracking_number}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            by {declaration.created_by.name}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col space-y-1">
                                                        {getDeclarationTypeBadge(declaration.declaration_type)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(declaration.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {declaration.origin_country} → {declaration.destination_country}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="flex items-center">
                                                        <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                                                        <span className="font-medium">
                                                            {formatCurrency(declaration.total_value, declaration.currency)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div>
                                                        <p className="text-sm">{formatDate(declaration.created_at)}</p>
                                                        {declaration.submitted_at && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Submitted: {formatDate(declaration.submitted_at)}
                                                            </p>
                                                        )}
                                                        {declaration.cleared_at && (
                                                            <p className="text-xs text-green-600">
                                                                Cleared: {formatDate(declaration.cleared_at)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.customs.show', declaration.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No customs declarations found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {declarations?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing {declarations?.meta?.from || 0} to {declarations?.meta?.to || 0} of {declarations?.meta?.total || 0} declarations
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                    {declarations?.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="min-w-[40px]"
                                        />
                                    )) || []}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
