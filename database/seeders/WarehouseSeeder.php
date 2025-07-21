<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouses = [
            [
                'name' => 'Dar es Salaam Main Hub',
                'code' => 'DSM001',
                'address_line_1' => 'Nyerere Road, Kariakoo',
                'address_line_2' => null,
                'city' => 'Dar es Salaam',
                'state_province' => 'Dar es Salaam',
                'postal_code' => '11101',
                'country' => 'Tanzania',
                'phone' => '+255222123456',
                'email' => 'dsm@rtexpress.com',
                'contact_person' => 'John Mwalimu',
                'capacity_cubic_meters' => 10000.00,
                'operating_hours' => json_encode(['monday' => '06:00-22:00', 'tuesday' => '06:00-22:00', 'wednesday' => '06:00-22:00', 'thursday' => '06:00-22:00', 'friday' => '06:00-22:00', 'saturday' => '08:00-18:00', 'sunday' => 'closed']),
                'status' => 'active',
                'latitude' => -6.8160,
                'longitude' => 39.2803,
            ],
            [
                'name' => 'Arusha Distribution Center',
                'code' => 'ARK001',
                'address_line_1' => 'Sokoine Road',
                'address_line_2' => 'Arusha Central',
                'city' => 'Arusha',
                'state_province' => 'Arusha',
                'postal_code' => '23101',
                'country' => 'Tanzania',
                'phone' => '+255272123456',
                'email' => 'arusha@rtexpress.com',
                'contact_person' => 'Mary Kimaro',
                'capacity_cubic_meters' => 5000.00,
                'operating_hours' => json_encode(['monday' => '07:00-19:00', 'tuesday' => '07:00-19:00', 'wednesday' => '07:00-19:00', 'thursday' => '07:00-19:00', 'friday' => '07:00-19:00', 'saturday' => '08:00-16:00', 'sunday' => 'closed']),
                'status' => 'active',
                'latitude' => -3.3869,
                'longitude' => 36.6830,
            ],
            [
                'name' => 'Mwanza Regional Hub',
                'code' => 'MWZ001',
                'address_line_1' => 'Kenyatta Road',
                'address_line_2' => 'Industrial Area',
                'city' => 'Mwanza',
                'state_province' => 'Mwanza',
                'postal_code' => '33101',
                'country' => 'Tanzania',
                'phone' => '+255282123456',
                'email' => 'mwanza@rtexpress.com',
                'contact_person' => 'Peter Magesa',
                'capacity_cubic_meters' => 3000.00,
                'operating_hours' => json_encode(['monday' => '07:00-18:00', 'tuesday' => '07:00-18:00', 'wednesday' => '07:00-18:00', 'thursday' => '07:00-18:00', 'friday' => '07:00-18:00', 'saturday' => '08:00-15:00', 'sunday' => 'closed']),
                'status' => 'active',
                'latitude' => -2.5164,
                'longitude' => 32.9175,
            ],
            [
                'name' => 'Dodoma Central Hub',
                'code' => 'DOD001',
                'address_line_1' => 'Uhuru Street',
                'address_line_2' => 'Government District',
                'city' => 'Dodoma',
                'state_province' => 'Dodoma',
                'postal_code' => '41101',
                'country' => 'Tanzania',
                'phone' => '+255262123456',
                'email' => 'dodoma@rtexpress.com',
                'contact_person' => 'Grace Mwanga',
                'capacity_cubic_meters' => 2500.00,
                'operating_hours' => json_encode(['monday' => '07:00-18:00', 'tuesday' => '07:00-18:00', 'wednesday' => '07:00-18:00', 'thursday' => '07:00-18:00', 'friday' => '07:00-18:00', 'saturday' => '08:00-15:00', 'sunday' => 'closed']),
                'status' => 'active',
                'latitude' => -6.1630,
                'longitude' => 35.7516,
            ],
            [
                'name' => 'Mbeya Southern Hub',
                'code' => 'MBY001',
                'address_line_1' => 'Jacaranda Street',
                'address_line_2' => 'Commercial District',
                'city' => 'Mbeya',
                'state_province' => 'Mbeya',
                'postal_code' => '53101',
                'country' => 'Tanzania',
                'phone' => '+255252123456',
                'email' => 'mbeya@rtexpress.com',
                'contact_person' => 'Daniel Msigwa',
                'capacity_cubic_meters' => 2000.00,
                'operating_hours' => json_encode(['monday' => '07:00-17:00', 'tuesday' => '07:00-17:00', 'wednesday' => '07:00-17:00', 'thursday' => '07:00-17:00', 'friday' => '07:00-17:00', 'saturday' => '08:00-14:00', 'sunday' => 'closed']),
                'status' => 'active',
                'latitude' => -8.9094,
                'longitude' => 33.4607,
            ],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::firstOrCreate(
                ['code' => $warehouse['code']],
                $warehouse
            );
        }

        $this->command->info('Warehouses seeded successfully!');
    }
}
