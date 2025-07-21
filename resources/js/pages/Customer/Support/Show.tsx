import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft,
    Clock,
    CheckCircle,
    MessageSquare,
    User,
    Calendar,
    Tag,
    AlertTriangle,
    Star,
    Send
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    company_name: string;
    customer_code: string;
}

interface TicketReply {
    id: number;
    message: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
    customer?: {
        id: number;
        name: string;
    };
    is_internal: boolean;
}

interface SupportTicket {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    updated_at: string;
    resolved_at?: string;
    satisfaction_rating?: number;
    satisfaction_feedback?: string;
    customer: Customer;
    assigned_to?: {
        id: number;
        name: string;
    };
    replies: TicketReply[];
}

interface Props {
    customer: Customer;
    ticket: SupportTicket;
}

export default function SupportShow({ customer, ticket }: Props) {
    const [showSatisfactionForm, setShowSatisfactionForm] = useState(false);
    const [rating, setRating] = useState(0);
    
    const { data, setData, post, processing } = useForm({
        message: '',
    });

    const { data: satisfactionData, setData: setSatisfactionData, post: postSatisfaction, processing: processingSatisfaction } = useForm({
        rating: 0,
        feedback: '',
    });

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/customer/support/${ticket.id}/reply`, {
            onSuccess: () => {
                setData('message', '');
            }
        });
    };

    const handleSatisfactionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postSatisfaction(`/customer/support/${ticket.id}/satisfaction`, {
            onSuccess: () => {
                setShowSatisfactionForm(false);
            }
        });
    };

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

        return (
            <Badge className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (currentRating: number, interactive: boolean = false) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-5 w-5 ${
                            star <= currentRating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
                        onClick={interactive ? () => setSatisfactionData('rating', star) : undefined}
                    />
                ))}
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title={`Ticket ${ticket.ticket_number}`} />
            
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/customer/support">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Support
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {ticket.ticket_number}
                            </h1>
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                        </div>
                        <p className="text-gray-600">{ticket.subject}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Original Message */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <Avatar>
                                        <AvatarFallback>
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{ticket.customer.name}</span>
                                            <Badge variant="outline">Customer</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{formatDate(ticket.created_at)}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Replies */}
                        {ticket.replies.map((reply) => (
                            <Card key={reply.id}>
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {reply.user ? reply.user.name : reply.customer?.name}
                                                </span>
                                                <Badge variant={reply.user ? 'default' : 'outline'}>
                                                    {reply.user ? 'Support Agent' : 'Customer'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{formatDate(reply.created_at)}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm max-w-none">
                                        <p className="whitespace-pre-wrap">{reply.message}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Reply Form */}
                        {ticket.status !== 'closed' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Add Reply</CardTitle>
                                    <CardDescription>
                                        Continue the conversation with our support team
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleReply} className="space-y-4">
                                        <Textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Type your message here..."
                                            rows={4}
                                            required
                                        />
                                        <Button type="submit" disabled={processing}>
                                            <Send className="h-4 w-4 mr-2" />
                                            {processing ? 'Sending...' : 'Send Reply'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Satisfaction Rating */}
                        {ticket.status === 'resolved' && !ticket.satisfaction_rating && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rate Your Experience</CardTitle>
                                    <CardDescription>
                                        Help us improve by rating the support you received
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!showSatisfactionForm ? (
                                        <Button onClick={() => setShowSatisfactionForm(true)}>
                                            <Star className="h-4 w-4 mr-2" />
                                            Rate Support
                                        </Button>
                                    ) : (
                                        <form onSubmit={handleSatisfactionSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    How satisfied are you with the support?
                                                </label>
                                                {renderStars(satisfactionData.rating, true)}
                                            </div>
                                            <Textarea
                                                value={satisfactionData.feedback}
                                                onChange={(e) => setSatisfactionData('feedback', e.target.value)}
                                                placeholder="Optional: Tell us more about your experience"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <Button type="submit" disabled={processingSatisfaction || satisfactionData.rating === 0}>
                                                    {processingSatisfaction ? 'Submitting...' : 'Submit Rating'}
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    onClick={() => setShowSatisfactionForm(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Existing Rating */}
                        {ticket.satisfaction_rating && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Rating</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {renderStars(ticket.satisfaction_rating)}
                                        {ticket.satisfaction_feedback && (
                                            <p className="text-sm text-gray-600 italic">
                                                "{ticket.satisfaction_feedback}"
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Ticket Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Created</p>
                                        <p className="text-sm text-gray-600">{formatDate(ticket.created_at)}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Category</p>
                                        <p className="text-sm text-gray-600 capitalize">{ticket.category.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                {ticket.assigned_to && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">Assigned to</p>
                                            <p className="text-sm text-gray-600">{ticket.assigned_to.name}</p>
                                        </div>
                                    </div>
                                )}

                                {ticket.resolved_at && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium">Resolved</p>
                                            <p className="text-sm text-gray-600">{formatDate(ticket.resolved_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Help Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Need More Help?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/customer/help">
                                        Browse Help Center
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/customer/support/create">
                                        Create New Ticket
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
