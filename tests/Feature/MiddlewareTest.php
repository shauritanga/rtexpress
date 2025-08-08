<?php

use App\Http\Middleware\PermissionMiddleware;
use App\Http\Middleware\RoleMiddleware;
use App\Models\Customer;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

test('role middleware allows users with correct role', function () {
    $user = User::factory()->create(['status' => 'active']);
    $role = Role::create([
        'name' => 'admin',
        'display_name' => 'Administrator',
        'description' => 'Admin role',
    ]);

    $user->assignRole($role);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware = new RoleMiddleware;
    $response = $middleware->handle($request, fn () => new Response('OK'), 'admin');

    expect($response->getContent())->toBe('OK');
});

test('role middleware blocks users without correct role', function () {
    // Create a customer user (has customer_id, so not admin)
    $customer = Customer::factory()->create();
    $user = User::factory()->create([
        'status' => 'active',
        'customer_id' => $customer->id,
    ]);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware = new RoleMiddleware;

    expect(fn () => $middleware->handle($request, fn () => new Response('OK'), 'admin'))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

test('role middleware blocks inactive users', function () {
    $user = User::factory()->create(['status' => 'inactive']);
    $role = Role::create([
        'name' => 'admin',
        'display_name' => 'Administrator',
        'description' => 'Admin role',
    ]);

    $user->assignRole($role);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    // Mock the auth facade
    $this->mock('auth', function ($mock) {
        $mock->shouldReceive('logout')->once();
    });

    $middleware = new RoleMiddleware;
    $response = $middleware->handle($request, fn () => new Response('OK'), 'admin');

    expect($response->getStatusCode())->toBe(302); // Redirect
});

test('permission middleware allows users with correct permission', function () {
    $user = User::factory()->create(['status' => 'active']);
    $role = Role::create([
        'name' => 'admin',
        'display_name' => 'Administrator',
        'description' => 'Admin role',
    ]);

    $permission = Permission::create([
        'name' => 'test.permission',
        'display_name' => 'Test Permission',
        'description' => 'Test permission',
        'module' => 'test',
    ]);

    $role->givePermission($permission);
    $user->assignRole($role);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware = new PermissionMiddleware;
    $response = $middleware->handle($request, fn () => new Response('OK'), 'test.permission');

    expect($response->getContent())->toBe('OK');
});

test('permission middleware blocks users without correct permission', function () {
    $user = User::factory()->create(['status' => 'active']);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $middleware = new PermissionMiddleware;

    expect(fn () => $middleware->handle($request, fn () => new Response('OK'), 'test.permission'))
        ->toThrow(\Symfony\Component\HttpKernel\Exception\HttpException::class);
});

test('middleware allows access when no roles or permissions specified', function () {
    $user = User::factory()->create(['status' => 'active']);

    $request = Request::create('/test');
    $request->setUserResolver(fn () => $user);

    $roleMiddleware = new RoleMiddleware;
    $permissionMiddleware = new PermissionMiddleware;

    $roleResponse = $roleMiddleware->handle($request, fn () => new Response('OK'));
    $permissionResponse = $permissionMiddleware->handle($request, fn () => new Response('OK'));

    expect($roleResponse->getContent())->toBe('OK');
    expect($permissionResponse->getContent())->toBe('OK');
});

test('middleware redirects unauthenticated users', function () {
    $request = Request::create('/test');
    $request->setUserResolver(fn () => null);

    $roleMiddleware = new RoleMiddleware;
    $permissionMiddleware = new PermissionMiddleware;

    $roleResponse = $roleMiddleware->handle($request, fn () => new Response('OK'), 'admin');
    $permissionResponse = $permissionMiddleware->handle($request, fn () => new Response('OK'), 'test.permission');

    expect($roleResponse->getStatusCode())->toBe(302); // Redirect to login
    expect($permissionResponse->getStatusCode())->toBe(302); // Redirect to login
});
