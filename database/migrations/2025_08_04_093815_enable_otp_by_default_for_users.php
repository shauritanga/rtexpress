<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the default value for otp_enabled to true
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('otp_enabled')->default(true)->change();
        });

        // Enable OTP for all existing users who have phone numbers
        DB::table('users')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->update(['otp_enabled' => true]);

        // Log the change
        \Log::info('OTP enabled by default for all users with phone numbers');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the default value back to false
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('otp_enabled')->default(false)->change();
        });

        // Optionally disable OTP for all users (commented out for safety)
        // DB::table('users')->update(['otp_enabled' => false]);
    }
};
