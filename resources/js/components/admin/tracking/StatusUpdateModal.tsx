import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Package, 
    Truck, 
    MapPin, 
    CheckCircle, 
    AlertTriangle, 
    Clock,
    Loader2,
    MapIcon
} from 'lucide-react';

interface Shipment {
    id: number;
    tracking_number: string;
    status: string;
    customer_name?: string;
    origin?: string;
    destination?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    shipments: Shipment[];
    onSuccess?: () => void;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'picked_up', label: 'Picked Up', icon: Package, color: 'bg-blue-100 text-blue-800' },
    { value: 'in_transit', label: 'In Transit', icon: Truck, color: 'bg-purple-100 text-purple-800' },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, color: 'bg-orange-100 text-orange-800' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'exception', label: 'Exception', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
    { value: 'cancelled', label: 'Cancelled', icon: AlertTriangle, color: 'bg-gray-100 text-gray-800' },
];

const commonLocations = [
    'RT Express Facility - Dar es Salaam',
    'Dar es Salaam Distribution Center',
    'Dodoma Distribution Center',
    'Mwanza Distribution Center',
    'Arusha Distribution Center',
    'Local Delivery Hub',
    'Customer Location',
    'In Transit',
    'Out for Delivery',
];

export default function StatusUpdateModal({ isOpen, onClose, shipments, onSuccess }: Props) {
    const [status, setStatus] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            if (shipments.length === 1) {
                // Single shipment update
                await router.post(`/admin/tracking/${shipments[0].id}/update-status`, {
                    status,
                    location,
                    notes,
                }, {
                    preserveState: true,
                    onSuccess: () => {
                        onSuccess?.();
                        onClose();
                        resetForm();
                    },
                    onError: (errors) => {
                        setErrors(errors);
                    },
                });
            } else {
                // Bulk update
                await router.post('/admin/tracking/bulk-update', {
                    shipment_ids: shipments.map(s => s.id),
                    status,
                    location,
                    notes,
                }, {
                    preserveState: true,
                    onSuccess: () => {
                        onSuccess?.();
                        onClose();
                        resetForm();
                    },
                    onError: (errors) => {
                        setErrors(errors);
                    },
                });
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setStatus('');
        setLocation('');
        setNotes('');
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const selectedStatusOption = statusOptions.find(option => option.value === status);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Update Tracking Status
                        {shipments.length > 1 && (
                            <Badge variant="secondary" className="ml-2">
                                {shipments.length} shipments
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {shipments.length === 1 
                            ? `Update status for shipment ${shipments[0].tracking_number}`
                            : `Update status for ${shipments.length} selected shipments`
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Shipment List */}
                    {shipments.length > 1 && (
                        <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                            <div className="space-y-2">
                                {shipments.map((shipment) => (
                                    <div key={shipment.id} className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{shipment.tracking_number}</span>
                                        <Badge variant="outline">{shipment.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="status">New Status *</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select new status">
                                    {selectedStatusOption && (
                                        <div className="flex items-center gap-2">
                                            <selectedStatusOption.icon className="h-4 w-4" />
                                            {selectedStatusOption.label}
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-red-600">{errors.status}</p>
                        )}
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location">Current Location *</Label>
                        <div className="space-y-2">
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter current location"
                                className={errors.location ? 'border-red-500' : ''}
                            />
                            <div className="flex flex-wrap gap-1">
                                {commonLocations.map((loc) => (
                                    <Button
                                        key={loc}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setLocation(loc)}
                                        className="text-xs"
                                    >
                                        {loc}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        {errors.location && (
                            <p className="text-sm text-red-600">{errors.location}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes about this status update..."
                            rows={3}
                        />
                        {errors.notes && (
                            <p className="text-sm text-red-600">{errors.notes}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !status || !location}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Updating...' : 'Update Status'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
