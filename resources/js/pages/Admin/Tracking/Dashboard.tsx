import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatus, LiveDataIndicator } from '@/components/ui/real-time-indicator';
import { useDashboardStats } from '@/hooks/usePusher';
import { 
    Wifi,
    Activity,
    TrendingUp,
    TrendingDown,
    Package,
    Truck,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle,
    Users,
    DollarSign,
    BarChart3,
    RefreshCw,
    Zap
} from 'lucide-react';

interface DashboardStats {
    total_active_shipments: number;
    in_transit_count: number;
    out_for_delivery_count: number;
    delivered_today: number;
    active_drivers: number;
    total_revenue_today: number;
    avg_delivery_time: number;
    exception_count: number;
}

interface RealtimeEvent {
    id: string;
    type: 'shipment_update' | 'delivery_completed' | 'exception' | 'driver_update';
    message: string;
    timestamp: string;
    severity: 'info' | 'success' | 'warning' | 'error';
}

export default function RealtimeDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        total_active_shipments: 1247,
        in_transit_count: 856,
        out_for_delivery_count: 234,
        delivered_today: 157,
        active_drivers: 89,
        total_revenue_today: 45678.90,
        avg_delivery_time: 2.4,
        exception_count: 12
    });

    const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([
        {
            id: '1',
            type: 'delivery_completed',
            message: 'Shipment RT001234567 delivered to New York, NY',
            timestamp: new Date().toISOString(),
            severity: 'success'
        },
        {
            id: '2',
            type: 'shipment_update',
            message: 'Shipment RT001234568 arrived at Chicago Hub',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            severity: 'info'
        },
        {
            id: '3',
            type: 'exception',
            message: 'Delivery exception for RT001234569 - Address not found',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            severity: 'error'
        }
    ]);

    // Pusher connection for real-time updates
    const { isConnected, lastMessage } = useDashboardStats();

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate stats updates
            setStats(prev => ({
                ...prev,
                total_active_shipments: prev.total_active_shipments + Math.floor(Math.random() * 3) - 1,
                delivered_today: prev.delivered_today + Math.floor(Math.random() * 2),
                total_revenue_today: prev.total_revenue_today + Math.random() * 100
            }));

            // Simulate new events
            const eventTypes: RealtimeEvent['type'][] = ['shipment_update', 'delivery_completed', 'driver_update'];
            const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            if (Math.random() < 0.3) { // 30% chance of new event
                const newEvent: RealtimeEvent = {
                    id: Date.now().toString(),
                    type: randomType,
                    message: `Real-time update: ${randomType.replace('_', ' ')} at ${new Date().toLocaleTimeString()}`,
                    timestamp: new Date().toISOString(),
                    severity: randomType === 'delivery_completed' ? 'success' : 'info'
                };
                
                setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 9)]);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getEventIcon = (type: RealtimeEvent['type']) => {
        switch (type) {
            case 'delivery_completed':
                return CheckCircle;
            case 'shipment_update':
                return Package;
            case 'driver_update':
                return Truck;
            case 'exception':
                return AlertTriangle;
            default:
                return Activity;
        }
    };

    const getEventColor = (severity: RealtimeEvent['severity']) => {
        switch (severity) {
            case 'success':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'warning':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'error':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    return (
        <AppLayout>
            <Head title="Real-time Dashboard" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Wifi className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Real-time Dashboard
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Live operations monitoring and analytics
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ConnectionStatus />
                        <LiveDataIndicator lastUpdated={new Date()} isLive={isConnected} />
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Real-time Stats Grid */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-bold">{stats.total_active_shipments.toLocaleString()}</p>
                                        <div className="flex items-center space-x-1">
                                            <Zap className="h-3 w-3 text-green-500" />
                                            <span className="text-xs text-green-600">LIVE</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Active Shipments</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Truck className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-bold">{stats.in_transit_count}</p>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">In Transit</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-bold">{stats.delivered_today}</p>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Delivered Today</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-bold">
                                            ${stats.total_revenue_today.toLocaleString('en-US', { 
                                                minimumFractionDigits: 0, 
                                                maximumFractionDigits: 0 
                                            })}
                                        </p>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Revenue Today</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.active_drivers}</p>
                                    <p className="text-sm text-muted-foreground">Active Drivers</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.out_for_delivery_count}</p>
                                    <p className="text-sm text-muted-foreground">Out for Delivery</p>
                                </div>
                                <MapPin className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.avg_delivery_time}d</p>
                                    <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
                                </div>
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-red-600">{stats.exception_count}</p>
                                    <p className="text-sm text-muted-foreground">Exceptions</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Real-time Events Feed */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Live Activity Feed</span>
                                </CardTitle>
                                <CardDescription>
                                    Real-time updates from across your logistics network
                                </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-green-600 font-medium">LIVE</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {realtimeEvents.map((event) => {
                                const IconComponent = getEventIcon(event.type);
                                return (
                                    <div
                                        key={event.id}
                                        className={`flex items-start space-x-3 p-3 rounded-lg border ${getEventColor(event.severity)}`}
                                    >
                                        <IconComponent className="h-5 w-5 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{event.message}</p>
                                            <p className="text-xs opacity-75 mt-1">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {event.type.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* WebSocket Debug Info */}
                {lastMessage && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">WebSocket Debug</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(lastMessage, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
