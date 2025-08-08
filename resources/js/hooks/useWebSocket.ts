import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
    type: string;
    data: any;
    timestamp: string;
}

interface WebSocketOptions {
    url?: string;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
}

interface WebSocketState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    lastMessage: WebSocketMessage | null;
    reconnectAttempts: number;
}

export function useWebSocket(options: WebSocketOptions = {}) {
    const {
        url = `ws://127.0.0.1:8080/app/rtexpress?protocol=7&client=js&version=8.4.0-rc2&flash=false`,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        onMessage,
        onConnect,
        onDisconnect,
        onError,
    } = options;

    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [state, setState] = useState<WebSocketState>({
        isConnected: false,
        isConnecting: false,
        error: null,
        lastMessage: null,
        reconnectAttempts: 0,
    });

    const connect = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setState((prev) => ({ ...prev, isConnecting: true, error: null }));

        try {
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                setState((prev) => ({
                    ...prev,
                    isConnected: true,
                    isConnecting: false,
                    error: null,
                    reconnectAttempts: 0,
                }));
                onConnect?.();
            };

            ws.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setState((prev) => ({ ...prev, lastMessage: message }));
                    onMessage?.(message);

                    // Handle specific message types
                    handleMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.current.onclose = () => {
                setState((prev) => ({
                    ...prev,
                    isConnected: false,
                    isConnecting: false,
                }));
                onDisconnect?.();

                // Attempt to reconnect
                if (state.reconnectAttempts < maxReconnectAttempts) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setState((prev) => ({
                            ...prev,
                            reconnectAttempts: prev.reconnectAttempts + 1,
                        }));
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.current.onerror = (error) => {
                setState((prev) => ({
                    ...prev,
                    error: 'WebSocket connection error',
                    isConnecting: false,
                }));
                onError?.(error);
            };
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: 'Failed to create WebSocket connection',
                isConnecting: false,
            }));
        }
    }, [url, maxReconnectAttempts, reconnectInterval, onConnect, onMessage, onDisconnect, onError]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }

        setState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            reconnectAttempts: 0,
        }));
    }, []);

    const sendMessage = useCallback((message: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, []);

    const handleMessage = (message: WebSocketMessage) => {
        switch (message.type) {
            case 'shipment_status_update':
                // Refresh shipments data
                if (window.location.pathname.includes('/admin/shipments')) {
                    router.reload({ only: ['shipments'] });
                }

                // Show notification
                showNotification('Shipment Update', `Shipment ${message.data.tracking_number} status changed to ${message.data.status}`);
                break;

            case 'route_update':
                // Refresh routes data
                if (window.location.pathname.includes('/admin/routes')) {
                    router.reload({ only: ['routes'] });
                }

                showNotification('Route Update', `Route ${message.data.route_number} has been updated`);
                break;

            case 'new_support_ticket':
                // Show notification for new support tickets
                showNotification('New Support Ticket', `New ticket #${message.data.ticket_number} from ${message.data.customer_name}`);
                break;

            case 'system_alert':
                // Show system alerts
                showNotification('System Alert', message.data.message, 'warning');
                break;

            case 'user_activity':
                // Handle user activity updates
                console.log('User activity:', message.data);
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    };

    const showNotification = (title: string, body: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        // Check if browser supports notifications
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
                tag: `rt-express-${Date.now()}`,
            });
        }

        // Also show in-app notification (you can integrate with a toast library)
        console.log(`[${type.toUpperCase()}] ${title}: ${body}`);
    };

    // Request notification permission
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    }, []);

    // Subscribe to specific channels
    const subscribe = useCallback(
        (channel: string) => {
            sendMessage({
                type: 'subscribe',
                channel,
            });
        },
        [sendMessage],
    );

    const unsubscribe = useCallback(
        (channel: string) => {
            sendMessage({
                type: 'unsubscribe',
                channel,
            });
        },
        [sendMessage],
    );

    // Auto-connect on mount
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    return {
        ...state,
        connect,
        disconnect,
        sendMessage,
        subscribe,
        unsubscribe,
        requestNotificationPermission,
    };
}

// Hook for shipment tracking
export function useShipmentTracking(trackingNumber?: string) {
    const { sendMessage, subscribe, unsubscribe, ...wsState } = useWebSocket({
        onMessage: (message) => {
            if (message.type === 'shipment_status_update' && message.data.tracking_number === trackingNumber) {
                // Handle specific shipment updates
                console.log('Shipment update received:', message.data);
            }
        },
    });

    useEffect(() => {
        if (trackingNumber && wsState.isConnected) {
            subscribe(`shipment.${trackingNumber}`);

            return () => {
                unsubscribe(`shipment.${trackingNumber}`);
            };
        }
    }, [trackingNumber, wsState.isConnected, subscribe, unsubscribe]);

    const updateShipmentStatus = useCallback(
        (status: string, location?: string, notes?: string) => {
            if (trackingNumber) {
                sendMessage({
                    type: 'update_shipment_status',
                    data: {
                        tracking_number: trackingNumber,
                        status,
                        location,
                        notes,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
        },
        [trackingNumber, sendMessage],
    );

    return {
        ...wsState,
        updateShipmentStatus,
    };
}

// Hook for route tracking
export function useRouteTracking(routeId?: string) {
    const { sendMessage, subscribe, unsubscribe, ...wsState } = useWebSocket({
        onMessage: (message) => {
            if (message.type === 'route_update' && message.data.route_id === routeId) {
                console.log('Route update received:', message.data);
            }
        },
    });

    useEffect(() => {
        if (routeId && wsState.isConnected) {
            subscribe(`route.${routeId}`);

            return () => {
                unsubscribe(`route.${routeId}`);
            };
        }
    }, [routeId, wsState.isConnected, subscribe, unsubscribe]);

    const updateRouteProgress = useCallback(
        (progress: number, currentStop?: string) => {
            if (routeId) {
                sendMessage({
                    type: 'update_route_progress',
                    data: {
                        route_id: routeId,
                        progress,
                        current_stop: currentStop,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
        },
        [routeId, sendMessage],
    );

    return {
        ...wsState,
        updateRouteProgress,
    };
}
