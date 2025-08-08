import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, MapPin, Phone, Save, Users, Warehouse } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Warehouse {
    id: number;
    name: string;
    code: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    phone: string;
    email: string;
    contact_person?: string;
    capacity_cubic_meters?: number;
    latitude?: number;
    longitude?: number;
    status: string;
    operating_hours: any;
}

interface Props {
    warehouse: Warehouse;
}

export default function WarehouseEdit({ warehouse }: Props) {
    // Helper function to parse operating hours from database format
    const parseOperatingHours = (hours: any) => {
        if (typeof hours === 'string') {
            try {
                hours = JSON.parse(hours);
            } catch {
                // If it's not valid JSON, return default hours
                return {
                    monday: { open: '09:00', close: '17:00', closed: false },
                    tuesday: { open: '09:00', close: '17:00', closed: false },
                    wednesday: { open: '09:00', close: '17:00', closed: false },
                    thursday: { open: '09:00', close: '17:00', closed: false },
                    friday: { open: '09:00', close: '17:00', closed: false },
                    saturday: { open: '09:00', close: '17:00', closed: false },
                    sunday: { open: '09:00', close: '17:00', closed: true },
                };
            }
        }

        // Convert database format to form format
        const formHours: any = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        days.forEach((day) => {
            if (hours && hours[day]) {
                if (hours[day] === 'closed') {
                    formHours[day] = { open: '09:00', close: '17:00', closed: true };
                } else {
                    const times = hours[day].split('-');
                    if (times.length === 2) {
                        formHours[day] = { open: times[0], close: times[1], closed: false };
                    } else {
                        formHours[day] = { open: '09:00', close: '17:00', closed: false };
                    }
                }
            } else {
                formHours[day] = { open: '09:00', close: '17:00', closed: false };
            }
        });

        return formHours;
    };

    const { data, setData, put, processing, errors } = useForm({
        name: warehouse.name || '',
        code: warehouse.code || '',
        address_line_1: warehouse.address_line_1 || '',
        address_line_2: warehouse.address_line_2 || '',
        city: warehouse.city || '',
        state_province: warehouse.state_province || '',
        postal_code: warehouse.postal_code || '',
        country: warehouse.country || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        contact_person: warehouse.contact_person || '',
        capacity_cubic_meters: warehouse.capacity_cubic_meters || '',
        latitude: warehouse.latitude || '',
        longitude: warehouse.longitude || '',
        status: warehouse.status || 'active',
        operating_hours: parseOperatingHours(warehouse.operating_hours),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Update form data being submitted:', data);
        put(route('admin.warehouses.update', warehouse.id), {
            onSuccess: () => {
                console.log('Update form submitted successfully');
            },
            onError: (errors) => {
                console.log('Update form submission errors:', errors);
            },
            onFinish: () => {
                console.log('Update form submission finished');
            },
        });
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
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Warehouse
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Edit Warehouse</h1>
                            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Update warehouse information and settings</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* General Error Display */}
                    {errors.error && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error updating warehouse</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{errors.error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Warehouse className="h-5 w-5" />
                                    <span>Basic Information</span>
                                </CardTitle>
                                <CardDescription>General warehouse details and identification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
                                        {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person">Contact Person</Label>
                                        <div className="relative">
                                            <Users className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="contact_person"
                                                type="text"
                                                value={data.contact_person}
                                                onChange={(e) => setData('contact_person', e.target.value)}
                                                placeholder="Contact person name"
                                                className={`pl-8 ${errors.contact_person ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.contact_person && <p className="text-sm text-red-600">{errors.contact_person}</p>}
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
                                        {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity_cubic_meters">Capacity (Cubic Meters)</Label>
                                    <Input
                                        id="capacity_cubic_meters"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.capacity_cubic_meters}
                                        onChange={(e) => setData('capacity_cubic_meters', e.target.value)}
                                        placeholder="Storage capacity in cubic meters"
                                        className={errors.capacity_cubic_meters ? 'border-red-500' : ''}
                                    />
                                    {errors.capacity_cubic_meters && <p className="text-sm text-red-600">{errors.capacity_cubic_meters}</p>}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base font-medium">Operating Hours</Label>
                                    <div className="space-y-3">
                                        {Object.entries(data.operating_hours).map(([day, hours]: [string, any]) => (
                                            <div key={day} className="flex items-center space-x-4 rounded-lg border p-3">
                                                <div className="w-20 text-sm font-medium capitalize">{day}</div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${day}-closed`}
                                                        checked={hours.closed}
                                                        onCheckedChange={(checked) => {
                                                            setData('operating_hours', {
                                                                ...data.operating_hours,
                                                                [day]: {
                                                                    ...hours,
                                                                    closed: checked,
                                                                },
                                                            });
                                                        }}
                                                    />
                                                    <Label htmlFor={`${day}-closed`} className="text-sm">
                                                        Closed
                                                    </Label>
                                                </div>
                                                {!hours.closed && (
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            type="time"
                                                            value={hours.open}
                                                            onChange={(e) => {
                                                                setData('operating_hours', {
                                                                    ...data.operating_hours,
                                                                    [day]: {
                                                                        ...hours,
                                                                        open: e.target.value,
                                                                    },
                                                                });
                                                            }}
                                                            className="w-32"
                                                        />
                                                        <span className="text-sm text-muted-foreground">to</span>
                                                        <Input
                                                            type="time"
                                                            value={hours.close}
                                                            onChange={(e) => {
                                                                setData('operating_hours', {
                                                                    ...data.operating_hours,
                                                                    [day]: {
                                                                        ...hours,
                                                                        close: e.target.value,
                                                                    },
                                                                });
                                                            }}
                                                            className="w-32"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.operating_hours && <p className="text-sm text-red-600">{errors.operating_hours}</p>}
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
                                <CardDescription>Address, contact information, and coordinates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address_line_1">Address Line 1 *</Label>
                                    <Input
                                        id="address_line_1"
                                        type="text"
                                        value={data.address_line_1}
                                        onChange={(e) => setData('address_line_1', e.target.value)}
                                        placeholder="Enter street address"
                                        className={errors.address_line_1 ? 'border-red-500' : ''}
                                    />
                                    {errors.address_line_1 && <p className="text-sm text-red-600">{errors.address_line_1}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line_2">Address Line 2</Label>
                                    <Input
                                        id="address_line_2"
                                        type="text"
                                        value={data.address_line_2}
                                        onChange={(e) => setData('address_line_2', e.target.value)}
                                        placeholder="Apartment, suite, etc. (optional)"
                                        className={errors.address_line_2 ? 'border-red-500' : ''}
                                    />
                                    {errors.address_line_2 && <p className="text-sm text-red-600">{errors.address_line_2}</p>}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                        {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state_province">State/Province *</Label>
                                        <Input
                                            id="state_province"
                                            type="text"
                                            value={data.state_province}
                                            onChange={(e) => setData('state_province', e.target.value)}
                                            placeholder="State or Province"
                                            className={errors.state_province ? 'border-red-500' : ''}
                                        />
                                        {errors.state_province && <p className="text-sm text-red-600">{errors.state_province}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                        {errors.postal_code && <p className="text-sm text-red-600">{errors.postal_code}</p>}
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
                                        {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Phone number"
                                                className={`pl-8 ${errors.phone ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Email address"
                                                className={`pl-8 ${errors.email ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                        {errors.latitude && <p className="text-sm text-red-600">{errors.latitude}</p>}
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
                                        {errors.longitude && <p className="text-sm text-red-600">{errors.longitude}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/admin/warehouses/${warehouse.id}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Warehouse'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
