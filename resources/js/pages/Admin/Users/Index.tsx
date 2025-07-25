import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Users, 
    UserPlus, 
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Eye,
    UserX,
    UserCheck,
    Shield,
    Clock,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useConfirmationModal } from '@/components/admin/ConfirmationModal';

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
    }>;
    created_shipments_count: number;
    assigned_shipments_count: number;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    online_now: number;
    new_this_month: number;
}

interface Props {
    users?: {
        data?: User[];
        links?: any[];
        meta?: {
            total?: number;
            from?: number;
            to?: number;
            last_page?: number;
        };
    };
    roles?: Role[];
    filters?: {
        search?: string;
        role?: string;
        status?: string;
    };
    stats?: Stats;
}

export default function UsersIndex({
    users = { data: [], links: [], meta: { total: 0, from: 0, to: 0, last_page: 1 } },
    roles = [],
    filters = {},
    stats = { total: 0, active: 0, inactive: 0, suspended: 0, online_now: 0, new_this_month: 0 }
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const { openModal, ConfirmationModal } = useConfirmationModal();

    const handleSearch = () => {
        router.get('/admin/users', {
            search: searchTerm,
            role: selectedRole === 'all' ? '' : selectedRole,
            status: selectedStatus === 'all' ? '' : selectedStatus,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = (user: User) => {
        const action = user.status === 'active' ? 'deactivate' : 'activate';
        const actionPast = user.status === 'active' ? 'deactivated' : 'activated';

        openModal({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            description: `Are you sure you want to ${action} ${user.name}? ${
                user.status === 'active'
                    ? 'This will prevent them from accessing the system.'
                    : 'This will restore their access to the system.'
            }`,
            confirmText: action.charAt(0).toUpperCase() + action.slice(1),
            variant: user.status === 'active' ? 'warning' : 'success',
            onConfirm: () => {
                router.post(`/admin/users/${user.id}/toggle-status`, {}, {
                    preserveScroll: true,
                });
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800',
        };
        
        return (
            <Badge className={variants[status as keyof typeof variants]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getRoleBadges = (userRoles: User['roles']) => {
        return userRoles.map((role) => (
            <Badge key={role.id} variant="outline" className="text-xs">
                {role.display_name}
            </Badge>
        ));
    };

    const formatLastLogin = (lastLogin?: string) => {
        if (!lastLogin) return 'Never';
        
        const date = new Date(lastLogin);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 15) return 'Online now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        
        return date.toLocaleDateString();
    };

    // Stats cards data
    const statsCards = [
        {
            title: 'Total Users',
            value: stats?.total || 0,
            description: `${stats?.new_this_month || 0} new this month`,
            icon: Users,
            color: 'text-blue-600',
        },
        {
            title: 'Active Users',
            value: stats?.active || 0,
            description: `${stats?.total ? Math.round(((stats?.active || 0) / stats.total) * 100) : 0}% of total`,
            icon: UserCheck,
            color: 'text-green-600',
        },
        {
            title: 'Online Now',
            value: stats?.online_now || 0,
            description: 'Active in last 15 minutes',
            icon: Clock,
            color: 'text-purple-600',
        },
        {
            title: 'Inactive/Suspended',
            value: (stats?.inactive || 0) + (stats?.suspended || 0),
            description: `${stats?.suspended || 0} suspended`,
            icon: AlertTriangle,
            color: 'text-orange-600',
        },
    ];

    return (
        <AppLayout>
            <Head title="User Management" />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            User Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage users, roles, and permissions across the platform
                        </p>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                        <Button size="sm" asChild>
                            <Link href="/admin/users/create">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add User
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((card) => (
                        <Card key={card.title} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                        <CardDescription>
                            Search and filter users by various criteria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {role.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSearch} className="w-full md:w-auto">
                                <Filter className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users ({users?.meta?.total || 0})</CardTitle>
                        <CardDescription>
                            Manage user accounts and their access permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Activity</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users?.data?.length > 0 ? users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {getRoleBadges(user.roles || [])}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(user.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>Created: {user.created_shipments_count || 0}</div>
                                                    <div>Assigned: {user.assigned_shipments_count || 0}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {formatLastLogin(user.last_login_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/users/${user.id}`}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/users/${user.id}/edit`}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit User
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={user.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                                                        >
                                                            {user.status === 'active' ? (
                                                                <>
                                                                    <UserX className="h-4 w-4 mr-2" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="h-4 w-4 mr-2" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>No users found</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {users?.meta?.last_page > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {users?.meta?.from || 0} to {users?.meta?.to || 0} of {users?.meta?.total || 0} users
                                </div>
                                <div className="flex space-x-2">
                                    {users?.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )) || []}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal />
        </AppLayout>
    );
}
