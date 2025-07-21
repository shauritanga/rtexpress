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
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('driver_id')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('license_number')->unique();
            $table->date('license_expiry');
            $table->text('address');
            $table->date('date_of_birth');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('total_deliveries')->default(0);
            $table->decimal('total_distance', 10, 2)->default(0); // in km
            $table->json('emergency_contact')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('vehicle_plate')->nullable();
            $table->decimal('vehicle_capacity', 8, 2)->nullable(); // in kg
            $table->boolean('is_available')->default(true);
            $table->timestamp('last_location_update')->nullable();
            $table->decimal('current_latitude', 10, 8)->nullable();
            $table->decimal('current_longitude', 11, 8)->nullable();
            $table->json('working_hours')->nullable(); // start_time, end_time per day
            $table->timestamps();

            $table->index(['status', 'is_available']);
            $table->index(['current_latitude', 'current_longitude']);
            $table->index('last_location_update');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
