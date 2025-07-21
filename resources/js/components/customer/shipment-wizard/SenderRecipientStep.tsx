import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
    User,
    Building,
    MapPin,
    Phone,
    Mail,
    ArrowRight,
    BookOpen,
    Plus,
    Check
} from 'lucide-react';

interface Address {
    id?: number;
    company_name?: string;
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

interface Props {
    data: any;
    savedAddresses: any[];
    onUpdate: (data: any) => void;
    onNext: () => void;
}

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
];

export default function SenderRecipientStep({ data, savedAddresses, onUpdate, onNext }: Props) {
    const [recipient, setRecipient] = useState<Address>(data.recipient || {
        contact_person: '',
        email: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: 'US',
    });
    const [showAddressBook, setShowAddressBook] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!recipient.contact_person?.trim()) {
            newErrors.contact_person = 'Contact person is required';
        }
        if (!recipient.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(recipient.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!recipient.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        }
        if (!recipient.address_line_1?.trim()) {
            newErrors.address_line_1 = 'Address is required';
        }
        if (!recipient.city?.trim()) {
            newErrors.city = 'City is required';
        }
        if (!recipient.state_province?.trim()) {
            newErrors.state_province = 'State/Province is required';
        }
        if (!recipient.postal_code?.trim()) {
            newErrors.postal_code = 'Postal code is required';
        }
        if (!recipient.country) {
            newErrors.country = 'Country is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            onUpdate({ recipient });
            onNext();
        }
    };

    const handleAddressSelect = (address: Address) => {
        setRecipient(address);
        setShowAddressBook(false);
        setErrors({});
    };

    const handleInputChange = (field: string, value: string) => {
        setRecipient(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Sender Information (Read-only) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Sender Information
                    </CardTitle>
                    <CardDescription>
                        Your company information (automatically filled)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <div className="p-3 bg-gray-50 rounded-md text-sm">
                                {data.sender.company_name}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Person</Label>
                            <div className="p-3 bg-gray-50 rounded-md text-sm">
                                {data.sender.contact_person}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="p-3 bg-gray-50 rounded-md text-sm">
                                {data.sender.email}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <div className="p-3 bg-gray-50 rounded-md text-sm">
                                {data.sender.phone}
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Address</Label>
                            <div className="p-3 bg-gray-50 rounded-md text-sm">
                                {data.sender.address_line_1}
                                {data.sender.address_line_2 && <br />}
                                {data.sender.address_line_2}
                                <br />
                                {data.sender.city}, {data.sender.state_province} {data.sender.postal_code}
                                <br />
                                {data.sender.country}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                            <MapPin className="h-5 w-5 mr-2" />
                            Recipient Information
                        </div>
                        {savedAddresses.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAddressBook(!showAddressBook)}
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Address Book
                            </Button>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Enter the recipient's shipping address
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Address Book */}
                    {showAddressBook && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-3">Saved Addresses</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {savedAddresses.map((address, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-white rounded-md border cursor-pointer hover:border-blue-300 transition-colors"
                                        onClick={() => handleAddressSelect(address)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{address.contact_person}</p>
                                                {address.company_name && (
                                                    <p className="text-xs text-gray-600">{address.company_name}</p>
                                                )}
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {address.address_line_1}, {address.city}
                                                </p>
                                            </div>
                                            <Check className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recipient Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact_person">Contact Person *</Label>
                            <Input
                                id="contact_person"
                                value={recipient.contact_person}
                                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                placeholder="John Doe"
                                className={errors.contact_person ? 'border-red-500' : ''}
                            />
                            {errors.contact_person && (
                                <p className="text-sm text-red-600">{errors.contact_person}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_name">Company Name (Optional)</Label>
                            <Input
                                id="company_name"
                                value={recipient.company_name || ''}
                                onChange={(e) => handleInputChange('company_name', e.target.value)}
                                placeholder="ABC Company"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={recipient.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="john@example.com"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                value={recipient.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className={errors.phone ? 'border-red-500' : ''}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address_line_1">Address Line 1 *</Label>
                            <Input
                                id="address_line_1"
                                value={recipient.address_line_1}
                                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                                placeholder="123 Main Street"
                                className={errors.address_line_1 ? 'border-red-500' : ''}
                            />
                            {errors.address_line_1 && (
                                <p className="text-sm text-red-600">{errors.address_line_1}</p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
                            <Input
                                id="address_line_2"
                                value={recipient.address_line_2 || ''}
                                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                                placeholder="Apartment, suite, unit, building, floor, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={recipient.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder="New York"
                                className={errors.city ? 'border-red-500' : ''}
                            />
                            {errors.city && (
                                <p className="text-sm text-red-600">{errors.city}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state_province">State/Province *</Label>
                            <Input
                                id="state_province"
                                value={recipient.state_province}
                                onChange={(e) => handleInputChange('state_province', e.target.value)}
                                placeholder="NY"
                                className={errors.state_province ? 'border-red-500' : ''}
                            />
                            {errors.state_province && (
                                <p className="text-sm text-red-600">{errors.state_province}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code *</Label>
                            <Input
                                id="postal_code"
                                value={recipient.postal_code}
                                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                                placeholder="10001"
                                className={errors.postal_code ? 'border-red-500' : ''}
                            />
                            {errors.postal_code && (
                                <p className="text-sm text-red-600">{errors.postal_code}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country *</Label>
                            <Select
                                value={recipient.country}
                                onValueChange={(value) => handleInputChange('country', value)}
                            >
                                <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRIES.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.country && (
                                <p className="text-sm text-red-600">{errors.country}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-end">
                <Button onClick={handleNext} className="min-w-32">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
