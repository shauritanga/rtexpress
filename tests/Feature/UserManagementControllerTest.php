<?php

use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    // Create a test admin user
    $adminRole = Role::create([
        'name' => 'admin',
        'display_name' => 'Administrator',
        'description' => 'Full system access',
    ]);

    $admin = User::factory()->create([
        'email' => 'admin@test.com',
        'status' => 'active',
    ]);

    $admin->roles()->attach($adminRole);

    $this->actingAs($admin);
});

test('users index returns correct data structure', function () {
    // Create some test users
    User::factory()->count(3)->create(['status' => 'active']);
    User::factory()->count(2)->create(['status' => 'inactive']);

    $response = $this->get('/admin/users');

    $response->assertStatus(200);

    // Check that the response has the required structure
    $response->assertInertia(fn ($page) => $page->component('Admin/Users/Index')
        ->has('users.data')
        ->has('roles')
        ->has('filters')
        ->has('stats')
        ->has('stats.total')
        ->has('stats.active')
        ->has('stats.inactive')
        ->has('stats.suspended')
        ->has('stats.online_now')
        ->has('stats.new_this_month')
    );
});

test('user stats are calculated correctly', function () {
    // Create test users with different statuses
    User::factory()->count(2)->create(['status' => 'active']);
    User::factory()->count(1)->create(['status' => 'inactive']);
    User::factory()->count(1)->create(['status' => 'suspended']);

    $response = $this->get('/admin/users');

    $response->assertInertia(fn ($page) => $page->where('stats.total', 5) // 4 created + 1 admin
        ->where('stats.active', 3) // 2 created + 1 admin
        ->where('stats.inactive', 1)
        ->where('stats.suspended', 1)
    );
});
