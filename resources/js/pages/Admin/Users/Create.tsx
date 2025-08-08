import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Lock, Mail, Phone, Shield, User, UserPlus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
}

interface Props {
    roles: Role[];
}

export default function CreateUser({ roles }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        status: 'active',
        roles: [] as number[],
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => reset(),
        });
    };

    const handleRoleToggle = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData(
                'roles',
                data.roles.filter((id) => id !== roleId),
            );
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
            <Head title="Create User" />

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
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Create New User</h1>
                        </div>
                        <p className="text-muted-foreground">Add a new user to the RT Express platform</p>
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
                                    <CardDescription>Basic information about the user</CardDescription>
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
                                            <p className="flex items-center text-sm text-red-600">
                                                <AlertCircle className="mr-1 h-4 w-4" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <div className="relative">
                                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                            <p className="flex items-center text-sm text-red-600">
                                                <AlertCircle className="mr-1 h-4 w-4" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                            <p className="flex items-center text-sm text-red-600">
                                                <AlertCircle className="mr-1 h-4 w-4" />
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password *</Label>
                                            <div className="relative">
                                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Enter password"
                                                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.password && (
                                                <p className="flex items-center text-sm text-red-600">
                                                    <AlertCircle className="mr-1 h-4 w-4" />
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                            <div className="relative">
                                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="password_confirmation"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="Confirm password"
                                                    className={`pl-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="flex items-center text-sm text-red-600">
                                                    <AlertCircle className="mr-1 h-4 w-4" />
                                                    {errors.password_confirmation}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="show-password" checked={showPassword} onCheckedChange={setShowPassword} />
                                        <Label htmlFor="show-password" className="text-sm">
                                            Show passwords
                                        </Label>
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
                                            <p className="flex items-center text-sm text-red-600">
                                                <AlertCircle className="mr-1 h-4 w-4" />
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
                                    <CardDescription>Select one or more roles for this user</CardDescription>
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
                                                        <Badge className={getRoleColor(role.name)}>{role.name}</Badge>
                                                    </div>
                                                </Label>
                                            </div>
                                            <p className="ml-6 text-sm text-muted-foreground">{role.description}</p>
                                        </div>
                                    ))}

                                    {errors.roles && (
                                        <p className="flex items-center text-sm text-red-600">
                                            <AlertCircle className="mr-1 h-4 w-4" />
                                            {errors.roles}
                                        </p>
                                    )}

                                    {data.roles.length === 0 && (
                                        <p className="flex items-center text-sm text-orange-600">
                                            <AlertCircle className="mr-1 h-4 w-4" />
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
                            <Link href="/admin/users">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing || data.roles.length === 0}>
                            {processing ? (
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                    <span>Creating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <UserPlus className="h-4 w-4" />
                                    <span>Create User</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
