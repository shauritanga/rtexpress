import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, CheckIcon, EyeIcon, SearchIcon, TrashIcon } from 'lucide-react';
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

interface BookingStats {
    total_today: number;
    pending_today: number;
    done_today: number;
    total_all: number;
}

interface Props {
    bookings?: {
        data: ShipmentRequest[];
        links: any[];
        meta: any;
    };
    stats?: BookingStats;
    filters?: {
        filter?: string;
        status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function BookingsIndex(props: Props) {
    // Debug logging
    console.log('BookingsIndex props:', props);

    // Safely extract props with defaults
    const bookings = props.bookings || { data: [], links: [], meta: { total: 0, from: 0, to: 0, last_page: 1 } };
    const stats = props.stats || { total_today: 0, pending_today: 0, done_today: 0, total_all: 0 };
    const filters = props.filters || {};

    // Ensure filters is always an object with safe string values
    const safeFilters = filters;

    const [searchTerm, setSearchTerm] = useState(() => {
        const value = safeFilters.search;
        return typeof value === 'string' ? value : '';
    });
    const [selectedFilter, setSelectedFilter] = useState(() => {
        const value = safeFilters.filter;
        return typeof value === 'string' ? value : 'today';
    });
    const [selectedStatus, setSelectedStatus] = useState(() => {
        const value = safeFilters.status;
        return typeof value === 'string' ? value : 'all';
    });
    const [dateFrom, setDateFrom] = useState(() => {
        const value = safeFilters.date_from;
        return typeof value === 'string' ? value : '';
    });
    const [dateTo, setDateTo] = useState(() => {
        const value = safeFilters.date_to;
        return typeof value === 'string' ? value : '';
    });

    const handleSearch = () => {
        try {
            router.get('/admin/bookings', {
                search: searchTerm,
                filter: selectedFilter,
                status: selectedStatus,
                date_from: dateFrom,
                date_to: dateTo,
            });
        } catch (error) {
            console.error('Error in handleSearch:', error);
        }
    };

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        try {
            router.get('/admin/bookings', {
                search: searchTerm,
                filter: filter,
                status: selectedStatus,
            });
        } catch (error) {
            console.error('Error in handleFilterChange:', error);
        }
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        try {
            router.get('/admin/bookings', {
                search: searchTerm,
                filter: selectedFilter,
                status: status,
                date_from: dateFrom,
                date_to: dateTo,
            });
        } catch (error) {
            console.error('Error in handleStatusChange:', error);
        }
    };

    const markAsDone = (bookingId: number) => {
        if (confirm('Are you sure you want to mark this booking as done?')) {
            try {
                router.post(`/admin/bookings/${bookingId}/mark-done`);
            } catch (error) {
                console.error('Error in markAsDone:', error);
            }
        }
    };

    const deleteBooking = (bookingId: number) => {
        if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
            try {
                router.delete(`/admin/bookings/${bookingId}`);
            } catch (error) {
                console.error('Error in deleteBooking:', error);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'done':
                return <Badge variant="default">Done</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };



    return (
        <AppLayout>
            <Head title="Booking Management" />

            <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
                {/* Header - Mobile First */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bookings</h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                        Manage shipment requests
                    </p>
                </div>

                {/* Statistics Cards - Mobile First */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{stats?.total_today || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold text-orange-600">{stats?.pending_today || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Done</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold text-green-600">{stats?.done_today || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg sm:text-2xl font-bold">{stats?.total_all || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Filter and search bookings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Quick Filters */}
                        <Tabs value={selectedFilter} onValueChange={handleFilterChange}>
                            <TabsList>
                                <TabsTrigger value="today">Today</TabsTrigger>
                                <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                                <TabsTrigger value="this_week">This Week</TabsTrigger>
                                <TabsTrigger value="this_month">This Month</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="done">Done</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Search and Status Filter - Mobile First */}
                        <div className="space-y-3">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search bookings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleSearch} className="px-4">
                                    <SearchIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Date Range Filter */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">From Date</label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">To Date</label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" onClick={handleSearch}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Apply Date Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings ({bookings?.meta?.total || 0})</CardTitle>
                        <CardDescription>
                            Showing {bookings?.meta?.from || 0} to {bookings?.meta?.to || 0} of {bookings?.meta?.total || 0} bookings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile-First Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead className="hidden sm:table-cell">Contact</TableHead>
                                        <TableHead className="hidden md:table-cell">Pickup</TableHead>
                                        <TableHead className="hidden md:table-cell">Delivery</TableHead>
                                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                                        <TableHead className="hidden lg:table-cell">Created</TableHead>
                                        <TableHead className="w-20">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!bookings?.data || bookings.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="text-gray-500">
                                                    <p className="text-lg font-medium">No bookings found</p>
                                                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bookings.data?.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium text-xs sm:text-sm">#{booking.id}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-sm">{booking.name}</div>
                                                        <div className="text-xs text-gray-500 sm:hidden">{booking.phone}</div>
                                                        <div className="text-xs text-gray-500">{booking.email}</div>
                                                        <div className="text-xs text-gray-500 sm:hidden mt-1">
                                                            <div className="truncate max-w-32" title={booking.pickup_location}>
                                                                📍 {booking.pickup_location}
                                                            </div>
                                                            <div className="truncate max-w-32" title={booking.delivery_location}>
                                                                📍 {booking.delivery_location}
                                                            </div>
                                                        </div>
                                                        <div className="sm:hidden mt-1">
                                                            {getStatusBadge(booking.status)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <div className="text-sm">{booking.phone}</div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="max-w-32 truncate text-sm" title={booking.pickup_location}>
                                                        {booking.pickup_location}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="max-w-32 truncate text-sm" title={booking.delivery_location}>
                                                        {booking.delivery_location}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">{getStatusBadge(booking.status)}</TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <div className="text-sm">
                                                        {format(new Date(booking.created_at), 'MMM dd')}
                                                        <div className="text-xs text-gray-500">
                                                            {format(new Date(booking.created_at), 'HH:mm')}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={`/admin/bookings/${booking.id}`}
                                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7"
                                                        >
                                                            <EyeIcon className="h-3 w-3" />
                                                        </Link>
                                                        {booking.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => markAsDone(booking.id)}
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <CheckIcon className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => deleteBooking(booking.id)}
                                                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                                        >
                                                            <TrashIcon className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {bookings?.meta?.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {bookings?.meta?.from || 0} to {bookings?.meta?.to || 0} of {bookings?.meta?.total || 0} results
                                </div>
                                <div className="flex items-center gap-2">
                                    {bookings?.links?.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-md ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
