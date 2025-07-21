import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    ArrowLeft,
    Save,
    Warehouse,
    MapPin,
    Phone,
    Mail,
    Clock,
    Users
} from 'lucide-react';

interface Warehouse {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    manager_name: string;
    capacity_sqft: number;
    latitude: number;
    longitude: number;
    status: string;
    operating_hours: string;
}

interface Props {
    warehouse: Warehouse;
}

export default function WarehouseEdit({ warehouse }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address,
        city: warehouse.city,
        state: warehouse.state,
        postal_code: warehouse.postal_code,
        country: warehouse.country,
        phone: warehouse.phone,
        email: warehouse.email,
        manager_name: warehouse.manager_name,
        capacity_sqft: warehouse.capacity_sqft,
        latitude: warehouse.latitude,
        longitude: warehouse.longitude,
        status: warehouse.status,
        operating_hours: warehouse.operating_hours,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.warehouses.update', warehouse.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit Warehouse - ${warehouse.name}`} />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/warehouses/${warehouse.id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Warehouse
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Edit Warehouse
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Update warehouse information and settings
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Warehouse className="h-5 w-5" />
                                    <span>Basic Information</span>
                                </CardTitle>
                                <CardDescription>
                                    General warehouse details and identification
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Warehouse Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter warehouse name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="code">Warehouse Code *</Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            placeholder="e.g., WH001"
                                            className={errors.code ? 'border-red-500' : ''}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-red-600">{errors.code}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="manager_name">Manager Name</Label>
                                        <div className="relative">
                                            <Users className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="manager_name"
                                                type="text"
                                                value={data.manager_name}
                                                onChange={(e) => setData('manager_name', e.target.value)}
                                                placeholder="Manager name"
                                                className={`pl-8 ${errors.manager_name ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.manager_name && (
                                            <p className="text-sm text-red-600">{errors.manager_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600">{errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity_sqft">Capacity (sq ft)</Label>
                                    <Input
                                        id="capacity_sqft"
                                        type="number"
                                        value={data.capacity_sqft}
                                        onChange={(e) => setData('capacity_sqft', parseInt(e.target.value) || 0)}
                                        placeholder="Storage capacity in square feet"
                                        className={errors.capacity_sqft ? 'border-red-500' : ''}
                                    />
                                    {errors.capacity_sqft && (
                                        <p className="text-sm text-red-600">{errors.capacity_sqft}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="operating_hours">Operating Hours</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="operating_hours"
                                            type="text"
                                            value={data.operating_hours}
                                            onChange={(e) => setData('operating_hours', e.target.value)}
                                            placeholder="e.g., Mon-Fri 8:00 AM - 6:00 PM"
                                            className={`pl-8 ${errors.operating_hours ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.operating_hours && (
                                        <p className="text-sm text-red-600">{errors.operating_hours}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact & Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>Contact & Location</span>
                                </CardTitle>
                                <CardDescription>
                                    Address, contact information, and coordinates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address *</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Enter full street address"
                                        className={errors.address ? 'border-red-500' : ''}
                                        rows={2}
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-600">{errors.address}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="City"
                                            className={errors.city ? 'border-red-500' : ''}
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-600">{errors.city}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">State/Province *</Label>
                                        <Input
                                            id="state"
                                            type="text"
                                            value={data.state}
                                            onChange={(e) => setData('state', e.target.value)}
                                            placeholder="State or Province"
                                            className={errors.state ? 'border-red-500' : ''}
                                        />
                                        {errors.state && (
                                            <p className="text-sm text-red-600">{errors.state}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code *</Label>
                                        <Input
                                            id="postal_code"
                                            type="text"
                                            value={data.postal_code}
                                            onChange={(e) => setData('postal_code', e.target.value)}
                                            placeholder="Postal/ZIP code"
                                            className={errors.postal_code ? 'border-red-500' : ''}
                                        />
                                        {errors.postal_code && (
                                            <p className="text-sm text-red-600">{errors.postal_code}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country *</Label>
                                        <Input
                                            id="country"
                                            type="text"
                                            value={data.country}
                                            onChange={(e) => setData('country', e.target.value)}
                                            placeholder="Country"
                                            className={errors.country ? 'border-red-500' : ''}
                                        />
                                        {errors.country && (
                                            <p className="text-sm text-red-600">{errors.country}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Phone number"
                                                className={`pl-8 ${errors.phone ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Email address"
                                                className={`pl-8 ${errors.email ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            type="number"
                                            step="any"
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', parseFloat(e.target.value) || 0)}
                                            placeholder="e.g., 40.7128"
                                            className={errors.latitude ? 'border-red-500' : ''}
                                        />
                                        {errors.latitude && (
                                            <p className="text-sm text-red-600">{errors.latitude}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            type="number"
                                            step="any"
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', parseFloat(e.target.value) || 0)}
                                            placeholder="e.g., -74.0060"
                                            className={errors.longitude ? 'border-red-500' : ''}
                                        />
                                        {errors.longitude && (
                                            <p className="text-sm text-red-600">{errors.longitude}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/admin/warehouses/${warehouse.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Warehouse'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
