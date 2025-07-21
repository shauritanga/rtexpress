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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // shipments.create, shipments.view, etc.
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->string('module'); // shipments, billing, warehouse, etc.
            $table->timestamps();

            // Add indexes
            $table->index('name');
            $table->index('module');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
