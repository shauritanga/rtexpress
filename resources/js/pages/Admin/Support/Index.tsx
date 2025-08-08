import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Archive,
    CheckCircle,
    CheckSquare,
    Clock,
    Eye,
    Filter,
    HeadphonesIcon,
    MoreHorizontal,
    PlayCircle,
    Plus,
    RotateCcw,
    Search,
    Timer,
    Trash2,
    TrendingUp,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Ticket {
    id: number;
    ticket_number: string;
    subject: string;
    status: string;
    priority: string;
    category: string;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    assigned_to?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
    is_overdue?: boolean;
}

interface Stats {
    total_tickets: number;
    open_tickets: number;
    overdue_tickets: number;
    resolved_today: number;
    avg_response_time: number;
    avg_resolution_time: number;
}

interface Agent {
    id: number;
    name: string;
}

interface Props {
    tickets: {
        data: Ticket[];
        meta: any;
        links: any[];
    };
    stats: Stats;
    agents: Agent[];
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        category?: string;
        assigned_to?: string;
    };
}

export default function SupportIndex({ tickets, stats, agents, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedAgent, setSelectedAgent] = useState(filters.assigned_to || 'all');
    const [processingTicket, setProcessingTicket] = useState<number | null>(null);
    const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
    const [showArchived, setShowArchived] = useState(false);

    // Quick action handlers
    const handleQuickStatusChange = (ticketId: number, newStatus: string) => {
        setProcessingTicket(ticketId);
        router.post(
            route('admin.support.status', ticketId),
            {
                status: newStatus,
            },
            {
                onFinish: () => setProcessingTicket(null),
            },
        );
    };

    const handleQuickAssign = (ticketId: number, agentId: string) => {
        setProcessingTicket(ticketId);
        router.post(
            route('admin.support.assign', ticketId),
            {
                assigned_to: agentId || null,
            },
            {
                onFinish: () => setProcessingTicket(null),
            },
        );
    };

    const handleArchive = (ticketId: number) => {
        setProcessingTicket(ticketId);
        router.post(
            route('admin.support.archive', ticketId),
            {},
            {
                onFinish: () => setProcessingTicket(null),
            },
        );
    };

    const handleDelete = (ticketId: number) => {
        if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            setProcessingTicket(ticketId);
            router.delete(route('admin.support.destroy', ticketId), {
                onFinish: () => setProcessingTicket(null),
            });
        }
    };

    const handleRestore = (ticketId: number) => {
        setProcessingTicket(ticketId);
        router.post(
            route('admin.support.restore', ticketId),
            {},
            {
                onFinish: () => setProcessingTicket(null),
            },
        );
    };

    const handleBulkAction = (action: string) => {
        if (selectedTickets.length === 0) {
            alert('Please select tickets first');
            return;
        }

        if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedTickets.length} tickets? This action cannot be undone.`)) {
            return;
        }

        router.post(
            route('admin.support.bulk-action'),
            {
                action,
                ticket_ids: selectedTickets,
            },
            {
                onSuccess: () => {
                    setSelectedTickets([]);
                },
            },
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTickets(tickets.data.map((ticket) => ticket.id));
        } else {
            setSelectedTickets([]);
        }
    };

    const handleSelectTicket = (ticketId: number, checked: boolean) => {
        if (checked) {
            setSelectedTickets([...selectedTickets, ticketId]);
        } else {
            setSelectedTickets(selectedTickets.filter((id) => id !== ticketId));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string, isOverdue: boolean = false) => {
        if (isOverdue) {
            return (
                <Badge variant="destructive" className="flex items-center">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Overdue
                </Badge>
            );
        }

        const statusConfig = {
            open: { label: 'Open', variant: 'default' as const, icon: Clock },
            in_progress: { label: 'In Progress', variant: 'default' as const, icon: Timer },
            waiting_customer: { label: 'Waiting Customer', variant: 'secondary' as const, icon: Clock },
            resolved: { label: 'Resolved', variant: 'success' as const, icon: CheckCircle },
            closed: { label: 'Closed', variant: 'secondary' as const, icon: XCircle },
            archived: { label: 'Archived', variant: 'outline' as const, icon: Archive },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const, icon: AlertTriangle };

        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
            medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
            high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
            urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
        };

        const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'bg-gray-100 text-gray-800' };

        return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>{config.label}</span>;
    };

    const handleSearch = () => {
        router.get(
            route('admin.support.index'),
            {
                search: searchTerm,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                assigned_to: selectedAgent !== 'all' ? selectedAgent : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedPriority('all');
        setSelectedCategory('all');
        setSelectedAgent('all');

        router.get(
            route('admin.support.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Customer Support" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Customer Support</h1>
                        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Manage support tickets and customer inquiries</p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/support/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Ticket
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                                    <p className="text-2xl font-bold">{stats.total_tickets}</p>
                                    <p className="text-xs text-muted-foreground">All time</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                                    <p className="text-2xl font-bold">{stats.open_tickets}</p>
                                    <p className="text-xs text-orange-600">{stats.overdue_tickets} overdue</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                                    <p className="text-2xl font-bold">{stats.resolved_today}</p>
                                    <p className="text-xs text-green-600">Great progress!</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                                    <p className="text-2xl font-bold">{stats.avg_response_time}h</p>
                                    <p className="text-xs text-muted-foreground">Resolution: {stats.avg_resolution_time}h</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="mr-2 h-5 w-5" />
                            Filter Tickets
                        </CardTitle>
                        <CardDescription>Search and filter support tickets by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Ticket number, subject, customer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="waiting_customer">Waiting Customer</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Agent</label>
                                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All agents" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Agents</SelectItem>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id.toString()}>
                                                {agent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                <label className="text-sm font-medium">Actions</label>
                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                    <Button onClick={handleSearch} className="flex-1">
                                        <Search className="mr-2 h-4 w-4" />
                                        Search
                                    </Button>
                                    <Button variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-none">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedTickets.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <CheckSquare className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">
                                        {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('archive')}
                                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                    >
                                        <Archive className="mr-2 h-4 w-4" />
                                        Archive
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkAction('delete')}
                                        className="border-red-300 text-red-700 hover:bg-red-100"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedTickets([])}>
                                        Clear Selection
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tickets Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Support Tickets</CardTitle>
                        <CardDescription>All customer support tickets and their current status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-md border">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectedTickets.length === tickets.data.length && tickets.data.length > 0}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead className="min-w-[150px]">Ticket</TableHead>
                                            <TableHead className="min-w-[200px]">Subject</TableHead>
                                            <TableHead className="min-w-[150px]">Customer</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[100px]">Priority</TableHead>
                                            <TableHead className="hidden min-w-[120px] sm:table-cell">Assigned To</TableHead>
                                            <TableHead className="hidden min-w-[100px] md:table-cell">Created</TableHead>
                                            <TableHead className="min-w-[80px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.data.length > 0 ? (
                                            tickets.data.map((ticket) => (
                                                <TableRow key={ticket.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedTickets.includes(ticket.id)}
                                                            onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{ticket.ticket_number}</p>
                                                            <p className="text-sm text-muted-foreground capitalize">
                                                                {ticket.category.replace('_', ' ')}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="line-clamp-2 font-medium">{ticket.subject}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{ticket.customer.name}</p>
                                                            <p className="text-sm text-muted-foreground">{ticket.customer.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(ticket.status, ticket.is_overdue)}</TableCell>
                                                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">
                                                        {ticket.assigned_to ? (
                                                            <div className="flex items-center">
                                                                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm">{ticket.assigned_to.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">Unassigned</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <div className="text-sm">{formatDate(ticket.created_at)}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={route('admin.support.show', ticket.id)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" disabled={processingTicket === ticket.id}>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {/* Quick Status Changes */}
                                                                    {ticket.status !== 'in_progress' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleQuickStatusChange(ticket.id, 'in_progress')}
                                                                            disabled={processingTicket === ticket.id}
                                                                        >
                                                                            <PlayCircle className="mr-2 h-4 w-4" />
                                                                            Mark In Progress
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {ticket.status !== 'resolved' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleQuickStatusChange(ticket.id, 'resolved')}
                                                                            disabled={processingTicket === ticket.id}
                                                                            className="text-green-600 focus:text-green-600"
                                                                        >
                                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                                            Mark Resolved
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {/* Quick Assignment */}
                                                                    {!ticket.assigned_to && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleQuickAssign(ticket.id, '101')}
                                                                            disabled={processingTicket === ticket.id}
                                                                        >
                                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                                            Assign to Me
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {/* Management Actions */}
                                                                    {ticket.status !== 'archived' ? (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleArchive(ticket.id)}
                                                                            disabled={processingTicket === ticket.id}
                                                                            className="text-orange-600 focus:text-orange-600"
                                                                        >
                                                                            <Archive className="mr-2 h-4 w-4" />
                                                                            Archive
                                                                        </DropdownMenuItem>
                                                                    ) : (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleRestore(ticket.id)}
                                                                            disabled={processingTicket === ticket.id}
                                                                            className="text-blue-600 focus:text-blue-600"
                                                                        >
                                                                            <RotateCcw className="mr-2 h-4 w-4" />
                                                                            Restore
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(ticket.id)}
                                                                        disabled={processingTicket === ticket.id}
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                                    No support tickets found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {tickets?.meta?.last_page > 1 && (
                            <div className="flex flex-col space-y-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <div className="text-center text-sm text-muted-foreground sm:text-left">
                                    Showing {tickets?.meta?.from || 0} to {tickets?.meta?.to || 0} of {tickets?.meta?.total || 0} tickets
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                                    {tickets?.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className="min-w-[40px]"
                                        />
                                    )) || []}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
