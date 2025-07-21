import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
    Zap,
    Brain,
    Target,
    AlertTriangle,
    TrendingUp,
    Clock,
    MapPin,
    Thermometer,
    Wifi,
    Smartphone,
    Mail,
    MessageSquare,
    Bell,
    Settings,
    Plus,
    Trash2,
    Edit,
    Save,
    RefreshCw,
    CheckCircle,
    Info,
    Calendar,
    DollarSign,
    Package,
    Users,
    BarChart3
} from 'lucide-react';

interface SmartRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    trigger: {
        type: 'event' | 'condition' | 'schedule' | 'location' | 'behavior';
        event?: string;
        conditions?: Array<{
            field: string;
            operator: string;
            value: any;
        }>;
        schedule?: {
            frequency: string;
            time?: string;
            days?: string[];
        };
        location?: {
            type: 'geofence' | 'address' | 'city' | 'country';
            value: string;
            radius?: number;
        };
        behavior?: {
            pattern: string;
            threshold: number;
            timeframe: string;
        };
    };
    actions: Array<{
        type: 'notify' | 'escalate' | 'update' | 'webhook';
        channels?: string[];
        template?: string;
        delay?: number;
        conditions?: any;
    }>;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    last_triggered?: string;
    trigger_count: number;
}

interface ProactiveAlert {
    id: string;
    title: string;
    message: string;
    type: 'prediction' | 'recommendation' | 'warning' | 'opportunity';
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    data_points: string[];
    suggested_actions: Array<{
        action: string;
        description: string;
        effort: 'low' | 'medium' | 'high';
        impact: 'low' | 'medium' | 'high';
    }>;
    created_at: string;
    expires_at?: string;
    dismissed: boolean;
}

interface Props {
    className?: string;
    onRuleUpdate?: (rule: SmartRule) => void;
    onAlertAction?: (alertId: string, action: string) => void;
}

