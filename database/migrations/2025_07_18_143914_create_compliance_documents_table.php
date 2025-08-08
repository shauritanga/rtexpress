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
        Schema::create('compliance_documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique();
            $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
            $table->foreignId('customs_declaration_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('document_type', [
                'commercial_invoice',
                'packing_list',
                'certificate_of_origin',
                'export_license',
                'import_permit',
                'dangerous_goods_declaration',
                'insurance_certificate',
                'bill_of_lading',
                'airway_bill',
                'customs_declaration',
                'phytosanitary_certificate',
                'health_certificate',
                'other',
            ]);
            $table->string('document_name');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable(); // in bytes
            $table->string('issued_by')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('reference_number')->nullable();
            $table->enum('status', ['draft', 'pending_review', 'approved', 'rejected', 'expired'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_required')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->json('metadata')->nullable(); // Additional document-specific data
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['shipment_id', 'document_type']);
            $table->index(['customs_declaration_id']);
            $table->index(['status', 'expiry_date']);
            $table->index(['document_type', 'is_required']);
            $table->index('issue_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_documents');
    }
};
