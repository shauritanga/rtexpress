<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

test('roles can be created and assigned permissions', function () {
    $role = Role::create([
        'name' => 'test_role',
        'display_name' => 'Test Role',
        'description' => 'A test role',
    ]);

    $permission = Permission::create([
        'name' => 'test.permission',
        'display_name' => 'Test Permission',
        'description' => 'A test permission',
        'module' => 'test',
    ]);

    $role->givePermission($permission);

    expect($role->hasPermission('test.permission'))->toBeTrue();
    expect($role->permissions)->toHaveCount(1);
});

test('users can be assigned roles', function () {
    $user = User::factory()->create();
    $role = Role::create([
        'name' => 'test_role',
        'display_name' => 'Test Role',
        'description' => 'A test role',
    ]);

    $user->assignRole($role);

    expect($user->hasRole('test_role'))->toBeTrue();
    expect($user->roles)->toHaveCount(1);
});

test('users inherit permissions from roles', function () {
    $user = User::factory()->create();

    $role = Role::create([
        'name' => 'test_role',
        'display_name' => 'Test Role',
        'description' => 'A test role',
    ]);

    $permission = Permission::create([
        'name' => 'test.permission',
        'display_name' => 'Test Permission',
        'description' => 'A test permission',
        'module' => 'test',
    ]);

    $role->givePermission($permission);
    $user->assignRole($role);

    expect($user->hasPermission('test.permission'))->toBeTrue();
    expect($user->getAllPermissions())->toContain('test.permission');
});

test('role permission seeder creates default roles and permissions', function () {
    $seeder = new RolePermissionSeeder;
    $seeder->run();

    // Check that default roles exist
    expect(Role::where('name', 'admin')->exists())->toBeTrue();
    expect(Role::where('name', 'warehouse_staff')->exists())->toBeTrue();
    expect(Role::where('name', 'billing_admin')->exists())->toBeTrue();
    expect(Role::where('name', 'customer_support')->exists())->toBeTrue();

    // Check that permissions exist
    expect(Permission::where('name', 'dashboard.view')->exists())->toBeTrue();
    expect(Permission::where('name', 'shipments.create')->exists())->toBeTrue();

    // Check that admin has all permissions
    $adminRole = Role::where('name', 'admin')->first();
    expect($adminRole->hasPermission('dashboard.view'))->toBeTrue();
    expect($adminRole->hasPermission('shipments.create'))->toBeTrue();
    expect($adminRole->hasPermission('users.create'))->toBeTrue();
});

test('warehouse staff has limited permissions', function () {
    $seeder = new RolePermissionSeeder;
    $seeder->run();

    $warehouseRole = Role::where('name', 'warehouse_staff')->first();

    // Should have warehouse-related permissions
    expect($warehouseRole->hasPermission('inventory.manage'))->toBeTrue();
    expect($warehouseRole->hasPermission('shipments.track'))->toBeTrue();

    // Should not have admin permissions
    expect($warehouseRole->hasPermission('users.create'))->toBeFalse();
    expect($warehouseRole->hasPermission('settings.edit'))->toBeFalse();
});

test('user status affects authentication', function () {
    $user = User::factory()->create(['status' => 'active']);
    expect($user->isActive())->toBeTrue();

    $user->update(['status' => 'inactive']);
    expect($user->isActive())->toBeFalse();

    $user->update(['status' => 'suspended']);
    expect($user->isActive())->toBeFalse();
});

test('user can have multiple roles', function () {
    $user = User::factory()->create();

    $role1 = Role::create([
        'name' => 'role1',
        'display_name' => 'Role 1',
        'description' => 'First role',
    ]);

    $role2 = Role::create([
        'name' => 'role2',
        'display_name' => 'Role 2',
        'description' => 'Second role',
    ]);

    $user->assignRole($role1);
    $user->assignRole($role2);

    expect($user->hasRole('role1'))->toBeTrue();
    expect($user->hasRole('role2'))->toBeTrue();
    expect($user->hasAnyRole(['role1', 'role3']))->toBeTrue();
    expect($user->hasAllRoles(['role1', 'role2']))->toBeTrue();
    expect($user->roles)->toHaveCount(2);
});

test('permissions can be grouped by module', function () {
    Permission::create([
        'name' => 'shipments.view',
        'display_name' => 'View Shipments',
        'description' => 'View shipment listings',
        'module' => 'shipments',
    ]);

    Permission::create([
        'name' => 'shipments.create',
        'display_name' => 'Create Shipments',
        'description' => 'Create new shipments',
        'module' => 'shipments',
    ]);

    Permission::create([
        'name' => 'users.view',
        'display_name' => 'View Users',
        'description' => 'View user listings',
        'module' => 'users',
    ]);

    $groupedPermissions = Permission::getByModule();

    expect($groupedPermissions)->toHaveKey('shipments');
    expect($groupedPermissions)->toHaveKey('users');
    expect($groupedPermissions['shipments'])->toHaveCount(2);
    expect($groupedPermissions['users'])->toHaveCount(1);
});
