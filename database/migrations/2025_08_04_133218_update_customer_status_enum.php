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
        Schema::table('customers', function (Blueprint $table) {
            // Update the status enum to include pending_approval
            $table->enum('status', ['active', 'inactive', 'suspended', 'pending_approval'])->default('pending_approval')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->change();
        });
    }
};
