import { Badge } from '@/components/ui/badge';
import { 
    Clock, 
    Package, 
    Truck, 
    CheckCircle, 
    AlertTriangle,
    XCircle
} from 'lucide-react';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const statusConfig = {
        pending: { 
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
            icon: Clock,
            label: 'Pending'
        },
        picked_up: { 
            color: 'bg-blue-100 text-blue-800 border-blue-200', 
            icon: Package,
            label: 'Picked Up'
        },
        in_transit: { 
            color: 'bg-purple-100 text-purple-800 border-purple-200', 
            icon: Truck,
            label: 'In Transit'
        },
        out_for_delivery: { 
            color: 'bg-orange-100 text-orange-800 border-orange-200', 
            icon: Truck,
            label: 'Out for Delivery'
        },
        delivered: { 
            color: 'bg-green-100 text-green-800 border-green-200', 
            icon: CheckCircle,
            label: 'Delivered'
        },
        exception: { 
            color: 'bg-red-100 text-red-800 border-red-200', 
            icon: AlertTriangle,
            label: 'Exception'
        },
        cancelled: { 
            color: 'bg-gray-100 text-gray-800 border-gray-200', 
            icon: XCircle,
            label: 'Cancelled'
        },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2.5 py-1.5',
        lg: 'text-base px-3 py-2',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    return (
        <Badge 
            className={`${config.color} ${sizeClasses[size]} flex items-center space-x-1 font-medium border`}
        >
            <Icon className={iconSizes[size]} />
            <span>{config.label}</span>
        </Badge>
    );
}

// Service Type Badge Component
interface ServiceBadgeProps {
    serviceType: string;
    size?: 'sm' | 'md' | 'lg';
}

export function ServiceBadge({ serviceType, size = 'md' }: ServiceBadgeProps) {
    const serviceConfig = {
        standard: { 
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            label: 'Standard'
        },
        express: { 
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'Express'
        },
        overnight: { 
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            label: 'Overnight'
        },
        international: { 
            color: 'bg-green-100 text-green-800 border-green-200',
            label: 'International'
        },
    };

    const config = serviceConfig[serviceType as keyof typeof serviceConfig] || serviceConfig.standard;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2.5 py-1.5',
        lg: 'text-base px-3 py-2',
    };

    return (
        <Badge 
            className={`${config.color} ${sizeClasses[size]} font-medium border`}
        >
            {config.label}
        </Badge>
    );
}

// Priority Badge Component
interface PriorityBadgeProps {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
    const priorityConfig = {
        low: { 
            color: 'bg-gray-100 text-gray-800 border-gray-200',
            label: 'Low'
        },
        medium: { 
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            label: 'Medium'
        },
        high: { 
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            label: 'High'
        },
        urgent: { 
            color: 'bg-red-100 text-red-800 border-red-200',
            label: 'Urgent'
        },
    };

    const config = priorityConfig[priority];

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-2.5 py-1.5',
        lg: 'text-base px-3 py-2',
    };

    return (
        <Badge 
            className={`${config.color} ${sizeClasses[size]} font-medium border`}
        >
            {config.label}
        </Badge>
    );
}
