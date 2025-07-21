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
        Schema::create('customs_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customs_declaration_id')->constrained()->onDelete('cascade');
            $table->string('description');
            $table->string('hs_code')->nullable(); // Harmonized System code
            $table->string('country_of_origin', 3); // ISO 3166-1 alpha-3
            $table->integer('quantity');
            $table->string('unit_of_measure')->default('piece');
            $table->decimal('unit_weight', 8, 3); // in kg
            $table->decimal('unit_value', 10, 2);
            $table->decimal('total_value', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('manufacturer')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('material')->nullable();
            $table->string('purpose')->nullable(); // Commercial use, personal use, etc.
            $table->boolean('is_restricted')->default(false);
            $table->boolean('requires_permit')->default(false);
            $table->string('permit_number')->nullable();
            $table->decimal('estimated_duty_rate', 5, 2)->default(0); // Percentage
            $table->decimal('estimated_duty_amount', 10, 2)->default(0);
            $table->decimal('estimated_tax_rate', 5, 2)->default(0); // Percentage
            $table->decimal('estimated_tax_amount', 10, 2)->default(0);
            $table->json('additional_details')->nullable();
            $table->timestamps();

            $table->index(['customs_declaration_id']);
            $table->index(['hs_code']);
            $table->index(['country_of_origin']);
            $table->index(['is_restricted', 'requires_permit']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customs_items');
    }
};
