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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('barcode')->unique()->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->default('general');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->decimal('weight', 8, 2)->nullable(); // in kg
            $table->json('dimensions')->nullable(); // length, width, height in cm
            $table->string('unit_of_measure')->default('piece'); // piece, kg, liter, etc.
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->string('supplier')->nullable();
            $table->string('manufacturer')->nullable();
            $table->integer('min_stock_level')->default(0);
            $table->integer('max_stock_level')->default(1000);
            $table->integer('reorder_point')->default(10);
            $table->integer('reorder_quantity')->default(50);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_trackable')->default(true);
            $table->boolean('is_serialized')->default(false);
            $table->json('custom_fields')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index(['brand', 'is_active']);
            $table->index(['is_active', 'created_at']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
