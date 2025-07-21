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
        Schema::create('customs_regulations', function (Blueprint $table) {
            $table->id();
            $table->string('regulation_code')->unique();
            $table->string('country', 3); // ISO 3166-1 alpha-3
            $table->string('regulation_type'); // duty_rate, restriction, prohibition, etc.
            $table->string('hs_code')->nullable(); // Specific to HS code or general
            $table->string('product_category')->nullable();
            $table->string('title');
            $table->text('description');
            $table->decimal('duty_rate', 5, 2)->nullable(); // Percentage
            $table->decimal('minimum_duty', 10, 2)->nullable();
            $table->decimal('maximum_duty', 10, 2)->nullable();
            $table->decimal('tax_rate', 5, 2)->nullable(); // VAT/GST rate
            $table->decimal('threshold_value', 12, 2)->nullable(); // De minimis threshold
            $table->json('restrictions')->nullable(); // Quantity limits, licensing requirements
            $table->json('required_documents')->nullable(); // List of required documents
            $table->json('prohibited_items')->nullable(); // List of prohibited items
            $table->boolean('requires_permit')->default(false);
            $table->string('permit_authority')->nullable();
            $table->text('compliance_notes')->nullable();
            $table->date('effective_date');
            $table->date('expiry_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('source')->nullable(); // Government agency, trade agreement, etc.
            $table->string('reference_url')->nullable();
            $table->timestamp('last_updated_at');
            $table->foreignId('updated_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['country', 'is_active']);
            $table->index(['hs_code', 'country']);
            $table->index(['regulation_type', 'is_active']);
            $table->index(['effective_date', 'expiry_date']);
            $table->index('product_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customs_regulations');
    }
};
