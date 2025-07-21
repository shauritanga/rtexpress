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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->string('user_type'); // user, customer
            $table->unsignedBigInteger('user_id');
            $table->string('notification_type'); // shipment_update, payment_received, etc.
            $table->boolean('email_enabled')->default(true);
            $table->boolean('sms_enabled')->default(false);
            $table->boolean('push_enabled')->default(true);
            $table->boolean('in_app_enabled')->default(true);
            $table->json('schedule')->nullable(); // Time preferences, quiet hours
            $table->json('filters')->nullable(); // Specific filters for this notification type
            $table->timestamps();

            $table->unique(['user_type', 'user_id', 'notification_type']);
            $table->index(['user_type', 'user_id']);
            $table->index('notification_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