export default function SmartNotifications({ 
    className = '', 
    onRuleUpdate,
    onAlertAction
}: Props) {
    const [smartRules, setSmartRules] = useState<SmartRule[]>([]);
    const [proactiveAlerts, setProactiveAlerts] = useState<ProactiveAlert[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingRule, setIsCreatingRule] = useState(false);
    const [editingRule, setEditingRule] = useState<SmartRule | null>(null);
    const [newRule, setNewRule] = useState<Partial<SmartRule>>({
        name: '',
        description: '',
        enabled: true,
        trigger: { type: 'event' },
        actions: [{ type: 'notify', channels: ['email', 'in_app'] }],
        priority: 'medium',
    });

    // Mock data - in real app, would fetch from API
    const mockSmartRules: SmartRule[] = [
        {
            id: 'rule_1',
            name: 'Delivery Delay Alert',
            description: 'Notify when shipment is delayed by more than 2 hours',
            enabled: true,
            trigger: {
                type: 'condition',
                conditions: [
                    { field: 'estimated_delivery', operator: 'delayed_by', value: 120 },
                    { field: 'status', operator: 'equals', value: 'in_transit' },
                ],
            },
            actions: [
                {
                    type: 'notify',
                    channels: ['email', 'sms', 'push'],
                    template: 'delivery_delay',
                },
                {
                    type: 'escalate',
                    delay: 60,
                    conditions: { no_response: true },
                },
            ],
            priority: 'high',
            created_at: '2024-01-15T10:00:00Z',
            last_triggered: '2024-01-20T14:30:00Z',
            trigger_count: 12,
        },
        {
            id: 'rule_2',
            name: 'High Value Shipment Tracking',
            description: 'Enhanced notifications for shipments over $1000',
            enabled: true,
            trigger: {
                type: 'condition',
                conditions: [
                    { field: 'declared_value', operator: 'greater_than', value: 1000 },
                ],
            },
            actions: [
                {
                    type: 'notify',
                    channels: ['email', 'sms', 'push', 'in_app'],
                    template: 'high_value_tracking',
                },
            ],
            priority: 'high',
            created_at: '2024-01-10T09:00:00Z',
            last_triggered: '2024-01-19T16:45:00Z',
            trigger_count: 8,
        },
        {
            id: 'rule_3',
            name: 'Weekly Shipping Summary',
            description: 'Send weekly summary every Monday at 9 AM',
            enabled: true,
            trigger: {
                type: 'schedule',
                schedule: {
                    frequency: 'weekly',
                    time: '09:00',
                    days: ['monday'],
                },
            },
            actions: [
                {
                    type: 'notify',
                    channels: ['email'],
                    template: 'weekly_summary',
                },
            ],
            priority: 'low',
            created_at: '2024-01-05T08:00:00Z',
            last_triggered: '2024-01-22T09:00:00Z',
            trigger_count: 3,
        },
    ];

    const mockProactiveAlerts: ProactiveAlert[] = [
        {
            id: 'alert_1',
            title: 'Shipping Cost Optimization Opportunity',
            message: 'Based on your shipping patterns, switching to our Express+ service could save you 15% on international shipments.',
            type: 'opportunity',
            confidence: 87,
            impact: 'medium',
            data_points: [
                '68% of your shipments are international',
                'Average shipment value: $245',
                'Current service: Standard International',
                'Potential monthly savings: $127',
            ],
            suggested_actions: [
                {
                    action: 'Switch to Express+ for international shipments',
                    description: 'Upgrade your default international service',
                    effort: 'low',
                    impact: 'medium',
                },
                {
                    action: 'Schedule consultation with account manager',
                    description: 'Discuss custom pricing options',
                    effort: 'low',
                    impact: 'high',
                },
            ],
            created_at: '2024-01-20T10:00:00Z',
            expires_at: '2024-02-20T10:00:00Z',
            dismissed: false,
        },
        {
            id: 'alert_2',
            title: 'Potential Delivery Issue Detected',
            message: 'Weather conditions in Chicago may affect deliveries scheduled for tomorrow. Consider rescheduling non-urgent shipments.',
            type: 'warning',
            confidence: 92,
            impact: 'high',
            data_points: [
                'Severe weather warning for Chicago area',
                '3 shipments scheduled for delivery tomorrow',
                'Historical delay rate during similar conditions: 78%',
                'Affected tracking numbers: RT-2024-045, RT-2024-046, RT-2024-047',
            ],
            suggested_actions: [
                {
                    action: 'Reschedule non-urgent deliveries',
                    description: 'Move deliveries to Wednesday when weather clears',
                    effort: 'low',
                    impact: 'high',
                },
                {
                    action: 'Notify recipients proactively',
                    description: 'Send weather delay notifications to customers',
                    effort: 'low',
                    impact: 'medium',
                },
            ],
            created_at: '2024-01-21T15:30:00Z',
            expires_at: '2024-01-23T23:59:00Z',
            dismissed: false,
        },
        {
            id: 'alert_3',
            title: 'Shipping Volume Trend Analysis',
            message: 'Your shipping volume has increased 34% this month. Consider upgrading to our Business Pro plan for better rates.',
            type: 'recommendation',
            confidence: 95,
            impact: 'medium',
            data_points: [
                'Current month shipments: 47',
                'Previous month shipments: 35',
                'Growth rate: +34%',
                'Current plan: Business Basic',
                'Potential savings with Pro plan: $89/month',
            ],
            suggested_actions: [
                {
                    action: 'Upgrade to Business Pro plan',
                    description: 'Get volume discounts and priority support',
                    effort: 'low',
                    impact: 'high',
                },
                {
                    action: 'Review shipping analytics',
                    description: 'Analyze detailed shipping patterns and costs',
                    effort: 'medium',
                    impact: 'medium',
                },
            ],
            created_at: '2024-01-18T12:00:00Z',
            dismissed: false,
        },
    ];

    useEffect(() => {
        loadSmartFeatures();
    }, []);

    const loadSmartFeatures = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSmartRules(mockSmartRules);
            setProactiveAlerts(mockProactiveAlerts);
        } catch (error) {
            console.error('Failed to load smart notification features:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRuleToggle = (ruleId: string, enabled: boolean) => {
        setSmartRules(prev => prev.map(rule =>
            rule.id === ruleId ? { ...rule, enabled } : rule
        ));
    };

    const handleCreateRule = () => {
        setIsCreatingRule(true);
        setEditingRule(null);
    };

    const handleEditRule = (rule: SmartRule) => {
        setEditingRule(rule);
        setNewRule(rule);
        setIsCreatingRule(true);
    };

    const handleSaveRule = () => {
        if (editingRule) {
            // Update existing rule
            setSmartRules(prev => prev.map(rule =>
                rule.id === editingRule.id ? { ...rule, ...newRule } as SmartRule : rule
            ));
        } else {
            // Create new rule
            const rule: SmartRule = {
                ...newRule,
                id: `rule_${Date.now()}`,
                created_at: new Date().toISOString(),
                trigger_count: 0,
            } as SmartRule;
            setSmartRules(prev => [...prev, rule]);
        }
        
        setIsCreatingRule(false);
        setEditingRule(null);
        setNewRule({
            name: '',
            description: '',
            enabled: true,
            trigger: { type: 'event' },
            actions: [{ type: 'notify', channels: ['email', 'in_app'] }],
            priority: 'medium',
        });
    };

    const handleDeleteRule = (ruleId: string) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            setSmartRules(prev => prev.filter(rule => rule.id !== ruleId));
        }
    };

    const handleDismissAlert = (alertId: string) => {
        setProactiveAlerts(prev => prev.map(alert =>
            alert.id === alertId ? { ...alert, dismissed: true } : alert
        ));
        onAlertAction?.(alertId, 'dismiss');
    };

    const handleAlertAction = (alertId: string, actionIndex: number) => {
        const alert = proactiveAlerts.find(a => a.id === alertId);
        if (alert && alert.suggested_actions[actionIndex]) {
            const action = alert.suggested_actions[actionIndex];
            console.log('Executing action:', action.action);
            onAlertAction?.(alertId, action.action);
        }
    };

    const getTypeIcon = (type: string) => {
        const icons = {
            prediction: <Brain className="h-4 w-4" />,
            recommendation: <Target className="h-4 w-4" />,
            warning: <AlertTriangle className="h-4 w-4" />,
            opportunity: <TrendingUp className="h-4 w-4" />,
        };
        return icons[type as keyof typeof icons] || <Info className="h-4 w-4" />;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            prediction: 'bg-purple-100 text-purple-800 border-purple-300',
            recommendation: 'bg-blue-100 text-blue-800 border-blue-300',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            opportunity: 'bg-green-100 text-green-800 border-green-300',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getImpactColor = (impact: string) => {
        const colors = {
            low: 'text-gray-600',
            medium: 'text-yellow-600',
            high: 'text-red-600',
        };
        return colors[impact as keyof typeof colors] || 'text-gray-600';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800 border-gray-300',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            high: 'bg-orange-100 text-orange-800 border-orange-300',
            urgent: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
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

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading smart notification features...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Proactive Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Brain className="h-5 w-5 mr-2" />
                        Proactive Alerts
                    </CardTitle>
                    <CardDescription>
                        AI-powered insights and recommendations based on your shipping patterns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {proactiveAlerts.filter(alert => !alert.dismissed).length === 0 ? (
                        <div className="text-center py-8">
                            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                            <p className="text-gray-600">We'll notify you when we detect opportunities or issues</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {proactiveAlerts.filter(alert => !alert.dismissed).map((alert) => (
                                <Card key={alert.id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="pt-4">
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                                        <Badge className={getTypeColor(alert.type)}>
                                                            {getTypeIcon(alert.type)}
                                                            <span className="ml-1 capitalize">{alert.type}</span>
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {alert.confidence}% confidence
                                                        </Badge>
                                                        <Badge variant="outline" className={getImpactColor(alert.impact)}>
                                                            {alert.impact} impact
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">{alert.message}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDismissAlert(alert.id)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                            
                                            {/* Data Points */}
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <h5 className="font-medium text-gray-900 mb-2">Key Data Points:</h5>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {alert.data_points.map((point, index) => (
                                                        <li key={index}>• {point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            
                                            {/* Suggested Actions */}
                                            <div>
                                                <h5 className="font-medium text-gray-900 mb-2">Suggested Actions:</h5>
                                                <div className="space-y-2">
                                                    {alert.suggested_actions.map((action, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                                            <div className="flex-1">
                                                                <h6 className="font-medium text-gray-900">{action.action}</h6>
                                                                <p className="text-sm text-gray-600">{action.description}</p>
                                                                <div className="flex items-center gap-4 mt-1">
                                                                    <span className="text-xs text-gray-500">
                                                                        Effort: <span className={getImpactColor(action.effort)}>{action.effort}</span>
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        Impact: <span className={getImpactColor(action.impact)}>{action.impact}</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAlertAction(alert.id, index)}
                                                            >
                                                                Take Action
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="text-xs text-gray-500">
                                                Created: {formatDate(alert.created_at)}
                                                {alert.expires_at && (
                                                    <span className="ml-4">Expires: {formatDate(alert.expires_at)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Smart Rules */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center">
                                <Zap className="h-5 w-5 mr-2" />
                                Smart Notification Rules
                            </CardTitle>
                            <CardDescription>
                                Automated rules that trigger notifications based on conditions and events
                            </CardDescription>
                        </div>
                        <Button onClick={handleCreateRule}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Rule
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {smartRules.length === 0 ? (
                        <div className="text-center py-8">
                            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Smart Rules</h3>
                            <p className="text-gray-600 mb-4">Create automated notification rules to stay informed</p>
                            <Button onClick={handleCreateRule}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Rule
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {smartRules.map((rule) => (
                                <Card key={rule.id}>
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                                                    <Badge className={getPriorityColor(rule.priority)}>
                                                        {rule.priority}
                                                    </Badge>
                                                    <Switch
                                                        checked={rule.enabled}
                                                        onCheckedChange={(enabled) => handleRuleToggle(rule.id, enabled)}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Trigger:</span>
                                                        <p className="text-gray-600 capitalize">{rule.trigger.type}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Actions:</span>
                                                        <p className="text-gray-600">{rule.actions.length} action{rule.actions.length > 1 ? 's' : ''}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Triggered:</span>
                                                        <p className="text-gray-600">{rule.trigger_count} times</p>
                                                    </div>
                                                </div>
                                                
                                                {rule.last_triggered && (
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        Last triggered: {formatDate(rule.last_triggered)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditRule(rule)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Rule Modal */}
            {isCreatingRule && (
                <Card className="border-2 border-blue-500">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {editingRule ? 'Edit Smart Rule' : 'Create Smart Rule'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="rule-name">Rule Name</Label>
                                <Input
                                    id="rule-name"
                                    value={newRule.name || ''}
                                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter rule name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="rule-priority">Priority</Label>
                                <Select 
                                    value={newRule.priority || 'medium'} 
                                    onValueChange={(priority) => setNewRule(prev => ({ ...prev, priority: priority as any }))}
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
                        </div>
                        
                        <div>
                            <Label htmlFor="rule-description">Description</Label>
                            <Textarea
                                id="rule-description"
                                value={newRule.description || ''}
                                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what this rule does"
                                rows={3}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="trigger-type">Trigger Type</Label>
                            <Select 
                                value={newRule.trigger?.type || 'event'} 
                                onValueChange={(type) => setNewRule(prev => ({ 
                                    ...prev, 
                                    trigger: { ...prev.trigger, type: type as any } 
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="event">Event-based</SelectItem>
                                    <SelectItem value="condition">Condition-based</SelectItem>
                                    <SelectItem value="schedule">Scheduled</SelectItem>
                                    <SelectItem value="location">Location-based</SelectItem>
                                    <SelectItem value="behavior">Behavior-based</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={newRule.enabled || true}
                                onCheckedChange={(enabled) => setNewRule(prev => ({ ...prev, enabled }))}
                            />
                            <Label>Enable this rule</Label>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button onClick={handleSaveRule}>
                                <Save className="h-4 w-4 mr-2" />
                                {editingRule ? 'Update Rule' : 'Create Rule'}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setIsCreatingRule(false);
                                    setEditingRule(null);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
