import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeftIcon, CheckIcon, TrashIcon, CalendarIcon, UserIcon, PhoneIcon, MailIcon, MapPinIcon, PackageIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ShipmentRequest {
    id: number;
    name: string;
    phone: string;
    email: string;
    item_description: string;
    pickup_location: string;
    delivery_location: string;
    additional_notes?: string;
    status: 'pending' | 'done' | 'cancelled';
    source: string;
    created_at: string;
    processed_at?: string;
    processed_by?: {
        id: number;
        name: string;
    };
}

interface Props {
    booking: ShipmentRequest;
}

export default function BookingShow({ booking }: Props) {
    const markAsDone = () => {
        if (confirm('Are you sure you want to mark this booking as done?')) {
            router.post(`/admin/bookings/${booking.id}/mark-done`);
        }
    };

    const deleteBooking = () => {
        if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            router.delete(`/admin/bookings/${booking.id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="text-orange-600 bg-orange-100">Pending</Badge>;
            case 'done':
                return <Badge variant="default" className="text-green-600 bg-green-100">Done</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };



    return (
        <AppLayout>
            <Head title={`Booking #${booking.id}`} />

            <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
                {/* Header - Mobile First */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/bookings"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                        >
                            <ArrowLeftIcon className="mr-1 h-4 w-4" />
                            <span className="hidden sm:inline">Back to Bookings</span>
                            <span className="sm:hidden">Back</span>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Booking #{booking.id}</h1>
                            <p className="text-sm text-gray-600 hidden sm:block">View and manage booking details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {booking.status === 'pending' && (
                            <Button onClick={markAsDone} className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
                                <CheckIcon className="mr-2 h-4 w-4" />
                                Mark as Done
                            </Button>
                        )}
                        <Button variant="destructive" onClick={deleteBooking} className="flex-1 sm:flex-none">
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Status and Created Date */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    {getStatusBadge(booking.status)}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        Created {format(new Date(booking.created_at), 'MMM dd, yyyy \'at\' HH:mm')}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                                <p className="text-lg font-medium">{booking.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email Address</label>
                                <div className="flex items-center gap-2">
                                    <MailIcon className="h-4 w-4 text-gray-400" />
                                    <a href={`mailto:${booking.email}`} className="text-blue-600 hover:underline">
                                        {booking.email}
                                    </a>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                                <div className="flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                                    <a href={`tel:${booking.phone}`} className="text-blue-600 hover:underline">
                                        {booking.phone}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PackageIcon className="h-5 w-5" />
                                Shipment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Item Description</label>
                                <p className="text-gray-900">{booking.item_description}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Pickup Location</label>
                                <div className="flex items-start gap-2">
                                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <p className="text-gray-900">{booking.pickup_location}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Delivery Location</label>
                                <div className="flex items-start gap-2">
                                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <p className="text-gray-900">{booking.delivery_location}</p>
                                </div>
                            </div>
                            {booking.additional_notes && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Additional Notes</label>
                                    <p className="text-gray-900 whitespace-pre-wrap">{booking.additional_notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Processing Information */}
                {(booking.processed_at || booking.processed_by) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Processing Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {booking.processed_at && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Processed At</label>
                                    <p className="text-gray-900">
                                        {format(new Date(booking.processed_at), 'MMM dd, yyyy \'at\' HH:mm')}
                                    </p>
                                </div>
                            )}
                            {booking.processed_by && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Processed By</label>
                                    <p className="text-gray-900">{booking.processed_by.name}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                        <CardDescription>Booking activity history</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Booking Created</p>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(booking.created_at), 'MMM dd, yyyy \'at\' HH:mm')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Booking request submitted
                                    </p>
                                </div>
                            </div>
                            
                            {booking.processed_at && (
                                <div className="flex items-start gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Booking Processed</p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(booking.processed_at), 'MMM dd, yyyy \'at\' HH:mm')}
                                        </p>
                                        {booking.processed_by && (
                                            <p className="text-sm text-gray-500">
                                                Processed by {booking.processed_by.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
