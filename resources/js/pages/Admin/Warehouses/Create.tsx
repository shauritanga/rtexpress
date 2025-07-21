import { Head, Link, useForm } from '@inertiajs/react';
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
    Warehouse,
    MapPin,
    User,
    Phone,
    Mail,
    Building,
    Clock
} from 'lucide-react';

export default function WarehouseCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        type: 'distribution',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        phone: '',
        email: '',
        contact_person: '',
        capacity_cubic_meters: 1000,
        latitude: '',
        longitude: '',
        status: 'active',
        operating_hours: {
            monday: { open: '08:00', close: '17:00', closed: false },
            tuesday: { open: '08:00', close: '17:00', closed: false },
            wednesday: { open: '08:00', close: '17:00', closed: false },
            thursday: { open: '08:00', close: '17:00', closed: false },
            friday: { open: '08:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '13:00', closed: false },
            sunday: { open: '09:00', close: '13:00', closed: true },
        },
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.warehouses.store'));
    };

    const updateOperatingHours = (day: string, field: string, value: any) => {
        setData('operating_hours', {
            ...data.operating_hours,
            [day]: {
                ...data.operating_hours[day as keyof typeof data.operating_hours],
                [field]: value,
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create Warehouse" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/warehouses">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Warehouses
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Create New Warehouse
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Add a new warehouse facility to the system
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Warehouse className="h-5 w-5 mr-2" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Warehouse identification and type
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Warehouse Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter warehouse name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Warehouse Code *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="Enter warehouse code (e.g., WH001)"
                                        required
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-600">{errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Warehouse Type</Label>
                                    <Select 
                                        value={data.type} 
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select warehouse type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="distribution">Distribution Center</SelectItem>
                                            <SelectItem value="fulfillment">Fulfillment Center</SelectItem>
                                            <SelectItem value="storage">Storage Facility</SelectItem>
                                            <SelectItem value="cross_dock">Cross Dock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-red-600">{errors.type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity_cubic_meters">Capacity (Cubic Meters)</Label>
                                    <Input
                                        id="capacity_cubic_meters"
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={data.capacity_cubic_meters}
                                        onChange={(e) => setData('capacity_cubic_meters', parseFloat(e.target.value) || 0)}
                                        placeholder="Enter storage capacity"
                                    />
                                    {errors.capacity_cubic_meters && (
                                        <p className="text-sm text-red-600">{errors.capacity_cubic_meters}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="maintenance">Under Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Contact Information
                                </CardTitle>
                                <CardDescription>
                                    Warehouse manager and contact details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_person">Manager/Contact Person</Label>
                                    <div className="relative">
                                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="contact_person"
                                            value={data.contact_person}
                                            onChange={(e) => setData('contact_person', e.target.value)}
                                            placeholder="Enter manager name"
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.contact_person && (
                                        <p className="text-sm text-red-600">{errors.contact_person}</p>
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
                                            placeholder="Enter email address"
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional notes about this warehouse..."
                                        rows={4}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="h-5 w-5 mr-2" />
                                Address & Location
                            </CardTitle>
                            <CardDescription>
                                Physical address and GPS coordinates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                    <Label htmlFor="address_line_1">Address Line 1 *</Label>
                                    <Input
                                        id="address_line_1"
                                        value={data.address_line_1}
                                        onChange={(e) => setData('address_line_1', e.target.value)}
                                        placeholder="Enter street address"
                                        required
                                    />
                                    {errors.address_line_1 && (
                                        <p className="text-sm text-red-600">{errors.address_line_1}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line_2">Address Line 2</Label>
                                    <Input
                                        id="address_line_2"
                                        value={data.address_line_2}
                                        onChange={(e) => setData('address_line_2', e.target.value)}
                                        placeholder="Suite, building, etc."
                                    />
                                    {errors.address_line_2 && (
                                        <p className="text-sm text-red-600">{errors.address_line_2}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Enter city"
                                        required
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-red-600">{errors.city}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="state_province">State/Province *</Label>
                                    <Input
                                        id="state_province"
                                        value={data.state_province}
                                        onChange={(e) => setData('state_province', e.target.value)}
                                        placeholder="Enter state or province"
                                        required
                                    />
                                    {errors.state_province && (
                                        <p className="text-sm text-red-600">{errors.state_province}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code *</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="Enter postal code"
                                        required
                                    />
                                    {errors.postal_code && (
                                        <p className="text-sm text-red-600">{errors.postal_code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">Country *</Label>
                                    <Select 
                                        value={data.country} 
                                        onValueChange={(value) => setData('country', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="CA">Canada</SelectItem>
                                            <SelectItem value="GB">United Kingdom</SelectItem>
                                            <SelectItem value="AU">Australia</SelectItem>
                                            <SelectItem value="DE">Germany</SelectItem>
                                            <SelectItem value="FR">France</SelectItem>
                                            <SelectItem value="JP">Japan</SelectItem>
                                            <SelectItem value="CN">China</SelectItem>
                                            <SelectItem value="IN">India</SelectItem>
                                            <SelectItem value="BR">Brazil</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.country && (
                                        <p className="text-sm text-red-600">{errors.country}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude (Optional)</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        placeholder="e.g., 40.7128"
                                    />
                                    {errors.latitude && (
                                        <p className="text-sm text-red-600">{errors.latitude}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude (Optional)</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        placeholder="e.g., -74.0060"
                                    />
                                    {errors.longitude && (
                                        <p className="text-sm text-red-600">{errors.longitude}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operating Hours */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="h-5 w-5 mr-2" />
                                Operating Hours
                            </CardTitle>
                            <CardDescription>
                                Set the operating hours for each day of the week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(data.operating_hours).map(([day, hours]) => (
                                    <div key={day} className="grid gap-4 grid-cols-1 sm:grid-cols-4 items-center">
                                        <div className="font-medium capitalize">{day}</div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={!hours.closed}
                                                onChange={(e) => updateOperatingHours(day, 'closed', !e.target.checked)}
                                                className="rounded"
                                            />
                                            <span className="text-sm">Open</span>
                                        </div>
                                        {!hours.closed && (
                                            <>
                                                <Input
                                                    type="time"
                                                    value={hours.open}
                                                    onChange={(e) => updateOperatingHours(day, 'open', e.target.value)}
                                                />
                                                <Input
                                                    type="time"
                                                    value={hours.close}
                                                    onChange={(e) => updateOperatingHours(day, 'close', e.target.value)}
                                                />
                                            </>
                                        )}
                                        {hours.closed && (
                                            <div className="sm:col-span-2 text-sm text-muted-foreground">
                                                Closed
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/warehouses">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Building className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Warehouse'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
