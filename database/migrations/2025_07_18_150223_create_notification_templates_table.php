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
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type'); // shipment_update, payment_received, etc.
            $table->string('channel'); // email, sms, push
            $table->string('subject')->nullable(); // For email templates
            $table->text('content'); // Template content with placeholders
            $table->json('variables')->nullable(); // Available template variables
            $table->json('settings')->nullable(); // Template-specific settings
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false); // System templates cannot be deleted
            $table->string('language', 5)->default('en'); // Language code
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['type', 'channel', 'is_active']);
            $table->index(['language', 'is_active']);
            $table->index('template_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
