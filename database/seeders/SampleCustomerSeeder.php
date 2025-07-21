<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\NotificationPreference;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class SampleCustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user first (for created_by fields)
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@rtexpress.com'],
            [
                'name' => 'RT Express Admin',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );

        // Skip warehouse creation for now
        // $this->createSampleWarehouses($adminUser);

        // Create sample customers
        $customers = [
            [
                'company_name' => 'Tech Solutions Inc',
                'customer_code' => 'TECH001',
                'contact_person' => 'John Smith',
                'email' => 'john@techsolutions.com',
                'phone' => '+1-555-0101',
                'address_line_1' => '123 Tech Street',
                'address_line_2' => 'Suite 100',
                'city' => 'San Francisco',
                'state_province' => 'CA',
                'postal_code' => '94105',
                'country' => 'US',
                'status' => 'active',
                'user_email' => 'customer@demo.com',
                'user_password' => 'customer123',
            ],
            [
                'company_name' => 'Global Imports Ltd',
                'customer_code' => 'GLOB002',
                'contact_person' => 'Sarah Johnson',
                'email' => 'sarah@globalimports.com',
                'phone' => '+1-555-0202',
                'address_line_1' => '456 Import Avenue',
                'city' => 'New York',
                'state_province' => 'NY',
                'postal_code' => '10001',
                'country' => 'US',
                'status' => 'active',
                'user_email' => 'sarah@demo.com',
                'user_password' => 'sarah123',
            ],
            [
                'company_name' => 'East Africa Trading Co',
                'customer_code' => 'EATC003',
                'contact_person' => 'David Mwangi',
                'email' => 'david@eatrading.co.tz',
                'phone' => '+255-123-456789',
                'address_line_1' => '789 Uhuru Street',
                'city' => 'Dar es Salaam',
                'state_province' => 'Dar es Salaam',
                'postal_code' => '12345',
                'country' => 'TZ',
                'status' => 'active',
                'user_email' => 'david@demo.com',
                'user_password' => 'david123',
            ],
        ];

        foreach ($customers as $customerData) {
            // Create customer
            $customer = Customer::firstOrCreate(
                ['customer_code' => $customerData['customer_code']],
                [
                    'company_name' => $customerData['company_name'],
                    'contact_person' => $customerData['contact_person'],
                    'email' => $customerData['email'],
                    'phone' => $customerData['phone'],
                    'address_line_1' => $customerData['address_line_1'],
                    'address_line_2' => $customerData['address_line_2'] ?? null,
                    'city' => $customerData['city'],
                    'state_province' => $customerData['state_province'],
                    'postal_code' => $customerData['postal_code'],
                    'country' => $customerData['country'],
                    'status' => $customerData['status'],
                    'created_by' => $adminUser->id,
                ]
            );

            // Create user account for customer
            $customerUser = User::firstOrCreate(
                ['email' => $customerData['user_email']],
                [
                    'name' => $customerData['contact_person'],
                    'password' => Hash::make($customerData['user_password']),
                    'email_verified_at' => now(),
                    'customer_id' => $customer->id,
                ]
            );

            // Create sample shipments for testing
            $this->createSampleShipments($customer, $adminUser);

            // Skip invoices for now to avoid complex dependencies
            // $this->createSampleInvoicesAndPayments($customer, $adminUser);

            // Create notification preferences
            $this->createNotificationPreferences($customer);

            $this->command->info("Created customer: {$customer->company_name} (Login: {$customerData['user_email']} / {$customerData['user_password']})");
        }

        $this->command->info("\n=== SAMPLE CUSTOMER LOGIN CREDENTIALS ===");
        $this->command->info("1. Tech Solutions Inc:");
        $this->command->info("   Email: customer@demo.com");
        $this->command->info("   Password: customer123");
        $this->command->info("");
        $this->command->info("2. Global Imports Ltd:");
        $this->command->info("   Email: sarah@demo.com");
        $this->command->info("   Password: sarah123");
        $this->command->info("");
        $this->command->info("3. East Africa Trading Co:");
        $this->command->info("   Email: david@demo.com");
        $this->command->info("   Password: david123");
        $this->command->info("");
        $this->command->info("Admin Login:");
        $this->command->info("   Email: admin@rtexpress.com");
        $this->command->info("   Password: admin123");
        $this->command->info("==========================================");
    }

    private function createSampleWarehouses(User $adminUser): void
    {
        $warehouses = [
            [
                'name' => 'Main Distribution Center',
                'code' => 'MDC001',
                'address_line_1' => '123 Warehouse Blvd',
                'city' => 'Distribution City',
                'state_province' => 'DC',
                'postal_code' => '12345',
                'country' => 'US',
                'contact_person' => 'Warehouse Manager',
                'phone' => '+1-555-0001',
                'email' => 'warehouse1@rtexpress.com',
            ],
            [
                'name' => 'East Coast Hub',
                'code' => 'ECH002',
                'address_line_1' => '456 Hub Street',
                'city' => 'New York',
                'state_province' => 'NY',
                'postal_code' => '10001',
                'country' => 'US',
                'contact_person' => 'Hub Manager',
                'phone' => '+1-555-0002',
                'email' => 'warehouse2@rtexpress.com',
            ],
        ];

        foreach ($warehouses as $warehouseData) {
            Warehouse::firstOrCreate(
                ['code' => $warehouseData['code']],
                [
                    'name' => $warehouseData['name'],
                    'address_line_1' => $warehouseData['address_line_1'],
                    'city' => $warehouseData['city'],
                    'state_province' => $warehouseData['state_province'],
                    'postal_code' => $warehouseData['postal_code'],
                    'country' => $warehouseData['country'],
                    'contact_person' => $warehouseData['contact_person'],
                    'phone' => $warehouseData['phone'],
                    'email' => $warehouseData['email'],
                    'status' => 'active',
                ]
            );
        }
    }

    private function createSampleShipments(Customer $customer, User $adminUser): void
    {
        $statuses = ['pending', 'picked_up', 'in_transit', 'delivered', 'exception'];
        $services = ['standard', 'express', 'overnight'];
        $packageTypes = ['package', 'envelope', 'box'];

        for ($i = 1; $i <= 5; $i++) {
            $status = $statuses[array_rand($statuses)];
            $service = $services[array_rand($services)];
            $packageType = $packageTypes[array_rand($packageTypes)];

            Shipment::create([
                'tracking_number' => 'RT-' . date('Y') . '-' . str_pad($customer->id * 1000 + $i, 6, '0', STR_PAD_LEFT),
                'customer_id' => $customer->id,
                'origin_warehouse_id' => 1, // Assuming warehouse ID 1 exists
                'destination_warehouse_id' => 2, // Assuming warehouse ID 2 exists
                'sender_name' => $customer->contact_person,
                'sender_phone' => $customer->phone,
                'sender_address' => $customer->address_line_1 . ', ' . $customer->city . ', ' . $customer->state_province . ' ' . $customer->postal_code . ', ' . $customer->country,
                'recipient_name' => 'John Recipient',
                'recipient_phone' => '+1-555-9999',
                'recipient_address' => '123 Destination St, Destination City, DS 54321, US',
                'service_type' => $service,
                'package_type' => $packageType,
                'weight_kg' => rand(1, 50),
                'dimensions_length_cm' => rand(10, 100),
                'dimensions_width_cm' => rand(10, 100),
                'dimensions_height_cm' => rand(10, 100),
                'declared_value' => rand(100, 5000),
                'insurance_value' => rand(100, 5000),
                'total_cost' => rand(25, 500),
                'status' => $status,
                'estimated_delivery_date' => now()->addDays(rand(1, 7)),
                'actual_delivery_date' => $status === 'delivered' ? now()->subDays(rand(0, 5)) : null,
                'special_instructions' => 'Handle with care',
                'created_by' => $adminUser->id,
                'created_at' => now()->subDays(rand(1, 30)),
            ]);
        }
    }

    private function createSampleInvoicesAndPayments(Customer $customer, User $adminUser): void
    {
        $currencies = ['USD', 'EUR', 'GBP', 'TZS'];
        $statuses = ['draft', 'sent', 'paid', 'overdue'];
        
        for ($i = 1; $i <= 3; $i++) {
            $currency = $currencies[array_rand($currencies)];
            $status = $statuses[array_rand($statuses)];
            $subtotal = rand(100, 1000);
            $taxAmount = $subtotal * 0.1;
            $totalAmount = $subtotal + $taxAmount;
            
            $invoice = Invoice::create([
                'invoice_number' => 'INV-' . date('Y') . '-' . str_pad($customer->id * 100 + $i, 6, '0', STR_PAD_LEFT),
                'customer_id' => $customer->id,
                'status' => $status,
                'currency' => $currency,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => 0,
                'total_amount' => $totalAmount,
                'paid_amount' => $status === 'paid' ? $totalAmount : 0,
                'balance_due' => $status === 'paid' ? 0 : $totalAmount,
                'issue_date' => now()->subDays(rand(1, 60)),
                'due_date' => now()->addDays(rand(1, 30)),
                'payment_terms' => 'Net 30',
                'billing_address' => $customer->address_line_1 . ', ' . $customer->city . ', ' . $customer->state_province . ' ' . $customer->postal_code,
                'company_address' => 'RT Express, 123 Express Way, Shipping City, SC 12345',
                'created_by' => $adminUser->id,
                'created_at' => now()->subDays(rand(1, 60)),
            ]);

            // Create payment if invoice is paid
            if ($status === 'paid') {
                Payment::create([
                    'payment_number' => 'PAY-' . date('Y') . '-' . str_pad($customer->id * 100 + $i, 6, '0', STR_PAD_LEFT),
                    'invoice_id' => $invoice->id,
                    'customer_id' => $customer->id,
                    'status' => 'completed',
                    'type' => 'full',
                    'method' => 'credit_card',
                    'currency' => $currency,
                    'exchange_rate' => 1.0,
                    'amount' => $totalAmount,
                    'fee_amount' => $totalAmount * 0.029, // 2.9% processing fee
                    'net_amount' => $totalAmount - ($totalAmount * 0.029),
                    'gateway' => 'stripe',
                    'gateway_transaction_id' => 'txn_' . uniqid(),
                    'payment_date' => now()->subDays(rand(0, 30)),
                    'created_by' => $adminUser->id,
                ]);
            }
        }
    }

    private function createNotificationPreferences(Customer $customer): void
    {
        $notificationTypes = [
            'shipment_created', 'shipment_picked_up', 'shipment_in_transit',
            'shipment_delivered', 'shipment_exception', 'payment_due',
            'payment_received', 'account_security'
        ];

        foreach ($notificationTypes as $type) {
            NotificationPreference::firstOrCreate([
                'user_type' => 'customer',
                'user_id' => $customer->id,
                'notification_type' => $type,
            ], [
                'email_enabled' => true,
                'sms_enabled' => in_array($type, ['shipment_delivered', 'shipment_exception', 'account_security']),
                'push_enabled' => in_array($type, ['shipment_picked_up', 'shipment_in_transit', 'shipment_delivered']),
                'in_app_enabled' => true,
            ]);
        }
    }
}
