<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class CustomerRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create customer role
        $customerRole = Role::firstOrCreate(['name' => 'customer']);

        // Create customer-specific permissions
        $permissions = [
            'view own shipments',
            'create shipments',
            'track shipments',
            'view own invoices',
            'make payments',
            'manage profile',
            'view notifications',
            'request pickups',
            'create returns',
            'view analytics',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to customer role
        $customerRole->syncPermissions($permissions);

        $this->command->info('Customer role and permissions created successfully!');
    }
}
