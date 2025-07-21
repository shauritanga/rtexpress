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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_id')->constrained()->onDelete('cascade');
            $table->string('event'); // sent, delivered, failed, opened, clicked
            $table->timestamp('event_time');
            $table->json('event_data')->nullable(); // Provider-specific event data
            $table->string('provider')->nullable(); // twilio, sendgrid, etc.
            $table->string('provider_message_id')->nullable();
            $table->text('provider_response')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['notification_id', 'event']);
            $table->index(['event', 'event_time']);
            $table->index('provider_message_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
