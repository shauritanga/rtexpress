import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Wifi, 
    WifiOff, 
    Loader2, 
    AlertTriangle,
    CheckCircle,
    RefreshCw
} from 'lucide-react';

interface RealTimeIndicatorProps {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    onReconnect?: () => void;
    className?: string;
    showDetails?: boolean;
}

export function RealTimeIndicator({
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    maxReconnectAttempts,
    onReconnect,
    className,
    showDetails = false
}: RealTimeIndicatorProps) {
    const getStatus = () => {
        if (isConnecting) {
            return {
                label: 'Connecting...',
                variant: 'secondary' as const,
                icon: Loader2,
                iconClass: 'animate-spin'
            };
        }
        
        if (error) {
            return {
                label: 'Connection Error',
                variant: 'destructive' as const,
                icon: AlertTriangle,
                iconClass: ''
            };
        }
        
        if (isConnected) {
            return {
                label: 'Live Updates',
                variant: 'success' as const,
                icon: Wifi,
                iconClass: ''
            };
        }
        
        return {
            label: 'Offline',
            variant: 'secondary' as const,
            icon: WifiOff,
            iconClass: ''
        };
    };

    const status = getStatus();
    const IconComponent = status.icon;

    if (!showDetails) {
        return (
            <Badge 
                variant={status.variant} 
                className={cn("flex items-center space-x-1", className)}
            >
                <IconComponent className={cn("h-3 w-3", status.iconClass)} />
                <span>{status.label}</span>
            </Badge>
        );
    }

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Badge 
                variant={status.variant} 
                className="flex items-center space-x-1"
            >
                <IconComponent className={cn("h-3 w-3", status.iconClass)} />
                <span>{status.label}</span>
            </Badge>
            
            {error && onReconnect && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReconnect}
                    disabled={isConnecting}
                >
                    <RefreshCw className={cn("h-3 w-3 mr-1", isConnecting && "animate-spin")} />
                    Retry
                </Button>
            )}
            
            {reconnectAttempts > 0 && (
                <span className="text-xs text-muted-foreground">
                    Attempt {reconnectAttempts}/{maxReconnectAttempts}
                </span>
            )}
        </div>
    );
}

// Connection status component for the header
export function ConnectionStatus() {
    // This would typically use the WebSocket hook
    // For demo purposes, we'll simulate the states
    const [isConnected, setIsConnected] = React.useState(true);
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Simulate connection states for demo
    React.useEffect(() => {
        const interval = setInterval(() => {
            const random = Math.random();
            if (random < 0.1) {
                // 10% chance of error
                setError('Connection lost');
                setIsConnected(false);
            } else if (random < 0.2) {
                // 10% chance of connecting
                setIsConnecting(true);
                setError(null);
                setTimeout(() => {
                    setIsConnecting(false);
                    setIsConnected(true);
                }, 2000);
            } else {
                // 80% chance of being connected
                setIsConnected(true);
                setIsConnecting(false);
                setError(null);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleReconnect = () => {
        setIsConnecting(true);
        setError(null);
        
        setTimeout(() => {
            setIsConnecting(false);
            setIsConnected(true);
        }, 2000);
    };

    return (
        <RealTimeIndicator
            isConnected={isConnected}
            isConnecting={isConnecting}
            error={error}
            reconnectAttempts={0}
            maxReconnectAttempts={5}
            onReconnect={handleReconnect}
            showDetails={true}
        />
    );
}

// Live data indicator for tables and lists
interface LiveDataIndicatorProps {
    lastUpdated?: Date;
    isLive?: boolean;
    className?: string;
}

export function LiveDataIndicator({ 
    lastUpdated, 
    isLive = false, 
    className 
}: LiveDataIndicatorProps) {
    const [timeAgo, setTimeAgo] = React.useState('');

    React.useEffect(() => {
        if (!lastUpdated) return;

        const updateTimeAgo = () => {
            const now = new Date();
            const diff = now.getTime() - lastUpdated.getTime();
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            if (seconds < 60) {
                setTimeAgo(`${seconds}s ago`);
            } else if (minutes < 60) {
                setTimeAgo(`${minutes}m ago`);
            } else {
                setTimeAgo(`${hours}h ago`);
            }
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 1000);

        return () => clearInterval(interval);
    }, [lastUpdated]);

    return (
        <div className={cn("flex items-center space-x-2 text-xs text-muted-foreground", className)}>
            {isLive && (
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live</span>
                </div>
            )}
            {lastUpdated && (
                <span>Updated {timeAgo}</span>
            )}
        </div>
    );
}

// Notification permission component
export function NotificationPermission() {
    const [permission, setPermission] = React.useState<NotificationPermission>('default');
    const [isRequesting, setIsRequesting] = React.useState(false);

    React.useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) return;

        setIsRequesting(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
        } catch (error) {
            console.error('Failed to request notification permission:', error);
        } finally {
            setIsRequesting(false);
        }
    };

    if (!('Notification' in window)) {
        return null;
    }

    if (permission === 'granted') {
        return (
            <Badge variant="success" className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Notifications Enabled</span>
            </Badge>
        );
    }

    if (permission === 'denied') {
        return (
            <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Notifications Blocked</span>
            </Badge>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={requestPermission}
            disabled={isRequesting}
        >
            {isRequesting ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
            )}
            Enable Notifications
        </Button>
    );
}
