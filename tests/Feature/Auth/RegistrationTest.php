<?php

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new customers can register', function () {
    $response = $this->post('/register', [
        'company_name' => 'Test Company Ltd',
        'contact_person' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '+1234567890',
        'password' => 'MyVerySecureP@ssw0rd2024!',
        'password_confirmation' => 'MyVerySecureP@ssw0rd2024!',
        'address_line_1' => '123 Test Street',
        'address_line_2' => 'Suite 100',
        'city' => 'Test City',
        'state_province' => 'Test State',
        'postal_code' => '12345',
        'country' => 'Test Country',
        'terms' => true,
    ]);

    // With our security enhancements, users are not auto-logged in
    // They need to verify their email first
    $this->assertGuest();
    $response->assertRedirect(route('verification.notice'));

    // Verify user was created
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);
});