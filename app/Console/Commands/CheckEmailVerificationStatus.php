<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class CheckEmailVerificationStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:check-verification {--email= : Check specific email address}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check email verification status and mail configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Email Verification Status Check');
        $this->newLine();

        // Check mail configuration
        $this->checkMailConfiguration();
        $this->newLine();

        // Check specific email or all unverified users
        if ($email = $this->option('email')) {
            $this->checkSpecificUser($email);
        } else {
            $this->checkAllUnverifiedUsers();
        }

        $this->newLine();
        $this->info('✅ Email verification check completed!');
    }

    private function checkMailConfiguration()
    {
        $this->info('📧 Mail Configuration:');

        $mailer = config('mail.default');
        $this->line("  Driver: {$mailer}");

        if ($mailer === 'log') {
            $this->warn('  ⚠️  Mail driver is set to "log" - emails will be written to storage/logs/laravel.log');
            $this->line('  💡 To send real emails, configure SMTP settings in .env file');
        } else {
            $this->line('  Host: '.config('mail.mailers.smtp.host'));
            $this->line('  Port: '.config('mail.mailers.smtp.port'));
        }

        $this->line('  From: '.config('mail.from.address').' ('.config('mail.from.name').')');
    }

    private function checkSpecificUser(string $email)
    {
        $this->info("👤 Checking user: {$email}");

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("  ❌ User not found with email: {$email}");

            return;
        }

        $this->displayUserStatus($user);
    }

    private function checkAllUnverifiedUsers()
    {
        $this->info('👥 All Unverified Users:');

        $unverifiedUsers = User::whereNull('email_verified_at')->get();

        if ($unverifiedUsers->isEmpty()) {
            $this->line('  ✅ All users have verified their email addresses!');

            return;
        }

        $this->line("  Found {$unverifiedUsers->count()} unverified users:");
        $this->newLine();

        foreach ($unverifiedUsers as $user) {
            $this->displayUserStatus($user);
            $this->newLine();
        }
    }

    private function displayUserStatus(User $user)
    {
        $this->line("  📧 Email: {$user->email}");
        $this->line("  👤 Name: {$user->name}");
        $this->line('  📅 Registered: '.$user->created_at->format('Y-m-d H:i:s'));

        if ($user->email_verified_at) {
            $this->line('  ✅ Verified: '.$user->email_verified_at->format('Y-m-d H:i:s'));
        } else {
            $this->line('  ❌ Not verified');
            $this->line('  ⏰ Days since registration: '.$user->created_at->diffInDays(now()));
        }

        // Check if user has customer role
        if ($user->hasRole('customer')) {
            $this->line('  🏢 Role: Customer');
            if ($user->customer) {
                $this->line('  🏢 Company: '.$user->customer->company_name);
                $this->line('  📊 Status: '.$user->customer->status);
            }
        }
    }
}
