import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    LayoutGrid,
    Package,
    Scan,
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
    Calculator,
    Home,
    HelpCircle
} from 'lucide-react';
import AppLogo from './app-logo';

// Core Operations - Daily workflow items (highest priority)
const coreOperationsNavItems: NavItem[] = [
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
        title: 'Live Tracking',
        href: '/admin/tracking/live',
        icon: Activity,
    },
    {
        title: 'Customers',
        href: '/admin/customers',
        icon: Users,
    },
];

// Business Management - Regular business operations
const businessManagementNavItems: NavItem[] = [
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
];

// Infrastructure & Setup - Less frequent but important
const infrastructureNavItems: NavItem[] = [
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
    {
        title: 'User Management',
        href: '/admin/users',
        icon: UserCog,
    },
];

// Analytics & Monitoring - Strategic oversight
const analyticsNavItems: NavItem[] = [
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
    },
    {
        title: 'Real-time Dashboard',
        href: '/admin/tracking/dashboard',
        icon: Wifi,
    },
];

// Support & Communication - Customer service
const supportNavItems: NavItem[] = [
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
                {isCustomer ? (
                    <NavMain items={customerNavItems} />
                ) : (
                    <>
                        {/* Core Operations - Most frequently used */}
                        <SidebarGroup>
                            <SidebarGroupLabel>
                                Core Operations
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <NavMain items={coreOperationsNavItems} />
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {/* Business Management - Regular operations */}
                        <SidebarGroup>
                            <SidebarGroupLabel>
                                Business Management
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <NavMain items={businessManagementNavItems} />
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {/* Infrastructure & Setup - Configuration */}
                        <SidebarGroup>
                            <SidebarGroupLabel>
                                Infrastructure
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <NavMain items={infrastructureNavItems} />
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {/* Analytics & Monitoring - Strategic oversight */}
                        <SidebarGroup>
                            <SidebarGroupLabel>
                                Analytics & Monitoring
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <NavMain items={analyticsNavItems} />
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {/* Support & Communication - Customer service */}
                        <SidebarGroup>
                            <SidebarGroupLabel>
                                Support & Communication
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <NavMain items={supportNavItems} />
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
