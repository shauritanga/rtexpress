<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Notification;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationsController extends Controller
{
    /**
     * Display the notifications page
     */
    public function index()
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return redirect()->route('customer.dashboard')
                ->with('error', 'Customer profile not found.');
        }

        // Get user notification preferences
        $notificationPrefs = NotificationPreference::where('user_type', 'customer')
            ->where('user_id', $customer->id)
            ->get()
            ->keyBy('notification_type');

        // Get global channel settings from a special 'global_channels' preference record
        $globalChannelPref = $notificationPrefs->get('global_channels');
        $globalChannels = [
            'email' => $globalChannelPref ? (bool) $globalChannelPref->email_enabled : true,
            'sms' => $globalChannelPref ? (bool) $globalChannelPref->sms_enabled : false,
            'push' => $globalChannelPref ? (bool) $globalChannelPref->push_enabled : false,
        ];

        // Determine which notification types are enabled (any channel enabled = type enabled)
        $notificationTypes = [];
        foreach ($notificationPrefs as $type => $pref) {
            // Skip the global_channels special record
            if ($type === 'global_channels') {
                continue;
            }
            $notificationTypes[$type] = $pref->email_enabled || $pref->sms_enabled || $pref->push_enabled || $pref->in_app_enabled;
        }

        $preferences = [
            'global_channels' => $globalChannels,
            'notification_types' => $notificationTypes,
            'contact_info' => [
                'email_address' => $customer->email,
                'phone_number' => $customer->phone,
            ],
        ];

        // Get notification statistics
        $stats = Notification::getActiveStatsForCustomer($customer->id);

        // Get recent notifications from database (only active ones)
        $notifications = Notification::forCustomer($customer->id)->active()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'notification_id' => $notification->notification_id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'channel' => $notification->channel,
                    'status' => $notification->status,
                    'priority' => $notification->priority,
                    'created_at' => $notification->created_at->toISOString(),
                    'read_at' => $notification->read_at?->toISOString(),
                    'sent_at' => $notification->sent_at?->toISOString(),
                    'delivered_at' => $notification->delivered_at?->toISOString(),
                    'failed_at' => $notification->failed_at?->toISOString(),
                    'failure_reason' => $notification->failure_reason,
                    'related_type' => $notification->related_type,
                    'related_id' => $notification->related_id,
                    'data' => $notification->data,
                    'metadata' => $notification->metadata,
                ];
            })
            ->toArray();

        return Inertia::render('Customer/Notifications/Index', [
            'preferences' => $preferences,
            'notifications' => $notifications,
            'stats' => $stats,
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updatePreferences(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return back()->with('error', 'Customer profile not found.');
        }

        $validated = $request->validate([
            'email_address' => 'nullable|email',
            'phone_number' => 'nullable|string|max:20',
            'global_channels' => 'required|array',
            'global_channels.email' => 'boolean',
            'global_channels.sms' => 'boolean',
            'global_channels.push' => 'boolean',
            'notification_types' => 'required|array',
            'notification_types.*' => 'boolean',
        ]);

        // Update customer contact information if provided
        if (isset($validated['email_address']) && $validated['email_address']) {
            $customer->update(['email' => $validated['email_address']]);
        }

        if (isset($validated['phone_number']) && $validated['phone_number']) {
            $customer->update(['phone' => $validated['phone_number']]);
        }

        // Store global channel preferences in a special record
        $globalChannels = $validated['global_channels'];
        NotificationPreference::updateOrCreate([
            'user_type' => 'customer',
            'user_id' => $customer->id,
            'notification_type' => 'global_channels',
        ], [
            'email_enabled' => $globalChannels['email'] ?? false,
            'sms_enabled' => $globalChannels['sms'] ?? false,
            'push_enabled' => $globalChannels['push'] ?? false,
            'in_app_enabled' => true, // Always enable in-app
        ]);

        // Update notification preferences using the NotificationPreference model
        foreach ($validated['notification_types'] as $notificationType => $enabled) {
            if ($enabled) {
                // If notification type is enabled, use global channel settings
                NotificationPreference::updateOrCreate([
                    'user_type' => 'customer',
                    'user_id' => $customer->id,
                    'notification_type' => $notificationType,
                ], [
                    'email_enabled' => $globalChannels['email'] ?? false,
                    'sms_enabled' => $globalChannels['sms'] ?? false,
                    'push_enabled' => $globalChannels['push'] ?? false,
                    'in_app_enabled' => true, // Always enable in-app notifications
                ]);
            } else {
                // If notification type is disabled, disable all channels
                NotificationPreference::updateOrCreate([
                    'user_type' => 'customer',
                    'user_id' => $customer->id,
                    'notification_type' => $notificationType,
                ], [
                    'email_enabled' => false,
                    'sms_enabled' => false,
                    'push_enabled' => false,
                    'in_app_enabled' => false,
                ]);
            }
        }

        return back()->with('success', 'Notification preferences updated successfully.');
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $notificationId)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return back()->with('error', 'Customer profile not found.');
        }

        $notification = Notification::forCustomer($customer->id)
            ->where('id', $notificationId)
            ->first();

        if (! $notification) {
            return back()->with('error', 'Notification not found.');
        }

        $notification->markAsRead();

        return back()->with('success', 'Notification marked as read.');
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return back()->with('error', 'Customer profile not found.');
        }

        $unreadNotifications = Notification::forCustomer($customer->id)
            ->unread()
            ->get();

        foreach ($unreadNotifications as $notification) {
            $notification->markAsRead();
        }

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Archive notification
     */
    public function archive(Request $request, $notificationId)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return back()->with('error', 'Customer profile not found.');
        }

        $notification = Notification::forCustomer($customer->id)
            ->where('id', $notificationId)
            ->first();

        if (! $notification) {
            return back()->with('error', 'Notification not found.');
        }

        $notification->markAsArchived();

        return back()->with('success', 'Notification archived successfully.');
    }

    /**
     * Delete notification
     */
    public function delete(Request $request, $notificationId)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return back()->with('error', 'Customer profile not found.');
        }

        $notification = Notification::forCustomer($customer->id)
            ->where('id', $notificationId)
            ->first();

        if (! $notification) {
            return back()->with('error', 'Notification not found.');
        }

        $notification->delete();

        return back()->with('success', 'Notification deleted successfully.');
    }

    /**
     * Get notification statistics
     */
    public function getStats()
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (! $customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        $stats = Notification::getActiveStatsForCustomer($customer->id);

        return response()->json($stats);
    }

    /**
     * Test notification sending
     */
    public function testNotification(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'type' => 'required|in:email,sms,push',
            'message' => 'required|string|max:255',
        ]);

        // Implementation for sending test notification
        // This would use your notification service

        return back()->with('success', 'Test notification sent successfully.');
    }
}
