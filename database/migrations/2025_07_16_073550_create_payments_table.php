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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique(); // PAY-YYYY-NNNNNN format
            $table->foreignId('invoice_id')->constrained()->onDelete('restrict');
            $table->foreignId('customer_id')->constrained()->onDelete('restrict');

            // Payment details
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->enum('type', ['full', 'partial', 'overpayment', 'refund'])->default('full');
            $table->enum('method', ['credit_card', 'bank_transfer', 'mobile_money', 'cash', 'check', 'other'])->default('credit_card');

            // Financial details
            $table->string('currency', 3)->default('USD');
            $table->decimal('exchange_rate', 10, 6)->default(1.000000);
            $table->decimal('amount', 12, 2);
            $table->decimal('fee_amount', 12, 2)->default(0); // Payment processing fees
            $table->decimal('net_amount', 12, 2); // Amount after fees

            // Payment gateway details
            $table->string('gateway')->nullable(); // stripe, paypal, clickpesa, etc.
            $table->string('gateway_transaction_id')->nullable();
            $table->string('gateway_payment_id')->nullable();
            $table->json('gateway_response')->nullable(); // Full gateway response

            // Payment method details
            $table->string('payment_method_details')->nullable(); // Last 4 digits of card, bank name, etc.
            $table->string('reference_number')->nullable(); // Bank reference, check number, etc.

            // Dates
            $table->timestamp('payment_date');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();

            // Additional details
            $table->text('notes')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('metadata')->nullable(); // Additional payment metadata

            // Tracking
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');

            // Refund details
            $table->foreignId('refund_parent_id')->nullable()->constrained('payments')->onDelete('set null');
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->text('refund_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('payment_number');
            $table->index('invoice_id');
            $table->index('customer_id');
            $table->index('status');
            $table->index('gateway');
            $table->index('payment_date');
            $table->index(['invoice_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index(['gateway', 'gateway_transaction_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
