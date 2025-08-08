import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, Calendar, CheckCircle, Clock, Edit, Mail, Package, Phone, Shield, User as UserIcon } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'suspended';
    email_verified_at?: string;
    last_login_at?: string;
    created_at: string;
    roles: Array<{
        id: number;
        name: string;
        display_name: string;
        permissions: Array<{
            id: number;
            name: string;
            display_name: string;
        }>;
    }>;
    created_shipments: Array<{
        id: number;
        tracking_number: string;
        status: string;
        customer: {
            company_name: string;
        };
        origin_warehouse: {
            name: string;
        };
        created_at: string;
    }>;
    assigned_shipments: Array<{
        id: number;
        tracking_number: string;
        status: string;
        customer: {
            company_name: string;
        };
        origin_warehouse: {
            name: string;
        };
        created_at: string;
    }>;
}

interface UserStats {
    total_created_shipments: number;
    total_assigned_shipments: number;
    active_assignments: number;
    completed_assignments: number;
    last_login?: string;
    account_age_days: number;
}

interface Props {
    user: User;
    userStats: UserStats;
}

export default function ShowUser({ user, userStats }: Props) {
    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800',
        };

        return <Badge className={variants[status as keyof typeof variants]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const getRoleBadge = (role: User['roles'][0]) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            warehouse_staff: 'bg-blue-100 text-blue-800',
            billing_admin: 'bg-green-100 text-green-800',
            customer_support: 'bg-purple-100 text-purple-800',
        };

        return (
            <Badge key={role.id} className={colors[role.name as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
                {role.display_name}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatLastLogin = (lastLogin?: string) => {
        if (!lastLogin) return 'Never';

        const date = new Date(lastLogin);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 15) return 'Online now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;

        return date.toLocaleDateString();
    };

    // Stats cards data
    const statsCards = [
        {
            title: 'Created Shipments',
            value: userStats.total_created_shipments,
            description: 'Total shipments created',
            icon: Package,
            color: 'text-blue-600',
        },
        {
            title: 'Assigned Shipments',
            value: userStats.total_assigned_shipments,
            description: `${userStats.active_assignments} currently active`,
            icon: Activity,
            color: 'text-green-600',
        },
        {
            title: 'Completed Tasks',
            value: userStats.completed_assignments,
            description: 'Successfully completed',
            icon: CheckCircle,
            color: 'text-purple-600',
        },
        {
            title: 'Account Age',
            value: `${userStats.account_age_days ? Number(userStats.account_age_days).toFixed(1) : '0.0'} days`,
            description: 'Since account creation',
            icon: Calendar,
            color: 'text-orange-600',
        },
    ];

    return (
        <AppLayout>
            <Head title={`User: ${user.name}`} />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/users">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{user.name}</h1>
                            {getStatusBadge(user.status)}
                        </div>
                        <p className="text-muted-foreground">User details and activity overview</p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button size="sm" asChild>
                            <Link href={`/admin/users/${user.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* User Information */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <UserIcon className="h-5 w-5" />
                                    <span>User Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            <span>Email</span>
                                        </div>
                                        <p className="font-medium">{user.email}</p>
                                        {user.email_verified_at && (
                                            <p className="flex items-center text-xs text-green-600">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Verified
                                            </p>
                                        )}
                                    </div>

                                    {user.phone && (
                                        <div>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>Phone</span>
                                            </div>
                                            <p className="font-medium">{user.phone}</p>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Created</span>
                                        </div>
                                        <p className="font-medium">{formatDate(user.created_at)}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>Last Login</span>
                                        </div>
                                        <p className="font-medium">{formatLastLogin(user.last_login_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Stats */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {statsCards.map((card) => (
                                <Card key={card.title} className="transition-shadow hover:shadow-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                        <card.icon className={`h-4 w-4 ${card.color}`} />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{card.value}</div>
                                        <p className="text-xs text-muted-foreground">{card.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Recent Shipments */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest shipments created and assigned to this user</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {user.created_shipments.length > 0 && (
                                        <div>
                                            <h4 className="mb-2 font-medium">Recently Created Shipments</h4>
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Tracking #</TableHead>
                                                            <TableHead>Customer</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead>Created</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {user.created_shipments.slice(0, 5).map((shipment) => (
                                                            <TableRow key={shipment.id}>
                                                                <TableCell className="font-medium">
                                                                    <Link
                                                                        href={`/admin/shipments/${shipment.id}`}
                                                                        className="text-blue-600 hover:underline"
                                                                    >
                                                                        {shipment.tracking_number}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>{shipment.customer.company_name}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{shipment.status.replace('_', ' ')}</Badge>
                                                                </TableCell>
                                                                <TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}

                                    {user.assigned_shipments.length > 0 && (
                                        <div>
                                            <h4 className="mb-2 font-medium">Recently Assigned Shipments</h4>
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Tracking #</TableHead>
                                                            <TableHead>Customer</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead>Assigned</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {user.assigned_shipments.slice(0, 5).map((shipment) => (
                                                            <TableRow key={shipment.id}>
                                                                <TableCell className="font-medium">
                                                                    <Link
                                                                        href={`/admin/shipments/${shipment.id}`}
                                                                        className="text-blue-600 hover:underline"
                                                                    >
                                                                        {shipment.tracking_number}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>{shipment.customer.company_name}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{shipment.status.replace('_', ' ')}</Badge>
                                                                </TableCell>
                                                                <TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}

                                    {user.created_shipments.length === 0 && user.assigned_shipments.length === 0 && (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <Package className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                            <p>No recent shipment activity</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Roles & Permissions */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5" />
                                    <span>Roles & Permissions</span>
                                </CardTitle>
                                <CardDescription>User roles and associated permissions</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-medium">Assigned Roles</h4>
                                    <div className="space-y-2">{user.roles.map((role) => getRoleBadge(role))}</div>
                                </div>

                                <div>
                                    <h4 className="mb-2 font-medium">Permissions</h4>
                                    <div className="max-h-64 space-y-2 overflow-y-auto">
                                        {user.roles
                                            .flatMap((role) => role.permissions)
                                            .map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2 text-sm">
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                    <span>{permission.display_name}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
