import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import {
    InstallPrompt,
    OfflineIndicator,
    UpdateNotification,
    NotificationPermissionRequest
} from '@/components/pwa/TouchOptimized';

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
    </>
);
