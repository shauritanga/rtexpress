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
        Schema::create('route_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_route_id')->constrained()->onDelete('cascade');
            $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
            $table->integer('stop_order');
            $table->enum('type', ['pickup', 'delivery'])->default('delivery');
            $table->enum('status', ['pending', 'in_transit', 'arrived', 'completed', 'failed'])->default('pending');
            $table->string('customer_name');
            $table->text('address');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('contact_phone')->nullable();
            $table->time('planned_arrival_time');
            $table->time('planned_departure_time');
            $table->timestamp('actual_arrival_time')->nullable();
            $table->timestamp('actual_departure_time')->nullable();
            $table->integer('estimated_duration')->default(15); // in minutes
            $table->integer('actual_duration')->nullable(); // in minutes
            $table->decimal('distance_from_previous', 8, 2)->default(0); // in km
            $table->text('delivery_instructions')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->boolean('requires_signature')->default(false);
            $table->boolean('is_fragile')->default(false);
            $table->json('delivery_proof')->nullable(); // photos, signatures, etc.
            $table->text('delivery_notes')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['delivery_route_id', 'stop_order']);
            $table->index(['shipment_id']);
            $table->index(['status', 'type']);
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('route_stops');
    }
};
