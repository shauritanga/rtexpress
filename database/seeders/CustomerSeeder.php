<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = \App\Models\User::where('email', 'admin@rtexpress.com')->first();

        if (!$adminUser) {
            $this->command->error('Admin user not found. Please run AdminUserSeeder first!');
            return;
        }

        $customers = [
            [
                'company_name' => 'Kilimanjaro Coffee Co.',
                'contact_person' => 'Ahmed Hassan',
                'email' => 'ahmed@kilimanjarocoffee.co.tz',
                'phone' => '+255754123456',
                'address_line_1' => 'Moshi Road',
                'address_line_2' => 'Arusha Central',
                'city' => 'Arusha',
                'state_province' => 'Arusha',
                'postal_code' => '23105',
                'country' => 'Tanzania',
                'credit_limit' => 500000.00,
                'payment_terms' => 'net_30',
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'company_name' => 'Dar Electronics Ltd',
                'contact_person' => 'Grace Mwalimu',
                'email' => 'grace@darelectronics.co.tz',
                'phone' => '+255713987654',
                'address_line_1' => 'Uhuru Street',
                'address_line_2' => 'City Center',
                'city' => 'Dar es Salaam',
                'state_province' => 'Dar es Salaam',
                'postal_code' => '11103',
                'country' => 'Tanzania',
                'credit_limit' => 750000.00,
                'payment_terms' => 'net_15',
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'company_name' => 'Serengeti Textiles',
                'contact_person' => 'John Kimaro',
                'email' => 'john@serengetitextiles.co.tz',
                'phone' => '+255782456789',
                'address_line_1' => 'Industrial Area',
                'address_line_2' => 'Block A',
                'city' => 'Mwanza',
                'state_province' => 'Mwanza',
                'postal_code' => '33102',
                'country' => 'Tanzania',
                'credit_limit' => 1000000.00,
                'payment_terms' => 'net_60',
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'company_name' => 'Zanzibar Spice Traders',
                'contact_person' => 'Fatuma Ali',
                'email' => 'fatuma@zanzibarspice.co.tz',
                'phone' => '+255774321098',
                'address_line_1' => 'Stone Town',
                'address_line_2' => 'Spice Market',
                'city' => 'Zanzibar',
                'state_province' => 'Zanzibar Urban',
                'postal_code' => '71101',
                'country' => 'Tanzania',
                'credit_limit' => 300000.00,
                'payment_terms' => 'net_30',
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'company_name' => 'Mbeya Mining Supplies',
                'contact_person' => 'Peter Msigwa',
                'email' => 'peter@mbeyamining.co.tz',
                'phone' => '+255765432109',
                'address_line_1' => 'Mbalizi Road',
                'address_line_2' => 'Mining District',
                'city' => 'Mbeya',
                'state_province' => 'Mbeya',
                'postal_code' => '53102',
                'country' => 'Tanzania',
                'credit_limit' => 2000000.00,
                'payment_terms' => 'net_90',
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'company_name' => 'Dodoma Pharmaceuticals',
                'contact_person' => 'Dr. Mary Mwanga',
                'email' => 'mary@dodomapharma.co.tz',
                'phone' => '+255756789012',
                'address_line_1' => 'Hospital Hill',
                'address_line_2' => 'Medical District',
                'city' => 'Dodoma',
                'state_province' => 'Dodoma',
                'postal_code' => '41102',
                'country' => 'Tanzania',
                'credit_limit' => 800000.00,
                'payment_terms' => 'net_30',
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(
                ['email' => $customer['email']],
                $customer
            );
        }

        $this->command->info('Customers seeded successfully!');
    }
}
