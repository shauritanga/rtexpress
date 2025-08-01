import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    ArrowLeft,
    MessageSquare,
    User,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Send,
    UserCheck,
    Star
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    email: string;
    customer_code: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface SupportMessage {
    id: number;
    message: string;
    sender_type: string;
    sender_name: string;
    created_at: string;
    attachments?: any[];
}

interface SupportTicket {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    priority: string;
    status: string;
    category: string;
    created_at: string;
    updated_at: string;
    resolved_at?: string;
    customer: Customer;
    assigned_to?: User;
    messages: SupportMessage[];
    rating?: number;
    feedback?: string;
}

interface Props {
    ticket: SupportTicket;
    users: User[];
}

export default function SupportShow({ ticket, users }: Props) {
    const [isReplying, setIsReplying] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
        status: ticket.status,
        priority: ticket.priority,
        assigned_to: ticket.assigned_to?.id?.toString() || '',
    });

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            open: { label: 'Open', variant: 'default' as const, icon: MessageSquare },
            in_progress: { label: 'In Progress', variant: 'default' as const, icon: Clock },
            resolved: { label: 'Resolved', variant: 'success' as const, icon: CheckCircle },
            closed: { label: 'Closed', variant: 'secondary' as const, icon: XCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: MessageSquare };
        
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

    const getCategoryBadge = (category: string) => {
        const colors = {
            technical: 'bg-purple-100 text-purple-800',
            billing: 'bg-green-100 text-green-800',
            shipping: 'bg-blue-100 text-blue-800',
            general: 'bg-gray-100 text-gray-800',
        };

        const color = colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
        
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
        );
    };

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.support.reply', ticket.id), {
            onSuccess: () => {
                reset('message');
                setIsReplying(false);
            },
        });
    };

    const handleStatusUpdate = (newStatus: string) => {
        post(route('admin.support.status', ticket.id), {
            status: newStatus,
        });
    };

    const handlePriorityUpdate = (newPriority: string) => {
        post(route('admin.support.priority', ticket.id), {
            priority: newPriority,
        });
    };

    const handleAssignment = (userId: string) => {
        post(route('admin.support.assign', ticket.id), {
            assigned_to: userId || null,
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <AppLayout>
            <Head title={`Ticket ${ticket.ticket_number}`} />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/support">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Support
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                {ticket.ticket_number}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                {ticket.subject}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsReplying(!isReplying)}
                            className="w-full sm:w-auto"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Reply
                        </Button>
                    </div>
                </div>

                {/* Status and Info Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(ticket.status)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                                    <div className="mt-1">
                                        {getPriorityBadge(ticket.priority)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                                    <div className="mt-1">
                                        {getCategoryBadge(ticket.category)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="text-sm font-medium">
                                        {formatDateTime(ticket.created_at)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Ticket Details and Messages */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Original Ticket */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Original Request</span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDateTime(ticket.created_at)}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">From</p>
                                        <p className="font-medium">{ticket.customer.name}</p>
                                        <p className="text-sm text-muted-foreground">{ticket.customer.email}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                                        <div className="mt-2 p-3 bg-muted rounded-md">
                                            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Messages */}
                        {ticket.messages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Conversation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {ticket.messages.map((message, index) => (
                                            <div key={message.id} className="flex space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        message.sender_type === 'customer' ? 'bg-blue-100' : 'bg-green-100'
                                                    }`}>
                                                        <User className={`h-4 w-4 ${
                                                            message.sender_type === 'customer' ? 'text-blue-600' : 'text-green-600'
                                                        }`} />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-sm font-medium">{message.sender_name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDateTime(message.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1 p-3 bg-muted rounded-md">
                                                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reply Form */}
                        {isReplying && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reply to Ticket</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleReply} className="space-y-4">
                                        <div>
                                            <Textarea
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                placeholder="Type your reply..."
                                                rows={6}
                                                required
                                            />
                                            {errors.message && (
                                                <p className="text-sm text-red-600 mt-1">{errors.message}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsReplying(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                <Send className="h-4 w-4 mr-2" />
                                                {processing ? 'Sending...' : 'Send Reply'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Customer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="font-medium">{ticket.customer.name}</p>
                                    <p className="text-sm text-muted-foreground">{ticket.customer.customer_code}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="text-sm">{ticket.customer.email}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assignment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <UserCheck className="h-5 w-5 mr-2" />
                                    Assignment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select 
                                    value={data.assigned_to} 
                                    onValueChange={(value) => {
                                        setData('assigned_to', value);
                                        handleAssignment(value);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Assign to agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Unassigned</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Status</p>
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(value) => {
                                            setData('status', value);
                                            handleStatusUpdate(value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <p className="text-sm font-medium mb-2">Priority</p>
                                    <Select 
                                        value={data.priority} 
                                        onValueChange={(value) => {
                                            setData('priority', value);
                                            handlePriorityUpdate(value);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rating */}
                        {ticket.rating && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Star className="h-5 w-5 mr-2" />
                                        Customer Rating
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-1">
                                            {renderStars(ticket.rating)}
                                            <span className="text-sm text-muted-foreground ml-2">
                                                {ticket.rating}/5
                                            </span>
                                        </div>
                                        {ticket.feedback && (
                                            <div className="mt-2 p-2 bg-muted rounded-md">
                                                <p className="text-sm">{ticket.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
