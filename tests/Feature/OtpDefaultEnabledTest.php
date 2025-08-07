<?php

use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles
    Role::create(['name' => 'customer', 'display_name' => 'Customer', 'description' => 'Customer role']);
    Role::create(['name' => 'admin', 'display_name' => 'Admin', 'description' => 'Admin role']);
});

describe('OTP Default Enabled', function () {
    test('new customer registration has OTP enabled by default', function () {
        $response = $this->post('/register/customer', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'MyVerySecureP@ssw0rd2024!',
            'password_confirmation' => 'MyVerySecureP@ssw0rd2024!',
            'phone' => '+1234567890',
            'company_name' => 'Test Company',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '12345',
            'country' => 'US',
            'terms_accepted' => true,
        ]);

        $response->assertRedirect(route('verification.notice'));
        
        // Verify user was created with OTP enabled
        $user = User::where('email', 'john@example.com')->first();
        expect($user)->not->toBeNull();
        expect($user->otp_enabled)->toBeTrue();
        expect($user->phone)->toBe('+1234567890');
    });

    test('standard registration has OTP enabled by default', function () {
        $response = $this->post('/register', [
            'company_name' => 'Test Company Ltd',
            'contact_person' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+9876543210',
            'password' => 'MyVerySecureP@ssw0rd2024!',
            'password_confirmation' => 'MyVerySecureP@ssw0rd2024!',
            'address_line_1' => '456 Test Ave',
            'address_line_2' => 'Suite 100',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '54321',
            'country' => 'Test Country',
            'terms' => true,
        ]);

        $response->assertRedirect(route('verification.notice'));
        
        // Verify user was created with OTP enabled
        $user = User::where('email', 'jane@example.com')->first();
        expect($user)->not->toBeNull();
        expect($user->otp_enabled)->toBeTrue();
        expect($user->phone)->toBe('+9876543210');
    });

    test('user model has otp_enabled field with correct default', function () {
        // Create a user using the factory
        $user = User::factory()->create([
            'phone' => '+1111111111'
        ]);

        // Check that OTP is enabled by default
        expect($user->otp_enabled)->toBeTrue();
    });

    test('users without phone numbers can still have OTP enabled', function () {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'otp_enabled' => true,
        ]);

        expect($user->otp_enabled)->toBeTrue();
        expect($user->phone)->toBeNull();
    });

    test('OTP can be manually disabled for specific users', function () {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'phone' => '+1234567890',
            'otp_enabled' => false, // Manually disable
        ]);

        expect($user->otp_enabled)->toBeFalse();
    });

    test('existing users can be bulk enabled with command', function () {
        // Create users with OTP disabled
        $user1 = User::create([
            'name' => 'User 1',
            'email' => 'user1@example.com',
            'password' => bcrypt('password'),
            'phone' => '+1111111111',
            'otp_enabled' => false,
        ]);

        $user2 = User::create([
            'name' => 'User 2',
            'email' => 'user2@example.com',
            'password' => bcrypt('password'),
            'phone' => '+2222222222',
            'otp_enabled' => false,
        ]);

        // User without phone
        $user3 = User::create([
            'name' => 'User 3',
            'email' => 'user3@example.com',
            'password' => bcrypt('password'),
            'otp_enabled' => false,
        ]);

        // Run the command
        $this->artisan('otp:enable-all')
            ->expectsOutput('🔐 Enabling OTP for all users...')
            ->expectsOutput('📱 Enabling OTP only for users with phone numbers')
            ->assertExitCode(0);

        // Refresh models
        $user1->refresh();
        $user2->refresh();
        $user3->refresh();

        // Check results
        expect($user1->otp_enabled)->toBeTrue();
        expect($user2->otp_enabled)->toBeTrue();
        expect($user3->otp_enabled)->toBeFalse(); // Should remain false (no phone)
    });

    test('force flag enables OTP for all users including those without phone', function () {
        // Create user without phone
        $user = User::create([
            'name' => 'User Without Phone',
            'email' => 'nophone@example.com',
            'password' => bcrypt('password'),
            'otp_enabled' => false,
        ]);

        // Run command with force flag
        $this->artisan('otp:enable-all --force')
            ->expectsOutput('🔐 Enabling OTP for all users...')
            ->expectsOutput('⚠️  Force mode: Enabling OTP for ALL users (including those without phone numbers)')
            ->assertExitCode(0);

        // Refresh model
        $user->refresh();

        // Check result
        expect($user->otp_enabled)->toBeTrue();
    });
});
