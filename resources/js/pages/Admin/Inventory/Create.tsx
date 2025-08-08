import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileForm, MobileFormField, MobileFormSection, MobileInputGroup } from '@/components/ui/mobile-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BarChart3, DollarSign, Package, Weight, X } from 'lucide-react';

interface Props {
    warehouses: Array<{
        id: number;
        name: string;
        code: string;
    }>;
}

export default function Create({ warehouses }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        sku: '',
        barcode: '',
        name: '',
        description: '',
        category: '',
        brand: '',
        model: '',
        weight: 0,
        dimensions: {
            length: 0,
            width: 0,
            height: 0,
        },
        unit_of_measure: 'piece',
        unit_cost: 0,
        unit_price: 0,
        supplier: '',
        manufacturer: '',
        min_stock_level: 0,
        max_stock_level: 1000,
        reorder_point: 10,
        reorder_quantity: 50,
        is_trackable: true,
        is_serialized: false,
        image_url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.inventory.store'));
    };

    const categories = ['Packaging', 'Electronics', 'Clothing', 'Books', 'Food', 'Medical', 'Automotive', 'Tools', 'Furniture', 'General'];

    const unitsOfMeasure = ['piece', 'kg', 'gram', 'liter', 'meter', 'box', 'pack', 'roll', 'sheet'];

    return (
        <AppLayout>
            <Head title="Create Inventory Item" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="mb-4 flex items-center space-x-3 sm:mb-6">
                    <Button variant="ghost" size="sm" asChild className="h-auto p-2">
                        <Link href="/admin/inventory">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Create Inventory Item</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Add a new item to your inventory</p>
                    </div>
                </div>

                <MobileForm onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <MobileFormSection title="Basic Information" icon={Package} description="Item identification and basic details">
                            <MobileInputGroup>
                                <MobileFormField label="Item Name" required error={errors.name}>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter item name"
                                        className="h-11 text-base"
                                        required
                                    />
                                </MobileFormField>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <MobileFormField label="SKU" error={errors.sku} description="Leave empty to auto-generate">
                                        <Input
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            placeholder="RT-XXXXXXXX"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Barcode" error={errors.barcode}>
                                        <Input
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            placeholder="Enter barcode"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>
                                </div>

                                <MobileFormField label="Description" error={errors.description}>
                                    <Textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Detailed item description"
                                        rows={3}
                                    />
                                </MobileFormField>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <MobileFormField label="Category" required error={errors.category}>
                                        <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                            <SelectTrigger className="h-11 text-base">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category.toLowerCase()}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </MobileFormField>

                                    <MobileFormField label="Brand" error={errors.brand}>
                                        <Input
                                            value={data.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                            placeholder="Brand name"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Model" error={errors.model}>
                                        <Input
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                            placeholder="Model number"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>
                                </div>
                            </MobileInputGroup>
                        </MobileFormSection>

                        {/* Physical Properties */}
                        <MobileFormSection title="Physical Properties" icon={Weight} description="Weight, dimensions, and unit of measure">
                            <MobileInputGroup>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <MobileFormField label="Weight (kg)" error={errors.weight}>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.weight}
                                            onChange={(e) => setData('weight', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Unit of Measure" error={errors.unit_of_measure}>
                                        <Select value={data.unit_of_measure} onValueChange={(value) => setData('unit_of_measure', value)}>
                                            <SelectTrigger className="h-11 text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {unitsOfMeasure.map((unit) => (
                                                    <SelectItem key={unit} value={unit}>
                                                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </MobileFormField>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <MobileFormField label="Length (cm)" error={errors['dimensions.length']}>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={data.dimensions.length}
                                            onChange={(e) =>
                                                setData('dimensions', {
                                                    ...data.dimensions,
                                                    length: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0.0"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Width (cm)" error={errors['dimensions.width']}>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={data.dimensions.width}
                                            onChange={(e) =>
                                                setData('dimensions', {
                                                    ...data.dimensions,
                                                    width: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0.0"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Height (cm)" error={errors['dimensions.height']}>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={data.dimensions.height}
                                            onChange={(e) =>
                                                setData('dimensions', {
                                                    ...data.dimensions,
                                                    height: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0.0"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>
                                </div>
                            </MobileInputGroup>
                        </MobileFormSection>

                        {/* Pricing & Suppliers */}
                        <MobileFormSection title="Pricing & Suppliers" icon={DollarSign} description="Cost, pricing, and supplier information">
                            <MobileInputGroup>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <MobileFormField
                                        label="Unit Cost (TSh)"
                                        required
                                        error={errors.unit_cost}
                                        description="Cost per unit in Tanzania Shillings"
                                    >
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.unit_cost}
                                            onChange={(e) => setData('unit_cost', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="h-11 text-base"
                                            required
                                        />
                                    </MobileFormField>

                                    <MobileFormField
                                        label="Unit Price (TSh)"
                                        error={errors.unit_price}
                                        description="Selling price per unit in Tanzania Shillings"
                                    >
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.unit_price}
                                            onChange={(e) => setData('unit_price', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <MobileFormField label="Supplier" error={errors.supplier}>
                                        <Input
                                            value={data.supplier}
                                            onChange={(e) => setData('supplier', e.target.value)}
                                            placeholder="Supplier name"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Manufacturer" error={errors.manufacturer}>
                                        <Input
                                            value={data.manufacturer}
                                            onChange={(e) => setData('manufacturer', e.target.value)}
                                            placeholder="Manufacturer name"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>
                                </div>
                            </MobileInputGroup>
                        </MobileFormSection>

                        {/* Stock Management */}
                        <MobileFormSection title="Stock Management" icon={BarChart3} description="Stock levels and reorder settings">
                            <MobileInputGroup>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <MobileFormField label="Min Stock Level" error={errors.min_stock_level}>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.min_stock_level}
                                            onChange={(e) => setData('min_stock_level', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Max Stock Level" error={errors.max_stock_level}>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={data.max_stock_level}
                                            onChange={(e) => setData('max_stock_level', parseInt(e.target.value) || 1000)}
                                            placeholder="1000"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Reorder Point" error={errors.reorder_point}>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.reorder_point}
                                            onChange={(e) => setData('reorder_point', parseInt(e.target.value) || 10)}
                                            placeholder="10"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>

                                    <MobileFormField label="Reorder Quantity" error={errors.reorder_quantity}>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={data.reorder_quantity}
                                            onChange={(e) => setData('reorder_quantity', parseInt(e.target.value) || 50)}
                                            placeholder="50"
                                            className="h-11 text-base"
                                        />
                                    </MobileFormField>
                                </div>
                            </MobileInputGroup>
                        </MobileFormSection>

                        {/* Submit Actions */}
                        <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row">
                            <Button type="button" variant="outline" className="h-11 flex-1" asChild>
                                <Link href="/admin/inventory">
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="h-11 flex-1">
                                {processing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Creating Item...
                                    </>
                                ) : (
                                    <>
                                        <Package className="mr-2 h-4 w-4" />
                                        Create Item
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </MobileForm>
            </div>
        </AppLayout>
    );
}
