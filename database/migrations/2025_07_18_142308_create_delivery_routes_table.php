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
        Schema::create('delivery_routes', function (Blueprint $table) {
            $table->id();
            $table->string('route_number')->unique();
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->date('delivery_date');
            $table->enum('status', ['planned', 'in_progress', 'completed', 'cancelled'])->default('planned');
            $table->time('planned_start_time');
            $table->time('planned_end_time');
            $table->timestamp('actual_start_time')->nullable();
            $table->timestamp('actual_end_time')->nullable();
            $table->decimal('total_distance', 10, 2)->default(0); // in km
            $table->decimal('estimated_duration', 8, 2)->default(0); // in hours
            $table->decimal('actual_duration', 8, 2)->nullable(); // in hours
            $table->integer('total_stops')->default(0);
            $table->integer('completed_stops')->default(0);
            $table->decimal('total_weight', 10, 2)->default(0); // in kg
            $table->decimal('fuel_cost', 8, 2)->default(0);
            $table->json('route_coordinates')->nullable(); // Google Maps route data
            $table->json('optimization_data')->nullable(); // Route optimization metadata
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['delivery_date', 'status']);
            $table->index(['driver_id', 'delivery_date']);
            $table->index(['warehouse_id', 'delivery_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_routes');
    }
};
