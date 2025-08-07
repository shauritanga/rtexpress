<?php

use App\Models\Customer;
use App\Traits\EncryptableAttributes;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;

uses(RefreshDatabase::class);

describe('Encryptable Attributes Trait', function () {
    test('sensitive attributes are encrypted when stored', function () {
        $customer = Customer::create([
            'customer_code' => 'TEST-001',
            'company_name' => 'Test Company',
            'contact_person' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+1234567890',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '12345',
            'country' => 'US',
            'tax_number' => 'TAX123456',
            'credit_limit' => 1000.00,
            'payment_terms' => 'net_30',
            'status' => 'active',
            'notes' => 'Sensitive customer notes',
        ]);

        // Check that the phone number is encrypted in the database
        $rawPhone = \DB::table('customers')->where('id', $customer->id)->value('phone');
        expect($rawPhone)->not->toBe('+1234567890');
        
        // But when accessed through the model, it should be decrypted
        expect($customer->phone)->toBe('+1234567890');
    });

    test('encrypted attributes are properly decrypted when retrieved', function () {
        $customer = Customer::create([
            'customer_code' => 'TEST-002',
            'company_name' => 'Test Company 2',
            'contact_person' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+9876543210',
            'address_line_1' => '456 Test Ave',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '54321',
            'country' => 'US',
            'tax_number' => 'TAX654321',
            'credit_limit' => 2000.00,
            'payment_terms' => 'net_30',
            'status' => 'active',
            'notes' => 'Another sensitive note',
        ]);

        // Refresh the model from database
        $customer = Customer::find($customer->id);

        expect($customer->phone)->toBe('+9876543210');
        expect($customer->tax_number)->toBe('TAX654321');
        expect($customer->notes)->toBe('Another sensitive note');
    });

    test('non-encryptable attributes are not encrypted', function () {
        $customer = Customer::create([
            'customer_code' => 'TEST-003',
            'company_name' => 'Test Company 3',
            'contact_person' => 'Bob Smith',
            'email' => 'bob@example.com',
            'phone' => '+1111111111',
            'address_line_1' => '789 Test Blvd',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '11111',
            'country' => 'US',
            'credit_limit' => 3000.00,
            'payment_terms' => 'net_30',
            'status' => 'active',
        ]);

        // Check that non-encryptable fields are stored as-is
        $rawEmail = \DB::table('customers')->where('id', $customer->id)->value('email');
        expect($rawEmail)->toBe('bob@example.com');
        
        $rawCompanyName = \DB::table('customers')->where('id', $customer->id)->value('company_name');
        expect($rawCompanyName)->toBe('Test Company 3');
    });

    test('trait handles null values gracefully', function () {
        $customer = Customer::create([
            'customer_code' => 'TEST-004',
            'company_name' => 'Test Company 4',
            'contact_person' => 'Alice Johnson',
            'email' => 'alice@example.com',
            'phone' => '+2222222222',
            'address_line_1' => '321 Test Dr',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '22222',
            'country' => 'US',
            'credit_limit' => 4000.00,
            'payment_terms' => 'net_30',
            'status' => 'active',
            // tax_number and notes are null
        ]);

        expect($customer->tax_number)->toBeNull();
        expect($customer->notes)->toBeNull();
    });

    test('trait handles decryption failures gracefully', function () {
        // Create a customer with manually corrupted encrypted data
        $customer = Customer::create([
            'customer_code' => 'TEST-005',
            'company_name' => 'Test Company 5',
            'contact_person' => 'Charlie Brown',
            'email' => 'charlie@example.com',
            'phone' => '+3333333333',
            'address_line_1' => '654 Test Ln',
            'city' => 'Test City',
            'state_province' => 'Test State',
            'postal_code' => '33333',
            'country' => 'US',
            'credit_limit' => 5000.00,
            'payment_terms' => 'net_30',
            'status' => 'active',
        ]);

        // Manually corrupt the encrypted phone number in the database
        \DB::table('customers')
            ->where('id', $customer->id)
            ->update(['phone' => 'corrupted_encrypted_data']);

        // Refresh the model
        $customer = Customer::find($customer->id);

        // Should return the corrupted data instead of throwing an exception
        expect($customer->phone)->toBe('corrupted_encrypted_data');
    });
});
