<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('warehouse_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->integer('quantity_available')->default(0);
            $table->integer('quantity_reserved')->default(0);
            $table->integer('quantity_damaged')->default(0);
            $table->string('location')->nullable(); // Aisle, Shelf, Bin location
            $table->decimal('average_cost', 10, 2)->default(0);
            $table->timestamp('last_counted_at')->nullable();
            $table->foreignId('last_counted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['inventory_item_id', 'warehouse_id']);
            $table->index(['warehouse_id', 'quantity_available']);
            $table->index('last_counted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_stock');
    }
};
