<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Setting;
use App\Models\Shipment;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class DevelopmentDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating development data...');

        // Create system settings
        $this->createSystemSettings();

        // Create warehouses
        $this->command->info('Creating warehouses...');
        $warehouses = $this->createWarehouses();

        // Create customers
        $this->command->info('Creating customers...');
        $customers = $this->createCustomers();

        // Create shipments
        $this->command->info('Creating shipments...');
        $this->createShipments($customers, $warehouses);

        $this->command->info('Development data created successfully!');
    }

    /**
     * Create system settings.
     */
    private function createSystemSettings(): void
    {
        $settings = [
            'app.company_name' => [
                'value' => 'RT Express Cargo Management',
                'description' => 'Company name displayed in the application',
                'is_public' => true,
            ],
            'app.company_address' => [
                'value' => 'Dar es Salaam, Tanzania',
                'description' => 'Company address',
                'is_public' => true,
            ],
            'app.contact_email' => [
                'value' => 'info@rtexpress.com',
                'description' => 'Main contact email',
                'is_public' => true,
            ],
            'app.contact_phone' => [
                'value' => '+255 123 456 789',
                'description' => 'Main contact phone',
                'is_public' => true,
            ],
            'shipping.default_service_type' => [
                'value' => 'standard',
                'description' => 'Default service type for new shipments',
                'is_public' => false,
            ],
            'shipping.tracking_url_format' => [
                'value' => 'https://track.rtexpress.com/{tracking_number}',
                'description' => 'URL format for tracking links',
                'is_public' => true,
            ],
            'billing.default_currency' => [
                'value' => 'TZS',
                'description' => 'Default currency for billing',
                'is_public' => false,
            ],
            'billing.tax_rate' => [
                'value' => 0.18,
                'description' => 'Default tax rate (18% VAT)',
                'is_public' => false,
            ],
            'notifications.email_enabled' => [
                'value' => true,
                'description' => 'Enable email notifications',
                'is_public' => false,
            ],
            'notifications.sms_enabled' => [
                'value' => false,
                'description' => 'Enable SMS notifications',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $key => $config) {
            Setting::set(
                $key,
                $config['value'],
                $config['description'],
                $config['is_public']
            );
        }

        $this->command->info('System settings created.');
    }

    /**
     * Create sample warehouses.
     */
    private function createWarehouses(): \Illuminate\Support\Collection
    {
        $warehouses = [
            [
                'code' => 'WAR-001',
                'name' => 'Dar es Salaam Main Hub',
                'city' => 'Dar es Salaam',
                'country' => 'Tanzania',
                'latitude' => -6.7924,
                'longitude' => 39.2083,
                'status' => 'active',
            ],
            [
                'code' => 'WAR-002',
                'name' => 'Arusha Distribution Center',
                'city' => 'Arusha',
                'country' => 'Tanzania',
                'latitude' => -3.3869,
                'longitude' => 36.6830,
                'status' => 'active',
            ],
            [
                'code' => 'WAR-003',
                'name' => 'Mwanza Regional Hub',
                'city' => 'Mwanza',
                'country' => 'Tanzania',
                'latitude' => -2.5164,
                'longitude' => 32.9175,
                'status' => 'active',
            ],
            [
                'code' => 'WAR-004',
                'name' => 'Dodoma Central Facility',
                'city' => 'Dodoma',
                'country' => 'Tanzania',
                'latitude' => -6.1630,
                'longitude' => 35.7516,
                'status' => 'active',
            ],
        ];

        $createdWarehouses = [];
        foreach ($warehouses as $warehouseData) {
            $warehouse = Warehouse::firstOrCreate(
                ['code' => $warehouseData['code']], // Find by code
                array_merge($warehouseData, [
                'address_line_1' => fake()->streetAddress(),
                'state_province' => $warehouseData['city'],
                'postal_code' => fake()->postcode(),
                'capacity_cubic_meters' => fake()->randomFloat(2, 5000, 20000),
                'operating_hours' => [
                    'monday' => '08:00-17:00',
                    'tuesday' => '08:00-17:00',
                    'wednesday' => '08:00-17:00',
                    'thursday' => '08:00-17:00',
                    'friday' => '08:00-17:00',
                    'saturday' => '08:00-12:00',
                    'sunday' => 'closed',
                ],
                'contact_person' => fake()->name(),
                'phone' => '+255' . fake()->numerify('#########'),
                'email' => fake()->safeEmail(),
                ])
            );

            $createdWarehouses[] = $warehouse;
        }

        // Create additional random warehouses
        $additionalWarehouses = Warehouse::factory()
            ->count(6)
            ->tanzanian()
            ->active()
            ->create();

        return collect($createdWarehouses)->merge($additionalWarehouses);
    }

    /**
     * Create sample customers.
     */
    private function createCustomers(): \Illuminate\Support\Collection
    {
        // Create some specific customers
        $specificCustomers = [
            [
                'company_name' => 'Kilimanjaro Trading Co.',
                'contact_person' => 'John Mwalimu',
                'email' => 'john@kilimanjaro-trading.co.tz',
                'city' => 'Arusha',
                'country' => 'Tanzania',
                'status' => 'active',
                'credit_limit' => 100000,
            ],
            [
                'company_name' => 'Zanzibar Spice Exports',
                'contact_person' => 'Fatima Ali',
                'email' => 'fatima@zanzibar-spice.com',
                'city' => 'Stone Town',
                'country' => 'Tanzania',
                'status' => 'active',
                'credit_limit' => 75000,
            ],
            [
                'company_name' => 'Serengeti Logistics Ltd',
                'contact_person' => 'David Kimani',
                'email' => 'david@serengeti-logistics.com',
                'city' => 'Mwanza',
                'country' => 'Tanzania',
                'status' => 'active',
                'credit_limit' => 150000,
            ],
        ];

        $createdCustomers = [];
        $adminUser = User::where('email', 'admin@rtexpress.com')->first();

        foreach ($specificCustomers as $customerData) {
            $customer = Customer::firstOrCreate(
                ['email' => $customerData['email']], // Find by email
                array_merge($customerData, [
                'phone' => '+255' . fake()->numerify('#########'),
                'address_line_1' => fake()->streetAddress(),
                'state_province' => $customerData['city'],
                'postal_code' => fake()->postcode(),
                'tax_number' => 'TIN-' . fake()->numerify('########'),
                'payment_terms' => 'net_30',
                'created_by' => $adminUser?->id ?? User::factory()->create()->id,
                ])
            );

            $createdCustomers[] = $customer;
        }

        // Create additional random customers
        $additionalCustomers = Customer::factory()
            ->count(47) // Total 50 customers
            ->tanzanian()
            ->active()
            ->create();

        return collect($createdCustomers)->merge($additionalCustomers);
    }

    /**
     * Create sample shipments.
     */
    private function createShipments(\Illuminate\Support\Collection $customers, \Illuminate\Support\Collection $warehouses): void
    {
        $adminUser = User::where('email', 'admin@rtexpress.com')->first();
        $warehouseUser = User::where('email', 'warehouse@rtexpress.com')->first();

        // Create shipments with various statuses
        $statusDistribution = [
            'pending' => 10,
            'picked_up' => 15,
            'in_transit' => 25,
            'out_for_delivery' => 20,
            'delivered' => 80,
            'exception' => 5,
            'cancelled' => 3,
        ];

        foreach ($statusDistribution as $status => $count) {
            $randomCustomer = fake()->randomElement($customers);
            $randomOriginWarehouse = fake()->randomElement($warehouses);
            $randomDestinationWarehouse = fake()->optional(0.7)->randomElement($warehouses);

            $factory = Shipment::factory()
                ->count($count)
                ->state([
                    'customer_id' => is_array($randomCustomer) ? $randomCustomer['id'] : $randomCustomer->id,
                    'origin_warehouse_id' => is_array($randomOriginWarehouse) ? $randomOriginWarehouse['id'] : $randomOriginWarehouse->id,
                    'destination_warehouse_id' => $randomDestinationWarehouse ? (is_array($randomDestinationWarehouse) ? $randomDestinationWarehouse['id'] : $randomDestinationWarehouse->id) : null,
                    'created_by' => $adminUser?->id ?? User::factory(),
                    'assigned_to' => fake()->optional(0.6)->randomElement([$adminUser?->id, $warehouseUser?->id]),
                ]);

            // Apply status-specific states
            switch ($status) {
                case 'pending':
                    $factory->pending();
                    break;
                case 'delivered':
                    $factory->delivered();
                    break;
                case 'exception':
                    $factory->withException();
                    break;
            }

            $shipments = $factory->create();

            // Add tracking history for some shipments
            foreach ($shipments as $shipment) {
                if ($status !== 'pending') {
                    $this->createTrackingHistory($shipment, $status);
                }
            }
        }

        // Create some express and international shipments
        $randomCustomer1 = fake()->randomElement($customers);
        $randomWarehouse1 = fake()->randomElement($warehouses);
        Shipment::factory()
            ->count(20)
            ->express()
            ->create([
                'customer_id' => is_array($randomCustomer1) ? $randomCustomer1['id'] : $randomCustomer1->id,
                'origin_warehouse_id' => is_array($randomWarehouse1) ? $randomWarehouse1['id'] : $randomWarehouse1->id,
                'created_by' => $adminUser?->id ?? User::factory(),
            ]);

        $randomCustomer2 = fake()->randomElement($customers);
        $randomWarehouse2 = fake()->randomElement($warehouses);
        Shipment::factory()
            ->count(15)
            ->international()
            ->create([
                'customer_id' => is_array($randomCustomer2) ? $randomCustomer2['id'] : $randomCustomer2->id,
                'origin_warehouse_id' => is_array($randomWarehouse2) ? $randomWarehouse2['id'] : $randomWarehouse2->id,
                'created_by' => $adminUser?->id ?? User::factory(),
            ]);

        // Create some overdue shipments
        $randomCustomer3 = fake()->randomElement($customers);
        $randomWarehouse3 = fake()->randomElement($warehouses);
        Shipment::factory()
            ->count(8)
            ->overdue()
            ->create([
                'customer_id' => is_array($randomCustomer3) ? $randomCustomer3['id'] : $randomCustomer3->id,
                'origin_warehouse_id' => is_array($randomWarehouse3) ? $randomWarehouse3['id'] : $randomWarehouse3->id,
                'created_by' => $adminUser?->id ?? User::factory(),
            ]);
    }

    /**
     * Create tracking history for a shipment.
     */
    private function createTrackingHistory(Shipment $shipment, string $finalStatus): void
    {
        $adminUser = User::where('email', 'admin@rtexpress.com')->first();
        $warehouseUser = User::where('email', 'warehouse@rtexpress.com')->first();

        $statusFlow = [
            'pending' => ['Shipment created and pending pickup'],
            'picked_up' => ['Package picked up from sender'],
            'in_transit' => ['Package in transit to destination'],
            'out_for_delivery' => ['Package out for delivery'],
            'delivered' => ['Package delivered successfully'],
            'exception' => ['Exception occurred during transit'],
            'cancelled' => ['Shipment cancelled'],
        ];

        $currentDate = $shipment->created_at;
        $statuses = array_keys($statusFlow);
        $finalIndex = array_search($finalStatus, $statuses);

        for ($i = 0; $i <= $finalIndex; $i++) {
            $status = $statuses[$i];
            $notes = $statusFlow[$status][0];

            $shipment->trackingHistory()->create([
                'status' => $status,
                'location' => $shipment->originWarehouse->city ?? 'Unknown',
                'notes' => $notes,
                'occurred_at' => $currentDate,
                'recorded_by' => fake()->randomElement([$adminUser?->id, $warehouseUser?->id]),
            ]);

            $currentDate = $currentDate->addHours(fake()->numberBetween(2, 24));
        }
    }
}
