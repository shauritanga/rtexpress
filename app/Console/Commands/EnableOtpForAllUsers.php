<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class EnableOtpForAllUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'otp:enable-all {--force : Force enable OTP even for users without phone numbers}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enable OTP (Two-Factor Authentication) for all users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔐 Enabling OTP for all users...');

        // Get users based on options
        if ($this->option('force')) {
            $users = User::where('otp_enabled', false)->get();
            $this->warn('⚠️  Force mode: Enabling OTP for ALL users (including those without phone numbers)');
        } else {
            $users = User::where('otp_enabled', false)
                ->whereNotNull('phone')
                ->where('phone', '!=', '')
                ->get();
            $this->info('📱 Enabling OTP only for users with phone numbers');
        }

        if ($users->isEmpty()) {
            $this->info('✅ No users found that need OTP enabled.');
            return Command::SUCCESS;
        }

        $this->info("Found {$users->count()} users to update:");

        // Show progress bar
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $updated = 0;
        $skipped = 0;

        foreach ($users as $user) {
            try {
                // Check if user has phone number (unless force mode)
                if (!$this->option('force') && empty($user->phone)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                // Enable OTP for user
                $user->update(['otp_enabled' => true]);
                $updated++;

                $bar->advance();
            } catch (\Exception $e) {
                $this->error("Failed to update user {$user->email}: " . $e->getMessage());
                $skipped++;
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info("📊 Summary:");
        $this->info("✅ Updated: {$updated} users");
        if ($skipped > 0) {
            $this->warn("⚠️  Skipped: {$skipped} users");
        }

        // Show warning about users without phone numbers
        $usersWithoutPhone = User::whereNull('phone')
            ->orWhere('phone', '')
            ->count();

        if ($usersWithoutPhone > 0 && !$this->option('force')) {
            $this->newLine();
            $this->warn("⚠️  Warning: {$usersWithoutPhone} users don't have phone numbers.");
            $this->warn("   These users won't be able to use OTP until they add a phone number.");
            $this->warn("   Use --force flag to enable OTP for all users regardless of phone number.");
        }

        $this->newLine();
        $this->info('🎉 OTP enablement completed successfully!');
        $this->info('💡 Users will now be required to use OTP when logging in.');

        return Command::SUCCESS;
    }
}
