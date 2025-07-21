import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    ArrowLeft,
    AlertCircle,
    HelpCircle,
    Package,
    CreditCard,
    Settings,
    Bug,
    MessageSquare,
    Lightbulb
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    company_name: string;
    customer_code: string;
}

interface Props {
    customer: Customer;
}

interface FormData {
    subject: string;
    description: string;
    priority: string;
    category: string;
    related_shipment: string;
}

export default function SupportCreate({ customer }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        subject: '',
        description: '',
        priority: 'medium',
        category: 'general',
        related_shipment: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer/support');
    };

    const categories = [
        { value: 'general', label: 'General Inquiry', icon: HelpCircle, description: 'General questions and information' },
        { value: 'shipping', label: 'Shipping & Tracking', icon: Package, description: 'Issues with shipments and tracking' },
        { value: 'billing', label: 'Billing & Payments', icon: CreditCard, description: 'Invoice and payment related issues' },
        { value: 'technical', label: 'Technical Support', icon: Bug, description: 'Website or system technical issues' },
        { value: 'complaint', label: 'Complaint', icon: AlertCircle, description: 'Service complaints and issues' },
        { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, description: 'Suggestions for new features' },
    ];

    const priorities = [
        { value: 'low', label: 'Low', description: 'General questions, non-urgent matters' },
        { value: 'medium', label: 'Medium', description: 'Standard business inquiries' },
        { value: 'high', label: 'High', description: 'Important issues affecting operations' },
        { value: 'urgent', label: 'Urgent', description: 'Critical issues requiring immediate attention' },
    ];

    const getCategoryIcon = (category: string) => {
        const categoryData = categories.find(cat => cat.value === category);
        const Icon = categoryData?.icon || HelpCircle;
        return <Icon className="h-4 w-4" />;
    };

    return (
        <AppLayout>
            <Head title="Create Support Ticket" />
            
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/customer/support">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Support
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Support Ticket</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Describe your issue and we'll help you resolve it
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Details</CardTitle>
                                <CardDescription>
                                    Please provide as much detail as possible to help us assist you better
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Subject */}
                                    <div>
                                        <Label htmlFor="subject">Subject *</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            placeholder="Brief description of your issue"
                                            className={errors.subject ? 'border-red-500' : ''}
                                        />
                                        {errors.subject && (
                                            <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.value} value={category.value}>
                                                        <div className="flex items-center gap-2">
                                                            <category.icon className="h-4 w-4" />
                                                            {category.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                                        )}
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <Label htmlFor="priority">Priority *</Label>
                                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorities.map((priority) => (
                                                    <SelectItem key={priority.value} value={priority.value}>
                                                        <div>
                                                            <div className="font-medium">{priority.label}</div>
                                                            <div className="text-xs text-gray-500">{priority.description}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.priority && (
                                            <p className="text-sm text-red-600 mt-1">{errors.priority}</p>
                                        )}
                                    </div>

                                    {/* Related Shipment */}
                                    <div>
                                        <Label htmlFor="related_shipment">Related Shipment (Optional)</Label>
                                        <Input
                                            id="related_shipment"
                                            value={data.related_shipment}
                                            onChange={(e) => setData('related_shipment', e.target.value)}
                                            placeholder="Enter tracking number if related to a shipment"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            If your issue is related to a specific shipment, please provide the tracking number
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Please describe your issue in detail. Include any error messages, steps you've taken, and what you expected to happen."
                                            rows={6}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            The more details you provide, the faster we can help resolve your issue
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating...' : 'Create Ticket'}
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href="/customer/support">Cancel</Link>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Tips for Better Support</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium">Be specific</p>
                                        <p className="text-xs text-gray-600">Include exact error messages and steps to reproduce</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium">Include context</p>
                                        <p className="text-xs text-gray-600">Mention what you were trying to accomplish</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium">Check Help Center first</p>
                                        <p className="text-xs text-gray-600">Many common issues have quick solutions</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Need Help Now?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/customer/help">
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        Browse Help Center
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/customer/help/search">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Search FAQ
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Other Ways to Reach Us</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium">Email Support</p>
                                    <p className="text-gray-600">support@rtexpress.com</p>
                                </div>
                                <div>
                                    <p className="font-medium">Phone Support</p>
                                    <p className="text-gray-600">+1 (555) 123-4567</p>
                                    <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
