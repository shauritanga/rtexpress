import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import DeliveryTimeSlots from '@/components/customer/delivery/DeliveryTimeSlots';
import AlternativeLocations from '@/components/customer/delivery/AlternativeLocations';
import DeliveryPreferences from '@/components/customer/delivery/DeliveryPreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar,
    MapPin,
    Settings,
    ArrowLeft,
    Clock,
    Package,
    Truck,
    CheckCircle,
    Star,
    Zap,
    Shield,
    Home
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
}

interface DeliveryStats {
    onTimeDeliveries: number;
    totalDeliveries: number;
    averageDeliveryTime: string;
    preferredTimeSlot: string;
    mostUsedLocation: string;
}

interface Props {
    customer: Customer;
    deliveryStats?: DeliveryStats;
    currentShipment?: any;
}

export default function DeliveryIndex({ 
    customer, 
    deliveryStats = {
        onTimeDeliveries: 47,
        totalDeliveries: 52,
        averageDeliveryTime: '2.3 days',
        preferredTimeSlot: '12:00 PM - 5:00 PM',
        mostUsedLocation: 'Front Door'
    },
    currentShipment
}: Props) {
    const [selectedDate, setSelectedDate] = React.useState<Date>();
    const [selectedSlot, setSelectedSlot] = React.useState<string>();
    const [selectedLocation, setSelectedLocation] = React.useState<string>();
    const [deliveryPreferences, setDeliveryPreferences] = React.useState<any>({});

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleSlotSelect = (slot: any) => {
        setSelectedSlot(slot.id);
    };

    const handleLocationSelect = (location: any) => {
        setSelectedLocation(location.id);
    };

    const handlePreferencesChange = (preferences: any) => {
        setDeliveryPreferences(preferences);
        // In a real app, this would save to the backend
        console.log('Preferences updated:', preferences);
    };

    const onTimePercentage = Math.round((deliveryStats.onTimeDeliveries / deliveryStats.totalDeliveries) * 100);

    return (
        <AppLayout>
            <Head title="Flexible Delivery Options" />
            
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header - Mobile Optimized */}
                <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            
                            {/* Quick Actions - Mobile Responsive */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <Calendar className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Schedule</span>
                                </Button>
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <MapPin className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Locations</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                                <Truck className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-blue-600" />
                                Flexible Delivery Options
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • Customize your delivery experience
                            </p>
                        </div>
                    </div>
                </div>

                {/* Delivery Performance Summary - Mobile First Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">On-Time Rate</p>
                                    <p className="text-sm sm:text-lg font-bold text-green-600 truncate">
                                        {onTimePercentage}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Time</p>
                                    <p className="text-sm sm:text-lg font-bold text-blue-600 truncate">
                                        {deliveryStats.averageDeliveryTime}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Preferred Slot</p>
                                    <p className="text-xs sm:text-sm font-bold text-yellow-600 truncate">
                                        {deliveryStats.preferredTimeSlot}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Top Location</p>
                                    <p className="text-xs sm:text-sm font-bold text-purple-600 truncate">
                                        {deliveryStats.mostUsedLocation}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Shipment Context */}
                {currentShipment && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">
                                        Customizing delivery for: {currentShipment.tracking_number}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {currentShipment.service_type} • {currentShipment.destination_address}
                                    </p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                    Active
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content - Mobile Responsive Tabs */}
                <Tabs defaultValue="timeslots" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="timeslots" className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Time Slots</span>
                        </TabsTrigger>
                        <TabsTrigger value="locations" className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Locations</span>
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Preferences</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="timeslots">
                        <DeliveryTimeSlots 
                            selectedDate={selectedDate}
                            selectedSlot={selectedSlot}
                            onDateSelect={handleDateSelect}
                            onSlotSelect={handleSlotSelect}
                            deliveryAddress={currentShipment?.destination_address}
                            serviceType={currentShipment?.service_type}
                        />
                    </TabsContent>

                    <TabsContent value="locations">
                        <AlternativeLocations
                            currentAddress={currentShipment?.destination_address}
                            selectedLocation={selectedLocation}
                            onLocationSelect={handleLocationSelect}
                            packageSize={currentShipment?.package_size}
                        />
                    </TabsContent>

                    <TabsContent value="preferences">
                        <DeliveryPreferences
                            preferences={deliveryPreferences}
                            onPreferencesChange={handlePreferencesChange}
                        />
                    </TabsContent>
                </Tabs>

                {/* Selection Summary */}
                {(selectedDate || selectedLocation || Object.keys(deliveryPreferences).length > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Delivery Summary</CardTitle>
                            <CardDescription>
                                Review your selected delivery options
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {selectedDate && selectedSlot && (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <h4 className="font-medium text-blue-900">Scheduled Delivery</h4>
                                            <p className="text-sm text-blue-800">
                                                {selectedDate.toLocaleDateString()} • Time slot selected
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedLocation && (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <MapPin className="h-5 w-5 text-green-600" />
                                        <div>
                                            <h4 className="font-medium text-green-900">Alternative Location</h4>
                                            <p className="text-sm text-green-800">
                                                Pickup location selected
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {Object.keys(deliveryPreferences).length > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <Settings className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <h4 className="font-medium text-purple-900">Custom Preferences</h4>
                                            <p className="text-sm text-purple-800">
                                                {deliveryPreferences.deliveryPreferences?.length || 0} preferences configured
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button className="flex-1">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Apply Delivery Options
                                    </Button>
                                    <Button variant="outline">
                                        Save as Default
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Delivery Benefits */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Flexible Delivery Benefits</CardTitle>
                        <CardDescription>
                            Why customize your delivery experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Time Flexibility</h4>
                                    <p className="text-sm text-gray-600">
                                        Choose delivery windows that work with your schedule
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Location Options</h4>
                                    <p className="text-sm text-gray-600">
                                        Secure pickup points when you're not home
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Security Control</h4>
                                    <p className="text-sm text-gray-600">
                                        Customize security and signature requirements
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                    <Zap className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Smart Notifications</h4>
                                    <p className="text-sm text-gray-600">
                                        Get updates exactly how and when you want them
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
