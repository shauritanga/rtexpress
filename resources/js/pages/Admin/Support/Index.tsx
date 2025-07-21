import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    Search,
    Plus,
    HeadphonesIcon,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    Filter,
    TrendingUp,
    Users,
    Timer
} from 'lucide-react';

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
                    <AlertTriangle className="h-3 w-3 mr-1" />
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
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: AlertTriangle };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
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

        const config = priorityConfig[priority as keyof typeof priorityConfig] || 
                      { label: priority, color: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const handleSearch = () => {
        router.get(route('admin.support.index'), {
            search: searchTerm,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            priority: selectedPriority !== 'all' ? selectedPriority : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            assigned_to: selectedAgent !== 'all' ? selectedAgent : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedPriority('all');
        setSelectedCategory('all');
        setSelectedAgent('all');
        
        router.get(route('admin.support.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Customer Support" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customer Support</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">
                            Manage support tickets and customer inquiries
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button asChild className="w-full sm:w-auto">
                            <Link href="/admin/support/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Ticket
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                                    <p className="text-2xl font-bold">{stats.total_tickets}</p>
                                    <p className="text-xs text-muted-foreground">
                                        All time
                                    </p>
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
                                    <p className="text-xs text-orange-600">
                                        {stats.overdue_tickets} overdue
                                    </p>
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
                                    <p className="text-xs text-green-600">
                                        Great progress!
                                    </p>
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
                                    <p className="text-xs text-muted-foreground">
                                        Resolution: {stats.avg_resolution_time}h
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filter Tickets
                        </CardTitle>
                        <CardDescription>
                            Search and filter support tickets by various criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                        <Search className="h-4 w-4 mr-2" />
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

                {/* Tickets Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Support Tickets</CardTitle>
                        <CardDescription>
                            All customer support tickets and their current status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">Ticket</TableHead>
                                            <TableHead className="min-w-[200px]">Subject</TableHead>
                                            <TableHead className="min-w-[150px]">Customer</TableHead>
                                            <TableHead className="min-w-[100px]">Status</TableHead>
                                            <TableHead className="min-w-[100px]">Priority</TableHead>
                                            <TableHead className="min-w-[120px] hidden sm:table-cell">Assigned To</TableHead>
                                            <TableHead className="min-w-[100px] hidden md:table-cell">Created</TableHead>
                                            <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.data.length > 0 ? tickets.data.map((ticket) => (
                                            <TableRow key={ticket.id}>
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
                                                        <p className="font-medium line-clamp-2">{ticket.subject}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{ticket.customer.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {ticket.customer.email}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(ticket.status, ticket.is_overdue)}
                                                </TableCell>
                                                <TableCell>
                                                    {getPriorityBadge(ticket.priority)}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    {ticket.assigned_to ? (
                                                        <div className="flex items-center">
                                                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                                            <span className="text-sm">{ticket.assigned_to.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">Unassigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="text-sm">
                                                        {formatDate(ticket.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.support.show', ticket.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
                                <div className="text-sm text-muted-foreground text-center sm:text-left">
                                    Showing {tickets?.meta?.from || 0} to {tickets?.meta?.to || 0} of {tickets?.meta?.total || 0} tickets
                                </div>
                                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                                    {tickets?.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
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
