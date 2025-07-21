import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import CommunicationCenter from '@/components/customer/communication/CommunicationCenter';
import DeliveryInstructions from '@/components/customer/communication/DeliveryInstructions';
import PhotoConfirmation from '@/components/customer/communication/PhotoConfirmation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    MessageCircle,
    ArrowLeft,
    Phone,
    MapPin,
    Camera,
    Bell,
    User,
    Truck
} from 'lucide-react';

interface Message {
    id: string;
    sender: 'customer' | 'driver' | 'system';
    content: string;
    timestamp: string;
    type: 'text' | 'image' | 'location' | 'system';
    attachments?: {
        type: 'image' | 'document';
        url: string;
        name: string;
    }[];
    read: boolean;
}

interface Driver {
    id: string;
    name: string;
    phone: string;
    photo?: string;
    vehicle: string;
    status: 'online' | 'offline' | 'busy';
    location?: {
        lat: number;
        lng: number;
        address: string;
    };
}

interface DeliveryPhoto {
    id: string;
    url: string;
    thumbnail: string;
    timestamp: string;
    location?: {
        lat: number;
        lng: number;
        address: string;
    };
    driver: {
        name: string;
        id: string;
    };
    type: 'delivery' | 'signature' | 'damage' | 'location';
    description?: string;
}

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
}

interface Props {
    customer: Customer;
    trackingNumber: string;
    driver?: Driver;
    messages: Message[];
    deliveryInstructions?: string;
    deliveryPhotos: DeliveryPhoto[];
    deliveryStatus: 'pending' | 'delivered' | 'attempted';
    deliveryTimestamp?: string;
}

