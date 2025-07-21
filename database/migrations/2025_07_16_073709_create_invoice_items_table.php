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
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');

            // Item details
            $table->string('description');
            $table->string('item_code')->nullable(); // SKU or service code
            $table->enum('type', ['service', 'product', 'shipping', 'tax', 'discount'])->default('service');

            // Quantity and pricing
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit')->default('pcs'); // pcs, kg, hours, etc.
            $table->decimal('unit_price', 12, 2);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('line_total', 12, 2); // (quantity * unit_price) - discount_amount

            // Tax details
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);

            // Additional details
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // Additional item metadata

            // Sorting
            $table->integer('sort_order')->default(0);

            $table->timestamps();

            // Indexes
            $table->index('invoice_id');
            $table->index('type');
            $table->index(['invoice_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
