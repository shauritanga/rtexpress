<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\WarehouseStock;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\User;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouses = Warehouse::all();
        $users = User::all();

        if ($warehouses->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No warehouses or users found. Please seed warehouses and users first.');
            return;
        }

        $inventoryItems = [
            [
                'name' => 'Cardboard Box - Small',
                'description' => 'Small cardboard shipping box for lightweight items',
                'category' => 'packaging',
                'brand' => 'BoxCorp',
                'weight' => 0.2,
                'dimensions' => ['length' => 20, 'width' => 15, 'height' => 10],
                'unit_of_measure' => 'piece',
                'unit_cost' => 1.50,
                'unit_price' => 2.25,
                'supplier' => 'Packaging Solutions Ltd',
                'min_stock_level' => 100,
                'max_stock_level' => 1000,
                'reorder_point' => 200,
                'reorder_quantity' => 500,
                'initial_stock' => 450,
            ],
            [
                'name' => 'Cardboard Box - Medium',
                'description' => 'Medium cardboard shipping box for standard items',
                'category' => 'packaging',
                'brand' => 'BoxCorp',
                'weight' => 0.4,
                'dimensions' => ['length' => 30, 'width' => 25, 'height' => 20],
                'unit_of_measure' => 'piece',
                'unit_cost' => 2.75,
                'unit_price' => 4.00,
                'supplier' => 'Packaging Solutions Ltd',
                'min_stock_level' => 75,
                'max_stock_level' => 750,
                'reorder_point' => 150,
                'reorder_quantity' => 300,
                'initial_stock' => 320,
            ],
            [
                'name' => 'Cardboard Box - Large',
                'description' => 'Large cardboard shipping box for heavy items',
                'category' => 'packaging',
                'brand' => 'BoxCorp',
                'weight' => 0.8,
                'dimensions' => ['length' => 40, 'width' => 35, 'height' => 30],
                'unit_of_measure' => 'piece',
                'unit_cost' => 4.50,
                'unit_price' => 6.75,
                'supplier' => 'Packaging Solutions Ltd',
                'min_stock_level' => 50,
                'max_stock_level' => 500,
                'reorder_point' => 100,
                'reorder_quantity' => 200,
                'initial_stock' => 180,
            ],
            [
                'name' => 'Bubble Wrap Roll',
                'description' => 'Protective bubble wrap for fragile items',
                'category' => 'packaging',
                'brand' => 'BubblePro',
                'weight' => 2.5,
                'dimensions' => ['length' => 100, 'width' => 60, 'height' => 15],
                'unit_of_measure' => 'roll',
                'unit_cost' => 12.00,
                'unit_price' => 18.00,
                'supplier' => 'Protective Materials Inc',
                'min_stock_level' => 10,
                'max_stock_level' => 100,
                'reorder_point' => 25,
                'reorder_quantity' => 50,
                'initial_stock' => 35,
            ],
            [
                'name' => 'Packing Tape',
                'description' => 'Strong adhesive tape for sealing packages',
                'category' => 'packaging',
                'brand' => 'TapeMax',
                'weight' => 0.3,
                'unit_of_measure' => 'roll',
                'unit_cost' => 3.25,
                'unit_price' => 5.00,
                'supplier' => 'Adhesive Solutions',
                'min_stock_level' => 20,
                'max_stock_level' => 200,
                'reorder_point' => 50,
                'reorder_quantity' => 100,
                'initial_stock' => 85,
            ],
            [
                'name' => 'Shipping Labels',
                'description' => 'Self-adhesive shipping labels',
                'category' => 'supplies',
                'brand' => 'LabelPro',
                'unit_of_measure' => 'sheet',
                'unit_cost' => 0.15,
                'unit_price' => 0.25,
                'supplier' => 'Label Solutions',
                'min_stock_level' => 500,
                'max_stock_level' => 5000,
                'reorder_point' => 1000,
                'reorder_quantity' => 2000,
                'initial_stock' => 1500,
            ],
            [
                'name' => 'Fragile Stickers',
                'description' => 'Warning stickers for fragile packages',
                'category' => 'supplies',
                'brand' => 'WarnLabel',
                'unit_of_measure' => 'piece',
                'unit_cost' => 0.05,
                'unit_price' => 0.10,
                'supplier' => 'Warning Labels Inc',
                'min_stock_level' => 200,
                'max_stock_level' => 2000,
                'reorder_point' => 500,
                'reorder_quantity' => 1000,
                'initial_stock' => 750,
            ],
            [
                'name' => 'Handheld Scanner',
                'description' => 'Barcode scanner for inventory tracking',
                'category' => 'equipment',
                'brand' => 'ScanTech',
                'model' => 'ST-2000',
                'weight' => 0.5,
                'dimensions' => ['length' => 20, 'width' => 8, 'height' => 5],
                'unit_of_measure' => 'piece',
                'unit_cost' => 150.00,
                'unit_price' => 225.00,
                'supplier' => 'Tech Equipment Ltd',
                'manufacturer' => 'ScanTech Industries',
                'min_stock_level' => 2,
                'max_stock_level' => 20,
                'reorder_point' => 5,
                'reorder_quantity' => 10,
                'initial_stock' => 8,
                'is_serialized' => true,
            ],
            [
                'name' => 'Pallet Wrap Film',
                'description' => 'Stretch film for securing palletized goods',
                'category' => 'packaging',
                'brand' => 'WrapSecure',
                'weight' => 3.0,
                'unit_of_measure' => 'roll',
                'unit_cost' => 25.00,
                'unit_price' => 37.50,
                'supplier' => 'Industrial Packaging',
                'min_stock_level' => 5,
                'max_stock_level' => 50,
                'reorder_point' => 15,
                'reorder_quantity' => 25,
                'initial_stock' => 22,
            ],
            [
                'name' => 'Weighing Scale',
                'description' => 'Digital scale for package weighing',
                'category' => 'equipment',
                'brand' => 'AccuWeight',
                'model' => 'AW-500',
                'weight' => 5.0,
                'dimensions' => ['length' => 40, 'width' => 30, 'height' => 10],
                'unit_of_measure' => 'piece',
                'unit_cost' => 200.00,
                'unit_price' => 300.00,
                'supplier' => 'Precision Instruments',
                'manufacturer' => 'AccuWeight Corp',
                'min_stock_level' => 1,
                'max_stock_level' => 10,
                'reorder_point' => 3,
                'reorder_quantity' => 5,
                'initial_stock' => 4,
                'is_serialized' => true,
            ],
        ];

        foreach ($inventoryItems as $itemData) {
            $initialStock = $itemData['initial_stock'];
            unset($itemData['initial_stock']);

            // Create inventory item
            $item = InventoryItem::create($itemData);

            // Create warehouse stock records and initial stock movements
            foreach ($warehouses as $warehouse) {
                // Distribute stock across warehouses
                $warehouseStock = $warehouse->id === 1 ?
                    intval($initialStock * 0.6) : // Main warehouse gets 60%
                    intval($initialStock * 0.4 / ($warehouses->count() - 1)); // Others split remaining

                // Create warehouse stock record
                WarehouseStock::create([
                    'inventory_item_id' => $item->id,
                    'warehouse_id' => $warehouse->id,
                    'quantity_available' => $warehouseStock,
                    'quantity_reserved' => 0,
                    'quantity_damaged' => 0,
                    'average_cost' => $item->unit_cost,
                    'last_counted_at' => now()->subDays(rand(1, 30)),
                    'last_counted_by' => $users->random()->id,
                ]);

                // Create initial stock movement
                if ($warehouseStock > 0) {
                    StockMovement::create([
                        'inventory_item_id' => $item->id,
                        'warehouse_id' => $warehouse->id,
                        'type' => 'in',
                        'quantity' => $warehouseStock,
                        'quantity_before' => 0,
                        'quantity_after' => $warehouseStock,
                        'unit_cost' => $item->unit_cost,
                        'reference_type' => 'initial_stock',
                        'notes' => 'Initial stock entry',
                        'created_by' => $users->first()->id,
                        'movement_date' => now()->subDays(rand(30, 60)),
                    ]);
                }
            }
        }

        $this->command->info('Inventory items seeded successfully!');
    }
}
