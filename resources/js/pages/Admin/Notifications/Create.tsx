import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    ArrowLeft,
    Send,
    Bell,
    Mail,
    MessageSquare,
    Monitor,
    User,
    Calendar,
    AlertTriangle
} from 'lucide-react';

interface NotificationTemplate {
    id: number;
    template_code: string;
    name: string;
    description: string;
    type: string;
    channel: string;
    subject?: string;
    content: string;
    variables: string[];
}

interface Props {
    templates: NotificationTemplate[];
}

export default function NotificationCreate({ templates }: Props) {
    const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
    const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
    const [recipients, setRecipients] = useState<any[]>([]);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [recipientSearch, setRecipientSearch] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        type: '',
        channel: '',
        recipient_type: '',
        recipient_id: '',
        recipient_email: '',
        recipient_phone: '',
        title: '',
        message: '',
        priority: 'medium',
        scheduled_at: '',
        template: '',
        data: {},
    });

    // Load recipients when recipient type changes (with debounce for search)
    useEffect(() => {
        if (data.recipient_type) {
            const timeoutId = setTimeout(() => {
                loadRecipients();
            }, 300); // 300ms debounce

            return () => clearTimeout(timeoutId);
        } else {
            setRecipients([]);
        }
    }, [data.recipient_type, recipientSearch]);

    const loadRecipients = async () => {
        if (!data.recipient_type) return;

        setLoadingRecipients(true);

        try {
            const params = new URLSearchParams({
                type: data.recipient_type,
                search: recipientSearch
            });

            const url = `/admin/notifications/recipients?${params.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const recipientData = await response.json();
            setRecipients(Array.isArray(recipientData) ? recipientData : []);
        } catch (error) {
            console.error('Failed to load recipients:', error);
            setRecipients([]);
        } finally {
            setLoadingRecipients(false);
        }
    };

    // Handle recipient selection
    const handleRecipientSelect = (recipientId: string) => {
        const selectedRecipient = recipients.find(r => r.id.toString() === recipientId);
        if (selectedRecipient) {
            setData({
                ...data,
                recipient_id: recipientId,
                recipient_email: selectedRecipient.email || '',
                recipient_phone: selectedRecipient.phone || '',
            });
        }
    };

    // Handle recipient type change
    const handleRecipientTypeChange = (type: string) => {
        setData({
            ...data,
            recipient_type: type,
            recipient_id: '',
            recipient_email: '',
            recipient_phone: '',
        });
        setRecipientSearch('');
    };

    const getChannelIcon = (channel: string) => {
        const icons = {
            email: Mail,
            sms: MessageSquare,
            push: Bell,
            in_app: Monitor,
        };

        const IconComponent = icons[channel as keyof typeof icons] || Bell;
        return <IconComponent className="h-4 w-4" />;
    };

    const handleTemplateSelect = (templateCode: string) => {
        const template = templates.find(t => t.template_code === templateCode);
        if (template) {
            setSelectedTemplate(template);
            setData({
                ...data,
                type: template.type,
                channel: template.channel,
                title: template.subject || '',
                message: template.content,
                template: templateCode,
            });

            // Initialize template variables
            const variables: Record<string, string> = {};
            template.variables.forEach(variable => {
                variables[variable] = '';
            });
            setTemplateVariables(variables);
        }
    };

    const handleVariableChange = (variable: string, value: string) => {
        setTemplateVariables(prev => ({
            ...prev,
            [variable]: value,
        }));
    };

    const renderMessagePreview = () => {
        if (!selectedTemplate) return data.message;

        let preview = data.message;
        Object.entries(templateVariables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            preview = preview.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
        });
        return preview;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = {
            ...data,
            data: selectedTemplate ? templateVariables : data.data,
        };

        post(route('admin.notifications.store'), {
            data: submitData,
        });
    };

    return (
        <AppLayout>
            <Head title="Send Notification" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/notifications">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Notifications
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Send Notification
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Create and send a new notification
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        {/* Notification Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bell className="h-5 w-5 mr-2" />
                                    Notification Details
                                </CardTitle>
                                <CardDescription>
                                    Configure the notification content and delivery settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Template Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="template">Template (Optional)</Label>
                                    <Select value={data.template} onValueChange={handleTemplateSelect}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a template or create custom" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">Custom Notification</SelectItem>
                                            {templates.map((template) => (
                                                <SelectItem key={template.id} value={template.template_code}>
                                                    <div className="flex items-center space-x-2">
                                                        {getChannelIcon(template.channel)}
                                                        <span>{template.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.template && (
                                        <p className="text-sm text-red-600">{errors.template}</p>
                                    )}
                                </div>

                                {/* Notification Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select 
                                        value={data.type} 
                                        onValueChange={(value) => setData('type', value)}
                                        disabled={!!selectedTemplate}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select notification type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="shipment_update">Shipment Update</SelectItem>
                                            <SelectItem value="payment_received">Payment Received</SelectItem>
                                            <SelectItem value="delivery_scheduled">Delivery Scheduled</SelectItem>
                                            <SelectItem value="support_ticket_update">Support Ticket Update</SelectItem>
                                            <SelectItem value="system_maintenance">System Maintenance</SelectItem>
                                            <SelectItem value="security_alert">Security Alert</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-red-600">{errors.type}</p>
                                    )}
                                </div>

                                {/* Channel */}
                                <div className="space-y-2">
                                    <Label htmlFor="channel">Channel</Label>
                                    <Select 
                                        value={data.channel} 
                                        onValueChange={(value) => setData('channel', value)}
                                        disabled={!!selectedTemplate}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select delivery channel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="email">
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4" />
                                                    <span>Email</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="sms">
                                                <div className="flex items-center space-x-2">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span>SMS</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="push">
                                                <div className="flex items-center space-x-2">
                                                    <Bell className="h-4 w-4" />
                                                    <span>Push</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="in_app">
                                                <div className="flex items-center space-x-2">
                                                    <Monitor className="h-4 w-4" />
                                                    <span>In-App</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.channel && (
                                        <p className="text-sm text-red-600">{errors.channel}</p>
                                    )}
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select 
                                        value={data.priority} 
                                        onValueChange={(value) => setData('priority', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">
                                                <div className="flex items-center space-x-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                    <span>Urgent</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && (
                                        <p className="text-sm text-red-600">{errors.priority}</p>
                                    )}
                                </div>

                                {/* Scheduled At */}
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_at">Schedule For (Optional)</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="scheduled_at"
                                            type="datetime-local"
                                            value={data.scheduled_at}
                                            onChange={(e) => setData('scheduled_at', e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    {errors.scheduled_at && (
                                        <p className="text-sm text-red-600">{errors.scheduled_at}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recipient Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Recipient Information
                                </CardTitle>
                                <CardDescription>
                                    Specify who should receive this notification
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Recipient Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="recipient_type">Recipient Type</Label>
                                    <Select
                                        value={data.recipient_type}
                                        onValueChange={handleRecipientTypeChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select recipient type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="customer">Customer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.recipient_type && (
                                        <p className="text-sm text-red-600">{errors.recipient_type}</p>
                                    )}
                                </div>

                                {/* Recipient Search */}
                                {data.recipient_type && (
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient_search">Search {data.recipient_type === 'user' ? 'Users' : 'Customers'}</Label>
                                        <Input
                                            id="recipient_search"
                                            type="text"
                                            value={recipientSearch}
                                            onChange={(e) => setRecipientSearch(e.target.value)}
                                            placeholder={`Search ${data.recipient_type === 'user' ? 'by name or email' : 'by company name or contact person'}`}
                                        />
                                    </div>
                                )}

                                {/* Recipient Selection */}
                                {data.recipient_type && (
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient_id">Select Recipient</Label>
                                        <Select
                                            value={data.recipient_id}
                                            onValueChange={handleRecipientSelect}
                                            disabled={loadingRecipients}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={
                                                    loadingRecipients
                                                        ? "Loading..."
                                                        : recipients.length === 0
                                                            ? `No ${data.recipient_type}s found`
                                                            : "Select recipient"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {recipients.map((recipient) => (
                                                    <SelectItem key={recipient.id} value={recipient.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{recipient.display}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ID: {recipient.id} | Email: {recipient.email}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.recipient_id && (
                                            <p className="text-sm text-red-600">{errors.recipient_id}</p>
                                        )}
                                    </div>
                                )}

                                {/* Email (auto-populated from selected recipient) */}
                                {(data.channel === 'email' || !data.channel) && data.recipient_id && (
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient_email">Email Address (Auto-populated)</Label>
                                        <Input
                                            id="recipient_email"
                                            type="email"
                                            value={data.recipient_email}
                                            readOnly
                                            className="bg-gray-50"
                                            placeholder="Email will be auto-populated when recipient is selected"
                                        />
                                        {!data.recipient_email && (
                                            <p className="text-sm text-amber-600">Selected recipient has no email address</p>
                                        )}
                                        {errors.recipient_email && (
                                            <p className="text-sm text-red-600">{errors.recipient_email}</p>
                                        )}
                                    </div>
                                )}

                                {/* Phone (auto-populated from selected recipient) */}
                                {data.channel === 'sms' && data.recipient_id && (
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient_phone">Phone Number (Auto-populated)</Label>
                                        <Input
                                            id="recipient_phone"
                                            type="tel"
                                            value={data.recipient_phone}
                                            readOnly
                                            className="bg-gray-50"
                                            placeholder="Phone will be auto-populated when recipient is selected"
                                        />
                                        {!data.recipient_phone && (
                                            <p className="text-sm text-amber-600">Selected recipient has no phone number</p>
                                        )}
                                        {errors.recipient_phone && (
                                            <p className="text-sm text-red-600">{errors.recipient_phone}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Message Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Content</CardTitle>
                            <CardDescription>
                                {selectedTemplate 
                                    ? `Using template: ${selectedTemplate.name}` 
                                    : 'Create your custom notification message'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter notification title"
                                    disabled={!!selectedTemplate}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Template Variables */}
                            {selectedTemplate && selectedTemplate.variables.length > 0 && (
                                <div className="space-y-4">
                                    <Label>Template Variables</Label>
                                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                        {selectedTemplate.variables.map((variable) => (
                                            <div key={variable} className="space-y-2">
                                                <Label htmlFor={variable} className="text-sm">
                                                    {variable.replace('_', ' ').charAt(0).toUpperCase() + 
                                                     variable.replace('_', ' ').slice(1)}
                                                </Label>
                                                <Input
                                                    id={variable}
                                                    value={templateVariables[variable] || ''}
                                                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                    placeholder={`Enter ${variable.replace('_', ' ')}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Enter notification message"
                                    rows={6}
                                    disabled={!!selectedTemplate}
                                />
                                {errors.message && (
                                    <p className="text-sm text-red-600">{errors.message}</p>
                                )}
                            </div>

                            {/* Preview */}
                            {(data.message || selectedTemplate) && (
                                <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <div className="p-4 bg-muted rounded-md border">
                                        <p className="text-sm font-medium mb-2">{data.title}</p>
                                        <p className="text-sm whitespace-pre-wrap">{renderMessagePreview()}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/notifications">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Send className="h-4 w-4 mr-2" />
                            {processing ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
