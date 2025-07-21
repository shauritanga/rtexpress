<?php

use Illuminate\Support\Facades\Schema;

test('core tables exist after migration', function () {
    // Test that core tables exist
    expect(Schema::hasTable('users'))->toBeTrue();
    expect(Schema::hasTable('roles'))->toBeTrue();
    expect(Schema::hasTable('permissions'))->toBeTrue();
    expect(Schema::hasTable('role_user'))->toBeTrue();
    expect(Schema::hasTable('permission_role'))->toBeTrue();
    expect(Schema::hasTable('customers'))->toBeTrue();
    expect(Schema::hasTable('warehouses'))->toBeTrue();
    expect(Schema::hasTable('shipments'))->toBeTrue();
    expect(Schema::hasTable('settings'))->toBeTrue();
});

test('users table has been extended correctly', function () {
    expect(Schema::hasColumn('users', 'phone'))->toBeTrue();
    expect(Schema::hasColumn('users', 'avatar'))->toBeTrue();
    expect(Schema::hasColumn('users', 'status'))->toBeTrue();
    expect(Schema::hasColumn('users', 'last_login_at'))->toBeTrue();
});

test('roles table has correct structure', function () {
    expect(Schema::hasColumn('roles', 'name'))->toBeTrue();
    expect(Schema::hasColumn('roles', 'display_name'))->toBeTrue();
    expect(Schema::hasColumn('roles', 'description'))->toBeTrue();
});

test('permissions table has correct structure', function () {
    expect(Schema::hasColumn('permissions', 'name'))->toBeTrue();
    expect(Schema::hasColumn('permissions', 'display_name'))->toBeTrue();
    expect(Schema::hasColumn('permissions', 'description'))->toBeTrue();
    expect(Schema::hasColumn('permissions', 'module'))->toBeTrue();
});

test('customers table has correct structure', function () {
    expect(Schema::hasColumn('customers', 'customer_code'))->toBeTrue();
    expect(Schema::hasColumn('customers', 'company_name'))->toBeTrue();
    expect(Schema::hasColumn('customers', 'contact_person'))->toBeTrue();
    expect(Schema::hasColumn('customers', 'email'))->toBeTrue();
    expect(Schema::hasColumn('customers', 'phone'))->toBeTrue();
    expect(Schema::hasColumn('customers', 'status'))->toBeTrue();
    expect(Schema::hasColumn('customers', 'credit_limit'))->toBeTrue();
    expect(Schema::hasColumn('customers', 'payment_terms'))->toBeTrue();
});

test('shipments table has correct structure', function () {
    expect(Schema::hasColumn('shipments', 'tracking_number'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'customer_id'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'origin_warehouse_id'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'sender_name'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'recipient_name'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'service_type'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'package_type'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'weight_kg'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'status'))->toBeTrue();
    expect(Schema::hasColumn('shipments', 'created_by'))->toBeTrue();
});

test('warehouses table has correct structure', function () {
    expect(Schema::hasColumn('warehouses', 'code'))->toBeTrue();
    expect(Schema::hasColumn('warehouses', 'name'))->toBeTrue();
    expect(Schema::hasColumn('warehouses', 'address_line_1'))->toBeTrue();
    expect(Schema::hasColumn('warehouses', 'city'))->toBeTrue();
    expect(Schema::hasColumn('warehouses', 'country'))->toBeTrue();
    expect(Schema::hasColumn('warehouses', 'latitude'))->toBeTrue();
    expect(Schema::hasColumn('warehouses', 'longitude'))->toBeTrue();
    expect(Schema::hasColumn('warehouses', 'status'))->toBeTrue();
});

test('settings table has correct structure', function () {
    expect(Schema::hasColumn('settings', 'key'))->toBeTrue();
    expect(Schema::hasColumn('settings', 'value'))->toBeTrue();
    expect(Schema::hasColumn('settings', 'description'))->toBeTrue();
    expect(Schema::hasColumn('settings', 'is_public'))->toBeTrue();
    expect(Schema::hasColumn('settings', 'updated_by'))->toBeTrue();
});
