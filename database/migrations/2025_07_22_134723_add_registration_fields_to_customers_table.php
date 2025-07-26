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
            $table->string('industry')->nullable()->after('company_name');
            $table->string('company_size')->nullable()->after('industry');
            $table->string('website')->nullable()->after('company_size');
            $table->string('monthly_volume')->nullable()->after('website');
            $table->string('primary_service')->nullable()->after('monthly_volume');
            $table->string('hear_about_us')->nullable()->after('primary_service');
            $table->boolean('marketing_emails')->default(false)->after('hear_about_us');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            //
        });
    }
};
