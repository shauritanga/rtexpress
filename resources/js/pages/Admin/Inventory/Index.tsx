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
    Package2,
    AlertTriangle,
    TrendingDown,
    DollarSign,
    Eye,
    Filter,
    Barcode,
    Warehouse
} from 'lucide-react';

interface InventoryItem {
    id: number;
    sku: string;
    barcode?: string;
    name: string;
    category: string;
    brand?: string;
    unit_of_measure: string;
    unit_cost: number;
    unit_price: number;
    min_stock_level: number;
    reorder_point: number;
    warehouse_stock: WarehouseStock[];
    total_quantity: number;
    available_quantity: number;
    stock_status: string;
}

interface WarehouseStock {
    id: number;
    warehouse_id: number;
    quantity_available: number;
    quantity_reserved: number;
    warehouse: {
        id: number;
        name: string;
    };
}

interface StockMovement {
    id: number;
    type: string;
    quantity: number;
    movement_date: string;
    inventory_item: {
        name: string;
        sku: string;
    };
    warehouse: {
        name: string;
    };
    created_by: {
        name: string;
    };
}

interface Stats {
    total_items: number;
    low_stock_items: number;
    out_of_stock_items: number;
    total_value: number;
    categories: string[];
    recent_movements: StockMovement[];
}

interface Warehouse {
    id: number;
    name: string;
}

interface Props {
    items: {
        data: InventoryItem[];
        meta: any;
        links: any[];
    };
    stats: Stats;
    warehouses: Warehouse[];
    filters: {
        search?: string;
        category?: string;
        stock_status?: string;
        warehouse_id?: string;
    };
}

export default function InventoryIndex({ items, stats, warehouses, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedStockStatus, setSelectedStockStatus] = useState(filters.stock_status || 'all');
    const [selectedWarehouse, setSelectedWarehouse] = useState(filters.warehouse_id || 'all');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStockStatusBadge = (status: string, quantity: number) => {
        const statusConfig = {
            out_of_stock: { label: 'Out of Stock', variant: 'destructive' as const, icon: AlertTriangle },
            low_stock: { label: 'Low Stock', variant: 'secondary' as const, icon: TrendingDown },
            in_stock: { label: 'In Stock', variant: 'success' as const, icon: Package2 },
            overstock: { label: 'Overstock', variant: 'default' as const, icon: Package2 },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: 'Unknown', variant: 'default' as const, icon: Package2 };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getMovementTypeBadge = (type: string) => {
        const typeConfig = {
            in: { label: 'Stock In', color: 'bg-green-100 text-green-800' },
            out: { label: 'Stock Out', color: 'bg-red-100 text-red-800' },
            adjustment: { label: 'Adjustment', color: 'bg-blue-100 text-blue-800' },
            transfer: { label: 'Transfer', color: 'bg-purple-100 text-purple-800' },
            damaged: { label: 'Damaged', color: 'bg-orange-100 text-orange-800' },
            lost: { label: 'Lost', color: 'bg-gray-100 text-gray-800' },
            found: { label: 'Found', color: 'bg-yellow-100 text-yellow-800' },
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
        router.get(route('admin.inventory.index'), {
            search: searchTerm,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            stock_status: selectedStockStatus !== 'all' ? selectedStockStatus : undefined,
            warehouse_id: selectedWarehouse !== 'all' ? selectedWarehouse : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedStockStatus('all');
        setSelectedWarehouse('all');
        
        router.get(route('admin.inventory.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Inventory Management" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventory Management</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Track and manage inventory items and stock levels
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/inventory/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package2 className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                                    <p className="text-2xl font-bold">{stats.total_items}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Active inventory
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <TrendingDown className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                                    <p className="text-2xl font-bold">{stats.low_stock_items}</p>
                                    <p className="text-xs text-orange-600">
                                        Need reordering
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                                    <p className="text-2xl font-bold">{stats.out_of_stock_items}</p>
                                    <p className="text-xs text-red-600">
                                        Urgent attention
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(stats.total_value)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Inventory worth
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
                            Filter Inventory
                        </CardTitle>
                        <CardDescription>
                            Search and filter inventory items by various criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Name, SKU, barcode, brand..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {stats.categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock Status</label>
                                <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="in_stock">In Stock</SelectItem>
                                        <SelectItem value="low_stock">Low Stock</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Warehouse</label>
                                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All warehouses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Warehouses</SelectItem>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                {warehouse.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                {/* Inventory Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Items</CardTitle>
                        <CardDescription>
                            All inventory items and their current stock levels
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Item</TableHead>
                                            <TableHead className="min-w-[120px]">SKU</TableHead>
                                            <TableHead className="min-w-[100px]">Category</TableHead>
                                            <TableHead className="min-w-[100px]">Stock Status</TableHead>
                                            <TableHead className="min-w-[100px]">Quantity</TableHead>
                                            <TableHead className="min-w-[100px] hidden sm:table-cell">Unit Cost</TableHead>
                                            <TableHead className="min-w-[120px] hidden md:table-cell">Warehouses</TableHead>
                                            <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.data.length > 0 ? items.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.brand && (
                                                            <p className="text-sm text-muted-foreground">{item.brand}</p>
                                                        )}
                                                        {item.barcode && (
                                                            <div className="flex items-center mt-1">
                                                                <Barcode className="h-3 w-3 mr-1 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">{item.barcode}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm">{item.sku}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="capitalize">{item.category}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {getStockStatusBadge(item.stock_status, item.total_quantity)}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.total_quantity} {item.unit_of_measure}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Available: {item.available_quantity}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    {formatCurrency(item.unit_cost)}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="space-y-1">
                                                        {item.warehouse_stock.slice(0, 2).map((stock) => (
                                                            <div key={stock.id} className="flex items-center text-sm">
                                                                <Warehouse className="h-3 w-3 mr-1 text-muted-foreground" />
                                                                <span>{stock.warehouse.name}: {stock.quantity_available}</span>
                                                            </div>
                                                        ))}
                                                        {item.warehouse_stock.length > 2 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                +{item.warehouse_stock.length - 2} more
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.inventory.show', item.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    No inventory items found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {items?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing {items?.meta?.from || 0} to {items?.meta?.to || 0} of {items?.meta?.total || 0} items
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                    {items?.links?.map((link, index) => (
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

                {/* Recent Stock Movements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Stock Movements</CardTitle>
                        <CardDescription>
                            Latest inventory movements and adjustments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recent_movements.length > 0 ? stats.recent_movements.map((movement) => (
                                <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div>
                                            {getMovementTypeBadge(movement.type)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{movement.inventory_item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                SKU: {movement.inventory_item.sku} • {movement.warehouse.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(movement.movement_date)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            by {movement.created_by.name}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No recent stock movements found.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
