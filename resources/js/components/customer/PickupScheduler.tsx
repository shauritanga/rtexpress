import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
    Truck,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Phone,
    User,
    Package,
    CheckCircle,
    AlertTriangle,
    Info,
    Loader2
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
}

interface PickupRequest {
    pickup_date: string;
    pickup_time_window: string;
    contact_person: string;
    contact_phone: string;
    pickup_location: string;
    special_instructions: string;
    package_count: number;
    total_weight: number;
    ready_time: string;
    close_time: string;
    residential_pickup: boolean;
}

interface Props {
    customer: Customer;
    shipmentIds?: number[];
    className?: string;
    onScheduled?: (pickupId: string) => void;
}

const TIME_WINDOWS = [
    { value: '8-12', label: '8:00 AM - 12:00 PM', description: 'Morning pickup' },
    { value: '12-17', label: '12:00 PM - 5:00 PM', description: 'Afternoon pickup' },
    { value: '8-17', label: '8:00 AM - 5:00 PM', description: 'All day availability' },
    { value: '9-15', label: '9:00 AM - 3:00 PM', description: 'Business hours' },
];

const READY_TIMES = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

const CLOSE_TIMES = [
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
];

export default function PickupScheduler({ customer, shipmentIds = [], className = '', onScheduled }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [pickupRequest, setPickupRequest] = useState<PickupRequest>({
        pickup_date: '',
        pickup_time_window: '8-17',
        contact_person: customer.contact_person,
        contact_phone: customer.phone,
        pickup_location: `${customer.address_line_1}${customer.address_line_2 ? ', ' + customer.address_line_2 : ''}, ${customer.city}, ${customer.state_province} ${customer.postal_code}`,
        special_instructions: '',
        package_count: shipmentIds.length || 1,
        total_weight: 0,
        ready_time: '9:00 AM',
        close_time: '5:00 PM',
        residential_pickup: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: keyof PickupRequest, value: any) => {
        setPickupRequest(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            setPickupRequest(prev => ({ 
                ...prev, 
                pickup_date: date.toISOString().split('T')[0] 
            }));
            setIsCalendarOpen(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!pickupRequest.pickup_date) {
            newErrors.pickup_date = 'Pickup date is required';
        } else {
            const selectedDate = new Date(pickupRequest.pickup_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                newErrors.pickup_date = 'Pickup date cannot be in the past';
            }
            
            // Check if it's a weekend
            if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
                newErrors.pickup_date = 'Pickup is not available on weekends';
            }
        }

        if (!pickupRequest.contact_person.trim()) {
            newErrors.contact_person = 'Contact person is required';
        }

        if (!pickupRequest.contact_phone.trim()) {
            newErrors.contact_phone = 'Contact phone is required';
        }

        if (!pickupRequest.pickup_location.trim()) {
            newErrors.pickup_location = 'Pickup location is required';
        }

        if (pickupRequest.package_count < 1) {
            newErrors.package_count = 'Package count must be at least 1';
        }

        if (pickupRequest.total_weight < 0) {
            newErrors.total_weight = 'Total weight cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSchedulePickup = async () => {
        if (!validateForm()) return;

        setIsScheduling(true);
        try {
            const response = await fetch('/customer/pickups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    ...pickupRequest,
                    shipment_ids: shipmentIds,
                }),
            });

            const result = await response.json();

            if (result.success) {
                onScheduled?.(result.pickup_id);
                alert('Pickup scheduled successfully!');
            } else {
                throw new Error(result.message || 'Failed to schedule pickup');
            }
        } catch (error) {
            console.error('Error scheduling pickup:', error);
            alert('Failed to schedule pickup. Please try again.');
        } finally {
            setIsScheduling(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Truck className="h-5 w-5 mr-2" />
                        Schedule Package Pickup
                    </CardTitle>
                    <CardDescription>
                        Schedule a convenient time for our driver to collect your packages
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Pickup Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Pickup Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Pickup Date *</Label>
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-start text-left font-normal ${
                                            !selectedDate && "text-muted-foreground"
                                        } ${errors.pickup_date ? 'border-red-500' : ''}`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? formatDate(selectedDate) : "Select pickup date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateSelect}
                                        disabled={(date) => isPastDate(date) || isWeekend(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.pickup_date && (
                                <p className="text-sm text-red-600">{errors.pickup_date}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Time Window *</Label>
                            <Select
                                value={pickupRequest.pickup_time_window}
                                onValueChange={(value) => handleInputChange('pickup_time_window', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIME_WINDOWS.map((window) => (
                                        <SelectItem key={window.value} value={window.value}>
                                            <div>
                                                <div className="font-medium">{window.label}</div>
                                                <div className="text-xs text-gray-500">{window.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Ready and Close Times */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ready Time</Label>
                            <Select
                                value={pickupRequest.ready_time}
                                onValueChange={(value) => handleInputChange('ready_time', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {READY_TIMES.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">When packages will be ready for pickup</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Close Time</Label>
                            <Select
                                value={pickupRequest.close_time}
                                onValueChange={(value) => handleInputChange('close_time', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CLOSE_TIMES.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">Latest time for pickup</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact_person">Contact Person *</Label>
                            <Input
                                id="contact_person"
                                value={pickupRequest.contact_person}
                                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                placeholder="John Doe"
                                className={errors.contact_person ? 'border-red-500' : ''}
                            />
                            {errors.contact_person && (
                                <p className="text-sm text-red-600">{errors.contact_person}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_phone">Contact Phone *</Label>
                            <Input
                                id="contact_phone"
                                value={pickupRequest.contact_phone}
                                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className={errors.contact_phone ? 'border-red-500' : ''}
                            />
                            {errors.contact_phone && (
                                <p className="text-sm text-red-600">{errors.contact_phone}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pickup_location">Pickup Location *</Label>
                        <Textarea
                            id="pickup_location"
                            value={pickupRequest.pickup_location}
                            onChange={(e) => handleInputChange('pickup_location', e.target.value)}
                            placeholder="Complete pickup address"
                            rows={3}
                            className={errors.pickup_location ? 'border-red-500' : ''}
                        />
                        {errors.pickup_location && (
                            <p className="text-sm text-red-600">{errors.pickup_location}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Package Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Package Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="package_count">Number of Packages *</Label>
                            <Input
                                id="package_count"
                                type="number"
                                min="1"
                                value={pickupRequest.package_count}
                                onChange={(e) => handleInputChange('package_count', parseInt(e.target.value) || 0)}
                                className={errors.package_count ? 'border-red-500' : ''}
                            />
                            {errors.package_count && (
                                <p className="text-sm text-red-600">{errors.package_count}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="total_weight">Total Weight (lbs)</Label>
                            <Input
                                id="total_weight"
                                type="number"
                                step="0.1"
                                min="0"
                                value={pickupRequest.total_weight}
                                onChange={(e) => handleInputChange('total_weight', parseFloat(e.target.value) || 0)}
                                placeholder="0.0"
                                className={errors.total_weight ? 'border-red-500' : ''}
                            />
                            {errors.total_weight && (
                                <p className="text-sm text-red-600">{errors.total_weight}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="special_instructions">Special Instructions (Optional)</Label>
                        <Textarea
                            id="special_instructions"
                            value={pickupRequest.special_instructions}
                            onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                            placeholder="Any special pickup instructions (e.g., gate code, building entrance, etc.)"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="residential_pickup"
                            checked={pickupRequest.residential_pickup}
                            onCheckedChange={(checked) => handleInputChange('residential_pickup', checked)}
                        />
                        <Label htmlFor="residential_pickup" className="cursor-pointer">
                            This is a residential pickup
                        </Label>
                    </div>
                </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-2">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="space-y-2">
                            <h4 className="font-medium text-blue-900">Important Pickup Information</h4>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                <li>Pickup requests must be scheduled at least 24 hours in advance</li>
                                <li>Pickups are available Monday through Friday, excluding holidays</li>
                                <li>Please have all packages ready and properly labeled</li>
                                <li>Someone must be available at the pickup location during the scheduled time</li>
                                <li>Additional charges may apply for residential pickups</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSchedulePickup}
                    disabled={isScheduling}
                    size="lg"
                    className="min-w-48"
                >
                    {isScheduling ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scheduling Pickup...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Schedule Pickup
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
