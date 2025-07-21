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
        Schema::create('driver_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->foreignId('delivery_route_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('accuracy', 8, 2)->nullable(); // GPS accuracy in meters
            $table->decimal('speed', 8, 2)->nullable(); // Speed in km/h
            $table->decimal('heading', 8, 2)->nullable(); // Direction in degrees
            $table->decimal('altitude', 8, 2)->nullable(); // Altitude in meters
            $table->timestamp('recorded_at');
            $table->string('source')->default('mobile_app'); // mobile_app, gps_device, manual
            $table->json('metadata')->nullable(); // Additional GPS data
            $table->timestamps();

            $table->index(['driver_id', 'recorded_at']);
            $table->index(['delivery_route_id', 'recorded_at']);
            $table->index(['latitude', 'longitude']);
            $table->index('recorded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_locations');
    }
};
