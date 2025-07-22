import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Smartphone, 
    Wifi, 
    WifiOff, 
    Download, 
    RefreshCw,
    Bell,
    BellOff,
    Home,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// PWA Status Hook
export function usePWAStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        // Online/Offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check if app is installed/standalone
        const checkStandalone = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                                   (window.navigator as any).standalone ||
                                   document.referrer.includes('android-app://');
            setIsStandalone(isStandaloneMode);
            setIsInstalled(isStandaloneMode);
        };

        checkStandalone();

        // Check notification permission
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            return permission;
        }
        return 'denied';
    };

    return {
        isOnline,
        isInstalled,
        isStandalone,
        notificationPermission,
        requestNotificationPermission
    };
}

// Touch-Optimized Button Component
interface TouchButtonProps extends React.ComponentProps<typeof Button> {
    touchSize?: 'sm' | 'md' | 'lg';
    haptic?: boolean;
}

export function TouchButton({ 
    children, 
    className, 
    touchSize = 'md', 
    haptic = false,
    onClick,
    ...props 
}: TouchButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Haptic feedback on supported devices
        if (haptic && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }

        onClick?.(e);
    };

    const sizeClasses = {
        sm: 'min-h-[44px] min-w-[44px] px-4 py-2',
        md: 'min-h-[48px] min-w-[48px] px-6 py-3',
        lg: 'min-h-[56px] min-w-[56px] px-8 py-4'
    };

    return (
        <Button
            className={cn(
                sizeClasses[touchSize],
                'touch-manipulation select-none',
                'active:scale-95 transition-transform duration-100',
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {children}
        </Button>
    );
}

// PWA Status Indicator
export function PWAStatusIndicator() {
    const { isOnline, isInstalled, notificationPermission } = usePWAStatus();

    return (
        <div className="flex items-center gap-2">
            {/* Online/Offline Status */}
            <Badge 
                variant={isOnline ? "secondary" : "destructive"}
                className="flex items-center gap-1"
            >
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? 'Online' : 'Offline'}
            </Badge>

            {/* Installation Status */}
            {isInstalled && (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    Installed
                </Badge>
            )}

            {/* Notification Status */}
            {notificationPermission === 'granted' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Notifications
                </Badge>
            )}
        </div>
    );
}

// Install Prompt Component
export function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDeferredPrompt(null);
    };

    if (!showPrompt) return null;

    return (
        <Card className="fixed bottom-4 left-4 right-4 z-50 bg-rt-red text-white border-rt-red shadow-rt-red-lg">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Download className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Install RT Express</h4>
                            <p className="text-sm text-white/80">Add to home screen for quick access</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TouchButton
                            size="sm"
                            variant="secondary"
                            onClick={handleInstall}
                            className="bg-white text-rt-red hover:bg-white/90"
                        >
                            Install
                        </TouchButton>
                        <TouchButton
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </TouchButton>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Offline Indicator
export function OfflineIndicator() {
    const { isOnline } = usePWAStatus();
    const [showOffline, setShowOffline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShowOffline(true);
        } else {
            // Hide after a delay when coming back online
            const timer = setTimeout(() => setShowOffline(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    if (!showOffline) return null;

    return (
        <div className={cn(
            "fixed top-4 left-4 right-4 z-50 p-3 rounded-lg shadow-lg transition-all duration-300",
            isOnline 
                ? "bg-green-500 text-white" 
                : "bg-yellow-500 text-black"
        )}>
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <Wifi className="h-4 w-4" />
                ) : (
                    <WifiOff className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                    {isOnline ? 'Back online!' : 'You\'re offline - Some features may be limited'}
                </span>
            </div>
        </div>
    );
}

// Update Available Notification
export function UpdateNotification() {
    const [showUpdate, setShowUpdate] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                setShowUpdate(true);
            });
        }
    }, []);

    const handleUpdate = async () => {
        setIsUpdating(true);
        
        // Refresh the page to load the new version
        window.location.reload();
    };

    const handleDismiss = () => {
        setShowUpdate(false);
    };

    if (!showUpdate) return null;

    return (
        <Card className="fixed top-4 left-4 right-4 z-50 bg-blue-500 text-white border-blue-500 shadow-lg">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <RefreshCw className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Update Available</h4>
                            <p className="text-sm text-white/80">A new version of RT Express is ready</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TouchButton
                            size="sm"
                            variant="secondary"
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="bg-white text-blue-500 hover:bg-white/90"
                        >
                            {isUpdating ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                'Update'
                            )}
                        </TouchButton>
                        <TouchButton
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </TouchButton>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Notification Permission Request
export function NotificationPermissionRequest() {
    const { notificationPermission, requestNotificationPermission } = usePWAStatus();
    const [showRequest, setShowRequest] = useState(false);

    useEffect(() => {
        // Show notification request after user has been active for a while
        if (notificationPermission === 'default') {
            const timer = setTimeout(() => setShowRequest(true), 30000); // 30 seconds
            return () => clearTimeout(timer);
        }
    }, [notificationPermission]);

    const handleRequest = async () => {
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
            // Show a test notification
            new Notification('RT Express', {
                body: 'Notifications enabled! You\'ll receive updates about your shipments.',
                icon: '/images/icons/icon-192x192.png'
            });
        }
        setShowRequest(false);
    };

    const handleDismiss = () => {
        setShowRequest(false);
    };

    if (!showRequest || notificationPermission !== 'default') return null;

    return (
        <Card className="fixed bottom-4 left-4 right-4 z-50 bg-blue-500 text-white border-blue-500 shadow-lg">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Stay Updated</h4>
                            <p className="text-sm text-white/80">Get notifications about your shipments</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TouchButton
                            size="sm"
                            variant="secondary"
                            onClick={handleRequest}
                            className="bg-white text-blue-500 hover:bg-white/90"
                        >
                            Enable
                        </TouchButton>
                        <TouchButton
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </TouchButton>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
