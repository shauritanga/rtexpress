import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar as CalendarIcon, CheckCircle, ChevronLeft, Clock, MapPin, Star, Truck, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    available: boolean;
    price: number;
    originalPrice?: number;
    discount?: number;
    type: 'standard' | 'express' | 'premium' | 'economy';
    capacity: number;
    remaining: number;
    popular?: boolean;
}

interface DeliveryDate {
    date: Date;
    available: boolean;
    slots: TimeSlot[];
    holiday?: boolean;
    reason?: string;
}

interface Props {
    className?: string;
    selectedDate?: Date;
    selectedSlot?: string;
    onDateSelect?: (date: Date) => void;
    onSlotSelect?: (slot: TimeSlot) => void;
    deliveryAddress?: string;
    serviceType?: string;
}

export default function DeliveryTimeSlots({
    className = '',
    selectedDate,
    selectedSlot,
    onDateSelect,
    onSlotSelect,
    deliveryAddress = '123 Business St, New York, NY 10019',
    serviceType = 'standard',
}: Props) {
    const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
    const [availableDates, setAvailableDates] = useState<DeliveryDate[]>([]);
    const [selectedDateSlots, setSelectedDateSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'calendar' | 'slots'>('calendar');

    // Generate available dates for the next 14 days
    useEffect(() => {
        generateAvailableDates();
    }, [serviceType]);

    // Load slots when date is selected
    useEffect(() => {
        if (selectedDate) {
            loadSlotsForDate(selectedDate);
        }
    }, [selectedDate, serviceType]);

    const generateAvailableDates = () => {
        const dates: DeliveryDate[] = [];
        const today = new Date();

        for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Skip Sundays for standard delivery
            const isWeekend = date.getDay() === 0;
            const isHoliday = checkIfHoliday(date);

            dates.push({
                date,
                available: !isWeekend && !isHoliday,
                slots: [],
                holiday: isHoliday,
                reason: isWeekend ? 'No Sunday delivery' : isHoliday ? 'Holiday' : undefined,
            });
        }

        setAvailableDates(dates);
    };

    const checkIfHoliday = (date: Date): boolean => {
        // Mock holiday check - in real app, would check against holiday calendar
        const holidays = [
            '2024-01-01', // New Year's Day
            '2024-07-04', // Independence Day
            '2024-12-25', // Christmas
        ];

        const dateString = date.toISOString().split('T')[0];
        return holidays.includes(dateString);
    };

    const loadSlotsForDate = (date: Date) => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            const slots = generateSlotsForDate(date);
            setSelectedDateSlots(slots);
            setIsLoading(false);
        }, 500);
    };

    const generateSlotsForDate = (date: Date): TimeSlot[] => {
        const isWeekend = date.getDay() === 6; // Saturday
        const dayOfWeek = date.getDay();

        const baseSlots: Omit<TimeSlot, 'id' | 'available' | 'capacity' | 'remaining'>[] = [
            {
                startTime: '08:00',
                endTime: '12:00',
                price: 0,
                type: 'standard',
                popular: true,
            },
            {
                startTime: '12:00',
                endTime: '17:00',
                price: 0,
                type: 'standard',
            },
            {
                startTime: '17:00',
                endTime: '20:00',
                price: 5.99,
                originalPrice: 8.99,
                discount: 33.3,
                type: 'express',
            },
            {
                startTime: '09:00',
                endTime: '11:00',
                price: 12.99,
                type: 'premium',
            },
            {
                startTime: '19:00',
                endTime: '21:00',
                price: 15.99,
                type: 'premium',
            },
        ];

        // Weekend slots (Saturday only)
        if (isWeekend) {
            baseSlots.push({
                startTime: '10:00',
                endTime: '14:00',
                price: 7.99,
                type: 'express',
            });
        }

        return baseSlots.map((slot, index) => ({
            ...slot,
            id: `slot-${index}`,
            available: Math.random() > 0.2, // 80% availability
            capacity: 10,
            remaining: Math.floor(Math.random() * 8) + 1,
        }));
    };

    const handleDateSelect = (date: Date) => {
        setCurrentDate(date);
        onDateSelect?.(date);
        loadSlotsForDate(date);
        setViewMode('slots');
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        if (slot.available) {
            onSlotSelect?.(slot);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const getSlotTypeColor = (type: string) => {
        const colors = {
            economy: 'bg-green-100 text-green-800 border-green-300',
            standard: 'bg-blue-100 text-blue-800 border-blue-300',
            express: 'bg-purple-100 text-purple-800 border-purple-300',
            premium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getSlotTypeIcon = (type: string) => {
        const icons = {
            economy: <Truck className="h-4 w-4" />,
            standard: <Clock className="h-4 w-4" />,
            express: <Zap className="h-4 w-4" />,
            premium: <Star className="h-4 w-4" />,
        };
        return icons[type as keyof typeof icons] || <Clock className="h-4 w-4" />;
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Delivery Time Slots
                </CardTitle>
                <CardDescription>Choose your preferred delivery date and time</CardDescription>

                {/* Delivery Address */}
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">{deliveryAddress}</span>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Mobile Navigation */}
                <div className="flex items-center justify-between sm:hidden">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('calendar')}
                        className={viewMode === 'calendar' ? 'bg-blue-100' : ''}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Date
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('slots')}
                        disabled={!selectedDate}
                        className={viewMode === 'slots' ? 'bg-blue-100' : ''}
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        Time
                    </Button>
                </div>

                {/* Calendar View */}
                {(viewMode === 'calendar' || window.innerWidth >= 640) && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Select Delivery Date</h3>

                        {/* Quick Date Selection - Mobile Optimized */}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {availableDates.slice(0, 8).map((dateInfo, index) => (
                                <Button
                                    key={index}
                                    variant={selectedDate?.toDateString() === dateInfo.date.toDateString() ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleDateSelect(dateInfo.date)}
                                    disabled={!dateInfo.available}
                                    className="flex h-auto flex-col p-3"
                                >
                                    <span className="text-xs font-medium">{dateInfo.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                    <span className="text-sm">{dateInfo.date.getDate()}</span>
                                    {!dateInfo.available && <span className="mt-1 text-xs text-red-600">{dateInfo.reason}</span>}
                                </Button>
                            ))}
                        </div>

                        {/* Full Calendar - Desktop */}
                        <div className="hidden sm:block">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && handleDateSelect(date)}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    return date < today || !availableDates.find((d) => d.date.toDateString() === date.toDateString())?.available;
                                }}
                                className="rounded-md border"
                            />
                        </div>
                    </div>
                )}

                {/* Time Slots View */}
                {(viewMode === 'slots' || window.innerWidth >= 640) && selectedDate && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">Available Time Slots</h3>
                            <span className="text-sm text-gray-600">{formatDate(selectedDate)}</span>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">Loading time slots...</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedDateSlots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                            selectedSlot === slot.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : slot.available
                                                  ? 'border-gray-200 hover:border-gray-300'
                                                  : 'cursor-not-allowed border-gray-100 bg-gray-50'
                                        }`}
                                        onClick={() => handleSlotSelect(slot)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`rounded-lg p-2 ${getSlotTypeColor(slot.type)}`}>{getSlotTypeIcon(slot.type)}</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">
                                                            {slot.startTime} - {slot.endTime}
                                                        </span>
                                                        <Badge className={getSlotTypeColor(slot.type)}>{slot.type}</Badge>
                                                        {slot.popular && (
                                                            <Badge className="border-orange-300 bg-orange-100 text-orange-800">
                                                                <Star className="mr-1 h-3 w-3" />
                                                                Popular
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                                                        <span>
                                                            {slot.remaining} of {slot.capacity} slots available
                                                        </span>
                                                        {!slot.available && <span className="font-medium text-red-600">Fully booked</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                {slot.price > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        {slot.originalPrice && (
                                                            <span className="text-sm text-gray-500 line-through">
                                                                ${slot.originalPrice.toFixed(2)}
                                                            </span>
                                                        )}
                                                        <span className="font-bold text-gray-900">+${slot.price.toFixed(2)}</span>
                                                        {slot.discount && (
                                                            <Badge className="border-green-300 bg-green-100 text-xs text-green-800">
                                                                {slot.discount.toFixed(0)}% off
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="font-medium text-green-600">Free</span>
                                                )}
                                            </div>
                                        </div>

                                        {selectedSlot === slot.id && (
                                            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-100 p-3">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-900">Selected for delivery</span>
                                                </div>
                                                <p className="mt-1 text-sm text-blue-800">
                                                    Your package will be delivered between {slot.startTime} and {slot.endTime}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {selectedDateSlots.length === 0 && (
                                    <div className="py-8 text-center">
                                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <p className="text-gray-500">No time slots available for this date</p>
                                        <p className="mt-1 text-sm text-gray-400">Please select a different date</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Pricing Information */}
                <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 font-medium text-gray-900">Time Slot Pricing</h4>
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Standard (8AM-5PM)</span>
                            <span className="font-medium text-green-600">Free</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Express (5PM-8PM)</span>
                            <span className="font-medium">+$5.99</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Premium (2-hour window)</span>
                            <span className="font-medium">+$12.99</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Weekend delivery</span>
                            <span className="font-medium">+$7.99</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Back Button */}
                {viewMode === 'slots' && (
                    <div className="sm:hidden">
                        <Button variant="outline" onClick={() => setViewMode('calendar')} className="w-full">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Calendar
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
