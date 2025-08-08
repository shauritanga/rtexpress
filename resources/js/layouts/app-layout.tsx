import { InstallPrompt, NotificationPermissionRequest, OfflineIndicator, UpdateNotification } from '@/components/pwa/TouchOptimized';
import { Toaster } from '@/components/ui/toaster';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <>
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>

        {/* PWA Components */}
        <InstallPrompt />
        <OfflineIndicator />
        <UpdateNotification />
        <NotificationPermissionRequest />

        {/* Toast Notifications */}
        <Toaster />
    </>
);
