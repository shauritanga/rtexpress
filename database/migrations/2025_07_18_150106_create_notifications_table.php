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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('notification_id')->unique();
            $table->string('type'); // shipment_update, payment_received, delivery_scheduled, etc.
            $table->string('channel'); // email, sms, push, in_app
            $table->string('recipient_type'); // user, customer, driver
            $table->unsignedBigInteger('recipient_id');
            $table->string('recipient_email')->nullable();
            $table->string('recipient_phone')->nullable();
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional notification data
            $table->string('template')->nullable(); // Email/SMS template name
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'sent', 'delivered', 'failed', 'read'])->default('pending');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->string('external_id')->nullable(); // SMS/Email service provider ID
            $table->json('metadata')->nullable(); // Provider-specific metadata
            $table->string('related_type')->nullable(); // shipment, invoice, etc.
            $table->unsignedBigInteger('related_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['recipient_type', 'recipient_id']);
            $table->index(['type', 'status']);
            $table->index(['channel', 'status']);
            $table->index(['scheduled_at', 'status']);
            $table->index(['related_type', 'related_id']);
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
