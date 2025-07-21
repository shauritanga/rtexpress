import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    LayoutGrid,
    Package,
    Truck,
    Users,
    UserCog,
    Warehouse,
    CreditCard,
    DollarSign,
    Package2,
    MapPin,
    FileText,
    Bell,
    Settings,
    HeadphonesIcon,
    Activity,
    Wifi,
    Sparkles,
    Zap,
    Calculator,
    Home,
    HelpCircle
} from 'lucide-react';
import AppLogo from './app-logo';

// Admin navigation items
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Shipments',
        href: '/admin/shipments',
        icon: Package,
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'User Management',
        href: '/admin/users',
        icon: UserCog,
    },
    {
        title: 'Customers',
        href: '/admin/customers',
        icon: Users,
    },
    {
        title: 'Warehouses',
        href: '/admin/warehouses',
        icon: Warehouse,
    },
    {
        title: 'Routes',
        href: '/admin/routes',
        icon: Truck,
    },
];

// Customer navigation items
const customerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/customer/dashboard',
        icon: Home,
    },
    {
        title: 'Shipments',
        href: '/customer/shipments',
        icon: Package,
    },
    {
        title: 'Tracking',
        href: '/customer/tracking',
        icon: MapPin,
    },
    {
        title: 'Rate Calculator',
        href: '/customer/rates',
        icon: Calculator,
    },
    {
        title: 'Invoices',
        href: '/customer/invoices',
        icon: FileText,
    },
    {
        title: 'Payments',
        href: '/customer/payments',
        icon: CreditCard,
    },
    {
        title: 'Analytics',
        href: '/customer/analytics',
        icon: BarChart3,
    },
    {
        title: 'Notifications',
        href: '/customer/notifications',
        icon: Bell,
    },
    {
        title: 'Support',
        href: '/customer/support',
        icon: HeadphonesIcon,
    },
    {
        title: 'Help Center',
        href: '/customer/help',
        icon: HelpCircle,
    },
];

// Admin-only navigation items
const adminOnlyNavItems: NavItem[] = [
    {
        title: 'Invoicing & Billing',
        href: '/admin/billing',
        icon: CreditCard,
    },
    {
        title: 'Payments',
        href: '/admin/payments',
        icon: DollarSign,
    },
    {
        title: 'Inventory',
        href: '/admin/inventory',
        icon: Package2,
    },
    {
        title: 'Customs',
        href: '/admin/customs',
        icon: FileText,
    },
    {
        title: 'Support',
        href: '/admin/support',
        icon: HeadphonesIcon,
    },
    {
        title: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
    },
];

// Real-time tracking navigation items
const realTimeNavItems: NavItem[] = [
    {
        title: 'Live Tracking',
        href: '/admin/tracking/live',
        icon: Activity,
    },
    {
        title: 'Real-time Dashboard',
        href: '/admin/tracking/dashboard',
        icon: Wifi,
    },
    {
        title: 'Advanced Features Demo',
        href: '/admin/demo/advanced-features',
        icon: Sparkles,
    },
    {
        title: 'WebSocket Test',
        href: '/admin/demo/websocket-test',
        icon: Zap,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Documentation',
        href: '/docs',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const page = usePage();
    const user = (page.props as any)?.auth?.user;

    // Check if user is a customer (has customer_id or customer relationship)
    const isCustomer = user?.customer_id || user?.customer;
    const isAdmin = !isCustomer;

    // Choose navigation items based on user role
    const mainNavItems = isCustomer ? customerNavItems : adminNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="space-y-0">
                <NavMain items={mainNavItems} />
                {isAdmin && <NavMain items={adminOnlyNavItems} />}
                {isAdmin && (
                    <div className="px-3 py-2">
                        <h4 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
                            Real-time Tracking
                        </h4>
                        <NavMain items={realTimeNavItems} />
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
