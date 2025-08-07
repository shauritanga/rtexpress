<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CustomsDeclaration;
use App\Models\CustomsItem;
use App\Models\ComplianceDocument;
use App\Models\CustomsRegulation;
use App\Models\Shipment;
use App\Models\User;

class CustomsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shipments = Shipment::all();
        $users = User::all();

        if ($shipments->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No shipments or users found. Please seed shipments and users first.');
            return;
        }

        // Create sample customs regulations first
        $regulations = [
            [
                'regulation_code' => 'USA-DUTY-001',
                'country' => 'USA',
                'regulation_type' => 'duty_rate',
                'hs_code' => '8471',
                'product_category' => 'electronics',
                'title' => 'Computer Equipment Import Duty',
                'description' => 'Standard duty rate for computer equipment and accessories',
                'duty_rate' => 5.5,
                'tax_rate' => 8.25,
                'threshold_value' => 800,
                'effective_date' => now()->subYear(),
                'is_active' => true,
                'source' => 'US Customs and Border Protection',
                'last_updated_at' => now(),
                'updated_by' => $users->first()->id,
            ],
            [
                'regulation_code' => 'CAN-DUTY-001',
                'country' => 'CAN',
                'regulation_type' => 'duty_rate',
                'hs_code' => '6109',
                'product_category' => 'textiles',
                'title' => 'Textile Products Import Duty',
                'description' => 'Duty rate for textile and clothing items',
                'duty_rate' => 12.0,
                'tax_rate' => 13.0,
                'threshold_value' => 200,
                'effective_date' => now()->subMonths(6),
                'is_active' => true,
                'source' => 'Canada Border Services Agency',
                'last_updated_at' => now(),
                'updated_by' => $users->first()->id,
            ],
            [
                'regulation_code' => 'UK-RESTRICT-001',
                'country' => 'GBR',
                'regulation_type' => 'restriction',
                'product_category' => 'food_beverages',
                'title' => 'Food Import Restrictions',
                'description' => 'Special requirements for food and beverage imports',
                'requires_permit' => true,
                'permit_authority' => 'Food Standards Agency',
                'required_documents' => ['health_certificate', 'import_permit'],
                'effective_date' => now()->subMonths(3),
                'is_active' => true,
                'source' => 'UK Government',
                'last_updated_at' => now(),
                'updated_by' => $users->first()->id,
            ],
        ];

        foreach ($regulations as $regulationData) {
            CustomsRegulation::create($regulationData);
        }

        // Create sample customs declarations
        $declarations = [
            [
                'shipment' => $shipments->random(),
                'declaration_type' => 'export',
                'shipment_type' => 'commercial',
                'origin_country' => 'USA',
                'destination_country' => 'CAN',
                'currency' => 'TZS',
                'total_value' => 2500.00,
                'description_of_goods' => 'Electronic components and computer accessories',
                'reason_for_export' => 'Commercial sale',
                'exporter_details' => [
                    'name' => 'Tech Solutions Inc',
                    'address' => '123 Business Ave, New York, NY 10001',
                    'tax_id' => 'US123456789',
                    'phone' => '+1-555-0123',
                    'email' => 'export@techsolutions.com',
                ],
                'importer_details' => [
                    'name' => 'Canadian Electronics Ltd',
                    'address' => '456 Commerce St, Toronto, ON M5V 1A1',
                    'tax_id' => 'CA987654321',
                    'phone' => '+1-416-555-0456',
                    'email' => 'import@canelectronics.ca',
                ],
                'status' => 'cleared',
                'submitted_at' => now()->subDays(5),
                'approved_at' => now()->subDays(3),
                'cleared_at' => now()->subDays(1),
                'items' => [
                    [
                        'description' => 'Laptop Computer',
                        'hs_code' => '8471301000',
                        'country_of_origin' => 'USA',
                        'quantity' => 10,
                        'unit_weight' => 2.5,
                        'unit_value' => 150.00,
                        'manufacturer' => 'TechCorp',
                        'brand' => 'TechBook Pro',
                        'model' => 'TB-2024',
                    ],
                    [
                        'description' => 'Computer Mouse',
                        'hs_code' => '8471606000',
                        'country_of_origin' => 'USA',
                        'quantity' => 50,
                        'unit_weight' => 0.2,
                        'unit_value' => 25.00,
                        'manufacturer' => 'PeripheralCorp',
                        'brand' => 'ProMouse',
                        'model' => 'PM-X1',
                    ],
                ],
            ],
            [
                'shipment' => $shipments->random(),
                'declaration_type' => 'export',
                'shipment_type' => 'commercial',
                'origin_country' => 'USA',
                'destination_country' => 'GBR',
                'currency' => 'USD',
                'total_value' => 5000.00,
                'description_of_goods' => 'Textile products and clothing accessories',
                'reason_for_export' => 'Commercial sale',
                'exporter_details' => [
                    'name' => 'Fashion Forward LLC',
                    'address' => '789 Fashion Blvd, Los Angeles, CA 90210',
                    'tax_id' => 'US987654321',
                    'phone' => '+1-555-0789',
                    'email' => 'export@fashionforward.com',
                ],
                'importer_details' => [
                    'name' => 'British Style Ltd',
                    'address' => '321 Oxford Street, London W1C 1DX',
                    'tax_id' => 'GB123456789',
                    'phone' => '+44-20-7123-4567',
                    'email' => 'import@britishstyle.co.uk',
                ],
                'status' => 'submitted',
                'submitted_at' => now()->subDays(2),
                'items' => [
                    [
                        'description' => 'Cotton T-Shirts',
                        'hs_code' => '6109100010',
                        'country_of_origin' => 'USA',
                        'quantity' => 100,
                        'unit_weight' => 0.3,
                        'unit_value' => 15.00,
                        'manufacturer' => 'Cotton Mills Inc',
                        'brand' => 'ComfortWear',
                        'material' => '100% Cotton',
                    ],
                    [
                        'description' => 'Denim Jeans',
                        'hs_code' => '6203423000',
                        'country_of_origin' => 'USA',
                        'quantity' => 50,
                        'unit_weight' => 0.8,
                        'unit_value' => 35.00,
                        'manufacturer' => 'Denim Works',
                        'brand' => 'ClassicFit',
                        'material' => 'Cotton Denim',
                    ],
                ],
            ],
            [
                'shipment' => $shipments->random(),
                'declaration_type' => 'export',
                'shipment_type' => 'gift',
                'origin_country' => 'USA',
                'destination_country' => 'DEU',
                'currency' => 'USD',
                'total_value' => 800.00,
                'description_of_goods' => 'Personal gift items and accessories',
                'reason_for_export' => 'Personal gift',
                'exporter_details' => [
                    'name' => 'John Smith',
                    'address' => '456 Residential St, Chicago, IL 60601',
                    'phone' => '+1-555-0456',
                    'email' => 'john.smith@email.com',
                ],
                'importer_details' => [
                    'name' => 'Maria Schmidt',
                    'address' => 'Hauptstraße 123, 10115 Berlin, Germany',
                    'phone' => '+49-30-12345678',
                    'email' => 'maria.schmidt@email.de',
                ],
                'status' => 'processing',
                'submitted_at' => now()->subDays(1),
                'items' => [
                    [
                        'description' => 'Wristwatch',
                        'hs_code' => '9102110000',
                        'country_of_origin' => 'USA',
                        'quantity' => 1,
                        'unit_weight' => 0.2,
                        'unit_value' => 500.00,
                        'manufacturer' => 'TimeKeeper Inc',
                        'brand' => 'Precision',
                        'model' => 'P-2024',
                    ],
                    [
                        'description' => 'Leather Wallet',
                        'hs_code' => '4202310000',
                        'country_of_origin' => 'USA',
                        'quantity' => 2,
                        'unit_weight' => 0.3,
                        'unit_value' => 150.00,
                        'manufacturer' => 'Leather Craft Co',
                        'brand' => 'Premium',
                        'material' => 'Genuine Leather',
                    ],
                ],
            ],
        ];

        foreach ($declarations as $declarationData) {
            $items = $declarationData['items'];
            unset($declarationData['items']);

            $declaration = CustomsDeclaration::create([
                'shipment_id' => $declarationData['shipment']->id,
                'declaration_type' => $declarationData['declaration_type'],
                'shipment_type' => $declarationData['shipment_type'],
                'origin_country' => $declarationData['origin_country'],
                'destination_country' => $declarationData['destination_country'],
                'currency' => $declarationData['currency'],
                'total_value' => $declarationData['total_value'],
                'description_of_goods' => $declarationData['description_of_goods'],
                'reason_for_export' => $declarationData['reason_for_export'],
                'exporter_details' => $declarationData['exporter_details'],
                'importer_details' => $declarationData['importer_details'],
                'status' => $declarationData['status'],
                'submitted_at' => $declarationData['submitted_at'] ?? null,
                'approved_at' => $declarationData['approved_at'] ?? null,
                'cleared_at' => $declarationData['cleared_at'] ?? null,
                'created_by' => $users->first()->id,
            ]);

            // Create customs items
            foreach ($items as $itemData) {
                CustomsItem::create([
                    'customs_declaration_id' => $declaration->id,
                    'description' => $itemData['description'],
                    'hs_code' => $itemData['hs_code'],
                    'country_of_origin' => $itemData['country_of_origin'],
                    'quantity' => $itemData['quantity'],
                    'unit_weight' => $itemData['unit_weight'],
                    'unit_value' => $itemData['unit_value'],
                    'currency' => $declarationData['currency'],
                    'manufacturer' => $itemData['manufacturer'] ?? null,
                    'brand' => $itemData['brand'] ?? null,
                    'model' => $itemData['model'] ?? null,
                    'material' => $itemData['material'] ?? null,
                ]);
            }

            // Create sample compliance documents
            if ($declaration->status !== 'draft') {
                ComplianceDocument::create([
                    'shipment_id' => $declaration->shipment_id,
                    'customs_declaration_id' => $declaration->id,
                    'document_type' => 'commercial_invoice',
                    'document_name' => 'Commercial Invoice - ' . $declaration->declaration_number,
                    'status' => 'approved',
                    'is_required' => true,
                    'is_verified' => true,
                    'verified_at' => now()->subDays(2),
                    'verified_by' => $users->first()->id,
                    'uploaded_by' => $users->first()->id,
                ]);

                ComplianceDocument::create([
                    'shipment_id' => $declaration->shipment_id,
                    'customs_declaration_id' => $declaration->id,
                    'document_type' => 'packing_list',
                    'document_name' => 'Packing List - ' . $declaration->declaration_number,
                    'status' => 'approved',
                    'is_required' => true,
                    'is_verified' => true,
                    'verified_at' => now()->subDays(2),
                    'verified_by' => $users->first()->id,
                    'uploaded_by' => $users->first()->id,
                ]);
            }

            // Calculate estimated charges
            $declaration->calculateEstimatedCharges();
        }

        $this->command->info('Customs declarations and regulations seeded successfully!');
    }
}
