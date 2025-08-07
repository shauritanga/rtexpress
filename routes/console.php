<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule notification cleanup
Schedule::command('notifications:archive-old')->dailyAt('02:00');
Schedule::command('notifications:process')->everyFiveMinutes();
