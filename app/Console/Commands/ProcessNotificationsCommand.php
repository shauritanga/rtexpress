<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;
use App\Models\Notification;

class ProcessNotificationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:process {--limit=100 : Maximum number of notifications to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending notifications and send them via configured channels';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService)
    {
        $limit = (int) $this->option('limit');

        $this->info('Starting notification processing...');

        // Get pending notifications count
        $pendingCount = Notification::pending()->count();
        $this->info("Found {$pendingCount} pending notifications");

        if ($pendingCount === 0) {
            $this->info('No pending notifications to process.');
            return 0;
        }

        try {
            $processed = $notificationService->processPending();

            $this->info("Successfully processed {$processed} notifications");

            // Show summary
            $this->table(
                ['Status', 'Count'],
                [
                    ['Pending', Notification::pending()->count()],
                    ['Sent', Notification::where('status', 'sent')->count()],
                    ['Delivered', Notification::where('status', 'delivered')->count()],
                    ['Failed', Notification::where('status', 'failed')->count()],
                ]
            );

            return 0;

        } catch (\Exception $e) {
            $this->error("Failed to process notifications: " . $e->getMessage());
            return 1;
        }
    }
}
