import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Calendar,
    ChevronLeft,
    ChevronRight,
    Package,
    Clock,
    MapPin,
    ExternalLink,
    CalendarDays
} from 'lucide-react';

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
    deliveries: UpcomingDelivery[];
    className?: string;
}

export default function UpcomingDeliveriesCalendar({ deliveries, className = '' }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    const getDeliveriesForDate = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        return deliveries.filter(delivery => 
            delivery.estimated_delivery_date.split('T')[0] === dateString
        );
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getServiceTypeColor = (serviceType: string) => {
        const colors = {
            express: 'bg-red-50 text-red-700',
            standard: 'bg-blue-50 text-blue-700',
            overnight: 'bg-purple-50 text-purple-700',
            international: 'bg-green-50 text-green-700',
        };
        return colors[serviceType as keyof typeof colors] || 'bg-gray-50 text-gray-700';
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const renderCalendarView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-20 sm:h-24"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayDeliveries = getDeliveriesForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            days.push(
                <div
                    key={day}
                    className={`h-20 sm:h-24 p-1 border border-gray-200 ${
                        isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    } hover:bg-gray-50 transition-colors`}
                >
                    <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dayDeliveries.slice(0, 2).map(delivery => (
                            <div
                                key={delivery.id}
                                className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityColor(delivery.priority)}`}
                                title={`${delivery.tracking_number} - ${delivery.recipient_name}`}
                            >
                                {delivery.tracking_number}
                            </div>
                        ))}
                        {dayDeliveries.length > 2 && (
                            <div className="text-xs text-gray-500">
                                +{dayDeliveries.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                        {day}
                    </div>
                ))}
                {days}
            </div>
        );
    };

    const renderListView = () => {
        const sortedDeliveries = [...deliveries]
            .sort((a, b) => new Date(a.estimated_delivery_date).getTime() - new Date(b.estimated_delivery_date).getTime())
            .slice(0, 10);

        return (
            <div className="space-y-3">
                {sortedDeliveries.map(delivery => (
                    <div key={delivery.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPriorityColor(delivery.priority)}`}>
                                <Package className="h-5 w-5" />
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {delivery.tracking_number}
                                </p>
                                <Badge className={`text-xs ${getServiceTypeColor(delivery.service_type)}`}>
                                    {delivery.service_type}
                                </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 truncate mb-1">
                                {delivery.recipient_name}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(delivery.estimated_delivery_date).toLocaleDateString()}
                                </div>
                                
                                {delivery.delivery_time_window && (
                                    <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {delivery.delivery_time_window}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {sortedDeliveries.length === 0 && (
                    <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No upcoming deliveries</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Your scheduled deliveries will appear here
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <CalendarDays className="h-5 w-5 mr-2" />
                        Upcoming Deliveries
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                        >
                            Calendar
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            List
                        </Button>
                    </div>
                </CardTitle>
                <CardDescription>
                    Track your scheduled deliveries and time windows
                </CardDescription>
            </CardHeader>
            <CardContent>
                {viewMode === 'calendar' && (
                    <div className="space-y-4">
                        {/* Calendar Navigation */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {formatDate(currentDate)}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateMonth('prev')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentDate(new Date())}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateMonth('next')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        {renderCalendarView()}
                        
                        {/* Legend */}
                        <div className="flex items-center justify-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                                <span>High Priority</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                                <span>Medium Priority</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                                <span>Low Priority</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {viewMode === 'list' && renderListView()}
            </CardContent>
        </Card>
    );
}
