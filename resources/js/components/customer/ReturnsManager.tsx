import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    RotateCcw,
    Package,
    Search,
    Plus,
    FileText,
    Truck,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Download
} from 'lucide-react';

interface ReturnShipment {
    id: number;
    return_tracking_number: string;
    original_tracking_number: string;
    return_reason: string;
    return_type: 'exchange' | 'refund' | 'repair';
    status: 'pending' | 'approved' | 'picked_up' | 'in_transit' | 'delivered' | 'processed' | 'cancelled';
    created_date: string;
    pickup_date?: string;
    estimated_delivery_date?: string;
    return_value: number;
    sender_name: string;
    recipient_name: string;
    recipient_address: string;
    special_instructions?: string;
}

interface Props {
    returns: ReturnShipment[];
    className?: string;
}

const RETURN_REASONS = [
    { value: 'defective', label: 'Defective/Damaged Item' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'size_issue', label: 'Size/Fit Issue' },
    { value: 'customer_change', label: 'Customer Changed Mind' },
    { value: 'warranty', label: 'Warranty Claim' },
    { value: 'other', label: 'Other' },
];

const RETURN_TYPES = [
    { value: 'refund', label: 'Refund', description: 'Return for money back' },
    { value: 'exchange', label: 'Exchange', description: 'Return for replacement item' },
    { value: 'repair', label: 'Repair', description: 'Return for repair/service' },
];

export default function ReturnsManager({ returns, className = '' }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newReturn, setNewReturn] = useState({
        original_tracking_number: '',
        return_reason: '',
        return_type: 'refund',
        return_value: 0,
        special_instructions: '',
    });

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            picked_up: 'bg-purple-100 text-purple-800',
            in_transit: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            processed: 'bg-emerald-100 text-emerald-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getTypeColor = (type: string) => {
        const colors = {
            refund: 'bg-red-100 text-red-800',
            exchange: 'bg-blue-100 text-blue-800',
            repair: 'bg-green-100 text-green-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const filteredReturns = returns.filter(returnItem => {
        const matchesSearch = returnItem.return_tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             returnItem.original_tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             returnItem.sender_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getReturnStats = () => {
        const total = returns.length;
        const pending = returns.filter(r => r.status === 'pending').length;
        const inProgress = returns.filter(r => ['approved', 'picked_up', 'in_transit'].includes(r.status)).length;
        const completed = returns.filter(r => ['delivered', 'processed'].includes(r.status)).length;
        const totalValue = returns.reduce((sum, r) => sum + r.return_value, 0);

        return { total, pending, inProgress, completed, totalValue };
    };

    const stats = getReturnStats();

    const handleCreateReturn = async () => {
        try {
            const response = await fetch('/customer/returns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(newReturn),
            });

            const result = await response.json();

            if (result.success) {
                setShowCreateForm(false);
                setNewReturn({
                    original_tracking_number: '',
                    return_reason: '',
                    return_type: 'refund',
                    return_value: 0,
                    special_instructions: '',
                });
                // Refresh the page or update the returns list
                window.location.reload();
            } else {
                alert('Failed to create return request: ' + result.message);
            }
        } catch (error) {
            console.error('Error creating return:', error);
            alert('Failed to create return request. Please try again.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center">
                                <RotateCcw className="h-5 w-5 mr-2" />
                                Returns Management
                            </CardTitle>
                            <CardDescription>
                                Manage return shipments and track their progress
                            </CardDescription>
                        </div>
                        <Button onClick={() => setShowCreateForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Return
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats Overview */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <Truck className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Value</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Returns Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search by tracking number or sender name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="picked_up">Picked Up</SelectItem>
                                        <SelectItem value="in_transit">In Transit</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="processed">Processed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Returns List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Return Shipments</CardTitle>
                            <CardDescription>
                                {filteredReturns.length} of {returns.length} returns
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredReturns.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredReturns.map((returnItem) => (
                                        <div key={returnItem.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {returnItem.return_tracking_number}
                                                        </h3>
                                                        <Badge className={getStatusColor(returnItem.status)}>
                                                            {returnItem.status.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                        <Badge className={getTypeColor(returnItem.return_type)}>
                                                            {returnItem.return_type.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Original:</span> {returnItem.original_tracking_number}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">From:</span> {returnItem.sender_name}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Created:</span> {formatDate(returnItem.created_date)}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Value:</span> {formatCurrency(returnItem.return_value)}
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        <span className="font-medium">Reason:</span> {returnItem.return_reason}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Label
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No returns found</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {searchTerm || statusFilter !== 'all' 
                                            ? 'Try adjusting your search or filters'
                                            : 'Create your first return request to get started'
                                        }
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Returns Analytics</CardTitle>
                            <CardDescription>
                                Insights into your return patterns and trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Analytics Coming Soon</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Detailed analytics and reporting features will be available in the next update
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Return Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>Create Return Request</CardTitle>
                            <CardDescription>
                                Fill out the details for your return shipment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="original_tracking">Original Tracking Number *</Label>
                                <Input
                                    id="original_tracking"
                                    value={newReturn.original_tracking_number}
                                    onChange={(e) => setNewReturn(prev => ({ ...prev, original_tracking_number: e.target.value }))}
                                    placeholder="RT12345678"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="return_reason">Return Reason *</Label>
                                <Select
                                    value={newReturn.return_reason}
                                    onValueChange={(value) => setNewReturn(prev => ({ ...prev, return_reason: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RETURN_REASONS.map((reason) => (
                                            <SelectItem key={reason.value} value={reason.value}>
                                                {reason.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="return_type">Return Type *</Label>
                                <Select
                                    value={newReturn.return_type}
                                    onValueChange={(value) => setNewReturn(prev => ({ ...prev, return_type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RETURN_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div>
                                                    <div className="font-medium">{type.label}</div>
                                                    <div className="text-xs text-gray-500">{type.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="return_value">Return Value ($)</Label>
                                <Input
                                    id="return_value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newReturn.return_value}
                                    onChange={(e) => setNewReturn(prev => ({ ...prev, return_value: parseFloat(e.target.value) || 0 }))}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="special_instructions">Special Instructions</Label>
                                <Textarea
                                    id="special_instructions"
                                    value={newReturn.special_instructions}
                                    onChange={(e) => setNewReturn(prev => ({ ...prev, special_instructions: e.target.value }))}
                                    placeholder="Any special handling instructions..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateReturn}>
                                    Create Return
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
