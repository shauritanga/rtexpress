import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Bell, Building, CheckCircle, Clock, Edit, Home, MapPin, Package, Save, Shield, X } from 'lucide-react';
import React, { useState } from 'react';

interface DeliveryInstruction {
    id: string;
    type: 'location' | 'access' | 'contact' | 'special';
    title: string;
    description: string;
    icon: React.ReactNode;
    active: boolean;
}

interface Props {
    trackingNumber: string;
    currentInstructions?: string;
    onUpdateInstructions: (instructions: string, preferences: string[]) => void;
    className?: string;
}

export default function DeliveryInstructions({ trackingNumber, currentInstructions = '', onUpdateInstructions, className = '' }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [instructions, setInstructions] = useState(currentInstructions);
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const commonInstructions: DeliveryInstruction[] = [
        {
            id: 'front_door',
            type: 'location',
            title: 'Leave at front door',
            description: 'Safe to leave package at front entrance',
            icon: <Home className="h-4 w-4" />,
            active: false,
        },
        {
            id: 'reception',
            type: 'location',
            title: 'Deliver to reception',
            description: 'Leave with building reception/front desk',
            icon: <Building className="h-4 w-4" />,
            active: false,
        },
        {
            id: 'ring_bell',
            type: 'contact',
            title: 'Ring doorbell',
            description: 'Ring doorbell and wait for answer',
            icon: <Bell className="h-4 w-4" />,
            active: false,
        },
        {
            id: 'call_first',
            type: 'contact',
            title: 'Call before delivery',
            description: 'Call recipient 15 minutes before arrival',
            icon: <Clock className="h-4 w-4" />,
            active: false,
        },
        {
            id: 'signature_required',
            type: 'special',
            title: 'Signature required',
            description: 'Must obtain signature from recipient',
            icon: <Shield className="h-4 w-4" />,
            active: false,
        },
        {
            id: 'fragile',
            type: 'special',
            title: 'Handle with care',
            description: 'Package contains fragile items',
            icon: <AlertTriangle className="h-4 w-4" />,
            active: false,
        },
    ];

    const handlePreferenceToggle = (preferenceId: string) => {
        setSelectedPreferences((prev) => (prev.includes(preferenceId) ? prev.filter((id) => id !== preferenceId) : [...prev, preferenceId]));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdateInstructions(instructions, selectedPreferences);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save instructions:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setInstructions(currentInstructions);
        setSelectedPreferences([]);
        setIsEditing(false);
    };

    const getTypeColor = (type: string) => {
        const colors = {
            location: 'bg-blue-100 text-blue-800 border-blue-300',
            access: 'bg-green-100 text-green-800 border-green-300',
            contact: 'bg-purple-100 text-purple-800 border-purple-300',
            special: 'bg-orange-100 text-orange-800 border-orange-300',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center text-lg sm:text-xl">
                            <MapPin className="mr-2 h-5 w-5" />
                            Delivery Instructions
                        </CardTitle>
                        <CardDescription>Provide specific instructions for your delivery • {trackingNumber}</CardDescription>
                    </div>

                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Instructions
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Current Instructions Display */}
                {!isEditing && (
                    <div className="space-y-4">
                        {currentInstructions ? (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                    <div>
                                        <h4 className="mb-2 font-medium text-blue-900">Active Instructions</h4>
                                        <p className="text-sm whitespace-pre-wrap text-blue-800">{currentInstructions}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500">No delivery instructions set</p>
                                <p className="mt-1 text-sm text-gray-400">Add instructions to help your driver deliver your package</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Editing Mode */}
                {isEditing && (
                    <div className="space-y-6">
                        {/* Quick Preferences - Mobile Optimized */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Quick Preferences</h4>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {commonInstructions.map((instruction) => (
                                    <div
                                        key={instruction.id}
                                        className={`cursor-pointer rounded-lg border p-3 transition-all ${
                                            selectedPreferences.includes(instruction.id)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handlePreferenceToggle(instruction.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={selectedPreferences.includes(instruction.id)}
                                                onChange={() => handlePreferenceToggle(instruction.id)}
                                                className="mt-0.5"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    {instruction.icon}
                                                    <span className="text-sm font-medium">{instruction.title}</span>
                                                    <Badge className={`${getTypeColor(instruction.type)} text-xs`}>{instruction.type}</Badge>
                                                </div>
                                                <p className="text-xs text-gray-600">{instruction.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Custom Instructions */}
                        <div className="space-y-3">
                            <Label htmlFor="custom_instructions" className="text-base font-medium">
                                Custom Instructions
                            </Label>
                            <Textarea
                                id="custom_instructions"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Enter specific delivery instructions (e.g., gate code, apartment number, special access requirements...)"
                                rows={4}
                                className="text-base sm:text-sm"
                            />
                            <p className="text-xs text-gray-500">Be specific about location, access codes, or any special requirements</p>
                        </div>

                        {/* Common Examples */}
                        <div className="rounded-lg bg-gray-50 p-4">
                            <h5 className="mb-2 font-medium text-gray-900">Example Instructions:</h5>
                            <ul className="space-y-1 text-sm text-gray-600">
                                <li>• "Apartment 4B, use buzzer code #1234"</li>
                                <li>• "Leave with concierge in main lobby"</li>
                                <li>• "Ring doorbell twice, dog may bark"</li>
                                <li>• "Side entrance, follow signs to office"</li>
                                <li>• "Call when arrived, will meet in parking lot"</li>
                            </ul>
                        </div>

                        {/* Action Buttons - Mobile Optimized */}
                        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
                            <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
                                {isSaving ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Instructions
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1 sm:flex-none">
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex items-start gap-2">
                        <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                        <div className="text-sm">
                            <p className="font-medium text-yellow-800">Security Notice</p>
                            <p className="mt-1 text-yellow-700">
                                Never include sensitive information like passwords, PINs, or security codes in delivery instructions.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
