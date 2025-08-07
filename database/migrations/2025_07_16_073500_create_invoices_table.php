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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // INV-YYYY-NNNNNN format
            $table->foreignId('customer_id')->constrained()->onDelete('restrict');
            $table->foreignId('shipment_id')->nullable()->constrained()->onDelete('set null');

            // Invoice details
            $table->enum('status', ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->enum('type', ['standard', 'recurring', 'credit_note', 'proforma'])->default('standard');
            $table->date('issue_date');
            $table->date('due_date');
            $table->date('paid_date')->nullable();

            // Financial details
            $table->string('currency', 3)->default('TZS'); // ISO currency code
            $table->decimal('exchange_rate', 10, 6)->default(1.000000);
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('balance_due', 12, 2);

            // Tax information
            $table->decimal('tax_rate', 5, 2)->default(0); // Percentage
            $table->string('tax_type')->nullable(); // VAT, GST, etc.

            // Billing addresses
            $table->json('billing_address'); // Customer billing address
            $table->json('company_address'); // Company address

            // Additional details
            $table->text('notes')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->string('payment_terms')->nullable(); // Net 30, Due on receipt, etc.
            $table->json('payment_methods')->nullable(); // Accepted payment methods

            // Tracking
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('sent_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->integer('view_count')->default(0);

            // Recurring invoice details
            $table->enum('recurring_frequency', ['weekly', 'monthly', 'quarterly', 'yearly'])->nullable();
            $table->date('next_recurring_date')->nullable();
            $table->foreignId('parent_invoice_id')->nullable()->constrained('invoices')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('invoice_number');
            $table->index('customer_id');
            $table->index('status');
            $table->index('due_date');
            $table->index('issue_date');
            $table->index(['customer_id', 'status']);
            $table->index(['status', 'due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
