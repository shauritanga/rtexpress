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
            // Drop the existing foreign key constraint
            $table->dropForeign(['created_by']);

            // Make the created_by column nullable
            $table->foreignId('created_by')->nullable()->change();

            // Re-add the foreign key constraint with nullable support
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Drop the nullable foreign key constraint
            $table->dropForeign(['created_by']);

            // Make the created_by column non-nullable again
            $table->foreignId('created_by')->nullable(false)->change();

            // Re-add the original foreign key constraint
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
        });
    }
};
