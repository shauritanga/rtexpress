<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class ArchiveOldNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:archive-old {--days=30 : Number of days after which read notifications should be archived} {--delete-days=90 : Number of days after which archived notifications should be deleted}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Archive old read notifications and delete very old archived notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $archiveDays = (int) $this->option('days');
        $deleteDays = (int) $this->option('delete-days');

        $this->info('Starting notification cleanup process...');

        // Archive old read notifications
        $this->info("Archiving read notifications older than {$archiveDays} days...");
        $archivedCount = Notification::autoArchiveOldNotifications($archiveDays);
        $this->info("Archived {$archivedCount} notifications.");

        // Delete very old archived notifications
        $this->info("Deleting archived notifications older than {$deleteDays} days...");
        $deletedCount = Notification::deleteOldArchivedNotifications($deleteDays);
        $this->info("Deleted {$deletedCount} old archived notifications.");

        $this->info('Notification cleanup completed!');
        $this->info("Summary: {$archivedCount} archived, {$deletedCount} deleted");

        return 0;
    }
}
