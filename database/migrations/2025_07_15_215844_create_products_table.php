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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->decimal('dimensions_length_cm', 8, 2)->nullable();
            $table->decimal('dimensions_width_cm', 8, 2)->nullable();
            $table->decimal('dimensions_height_cm', 8, 2)->nullable();
            $table->boolean('hazardous_material')->default(false);
            $table->boolean('temperature_controlled')->default(false);
            $table->boolean('fragile')->default(false);
            $table->enum('status', ['active', 'discontinued'])->default('active');
            $table->timestamps();

            // Add indexes
            $table->index('sku');
            $table->index('name');
            $table->index('category');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
