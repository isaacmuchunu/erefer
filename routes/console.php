<?php
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Custom console commands for the e-referral system
Artisan::command('ereferral:cleanup-expired-referrals', function () {
    $count = \App\Models\Referral::where('status', 'pending')
        ->where('response_deadline', '<', now())
        ->update(['status' => 'expired']);
    
    $this->info("Marked {$count} referrals as expired.");
})->purpose('Mark expired referrals as expired');

Artisan::command('ereferral:cleanup-expired-reservations', function () {
    $count = \App\Models\BedReservation::where('status', 'active')
        ->where('reserved_until', '<', now())
        ->update(['status' => 'expired']);
    
    $this->info("Marked {$count} bed reservations as expired.");
})->purpose('Mark expired bed reservations as expired');

Artisan::command('ereferral:send-maintenance-reminders', function () {
    $equipmentDue = \App\Models\Equipment::where('next_maintenance_due', '<=', now()->addDays(7))
        ->where('status', '!=', 'maintenance')
        ->get();
    
    foreach ($equipmentDue as $equipment) {
        // Send maintenance reminder notification
        $equipment->facility->admins->each(function ($admin) use ($equipment) {
            $admin->notify(new \App\Notifications\MaintenanceReminderNotification($equipment));
        });
    }
    
    $this->info("Sent maintenance reminders for {$equipmentDue->count()} equipment items.");
})->purpose('Send maintenance reminders for equipment');