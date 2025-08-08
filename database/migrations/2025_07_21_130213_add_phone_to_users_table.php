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
        Schema::table('users', function (Blueprint $table) {
            // Only add columns that don't exist
            if (! Schema::hasColumn('users', 'last_activity')) {
                $table->timestamp('last_activity')->nullable()->after('email_verified_at');
            }
            if (! Schema::hasColumn('users', 'otp_enabled')) {
                $table->boolean('otp_enabled')->default(false)->after('phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_activity', 'otp_enabled']);
        });
    }
};
