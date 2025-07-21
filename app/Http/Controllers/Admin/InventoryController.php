<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use App\Models\WarehouseStock;
use App\Models\StockAlert;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display inventory dashboard.
     */
    public function index(Request $request)
    {
        $query = InventoryItem::with(['warehouseStock.warehouse'])
            ->where('is_active', true)
            ->orderBy('name');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('stock_status')) {
            switch ($request->stock_status) {
                case 'low_stock':
                    $query->lowStock();
                    break;
                case 'out_of_stock':
                    $query->outOfStock();
                    break;
                case 'in_stock':
                    $query->whereHas('warehouseStock', function ($q) {
                        $q->where('quantity_available', '>', 0);
                    });
                    break;
            }
        }

        if ($request->filled('warehouse_id')) {
            $query->whereHas('warehouseStock', function ($q) use ($request) {
                $q->where('warehouse_id', $request->warehouse_id);
            });
        }

        $items = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total_items' => InventoryItem::active()->count(),
            'low_stock_items' => $this->getLowStockCount(),
            'out_of_stock_items' => $this->getOutOfStockCount(),
            'total_value' => $this->getTotalInventoryValue(),
            'categories' => InventoryItem::active()->distinct('category')->pluck('category'),
            'recent_movements' => StockMovement::with(['inventoryItem', 'warehouse', 'createdBy'])
                ->orderBy('movement_date', 'desc')
                ->limit(5)
                ->get(),
        ];

        // Get warehouses for filtering
        $warehouses = Warehouse::select('id', 'name')->get();

        return Inertia::render('Admin/Inventory/Index', [
            'items' => $items,
            'stats' => $stats,
            'warehouses' => $warehouses,
            'filters' => $request->only(['search', 'category', 'stock_status', 'warehouse_id']),
        ]);
    }

    /**
     * Show inventory item details.
     */
    public function show(InventoryItem $item)
    {
        $item->load([
            'warehouseStock.warehouse',
            'stockMovements' => function ($query) {
                $query->with(['warehouse', 'createdBy'])
                      ->orderBy('movement_date', 'desc')
                      ->limit(20);
            },
            'stockAlerts' => function ($query) {
                $query->where('status', 'active')
                      ->orderBy('priority', 'desc')
                      ->orderBy('triggered_at', 'desc');
            }
        ]);

        return Inertia::render('Admin/Inventory/Show', [
            'item' => $item,
        ]);
    }

    /**
     * Create new inventory item.
     */
    public function create()
    {
        $warehouses = Warehouse::select('id', 'name')->get();

        return Inertia::render('Admin/Inventory/Create', [
            'warehouses' => $warehouses,
        ]);
    }

    /**
     * Store new inventory item.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:inventory_items,sku',
            'barcode' => 'nullable|string|unique:inventory_items,barcode',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'weight' => 'nullable|numeric|min:0',
            'unit_of_measure' => 'required|string|max:50',
            'unit_cost' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'min_stock_level' => 'required|integer|min:0',
            'max_stock_level' => 'required|integer|min:1',
            'reorder_point' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:1',
            'is_trackable' => 'boolean',
            'is_serialized' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            $item = InventoryItem::create($request->all());

            // Create initial warehouse stock records
            $warehouses = Warehouse::all();
            foreach ($warehouses as $warehouse) {
                WarehouseStock::create([
                    'inventory_item_id' => $item->id,
                    'warehouse_id' => $warehouse->id,
                    'quantity_available' => 0,
                    'quantity_reserved' => 0,
                    'quantity_damaged' => 0,
                    'average_cost' => $item->unit_cost,
                ]);
            }

            DB::commit();

            return redirect()
                ->route('admin.inventory.show', $item)
                ->with('success', 'Inventory item created successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to create inventory item'])
                ->withInput();
        }
    }

    /**
     * Update inventory item.
     */
    public function update(Request $request, InventoryItem $item)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'barcode' => 'nullable|string|unique:inventory_items,barcode,' . $item->id,
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'weight' => 'nullable|numeric|min:0',
            'unit_of_measure' => 'required|string|max:50',
            'unit_cost' => 'required|numeric|min:0',
            'unit_price' => 'required|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'min_stock_level' => 'required|integer|min:0',
            'max_stock_level' => 'required|integer|min:1',
            'reorder_point' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:1',
            'is_trackable' => 'boolean',
            'is_serialized' => 'boolean',
        ]);

        $item->update($request->all());

        return redirect()
            ->route('admin.inventory.show', $item)
            ->with('success', 'Inventory item updated successfully');
    }

    /**
     * Adjust stock levels.
     */
    public function adjustStock(Request $request, InventoryItem $item)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'adjustment_type' => 'required|in:add,remove,set',
            'quantity' => 'required|integer|min:0',
            'reason' => 'required|string|max:255',
            'unit_cost' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $warehouseStock = WarehouseStock::where('inventory_item_id', $item->id)
                ->where('warehouse_id', $request->warehouse_id)
                ->first();

            if (!$warehouseStock) {
                $warehouseStock = WarehouseStock::create([
                    'inventory_item_id' => $item->id,
                    'warehouse_id' => $request->warehouse_id,
                    'quantity_available' => 0,
                    'average_cost' => $item->unit_cost,
                ]);
            }

            $oldQuantity = $warehouseStock->quantity_available;
            $newQuantity = $oldQuantity;
            $movementQuantity = 0;

            switch ($request->adjustment_type) {
                case 'add':
                    $newQuantity = $oldQuantity + $request->quantity;
                    $movementQuantity = $request->quantity;
                    break;
                case 'remove':
                    $newQuantity = max(0, $oldQuantity - $request->quantity);
                    $movementQuantity = -($oldQuantity - $newQuantity);
                    break;
                case 'set':
                    $newQuantity = $request->quantity;
                    $movementQuantity = $newQuantity - $oldQuantity;
                    break;
            }

            // Update warehouse stock
            if ($request->adjustment_type === 'add' && $request->unit_cost) {
                $warehouseStock->addStock($request->quantity, $request->unit_cost);
            } else {
                $warehouseStock->update(['quantity_available' => $newQuantity]);
            }

            // Record stock movement
            StockMovement::create([
                'inventory_item_id' => $item->id,
                'warehouse_id' => $request->warehouse_id,
                'type' => 'adjustment',
                'quantity' => $movementQuantity,
                'quantity_before' => $oldQuantity,
                'quantity_after' => $newQuantity,
                'unit_cost' => $request->unit_cost,
                'notes' => $request->reason,
                'created_by' => auth()->id(),
                'movement_date' => now(),
            ]);

            DB::commit();

            return redirect()
                ->route('admin.inventory.show', $item)
                ->with('success', 'Stock adjustment completed successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to adjust stock levels']);
        }
    }

    /**
     * Get low stock count.
     */
    private function getLowStockCount(): int
    {
        return InventoryItem::active()
            ->whereHas('warehouseStock', function ($query) {
                $query->selectRaw('inventory_item_id, SUM(quantity_available) as total_qty')
                      ->groupBy('inventory_item_id')
                      ->havingRaw('total_qty <= (SELECT reorder_point FROM inventory_items WHERE id = inventory_item_id)');
            })
            ->count();
    }

    /**
     * Get out of stock count.
     */
    private function getOutOfStockCount(): int
    {
        return InventoryItem::active()
            ->whereHas('warehouseStock', function ($query) {
                $query->selectRaw('inventory_item_id, SUM(quantity_available) as total_qty')
                      ->groupBy('inventory_item_id')
                      ->havingRaw('total_qty <= 0');
            })
            ->count();
    }

    /**
     * Get total inventory value.
     */
    private function getTotalInventoryValue(): float
    {
        return WarehouseStock::join('inventory_items', 'warehouse_stock.inventory_item_id', '=', 'inventory_items.id')
            ->where('inventory_items.is_active', true)
            ->sum(DB::raw('warehouse_stock.quantity_available * warehouse_stock.average_cost'));
    }
}
