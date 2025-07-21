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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique(); // RT-YYYY-NNNNNN format
            $table->foreignId('customer_id')->constrained()->onDelete('restrict');
            $table->foreignId('origin_warehouse_id')->constrained('warehouses')->onDelete('restrict');
            $table->foreignId('destination_warehouse_id')->nullable()->constrained('warehouses')->onDelete('restrict');

            // Sender information
            $table->string('sender_name');
            $table->string('sender_phone');
            $table->text('sender_address');

            // Recipient information
            $table->string('recipient_name');
            $table->string('recipient_phone');
            $table->text('recipient_address');

            // Shipment details
            $table->enum('service_type', ['standard', 'express', 'overnight', 'international'])->default('standard');
            $table->enum('package_type', ['document', 'package', 'pallet', 'container'])->default('package');
            $table->decimal('weight_kg', 8, 2);
            $table->decimal('dimensions_length_cm', 8, 2);
            $table->decimal('dimensions_width_cm', 8, 2);
            $table->decimal('dimensions_height_cm', 8, 2);
            $table->decimal('declared_value', 12, 2)->default(0);
            $table->decimal('insurance_value', 12, 2)->default(0);
            $table->text('special_instructions')->nullable();

            // Status and tracking
            $table->enum('status', [
                'pending', 'picked_up', 'in_transit', 'out_for_delivery',
                'delivered', 'exception', 'cancelled'
            ])->default('pending');
            $table->timestamp('estimated_delivery_date')->nullable();
            $table->timestamp('actual_delivery_date')->nullable();
            $table->string('delivery_signature')->nullable();
            $table->text('delivery_notes')->nullable();

            // User assignments
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            // Add indexes for performance
            $table->index('tracking_number');
            $table->index('customer_id');
            $table->index('status');
            $table->index('service_type');
            $table->index('created_at');
            $table->index('estimated_delivery_date');
            $table->index(['customer_id', 'status', 'created_at']); // Composite index for customer shipment queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
