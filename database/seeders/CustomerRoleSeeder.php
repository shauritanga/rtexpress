<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class CustomerRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create customer role
        $customerRole = Role::firstOrCreate(
            ['name' => 'customer'],
            [
                'display_name' => 'Customer',
                'description' => 'Customer role with access to customer portal',
            ]
        );

        // Create customer-specific permissions
        $permissions = [
            [
                'name' => 'view own shipments',
                'display_name' => 'View Own Shipments',
                'description' => 'View own shipment records',
                'module' => 'customer',
            ],
            [
                'name' => 'create shipments',
                'display_name' => 'Create Shipments',
                'description' => 'Create new shipments',
                'module' => 'customer',
            ],
            [
                'name' => 'track shipments',
                'display_name' => 'Track Shipments',
                'description' => 'Track shipment status',
                'module' => 'customer',
            ],
            [
                'name' => 'view own invoices',
                'display_name' => 'View Own Invoices',
                'description' => 'View own invoice records',
                'module' => 'customer',
            ],
            [
                'name' => 'make payments',
                'display_name' => 'Make Payments',
                'description' => 'Make payments for invoices',
                'module' => 'customer',
            ],
            [
                'name' => 'manage profile',
                'display_name' => 'Manage Profile',
                'description' => 'Manage customer profile',
                'module' => 'customer',
            ],
            [
                'name' => 'view notifications',
                'display_name' => 'View Notifications',
                'description' => 'View notifications',
                'module' => 'customer',
            ],
            [
                'name' => 'request pickups',
                'display_name' => 'Request Pickups',
                'description' => 'Request pickup services',
                'module' => 'customer',
            ],
            [
                'name' => 'create returns',
                'display_name' => 'Create Returns',
                'description' => 'Create return shipments',
                'module' => 'customer',
            ],
            [
                'name' => 'view analytics',
                'display_name' => 'View Analytics',
                'description' => 'View customer analytics',
                'module' => 'customer',
            ],
        ];

        $permissionNames = [];
        foreach ($permissions as $permission) {
            $perm = Permission::firstOrCreate(
                ['name' => $permission['name']],
                [
                    'display_name' => $permission['display_name'],
                    'description' => $permission['description'],
                    'module' => $permission['module'],
                ]
            );
            $permissionNames[] = $perm->id;
        }

        // Assign permissions to customer role
        $customerRole->permissions()->sync($permissionNames);

        $this->command->info('Customer role and permissions created successfully!');
    }
}
