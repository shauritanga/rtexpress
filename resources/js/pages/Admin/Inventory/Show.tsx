import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, BarChart3, CheckCircle, Edit, MapPin, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface InventoryItem {
    id: number;
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    category: string;
    brand?: string;
    model?: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    unit_of_measure: string;
    unit_cost: number;
    unit_price: number;
    supplier?: string;
    manufacturer?: string;
    min_stock_level: number;
    max_stock_level: number;
    reorder_point: number;
    reorder_quantity: number;
    is_active: boolean;
    is_trackable: boolean;
    is_serialized: boolean;
    total_quantity: number;
    available_quantity: number;
    stock_status: string;
    warehouse_stock: WarehouseStock[];
    stock_movements: StockMovement[];
    stock_alerts: StockAlert[];
}

interface WarehouseStock {
    id: number;
    warehouse_id: number;
    quantity_available: number;
    quantity_reserved: number;
    quantity_damaged: number;
    location?: string;
    average_cost: number;
    last_counted_at?: string;
    warehouse: {
        id: number;
        name: string;
        code: string;
    };
}

interface StockMovement {
    id: number;
    type: string;
    quantity: number;
    quantity_before: number;
    quantity_after: number;
    unit_cost?: number;
    reference_type?: string;
    notes?: string;
    movement_date: string;
    warehouse: {
        name: string;
    };
    created_by: {
        name: string;
    };
}

interface StockAlert {
    id: number;
    type: string;
    status: string;
    current_quantity: number;
    threshold_quantity?: number;
    message: string;
    priority: string;
    triggered_at: string;
    warehouse: {
        name: string;
    };
}

interface Props {
    item: InventoryItem;
}

