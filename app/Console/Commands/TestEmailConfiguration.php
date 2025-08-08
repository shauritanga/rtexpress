<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\OtpCodeNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TestEmailConfiguration extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email?} {--otp : Test OTP email specifically}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email configuration and send test emails';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Testing Email Configuration...');
        $this->newLine();

        // Check mail configuration
        $this->checkMailConfiguration();
        $this->newLine();

        // Test email sending
        $email = $this->argument('email') ?? $this->ask('Enter email address to test');
        
        if (!$email) {
            $this->error('Email address is required');
            return 1;
        }

        if ($this->option('otp')) {
            return $this->testOtpEmail($email);
        }

        return $this->testBasicEmail($email);
    }

    private function checkMailConfiguration()
    {
        $this->info('📧 Current Mail Configuration:');
        
        $mailer = config('mail.default');
        $this->line("  Driver: {$mailer}");
        
        if ($mailer === 'log') {
            $this->warn('  ⚠️  Mail driver is set to "log" - emails will be written to storage/logs/laravel.log');
            $this->warn('  💡 To send real emails, set MAIL_MAILER=smtp in .env file');
        } else {
            $this->line("  Host: " . config('mail.mailers.smtp.host'));
            $this->line("  Port: " . config('mail.mailers.smtp.port'));
            $this->line("  Username: " . config('mail.mailers.smtp.username'));
            $this->line("  Encryption: " . config('mail.mailers.smtp.encryption', 'none'));
        }
        
        $this->line("  From: " . config('mail.from.address') . " (" . config('mail.from.name') . ")");
        
        // Check queue configuration
        $queueDriver = config('queue.default');
        $this->line("  Queue Driver: {$queueDriver}");
        
        if ($queueDriver !== 'sync') {
            $this->warn('  ⚠️  Queue driver is not "sync" - emails may be queued');
            $this->warn('  💡 Make sure queue workers are running: php artisan queue:work');
        }
    }

    private function testBasicEmail(string $email)
    {
        $this->info("📤 Sending test email to: {$email}");
        
        try {
            Mail::raw('This is a test email from RT Express. If you receive this, your email configuration is working!', function ($message) use ($email) {
                $message->to($email)
                        ->subject('RT Express - Email Configuration Test');
            });
            
            $this->info('✅ Test email sent successfully!');
            
            if (config('mail.default') === 'log') {
                $this->warn('💡 Check storage/logs/laravel.log for the email content');
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to send test email:');
            $this->error($e->getMessage());
            return 1;
        }
    }

    private function testOtpEmail(string $email)
    {
        $this->info("📤 Sending test OTP email to: {$email}");
        
        try {
            // Find or create a test user
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                $this->warn("User with email {$email} not found. Creating temporary user for test...");
                $user = new User([
                    'name' => 'Test User',
                    'email' => $email,
                ]);
            }
            
            // Send OTP notification
            $testOtpCode = '123456';
            $user->notify(new OtpCodeNotification($testOtpCode, 'login', 5));
            
            $this->info('✅ Test OTP email sent successfully!');
            $this->line("Test OTP Code: {$testOtpCode}");
            
            if (config('mail.default') === 'log') {
                $this->warn('💡 Check storage/logs/laravel.log for the email content');
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to send test OTP email:');
            $this->error($e->getMessage());
            Log::error('Test OTP email failed', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return 1;
        }
    }
}
