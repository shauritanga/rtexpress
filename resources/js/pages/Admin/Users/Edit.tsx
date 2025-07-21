import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    UserPlus, 
    ArrowLeft,
    Shield,
    Mail,
    Phone,
    Lock,
    User,
    AlertCircle,
    Save
} from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'suspended';
    roles: Array<{
        id: number;
        name: string;
        display_name: string;
    }>;
}

interface Props {
    user: User;
    roles: Role[];
}

export default function EditUser({ user, roles }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        password: '',
        password_confirmation: '',
        status: user.status,
        roles: user.roles.map(role => role.id),
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`, {
            onSuccess: () => {
                setData('password', '');
                setData('password_confirmation', '');
            },
        });
    };

    const handleRoleToggle = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter(id => id !== roleId));
        }
    };

    const getRoleColor = (roleName: string) => {
        const colors = {
            admin: 'bg-red-100 text-red-800 border-red-200',
            warehouse_staff: 'bg-blue-100 text-blue-800 border-blue-200',
            billing_admin: 'bg-green-100 text-green-800 border-green-200',
            customer_support: 'bg-purple-100 text-purple-800 border-purple-200',
        };
        return colors[roleName as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <AppLayout>
            <Head title={`Edit User: ${user.name}`} />
            
            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/users/${user.id}`}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                Edit User: {user.name}
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Update user information and permissions
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* User Information */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <User className="h-5 w-5" />
                                        <span>User Information</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Update basic information about the user
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter full name"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter email address"
                                                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Enter phone number"
                                                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-4">
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium mb-2">Change Password (Optional)</h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Leave blank to keep current password
                                            </p>
                                        </div>
                                        
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">New Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        placeholder="Enter new password"
                                                        className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                                                    />
                                                </div>
                                                {errors.password && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        placeholder="Confirm new password"
                                                        className={`pl-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                                                    />
                                                </div>
                                                {errors.password_confirmation && (
                                                    <p className="text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.password_confirmation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="show-password"
                                                checked={showPassword}
                                                onCheckedChange={setShowPassword}
                                            />
                                            <Label htmlFor="show-password" className="text-sm">
                                                Show passwords
                                            </Label>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Account Status *</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Role Assignment */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Shield className="h-5 w-5" />
                                        <span>Role Assignment</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Update user roles and permissions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {roles.map((role) => (
                                        <div key={role.id} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role.id}`}
                                                    checked={data.roles.includes(role.id)}
                                                    onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                                                />
                                                <Label htmlFor={`role-${role.id}`} className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{role.display_name}</span>
                                                        <Badge className={getRoleColor(role.name)}>
                                                            {role.name}
                                                        </Badge>
                                                    </div>
                                                </Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground ml-6">
                                                {role.description}
                                            </p>
                                        </div>
                                    ))}
                                    
                                    {errors.roles && (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.roles}
                                        </p>
                                    )}
                                    
                                    {data.roles.length === 0 && (
                                        <p className="text-sm text-orange-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            Please select at least one role
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/admin/users/${user.id}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing || data.roles.length === 0}>
                            {processing ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Save className="h-4 w-4" />
                                    <span>Update User</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
