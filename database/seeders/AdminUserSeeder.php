<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@rtexpress.com'],
            [
                'name' => 'RT Express Admin',
                'password' => Hash::make('password'),
                'phone' => '+255123456789',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }

        // Create sample users for different roles
        $warehouseUser = User::firstOrCreate(
            ['email' => 'warehouse@rtexpress.com'],
            [
                'name' => 'Warehouse Manager',
                'password' => Hash::make('password'),
                'phone' => '+255123456790',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $warehouseRole = Role::where('name', 'warehouse_staff')->first();
        if ($warehouseRole) {
            $warehouseUser->assignRole($warehouseRole);
        }

        $billingUser = User::firstOrCreate(
            ['email' => 'billing@rtexpress.com'],
            [
                'name' => 'Billing Administrator',
                'password' => Hash::make('password'),
                'phone' => '+255123456791',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $billingRole = Role::where('name', 'billing_admin')->first();
        if ($billingRole) {
            $billingUser->assignRole($billingRole);
        }

        $supportUser = User::firstOrCreate(
            ['email' => 'support@rtexpress.com'],
            [
                'name' => 'Customer Support',
                'password' => Hash::make('password'),
                'phone' => '+255123456792',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $supportRole = Role::where('name', 'customer_support')->first();
        if ($supportRole) {
            $supportUser->assignRole($supportRole);
        }

        $this->command->info('Admin and sample users created successfully!');
        $this->command->info('Admin: admin@rtexpress.com / password');
        $this->command->info('Warehouse: warehouse@rtexpress.com / password');
        $this->command->info('Billing: billing@rtexpress.com / password');
        $this->command->info('Support: support@rtexpress.com / password');
    }
}
