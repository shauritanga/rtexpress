<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Console\Command;

class FixGoogleOAuthEmailVerification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:google-oauth-email-verification';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix email verification for Google OAuth users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing email verification for Google OAuth users...');

        // Find customers with Google ID but unverified email
        $customers = Customer::whereNotNull('google_id')
            ->whereNull('email_verified_at')
            ->get();

        $this->info("Found {$customers->count()} customers with Google OAuth but unverified email");

        foreach ($customers as $customer) {
            $customer->update(['email_verified_at' => now()]);
            $this->line("✓ Verified email for customer: {$customer->email}");
        }

        // Find users with customer role and Google OAuth but unverified email
        $users = User::whereHas('customer', function ($query) {
                $query->whereNotNull('google_id');
            })
            ->whereNull('email_verified_at')
            ->get();

        $this->info("Found {$users->count()} users with Google OAuth but unverified email");

        foreach ($users as $user) {
            $user->update(['email_verified_at' => now()]);
            $this->line("✓ Verified email for user: {$user->email}");
        }

        // Fix missing customer roles for Google OAuth users
        $usersWithoutRole = User::whereHas('customer', function ($query) {
                $query->whereNotNull('google_id');
            })
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'customer');
            })
            ->get();

        $this->info("Found {$usersWithoutRole->count()} Google OAuth users without customer role");

        foreach ($usersWithoutRole as $user) {
            $user->assignRole('customer');
            $this->line("✓ Assigned customer role to: {$user->email}");
        }

        $this->info('✅ Email verification and role assignment fix completed!');
    }
}
