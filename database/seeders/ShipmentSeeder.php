<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class ShipmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        $warehouses = Warehouse::all();
        $adminUser = User::where('email', 'admin@rtexpress.com')->first();

        if ($customers->isEmpty() || $warehouses->isEmpty() || ! $adminUser) {
            $this->command->error('Please run CustomerSeeder and WarehouseSeeder first!');

            return;
        }

        // Create 50 sample shipments with various statuses
        for ($i = 1; $i <= 50; $i++) {
            $customer = $customers->random();
            $originWarehouse = $warehouses->random();
            $destinationWarehouse = $warehouses->where('id', '!=', $originWarehouse->id)->random();

            $statuses = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception'];
            $serviceTypes = ['standard', 'express', 'overnight', 'international'];

            $status = $statuses[array_rand($statuses)];
            $serviceType = $serviceTypes[array_rand($serviceTypes)];

            // Create realistic dates based on status
            $createdAt = now()->subDays(rand(1, 30));
            $estimatedDelivery = $createdAt->copy()->addDays(rand(1, 7));
            $actualDelivery = null;

            if ($status === 'delivered') {
                $actualDelivery = $createdAt->copy()->addDays(rand(1, 6));
            }

            Shipment::create([
                'customer_id' => $customer->id,
                'origin_warehouse_id' => $originWarehouse->id,
                'destination_warehouse_id' => $destinationWarehouse->id,
                'created_by' => $adminUser->id,
                'service_type' => $serviceType,
                'status' => $status,
                'sender_name' => $customer->contact_person,
                'sender_phone' => $customer->phone,
                'sender_address' => $customer->address_line_1.($customer->address_line_2 ? ', '.$customer->address_line_2 : ''),
                'recipient_name' => 'Recipient '.$i,
                'recipient_phone' => '+255'.rand(700000000, 799999999),
                'recipient_address' => 'Address '.$i.', '.$destinationWarehouse->city,
                'weight_kg' => rand(1, 50),
                'dimensions_length_cm' => rand(10, 100),
                'dimensions_width_cm' => rand(10, 100),
                'dimensions_height_cm' => rand(10, 100),
                'declared_value' => rand(10000, 500000),
                'insurance_value' => rand(5000, 250000),
                'special_instructions' => $i % 3 === 0 ? 'Handle with care - fragile items' : null,
                'estimated_delivery_date' => $estimatedDelivery,
                'actual_delivery_date' => $actualDelivery,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $this->command->info('50 sample shipments created successfully!');
    }
}
