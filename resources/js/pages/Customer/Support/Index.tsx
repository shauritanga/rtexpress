import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Clock, HeadphonesIcon, MessageCircle, MessageSquare, Plus, Search, Star } from 'lucide-react';
import { useState } from 'react';

interface Customer {
    id: number;
    name: string;
    company_name: string;
    customer_code: string;
}

interface SupportTicket {
    id: number;
    ticket_number: string;
    subject: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    updated_at: string;
    replies_count?: number;
    assigned_to?: {
        name: string;
    };
}

interface SupportStats {
    total_tickets: number;
    open_tickets: number;
    resolved_tickets: number;
    avg_satisfaction: number;
}

interface Props {
    customer: Customer;
    tickets: {
        data: SupportTicket[];
        links: any[];
        meta: any;
    };
    stats: SupportStats;
    filters: {
        search?: string;
        status?: string;
        priority?: string;
    };
}

export default function SupportIndex({ customer, tickets, stats, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            open: { label: 'Open', variant: 'default' as const, icon: Clock },
            in_progress: { label: 'In Progress', variant: 'secondary' as const, icon: MessageSquare },
            resolved: { label: 'Resolved', variant: 'success' as const, icon: CheckCircle },
            closed: { label: 'Closed', variant: 'outline' as const, icon: CheckCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            low: { label: 'Low', className: 'bg-green-100 text-green-800' },
            medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
            high: { label: 'High', className: 'bg-orange-100 text-orange-800' },
            urgent: { label: 'Urgent', className: 'bg-red-100 text-red-800' },
        };

        const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;

        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Support Center" />

            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Support Center</h1>
                        <p className="mt-1 text-sm text-gray-600 sm:text-base">Get help and manage your support tickets</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/customer/support/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Ticket
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Tickets</p>
                                    <p className="text-2xl font-bold">{stats.total_tickets}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-100 p-2">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Open Tickets</p>
                                    <p className="text-2xl font-bold">{stats.open_tickets}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-100 p-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Resolved</p>
                                    <p className="text-2xl font-bold">{stats.resolved_tickets}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-yellow-100 p-2">
                                    <Star className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Satisfaction</p>
                                    <p className="text-2xl font-bold">{stats.avg_satisfaction}/5</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder="Search tickets..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tickets List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Support Tickets</CardTitle>
                        <CardDescription>View and manage your support requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tickets.data.length === 0 ? (
                            <div className="py-8 text-center">
                                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No tickets found</h3>
                                <p className="mb-4 text-gray-600">You haven't created any support tickets yet.</p>
                                <Button asChild>
                                    <Link href="/customer/support/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Ticket
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.data.map((ticket) => (
                                    <div key={ticket.id} className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Link
                                                        href={`/customer/support/${ticket.id}`}
                                                        className="font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        {ticket.ticket_number}
                                                    </Link>
                                                    {getStatusBadge(ticket.status)}
                                                    {getPriorityBadge(ticket.priority)}
                                                </div>
                                                <h4 className="mb-1 font-medium text-gray-900">{ticket.subject}</h4>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>Category: {ticket.category}</span>
                                                    <span>Created: {formatDate(ticket.created_at)}</span>
                                                    {ticket.assigned_to && <span>Assigned to: {ticket.assigned_to.name}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/customer/support/${ticket.id}`}>View Details</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
