import { useEffect, useRef, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import Pusher from 'pusher-js';

interface PusherMessage {
    type: string;
    data: any;
    timestamp: string;
}

interface PusherOptions {
    onMessage?: (message: PusherMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
}

interface PusherState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    lastMessage: PusherMessage | null;
}

export function usePusher(options: PusherOptions = {}) {
    const {
        onMessage,
        onConnect,
        onDisconnect,
        onError
    } = options;

    const pusher = useRef<Pusher | null>(null);
    const [state, setState] = useState<PusherState>({
        isConnected: false,
        isConnecting: false,
        error: null,
        lastMessage: null
    });

    const connect = useCallback(() => {
        if (pusher.current?.connection.state === 'connected') {
            return;
        }

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // Initialize Pusher with Laravel Reverb configuration
            pusher.current = new Pusher('rtexpress', {
                wsHost: '127.0.0.1',
                wsPort: 8080,
                wssPort: 8080,
                forceTLS: false,
                enabledTransports: ['ws', 'wss'],
                cluster: 'mt1' // This is ignored for custom hosts
            });

            pusher.current.connection.bind('connected', () => {
                setState(prev => ({
                    ...prev,
                    isConnected: true,
                    isConnecting: false,
                    error: null
                }));
                onConnect?.();
            });

            pusher.current.connection.bind('disconnected', () => {
                setState(prev => ({
                    ...prev,
                    isConnected: false,
                    isConnecting: false
                }));
                onDisconnect?.();
            });

            pusher.current.connection.bind('error', (error: any) => {
                setState(prev => ({
                    ...prev,
                    error: 'Connection error',
                    isConnecting: false
                }));
                onError?.(error);
            });

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to initialize Pusher',
                isConnecting: false
            }));
        }
    }, [onConnect, onDisconnect, onError]);

    const disconnect = useCallback(() => {
        if (pusher.current) {
            pusher.current.disconnect();
            pusher.current = null;
        }

        setState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false
        }));
    }, []);

    const subscribe = useCallback((channelName: string, eventName?: string, callback?: (data: any) => void) => {
        if (!pusher.current) return null;

        const channel = pusher.current.subscribe(channelName);
        
        if (eventName && callback) {
            channel.bind(eventName, (data: any) => {
                const message: PusherMessage = {
                    type: eventName,
                    data,
                    timestamp: new Date().toISOString()
                };
                
                setState(prev => ({ ...prev, lastMessage: message }));
                onMessage?.(message);
                callback(data);
            });
        }

        return channel;
    }, [onMessage]);

    const unsubscribe = useCallback((channelName: string) => {
        if (pusher.current) {
            pusher.current.unsubscribe(channelName);
        }
    }, []);

    // Auto-connect on mount
    useEffect(() => {
        connect();
        
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        ...state,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        pusher: pusher.current
    };
}

// Hook for shipment tracking with Pusher
export function useShipmentTracking(trackingNumber?: string) {
    const { subscribe, unsubscribe, ...pusherState } = usePusher({
        onMessage: (message) => {
            if (message.type === 'shipment.status.updated' && 
                message.data.tracking_number === trackingNumber) {
                // Handle specific shipment updates
                console.log('Shipment update received:', message.data);
                
                // Show notification
                showNotification('Shipment Update', 
                    `Shipment ${message.data.tracking_number} status changed to ${message.data.status}`);
                
                // Refresh page data if on shipments page
                if (window.location.pathname.includes('/admin/shipments')) {
                    router.reload({ only: ['shipments'] });
                }
            }
        }
    });

    useEffect(() => {
        if (pusherState.isConnected) {
            // Subscribe to general shipments channel
            const shipmentsChannel = subscribe('shipments', 'shipment.status.updated');
            
            // Subscribe to specific shipment channel if tracking number provided
            let specificChannel = null;
            if (trackingNumber) {
                specificChannel = subscribe(`shipment.${trackingNumber}`, 'shipment.status.updated');
            }
            
            return () => {
                if (shipmentsChannel) unsubscribe('shipments');
                if (specificChannel && trackingNumber) {
                    unsubscribe(`shipment.${trackingNumber}`);
                }
            };
        }
    }, [trackingNumber, pusherState.isConnected, subscribe, unsubscribe]);

    return {
        ...pusherState
    };
}

// Hook for route tracking with Pusher
export function useRouteTracking(routeId?: string) {
    const { subscribe, unsubscribe, ...pusherState } = usePusher({
        onMessage: (message) => {
            if (message.type === 'route.progress.updated' && 
                message.data.route_id === routeId) {
                console.log('Route update received:', message.data);
                
                // Show notification
                showNotification('Route Update', 
                    `Route ${message.data.route_number} progress: ${message.data.progress}%`);
                
                // Refresh page data if on routes page
                if (window.location.pathname.includes('/admin/routes')) {
                    router.reload({ only: ['routes'] });
                }
            }
        }
    });

    useEffect(() => {
        if (pusherState.isConnected) {
            // Subscribe to general routes channel
            const routesChannel = subscribe('routes', 'route.progress.updated');
            
            // Subscribe to specific route channel if route ID provided
            let specificChannel = null;
            if (routeId) {
                specificChannel = subscribe(`route.${routeId}`, 'route.progress.updated');
            }
            
            return () => {
                if (routesChannel) unsubscribe('routes');
                if (specificChannel && routeId) {
                    unsubscribe(`route.${routeId}`);
                }
            };
        }
    }, [routeId, pusherState.isConnected, subscribe, unsubscribe]);

    return {
        ...pusherState
    };
}

// Hook for dashboard stats with Pusher
export function useDashboardStats() {
    const { subscribe, unsubscribe, ...pusherState } = usePusher({
        onMessage: (message) => {
            if (message.type === 'stats.updated') {
                console.log('Stats update received:', message.data);
                
                // Refresh dashboard data
                if (window.location.pathname.includes('/admin/tracking/dashboard')) {
                    router.reload({ only: ['stats'] });
                }
            }
        }
    });

    useEffect(() => {
        if (pusherState.isConnected) {
            const dashboardChannel = subscribe('dashboard', 'stats.updated');
            
            return () => {
                if (dashboardChannel) unsubscribe('dashboard');
            };
        }
    }, [pusherState.isConnected, subscribe, unsubscribe]);

    return {
        ...pusherState
    };
}

// Utility function for notifications
const showNotification = (title: string, body: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: `rt-express-${Date.now()}`
        });
    }

    // Also log to console for development
    console.log(`[${type.toUpperCase()}] ${title}: ${body}`);
};
