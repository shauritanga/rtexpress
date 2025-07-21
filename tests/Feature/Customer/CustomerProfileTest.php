<?php

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('customer profile page requires authentication', function () {
    $response = $this->get('/customer/profile');

    $response->assertRedirect('/login');
});

test('customer can view profile page', function () {
    // Create customer user
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $user->update(['customer_id' => $customer->id]);

    $this->actingAs($user);

    $response = $this->get('/customer/profile');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) =>
        $page->has('user')
             ->has('customer')
    );
});

test('customer can view profile edit page', function () {
    // Create customer user
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $user->update(['customer_id' => $customer->id]);

    $this->actingAs($user);

    $response = $this->get('/customer/profile/edit');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) =>
        $page->has('user')
             ->has('customer')
    );
});

test('customer can update profile successfully', function () {
    // Create customer user
    $user = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old@test.com',
    ]);
    $customer = Customer::factory()->create([
        'company_name' => 'Old Company',
        'contact_person' => 'Old Name',
        'email' => 'old@test.com',
    ]);
    $user->update(['customer_id' => $customer->id]);

    $this->actingAs($user);

    $updateData = [
        'name' => 'New Name',
        'email' => 'new@test.com',
        'phone' => '+1234567890',
        'company_name' => 'New Company Ltd',
        'contact_person' => 'New Name',
        'address_line_1' => '123 New Street',
        'address_line_2' => 'Suite 200',
        'city' => 'New City',
        'state_province' => 'New State',
        'postal_code' => '54321',
        'country' => 'New Country',
    ];

    $response = $this->put('/customer/profile', $updateData);

    $response->assertRedirect('/customer/profile');

    // Check user was updated
    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'New Name',
        'email' => 'new@test.com',
        'phone' => '+1234567890',
    ]);

    // Check customer was updated
    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'company_name' => 'New Company Ltd',
        'contact_person' => 'New Name',
        'email' => 'new@test.com',
    ]);
});

test('customer profile update requires valid data', function () {
    // Create customer user
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $user->update(['customer_id' => $customer->id]);

    $this->actingAs($user);

    $response = $this->put('/customer/profile', []);

    $response->assertSessionHasErrors([
        'name',
        'email',
        'company_name',
        'contact_person',
        'address_line_1',
        'city',
        'state_province',
        'postal_code',
        'country',
    ]);
});

test('customer can update password successfully', function () {
    // Create customer user
    $user = User::factory()->create([
        'password' => Hash::make('oldpassword'),
    ]);
    $customer = Customer::factory()->create();
    $user->update(['customer_id' => $customer->id]);

    $this->actingAs($user);

    $response = $this->put('/customer/profile/password', [
        'current_password' => 'oldpassword',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertRedirect();

    // Verify password was changed
    $user->refresh();
    $this->assertTrue(Hash::check('newpassword123', $user->password));
});

test('customer password update requires correct current password', function () {
    // Create customer user
    $user = User::factory()->create([
        'password' => Hash::make('correctpassword'),
    ]);
    $customer = Customer::factory()->create();
    $user->update(['customer_id' => $customer->id]);

    $this->actingAs($user);

    $response = $this->put('/customer/profile/password', [
        'current_password' => 'wrongpassword',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors(['current_password']);
});
