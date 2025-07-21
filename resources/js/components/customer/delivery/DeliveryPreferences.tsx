import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
    Settings,
    Shield,
    User,
    MapPin,
    Bell,
    Package,
    Camera,
    Lock,
    Phone,
    Mail,
    Clock,
    AlertTriangle,
    CheckCircle,
    Info,
    Heart,
    Home,
    Building,
    Truck
} from 'lucide-react';

interface DeliveryPreference {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
    premium?: boolean;
    fee?: number;
}

interface ContactPreference {
    method: 'sms' | 'email' | 'phone' | 'app';
    enabled: boolean;
    value?: string;
}

interface Props {
    className?: string;
    preferences?: any;
    onPreferencesChange?: (preferences: any) => void;
}

export default function DeliveryPreferences({ 
    className = '', 
    preferences = {},
    onPreferencesChange
}: Props) {
    const [deliveryPreferences, setDeliveryPreferences] = useState<DeliveryPreference[]>([
        {
            id: 'contactless',
            name: 'Contactless Delivery',
            description: 'Leave package at door without signature',
            icon: <Package className="h-4 w-4" />,
            enabled: true,
        },
        {
            id: 'signature_required',
            name: 'Signature Required',
            description: 'Require signature for delivery confirmation',
            icon: <User className="h-4 w-4" />,
            enabled: false,
        },
        {
            id: 'photo_confirmation',
            name: 'Photo Confirmation',
            description: 'Take photo of delivered package',
            icon: <Camera className="h-4 w-4" />,
            enabled: true,
        },
        {
            id: 'secure_location',
            name: 'Secure Location Only',
            description: 'Only deliver to secure, covered areas',
            icon: <Shield className="h-4 w-4" />,
            enabled: false,
            premium: true,
            fee: 2.99,
        },
        {
            id: 'adult_signature',
            name: 'Adult Signature Required',
            description: 'Require adult (21+) signature with ID verification',
            icon: <Lock className="h-4 w-4" />,
            enabled: false,
            premium: true,
            fee: 5.99,
        },
        {
            id: 'weekend_delivery',
            name: 'Weekend Delivery',
            description: 'Allow Saturday and Sunday deliveries',
            icon: <Clock className="h-4 w-4" />,
            enabled: true,
            fee: 7.99,
        },
    ]);

    const [contactPreferences, setContactPreferences] = useState<ContactPreference[]>([
        { method: 'sms', enabled: true, value: '+1 (555) 123-4567' },
        { method: 'email', enabled: true, value: 'customer@example.com' },
        { method: 'phone', enabled: false, value: '+1 (555) 123-4567' },
        { method: 'app', enabled: true },
    ]);

    const [specialInstructions, setSpecialInstructions] = useState(
        preferences.specialInstructions || ''
    );
    const [deliveryLocation, setDeliveryLocation] = useState(
        preferences.deliveryLocation || 'front_door'
    );
    const [accessCode, setAccessCode] = useState(
        preferences.accessCode || ''
    );
    const [emergencyContact, setEmergencyContact] = useState(
        preferences.emergencyContact || { name: '', phone: '' }
    );

    const handlePreferenceToggle = (preferenceId: string) => {
        setDeliveryPreferences(prev => 
            prev.map(pref => 
                pref.id === preferenceId 
                    ? { ...pref, enabled: !pref.enabled }
                    : pref
            )
        );
    };

    const handleContactToggle = (method: string) => {
        setContactPreferences(prev => 
            prev.map(contact => 
                contact.method === method 
                    ? { ...contact, enabled: !contact.enabled }
                    : contact
            )
        );
    };

    const handleSavePreferences = () => {
        const allPreferences = {
            deliveryPreferences: deliveryPreferences.filter(p => p.enabled),
            contactPreferences: contactPreferences.filter(c => c.enabled),
            specialInstructions,
            deliveryLocation,
            accessCode,
            emergencyContact,
        };
        
        onPreferencesChange?.(allPreferences);
    };

    const getContactIcon = (method: string) => {
        const icons = {
            sms: <Phone className="h-4 w-4" />,
            email: <Mail className="h-4 w-4" />,
            phone: <Phone className="h-4 w-4" />,
            app: <Bell className="h-4 w-4" />,
        };
        return icons[method as keyof typeof icons];
    };

    const getContactLabel = (method: string) => {
        const labels = {
            sms: 'SMS Notifications',
            email: 'Email Notifications',
            phone: 'Phone Calls',
            app: 'App Notifications',
        };
        return labels[method as keyof typeof labels];
    };

    const getLocationIcon = (location: string) => {
        const icons = {
            front_door: <Home className="h-4 w-4" />,
            back_door: <Home className="h-4 w-4" />,
            side_door: <Home className="h-4 w-4" />,
            garage: <Building className="h-4 w-4" />,
            mailbox: <Package className="h-4 w-4" />,
            reception: <Building className="h-4 w-4" />,
            concierge: <User className="h-4 w-4" />,
        };
        return icons[location as keyof typeof icons] || <MapPin className="h-4 w-4" />;
    };

    const totalFees = deliveryPreferences
        .filter(p => p.enabled && p.fee)
        .reduce((sum, p) => sum + (p.fee || 0), 0);

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Delivery Preferences
                </CardTitle>
                <CardDescription>
                    Customize how you want your packages delivered
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Delivery Options */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Delivery Options</h3>
                    <div className="space-y-3">
                        {deliveryPreferences.map((preference) => (
                            <div
                                key={preference.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        {preference.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900">
                                                {preference.name}
                                            </h4>
                                            {preference.premium && (
                                                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                                    Premium
                                                </Badge>
                                            )}
                                            {preference.fee && (
                                                <Badge variant="outline">
                                                    +${preference.fee.toFixed(2)}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {preference.description}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={preference.enabled}
                                    onCheckedChange={() => handlePreferenceToggle(preference.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Location */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Preferred Delivery Location</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { id: 'front_door', label: 'Front Door' },
                            { id: 'back_door', label: 'Back Door' },
                            { id: 'side_door', label: 'Side Door' },
                            { id: 'garage', label: 'Garage' },
                            { id: 'mailbox', label: 'Mailbox Area' },
                            { id: 'reception', label: 'Reception/Lobby' },
                        ].map((location) => (
                            <Button
                                key={location.id}
                                variant={deliveryLocation === location.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setDeliveryLocation(location.id)}
                                className="flex items-center gap-2 h-auto p-3"
                            >
                                {getLocationIcon(location.id)}
                                <span className="text-sm">{location.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-4">
                    <Label htmlFor="instructions" className="text-base font-medium">
                        Special Delivery Instructions
                    </Label>
                    <Textarea
                        id="instructions"
                        placeholder="e.g., Ring doorbell twice, leave with neighbor in apt 2B, beware of dog..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        rows={3}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-500">
                        {specialInstructions.length}/500 characters
                    </p>
                </div>

                {/* Access Information */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Access Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="access-code">Building/Gate Access Code</Label>
                            <Input
                                id="access-code"
                                type="password"
                                placeholder="Enter access code"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="buzzer">Apartment/Unit Number</Label>
                            <Input
                                id="buzzer"
                                placeholder="e.g., Apt 4B, Unit 123"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Emergency Contact</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="emergency-name">Contact Name</Label>
                            <Input
                                id="emergency-name"
                                placeholder="Full name"
                                value={emergencyContact.name}
                                onChange={(e) => setEmergencyContact(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="emergency-phone">Phone Number</Label>
                            <Input
                                id="emergency-phone"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={emergencyContact.phone}
                                onChange={(e) => setEmergencyContact(prev => ({
                                    ...prev,
                                    phone: e.target.value
                                }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Notification Preferences</h3>
                    <div className="space-y-3">
                        {contactPreferences.map((contact) => (
                            <div
                                key={contact.method}
                                className="flex items-center justify-between p-3 border rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                        {getContactIcon(contact.method)}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {getContactLabel(contact.method)}
                                        </h4>
                                        {contact.value && (
                                            <p className="text-sm text-gray-600">{contact.value}</p>
                                        )}
                                    </div>
                                </div>
                                <Switch
                                    checked={contact.enabled}
                                    onCheckedChange={() => handleContactToggle(contact.method)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cost Summary */}
                {totalFees > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <h4 className="font-medium text-yellow-900">Additional Fees</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                            {deliveryPreferences
                                .filter(p => p.enabled && p.fee)
                                .map(p => (
                                    <div key={p.id} className="flex justify-between text-yellow-800">
                                        <span>{p.name}</span>
                                        <span>+${p.fee?.toFixed(2)}</span>
                                    </div>
                                ))}
                            <div className="border-t border-yellow-300 pt-1 mt-2">
                                <div className="flex justify-between font-medium text-yellow-900">
                                    <span>Total Additional Fees</span>
                                    <span>+${totalFees.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900 mb-1">Security & Privacy</h4>
                            <p className="text-sm text-blue-800">
                                Your delivery preferences and access information are encrypted and only 
                                shared with authorized delivery personnel. You can update these settings 
                                anytime from your account dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4">
                    <Button onClick={handleSavePreferences} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Preferences
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Reset to Default
                    </Button>
                </div>

                {/* Quick Tips */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Delivery Tips</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <Heart className="h-4 w-4 text-red-500 mt-0.5" />
                            <span>Enable photo confirmation for peace of mind</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Use secure location delivery for valuable packages</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Bell className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span>Enable multiple notification methods to stay informed</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-purple-500 mt-0.5" />
                            <span>Weekend delivery is perfect for busy weekdays</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
