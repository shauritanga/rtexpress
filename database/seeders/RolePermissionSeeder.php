<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = $this->getPermissions();

        foreach ($permissions as $module => $modulePermissions) {
            foreach ($modulePermissions as $permission) {
                Permission::firstOrCreate(
                    ['name' => $permission['name']],
                    [
                        'display_name' => $permission['display_name'],
                        'description' => $permission['description'],
                        'module' => $module,
                    ]
                );
            }
        }

        // Create roles
        $roles = $this->getRoles();

        foreach ($roles as $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleData['name']],
                [
                    'display_name' => $roleData['display_name'],
                    'description' => $roleData['description'],
                ]
            );

            // Assign permissions to role
            if (isset($roleData['permissions'])) {
                $permissionIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id');
                $role->permissions()->sync($permissionIds);
            }
        }
    }

    /**
     * Get all permissions organized by module.
     */
    private function getPermissions(): array
    {
        return [
            'dashboard' => [
                ['name' => 'dashboard.view', 'display_name' => 'View Dashboard', 'description' => 'Access to main dashboard'],
                ['name' => 'dashboard.analytics', 'display_name' => 'View Analytics', 'description' => 'Access to analytics and reports'],
            ],
            'shipments' => [
                ['name' => 'shipments.view', 'display_name' => 'View Shipments', 'description' => 'View shipment listings'],
                ['name' => 'shipments.create', 'display_name' => 'Create Shipments', 'description' => 'Create new shipments'],
                ['name' => 'shipments.edit', 'display_name' => 'Edit Shipments', 'description' => 'Edit existing shipments'],
                ['name' => 'shipments.delete', 'display_name' => 'Delete Shipments', 'description' => 'Delete shipments'],
                ['name' => 'shipments.track', 'display_name' => 'Track Shipments', 'description' => 'Update shipment tracking status'],
                ['name' => 'shipments.assign', 'display_name' => 'Assign Shipments', 'description' => 'Assign shipments to staff'],
            ],
            'customers' => [
                ['name' => 'customers.view', 'display_name' => 'View Customers', 'description' => 'View customer listings'],
                ['name' => 'customers.create', 'display_name' => 'Create Customers', 'description' => 'Create new customers'],
                ['name' => 'customers.edit', 'display_name' => 'Edit Customers', 'description' => 'Edit customer information'],
                ['name' => 'customers.delete', 'display_name' => 'Delete Customers', 'description' => 'Delete customers'],
            ],
            'warehouses' => [
                ['name' => 'warehouses.view', 'display_name' => 'View Warehouses', 'description' => 'View warehouse listings'],
                ['name' => 'warehouses.create', 'display_name' => 'Create Warehouses', 'description' => 'Create new warehouses'],
                ['name' => 'warehouses.edit', 'display_name' => 'Edit Warehouses', 'description' => 'Edit warehouse information'],
                ['name' => 'warehouses.delete', 'display_name' => 'Delete Warehouses', 'description' => 'Delete warehouses'],
            ],
            'inventory' => [
                ['name' => 'inventory.view', 'display_name' => 'View Inventory', 'description' => 'View inventory levels'],
                ['name' => 'inventory.manage', 'display_name' => 'Manage Inventory', 'description' => 'Update inventory levels'],
                ['name' => 'inventory.scan', 'display_name' => 'Barcode Scanning', 'description' => 'Use barcode scanning features'],
            ],
            'billing' => [
                ['name' => 'billing.view', 'display_name' => 'View Billing', 'description' => 'View invoices and payments'],
                ['name' => 'billing.create', 'display_name' => 'Create Invoices', 'description' => 'Generate invoices'],
                ['name' => 'billing.edit', 'display_name' => 'Edit Billing', 'description' => 'Edit invoices and payments'],
                ['name' => 'billing.process', 'display_name' => 'Process Payments', 'description' => 'Process payment transactions'],
            ],
            'support' => [
                ['name' => 'support.view', 'display_name' => 'View Support Tickets', 'description' => 'View support tickets'],
                ['name' => 'support.create', 'display_name' => 'Create Tickets', 'description' => 'Create support tickets'],
                ['name' => 'support.assign', 'display_name' => 'Assign Tickets', 'description' => 'Assign tickets to staff'],
                ['name' => 'support.resolve', 'display_name' => 'Resolve Tickets', 'description' => 'Resolve support tickets'],
            ],
            'users' => [
                ['name' => 'users.view', 'display_name' => 'View Users', 'description' => 'View user listings'],
                ['name' => 'users.create', 'display_name' => 'Create Users', 'description' => 'Create new users'],
                ['name' => 'users.edit', 'display_name' => 'Edit Users', 'description' => 'Edit user information'],
                ['name' => 'users.delete', 'display_name' => 'Delete Users', 'description' => 'Delete users'],
                ['name' => 'users.roles', 'display_name' => 'Manage Roles', 'description' => 'Assign and manage user roles'],
            ],
            'settings' => [
                ['name' => 'settings.view', 'display_name' => 'View Settings', 'description' => 'View system settings'],
                ['name' => 'settings.edit', 'display_name' => 'Edit Settings', 'description' => 'Modify system settings'],
            ],
        ];
    }

    /**
     * Get all roles with their permissions.
     */
    private function getRoles(): array
    {
        return [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access with all permissions',
                'permissions' => [
                    'dashboard.view', 'dashboard.analytics',
                    'shipments.view', 'shipments.create', 'shipments.edit', 'shipments.delete', 'shipments.track', 'shipments.assign',
                    'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
                    'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
                    'inventory.view', 'inventory.manage', 'inventory.scan',
                    'billing.view', 'billing.create', 'billing.edit', 'billing.process',
                    'support.view', 'support.create', 'support.assign', 'support.resolve',
                    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.roles',
                    'settings.view', 'settings.edit',
                ],
            ],
            [
                'name' => 'warehouse_staff',
                'display_name' => 'Warehouse Staff',
                'description' => 'Warehouse operations and inventory management',
                'permissions' => [
                    'dashboard.view',
                    'shipments.view', 'shipments.track',
                    'inventory.view', 'inventory.manage', 'inventory.scan',
                    'warehouses.view',
                ],
            ],
            [
                'name' => 'billing_admin',
                'display_name' => 'Billing Administrator',
                'description' => 'Billing and financial operations management',
                'permissions' => [
                    'dashboard.view', 'dashboard.analytics',
                    'shipments.view',
                    'customers.view', 'customers.edit',
                    'billing.view', 'billing.create', 'billing.edit', 'billing.process',
                ],
            ],
            [
                'name' => 'customer_support',
                'display_name' => 'Customer Support',
                'description' => 'Customer service and support operations',
                'permissions' => [
                    'dashboard.view',
                    'shipments.view', 'shipments.track',
                    'customers.view', 'customers.edit',
                    'support.view', 'support.create', 'support.assign', 'support.resolve',
                ],
            ],
        ];
    }
}
