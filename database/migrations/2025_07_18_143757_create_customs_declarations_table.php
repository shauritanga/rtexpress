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
        Schema::create('customs_declarations', function (Blueprint $table) {
            $table->id();
            $table->string('declaration_number')->unique();
            $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
            $table->string('origin_country', 3); // ISO 3166-1 alpha-3
            $table->string('destination_country', 3); // ISO 3166-1 alpha-3
            $table->enum('declaration_type', ['export', 'import', 'transit'])->default('export');
            $table->enum('shipment_type', ['commercial', 'gift', 'sample', 'return', 'personal'])->default('commercial');
            $table->string('incoterms')->nullable(); // EXW, FOB, CIF, etc.
            $table->string('currency', 3)->default('TZS'); // ISO 4217
            $table->decimal('total_value', 12, 2)->default(0);
            $table->decimal('insurance_value', 12, 2)->default(0);
            $table->decimal('freight_charges', 10, 2)->default(0);
            $table->decimal('estimated_duties', 10, 2)->default(0);
            $table->decimal('estimated_taxes', 10, 2)->default(0);
            $table->text('description_of_goods');
            $table->string('reason_for_export')->nullable();
            $table->boolean('contains_batteries')->default(false);
            $table->boolean('contains_liquids')->default(false);
            $table->boolean('contains_dangerous_goods')->default(false);
            $table->json('dangerous_goods_details')->nullable();
            $table->string('exporter_reference')->nullable();
            $table->string('importer_reference')->nullable();
            $table->json('exporter_details'); // Name, address, tax ID, etc.
            $table->json('importer_details'); // Name, address, tax ID, etc.
            $table->json('consignee_details')->nullable(); // If different from importer
            $table->enum('status', ['draft', 'submitted', 'processing', 'approved', 'rejected', 'cleared'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('cleared_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('customs_response')->nullable();
            $table->string('customs_reference')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['shipment_id']);
            $table->index(['status', 'created_at']);
            $table->index(['origin_country', 'destination_country']);
            $table->index('declaration_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customs_declarations');
    }
};