export default function Show({ item }: Props) {
    const [adjustStockOpen, setAdjustStockOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        warehouse_id: '',
        adjustment_type: 'in',
        quantity: 0,
        unit_cost: item.unit_cost,
        notes: '',
    });

    const handleStockAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.inventory.adjust-stock', item.id), {
            onSuccess: () => {
                setAdjustStockOpen(false);
                reset();
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('sw-TZ', {
            style: 'currency',
            currency: 'TZS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStockStatusColor = (status: string) => {
        switch (status) {
            case 'in_stock':
                return 'bg-green-100 text-green-800';
            case 'low_stock':
                return 'bg-yellow-100 text-yellow-800';
            case 'out_of_stock':
                return 'bg-red-100 text-red-800';
            case 'overstock':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'in':
            case 'found':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'out':
            case 'lost':
            case 'damaged':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            case 'adjustment':
                return <BarChart3 className="h-4 w-4 text-blue-600" />;
            default:
                return <Package className="h-4 w-4 text-gray-600" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title={`Inventory - ${item.name}`} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button variant="ghost" size="sm" asChild className="h-auto p-2">
                            <Link href="/admin/inventory">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">{item.name}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                SKU: {item.sku} • {item.category}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Dialog open={adjustStockOpen} onOpenChange={setAdjustStockOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Adjust Stock
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Adjust Stock</DialogTitle>
                                    <DialogDescription>Add or remove stock for {item.name}</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleStockAdjustment} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="warehouse_id">Warehouse</Label>
                                        <Select value={data.warehouse_id} onValueChange={(value) => setData('warehouse_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select warehouse" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {item.warehouse_stock.map((stock) => (
                                                    <SelectItem key={stock.warehouse_id} value={stock.warehouse_id.toString()}>
                                                        {stock.warehouse.name} (Current: {stock.quantity_available})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.warehouse_id && <p className="text-sm text-red-600">{errors.warehouse_id}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="adjustment_type">Type</Label>
                                            <Select value={data.adjustment_type} onValueChange={(value) => setData('adjustment_type', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="in">Stock In</SelectItem>
                                                    <SelectItem value="out">Stock Out</SelectItem>
                                                    <SelectItem value="adjustment">Adjustment</SelectItem>
                                                    <SelectItem value="damaged">Mark as Damaged</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Quantity</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                min="1"
                                                value={data.quantity}
                                                onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
                                                required
                                            />
                                            {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Reason for adjustment..."
                                            rows={3}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setAdjustStockOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Processing...' : 'Adjust Stock'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Button asChild>
                            <Link href={route('admin.inventory.edit', item.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.total_quantity}</div>
                            <p className="text-xs text-muted-foreground">Available: {item.available_quantity}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge className={getStockStatusColor(item.stock_status || 'in_stock')}>
                                {(item.stock_status || 'in_stock').replace('_', ' ').toUpperCase()}
                            </Badge>
                            <p className="mt-2 text-xs text-muted-foreground">Reorder at: {item.reorder_point}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unit Cost</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(item.unit_cost)}</div>
                            <p className="text-xs text-muted-foreground">Price: {formatCurrency(item.unit_price)}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.stock_alerts?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Information */}
                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="stock">Stock by Warehouse</TabsTrigger>
                        <TabsTrigger value="movements">Stock Movements</TabsTrigger>
                        <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Item Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">SKU</Label>
                                            <p className="text-sm">{item.sku}</p>
                                        </div>
                                        {item.barcode && (
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Barcode</Label>
                                                <p className="text-sm">{item.barcode}</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                                            <p className="text-sm">{item.category}</p>
                                        </div>
                                        {item.brand && (
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Brand</Label>
                                                <p className="text-sm">{item.brand}</p>
                                            </div>
                                        )}
                                        {item.model && (
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                                                <p className="text-sm">{item.model}</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Unit of Measure</Label>
                                            <p className="text-sm">{item.unit_of_measure}</p>
                                        </div>
                                    </div>
                                    {item.description && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                            <p className="text-sm">{item.description}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Physical Properties</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {item.weight && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Weight</Label>
                                            <p className="text-sm">{item.weight} kg</p>
                                        </div>
                                    )}
                                    {item.dimensions && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Dimensions</Label>
                                            <p className="text-sm">
                                                {item.dimensions.length} × {item.dimensions.width} × {item.dimensions.height} cm
                                            </p>
                                        </div>
                                    )}
                                    {item.supplier && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Supplier</Label>
                                            <p className="text-sm">{item.supplier}</p>
                                        </div>
                                    )}
                                    {item.manufacturer && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Manufacturer</Label>
                                            <p className="text-sm">{item.manufacturer}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="stock" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {item.warehouse_stock.map((stock) => (
                                <Card key={stock.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span className="flex items-center">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                {stock.warehouse.name}
                                            </span>
                                            <Badge variant="outline">{stock.warehouse.code}</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Available:</span>
                                                <span className="ml-1 font-medium">{stock.quantity_available}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Reserved:</span>
                                                <span className="ml-1 font-medium">{stock.quantity_reserved}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Damaged:</span>
                                                <span className="ml-1 font-medium">{stock.quantity_damaged}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Avg Cost:</span>
                                                <span className="ml-1 font-medium">{formatCurrency(stock.average_cost)}</span>
                                            </div>
                                        </div>
                                        {stock.location && (
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Location:</span>
                                                <span className="ml-1 font-medium">{stock.location}</span>
                                            </div>
                                        )}
                                        {stock.last_counted_at && (
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Last Counted:</span>
                                                <span className="ml-1">{new Date(stock.last_counted_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="movements" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Stock Movements</CardTitle>
                                <CardDescription>Latest 20 stock movements for this item</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {item.stock_movements?.length > 0 ? (
                                        item.stock_movements.map((movement) => (
                                            <div key={movement.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div className="flex items-center space-x-3">
                                                    {getMovementIcon(movement.type)}
                                                    <div>
                                                        <p className="font-medium">
                                                            {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {movement.warehouse.name} • {new Date(movement.movement_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {movement.quantity > 0 ? '+' : ''}
                                                        {movement.quantity}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {movement.quantity_before} → {movement.quantity_after}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-8 text-center text-muted-foreground">No stock movements recorded yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-4">
                        <div className="space-y-4">
                            {item.stock_alerts?.length > 0 ? (
                                item.stock_alerts.map((alert) => (
                                    <Card key={alert.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3">
                                                    <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-500" />
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium">{alert.type.replace('_', ' ').toUpperCase()}</h4>
                                                            <Badge className={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                                                        </div>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {alert.warehouse.name} • {new Date(alert.triggered_at).toLocaleDateString()}
                                                        </p>
                                                        <p className="mt-2 text-sm">{alert.message}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">Current: {alert.current_quantity}</p>
                                                    {alert.threshold_quantity && (
                                                        <p className="text-sm text-muted-foreground">Threshold: {alert.threshold_quantity}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center">
                                        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                                        <h3 className="mb-2 font-medium">No Active Alerts</h3>
                                        <p className="text-sm text-muted-foreground">All stock levels are within normal ranges</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
