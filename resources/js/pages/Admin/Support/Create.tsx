import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, HeadphonesIcon, Plus } from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    contact_person: string;
    email: string;
    customer_code: string;
}

interface Props {
    customers: Customer[];
}

export default function SupportCreate({ customers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        subject: '',
        description: '',
        priority: 'medium',
        category: 'general',
        source: 'web',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.support.store'));
    };

    const priorityOptions = [
        { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
        { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
    ];

    const categoryOptions = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'shipping', label: 'Shipping & Tracking' },
        { value: 'billing', label: 'Billing & Payments' },
        { value: 'technical', label: 'Technical Support' },
        { value: 'complaint', label: 'Complaint' },
        { value: 'feature_request', label: 'Feature Request' },
    ];

    const sourceOptions = [
        { value: 'web', label: 'Web Portal' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone Call' },
        { value: 'chat', label: 'Live Chat' },
    ];

    return (
        <AppLayout>
            <Head title="Create Support Ticket" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.support.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Support
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Support Ticket</h1>
                            <p className="text-gray-600">Create a new support ticket on behalf of a customer</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Admin Support</span>
                    </div>
                </div>

                {/* Create Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ticket Details</CardTitle>
                        <CardDescription>Fill in the details below to create a new support ticket</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Customer Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="customer_id">Customer *</Label>
                                    <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{customer.company_name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {customer.contact_person} • {customer.email}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && <p className="text-sm text-red-600">{errors.customer_id}</p>}
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorityOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${option.color}`}>
                                                            {option.label}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                                </div>

                                {/* Source */}
                                <div className="space-y-2">
                                    <Label htmlFor="source">Source</Label>
                                    <Select value={data.source} onValueChange={(value) => setData('source', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sourceOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.source && <p className="text-sm text-red-600">{errors.source}</p>}
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="Enter ticket subject"
                                    className="w-full"
                                />
                                {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the issue or request in detail..."
                                    rows={6}
                                    className="w-full"
                                />
                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end space-x-4 border-t pt-6">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.support.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Ticket'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
