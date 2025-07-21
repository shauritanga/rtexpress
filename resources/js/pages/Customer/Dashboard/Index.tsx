import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RecentActivityTimeline from '@/components/customer/RecentActivityTimeline';
import DeliveryPerformanceWidget from '@/components/customer/DeliveryPerformanceWidget';
import UpcomingDeliveriesCalendar from '@/components/customer/UpcomingDeliveriesCalendar';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    AlertTriangle,
    Plus,
    Search,
    BarChart3,
    TrendingUp
} from 'lucide-react';

interface Customer {
    id: number;
    company_name: string;
    customer_code: string;
    contact_person: string;
    email: string;
    phone: string;
}

interface Shipment {
    id: number;
    tracking_number: string;
    status: string;
    service_type: string;
    recipient_name: string;
    recipient_address: string;
    declared_value: number;
    created_at: string;
    estimated_delivery_date?: string;
}

interface Stats {
    total_shipments: number;
    active_shipments: number;
    delivered_shipments: number;
    pending_shipments: number;
}

interface TimelineEvent {
    id: number;
    shipment_id: number;
    tracking_number: string;
    event_type: string;
    status: string;
    description: string;
    location?: string;
    timestamp: string;
    recipient_name: string;
    service_type: string;
}

interface PerformanceMetrics {
    on_time_delivery_rate: number;
    average_delivery_time: number;
    total_deliveries_this_month: number;
    total_deliveries_last_month: number;
    early_deliveries: number;
    on_time_deliveries: number;
    late_deliveries: number;
    average_delivery_time_last_month: number;
    performance_trend: 'up' | 'down' | 'stable';
    customer_satisfaction_score?: number;
}

interface UpcomingDelivery {
    id: number;
    tracking_number: string;
    recipient_name: string;
    recipient_address: string;
    service_type: string;
    estimated_delivery_date: string;
    delivery_time_window?: string;
    status: string;
    priority: 'high' | 'medium' | 'low';
}

interface Props {
    customer: Customer;
    stats: Stats;
    recentShipments: Shipment[];
    activeShipments: Shipment[];
    recentActivity: TimelineEvent[];
    performanceMetrics: PerformanceMetrics;
    upcomingDeliveries: UpcomingDelivery[];
}

export default function CustomerDashboard({
    customer,
    stats,
    recentShipments,
    activeShipments,
    recentActivity,
    performanceMetrics,
    upcomingDeliveries
}: Props) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            picked_up: { label: 'Picked Up', variant: 'default' as const, icon: Package },
            in_transit: { label: 'In Transit', variant: 'default' as const, icon: Truck },
            out_for_delivery: { label: 'Out for Delivery', variant: 'default' as const, icon: Truck },
            delivered: { label: 'Delivered', variant: 'success' as const, icon: CheckCircle },
            exception: { label: 'Exception', variant: 'destructive' as const, icon: AlertTriangle },
            cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || 
                      { label: status, variant: 'default' as const, icon: Package };
        
        return (
            <Badge variant={config.variant} className="flex items-center">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />
            
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Welcome back, {customer.contact_person}!
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {customer.company_name} • Customer ID: {customer.customer_code}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-2">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Shipment
                            </Button>
                            <Button variant="outline">
                                <Search className="h-4 w-4 mr-2" />
                                Track Package
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_shipments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.active_shipments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.delivered_shipments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending_shipments}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Shipments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Truck className="h-5 w-5 mr-2" />
                            Active Shipments
                        </CardTitle>
                        <CardDescription>
                            Track your shipments currently in transit
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeShipments.length > 0 ? (
                            <div className="space-y-4">
                                {activeShipments.map((shipment) => (
                                    <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{shipment.tracking_number}</p>
                                                    <p className="text-sm text-gray-600">{shipment.recipient_name}</p>
                                                </div>
                                                {getStatusBadge(shipment.status)}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{shipment.recipient_address}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatCurrency(shipment.declared_value)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(shipment.created_at)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">No active shipments</p>
                                <Button className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Shipment
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Enhanced Dashboard Features - Phase 2 */}
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Recent Activity Timeline */}
                    <RecentActivityTimeline events={recentActivity} />

                    {/* Delivery Performance Widget */}
                    <DeliveryPerformanceWidget metrics={performanceMetrics} />
                </div>

                {/* Upcoming Deliveries Calendar */}
                <UpcomingDeliveriesCalendar deliveries={upcomingDeliveries} />
            </div>
        </AppLayout>
    );
}