export default function CommunicationIndex({ 
    customer, 
    trackingNumber, 
    driver, 
    messages, 
    deliveryInstructions,
    deliveryPhotos,
    deliveryStatus,
    deliveryTimestamp
}: Props) {
    // Mock data for demonstration
    const mockDriver: Driver = driver || {
        id: 'driver-123',
        name: 'Mike Johnson',
        phone: '+1 (555) 123-4567',
        photo: '/images/drivers/mike.jpg',
        vehicle: 'Truck #RT-2024',
        status: 'online',
        location: {
            lat: 40.7128,
            lng: -74.0060,
            address: 'En route to delivery location'
        }
    };

    const mockMessages: Message[] = messages.length > 0 ? messages : [
        {
            id: '1',
            sender: 'system',
            content: 'Your driver Mike has been assigned to your delivery',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'system',
            read: true,
        },
        {
            id: '2',
            sender: 'driver',
            content: 'Hi! I\'m Mike, your delivery driver. I\'ll be delivering your package today between 2-6 PM.',
            timestamp: new Date(Date.now() - 3000000).toISOString(),
            type: 'text',
            read: true,
        },
        {
            id: '3',
            sender: 'customer',
            content: 'Great! Please ring the doorbell when you arrive.',
            timestamp: new Date(Date.now() - 2700000).toISOString(),
            type: 'text',
            read: true,
        },
        {
            id: '4',
            sender: 'driver',
            content: 'Will do! I\'m about 15 minutes away now.',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            type: 'text',
            read: true,
        },
    ];

    const mockDeliveryPhotos: DeliveryPhoto[] = deliveryPhotos.length > 0 ? deliveryPhotos : 
        deliveryStatus === 'delivered' ? [
            {
                id: 'photo-1',
                url: '/images/delivery/proof-1.jpg',
                thumbnail: '/images/delivery/proof-1-thumb.jpg',
                timestamp: deliveryTimestamp || new Date().toISOString(),
                location: {
                    lat: 40.7589,
                    lng: -73.9851,
                    address: '456 Business St, New York, NY 10019'
                },
                driver: {
                    name: 'Mike Johnson',
                    id: 'driver-123'
                },
                type: 'delivery',
                description: 'Package delivered to front door as requested'
            },
            {
                id: 'photo-2',
                url: '/images/delivery/location-1.jpg',
                thumbnail: '/images/delivery/location-1-thumb.jpg',
                timestamp: deliveryTimestamp || new Date().toISOString(),
                location: {
                    lat: 40.7589,
                    lng: -73.9851,
                    address: '456 Business St, New York, NY 10019'
                },
                driver: {
                    name: 'Mike Johnson',
                    id: 'driver-123'
                },
                type: 'location',
                description: 'Delivery location confirmation'
            }
        ] : [];

    const handleSendMessage = async (content: string, type: 'text' | 'image', attachments?: File[]) => {
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('type', type);
            formData.append('tracking_number', trackingNumber);
            
            if (attachments) {
                attachments.forEach((file, index) => {
                    formData.append(`attachments[${index}]`, file);
                });
            }

            const response = await fetch('/api/communication/messages', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (response.ok) {
                // Message sent successfully
                // In a real app, you'd update the messages list or use WebSocket for real-time updates
                console.log('Message sent successfully');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleCallDriver = () => {
        if (mockDriver.phone) {
            window.location.href = `tel:${mockDriver.phone}`;
        }
    };

    const handleUpdateInstructions = async (instructions: string, preferences: string[]) => {
        try {
            const response = await fetch('/api/communication/instructions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    tracking_number: trackingNumber,
                    instructions,
                    preferences,
                }),
            });

            if (response.ok) {
                console.log('Instructions updated successfully');
            }
        } catch (error) {
            console.error('Failed to update instructions:', error);
        }
    };

    return (
        <AppLayout>
            <Head title="Communication Center" />
            
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
                                <Button variant="outline" size="sm" onClick={handleCallDriver} className="p-2 sm:px-3">
                                    <Phone className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Call Driver</span>
                                </Button>
                                <Button variant="outline" size="sm" className="p-2 sm:px-3">
                                    <Bell className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Alerts</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
                                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-blue-600" />
                                Communication Center
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • Stay connected with your delivery team
                            </p>
                        </div>
                    </div>
                </div>

                {/* Driver Status Card - Mobile First */}
                {deliveryStatus !== 'delivered' && (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Truck className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-blue-900">Your Driver: {mockDriver.name}</h3>
                                    <p className="text-sm text-blue-700">{mockDriver.vehicle}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Status: <span className="capitalize">{mockDriver.status}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button size="sm" onClick={handleCallDriver}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content - Mobile Responsive Tabs */}
                <Tabs defaultValue="chat" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="chat" className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Chat</span>
                        </TabsTrigger>
                        <TabsTrigger value="instructions" className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Instructions</span>
                        </TabsTrigger>
                        <TabsTrigger value="photos" className="flex items-center">
                            <Camera className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Photos</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chat">
                        <CommunicationCenter
                            trackingNumber={trackingNumber}
                            driver={deliveryStatus !== 'delivered' ? mockDriver : undefined}
                            messages={mockMessages}
                            onSendMessage={handleSendMessage}
                            onCallDriver={handleCallDriver}
                        />
                    </TabsContent>

                    <TabsContent value="instructions">
                        <DeliveryInstructions
                            trackingNumber={trackingNumber}
                            currentInstructions={deliveryInstructions}
                            onUpdateInstructions={handleUpdateInstructions}
                        />
                    </TabsContent>

                    <TabsContent value="photos">
                        <PhotoConfirmation
                            trackingNumber={trackingNumber}
                            photos={mockDeliveryPhotos}
                            deliveryStatus={deliveryStatus}
                            deliveryTimestamp={deliveryTimestamp}
                        />
                    </TabsContent>
                </Tabs>

                {/* Help Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Need Help?</CardTitle>
                        <CardDescription>
                            Get assistance with your delivery
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button variant="outline" className="justify-start">
                                <Phone className="h-4 w-4 mr-2" />
                                Contact Customer Service
                            </Button>
                            <Button variant="outline" className="justify-start">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Report an Issue
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
