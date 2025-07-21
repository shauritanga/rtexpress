import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
    MapPin,
    Clock,
    Key,
    Bell,
    Package,
    AlertTriangle,
    CheckCircle,
    Edit,
    Save,
    X,
    Home,
    Building,
    Shield
} from 'lucide-react';

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

export default function DeliveryInstructions({ 
    trackingNumber, 
    currentInstructions = '', 
    onUpdateInstructions,
    className = '' 
}: Props) {
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
        setSelectedPreferences(prev => 
            prev.includes(preferenceId)
                ? prev.filter(id => id !== preferenceId)
                : [...prev, preferenceId]
        );
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg sm:text-xl flex items-center">
                            <MapPin className="h-5 w-5 mr-2" />
                            Delivery Instructions
                        </CardTitle>
                        <CardDescription>
                            Provide specific instructions for your delivery • {trackingNumber}
                        </CardDescription>
                    </div>
                    
                    {!isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="w-full sm:w-auto"
                        >
                            <Edit className="h-4 w-4 mr-2" />
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
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-2">Active Instructions</h4>
                                        <p className="text-sm text-blue-800 whitespace-pre-wrap">
                                            {currentInstructions}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No delivery instructions set</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Add instructions to help your driver deliver your package
                                </p>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {commonInstructions.map((instruction) => (
                                    <div
                                        key={instruction.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
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
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {instruction.icon}
                                                    <span className="font-medium text-sm">{instruction.title}</span>
                                                    <Badge className={`${getTypeColor(instruction.type)} text-xs`}>
                                                        {instruction.type}
                                                    </Badge>
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
                            <p className="text-xs text-gray-500">
                                Be specific about location, access codes, or any special requirements
                            </p>
                        </div>

                        {/* Common Examples */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">Example Instructions:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• "Apartment 4B, use buzzer code #1234"</li>
                                <li>• "Leave with concierge in main lobby"</li>
                                <li>• "Ring doorbell twice, dog may bark"</li>
                                <li>• "Side entrance, follow signs to office"</li>
                                <li>• "Call when arrived, will meet in parking lot"</li>
                            </ul>
                        </div>

                        {/* Action Buttons - Mobile Optimized */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 sm:flex-none"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Instructions
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="flex-1 sm:flex-none"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-yellow-800">Security Notice</p>
                            <p className="text-yellow-700 mt-1">
                                Never include sensitive information like passwords, PINs, or security codes in delivery instructions.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
