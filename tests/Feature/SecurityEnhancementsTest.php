<?php

use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles
    Role::create(['name' => 'customer', 'display_name' => 'Customer', 'description' => 'Customer role']);
    Role::create(['name' => 'admin', 'display_name' => 'Admin', 'description' => 'Admin role']);
});

describe('Email Verification', function () {
    test('user model implements MustVerifyEmail', function () {
        $user = new User;
        expect($user)->toBeInstanceOf(\Illuminate\Contracts\Auth\MustVerifyEmail::class);
    });

    test('registration redirects to email verification', function () {
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
    });
});

describe('Enhanced Password Policy', function () {
    test('password must meet enhanced requirements', function () {
        $response = $this->post('/register/customer', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
            'phone' => '+1234567890',
            'company_name' => 'Test Company',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '12345',
            'country' => 'US',
            'terms_accepted' => true,
        ]);

        $response->assertSessionHasErrors(['password']);
    });

    test('strong password is accepted', function () {
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
        expect(User::where('email', 'john@example.com')->exists())->toBeTrue();
    });
});

describe('Registration Rate Limiting', function () {
    test('registration is rate limited', function () {
        $data = [
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
        ];

        // Make 4 requests (should exceed the 3 per minute limit)
        for ($i = 0; $i < 4; $i++) {
            $data['email'] = "john{$i}@example.com";
            $response = $this->post('/register/customer', $data);

            if ($i < 3) {
                $response->assertRedirect();
            } else {
                $response->assertStatus(429); // Too Many Requests
            }
        }
    });
});

describe('Account Approval Workflow', function () {
    test('new customers are set to pending approval', function () {
        $this->post('/register/customer', [
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

        $customer = Customer::where('email', 'john@example.com')->first();
        expect($customer->status)->toBe('inactive'); // Inactive until admin approval
    });

    test('pending customers cannot access customer portal', function () {
        $user = User::factory()->create();
        $user->assignRole('customer');

        $customer = Customer::factory()->create([
            'status' => 'inactive', // Inactive until admin approval
        ]);
        $user->update(['customer_id' => $customer->id]);

        $response = $this->actingAs($user)->get('/customer/dashboard');
        $response->assertRedirect('/login');
        $response->assertSessionHasErrors(['access']);
    });
});

describe('Phone Number Validation', function () {
    test('invalid phone numbers are rejected', function () {
        $response = $this->post('/register/customer', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'MyVerySecureP@ssw0rd2024!',
            'password_confirmation' => 'MyVerySecureP@ssw0rd2024!',
            'phone' => 'invalid-phone',
            'company_name' => 'Test Company',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '12345',
            'country' => 'US',
            'terms_accepted' => true,
        ]);

        $response->assertSessionHasErrors(['phone']);
    });

    test('valid international phone numbers are accepted', function () {
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
    });
});

describe('Security Headers', function () {
    test('security headers are present', function () {
        $response = $this->get('/');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        expect($response->headers->has('Content-Security-Policy'))->toBeTrue();
    });
});

describe('Security Logging', function () {
    test('failed login attempts are logged', function () {
        Log::shouldReceive('warning')
            ->once()
            ->with('Failed login attempt', \Mockery::type('array'));

        $this->post('/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpassword',
        ]);
    });

    test('successful registrations are logged', function () {
        Log::shouldReceive('info')
            ->once()
            ->with('Customer registration completed', \Mockery::type('array'));

        $this->post('/register/customer', [
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
    });
});
