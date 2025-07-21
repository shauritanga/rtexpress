<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display the notification center
     */
    public function index()
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return redirect()->route('customer.dashboard')
                ->with('error', 'Customer profile not found.');
        }

        // Get notification summary
        $summary = $this->getNotificationSummary($customer);

        return Inertia::render('Customer/Notifications/Index', [
            'customer' => $customer,
            'summary' => $summary,
        ]);
    }

    /**
     * Get notification preferences
     */
    public function getPreferences()
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        // Get all preferences for this customer
        $preferences = NotificationPreference::where('user_type', 'customer')
            ->where('user_id', $customer->id)
            ->get()
            ->keyBy('notification_type');

        // Create default preferences if none exist
        if ($preferences->isEmpty()) {
            $defaultTypes = [
                'shipment_created', 'shipment_picked_up', 'shipment_in_transit',
                'shipment_delivered', 'shipment_exception', 'payment_due',
                'payment_received', 'account_security'
            ];

            foreach ($defaultTypes as $type) {
                NotificationPreference::create([
                    'user_type' => 'customer',
                    'user_id' => $customer->id,
                    'notification_type' => $type,
                    'email_enabled' => in_array($type, ['shipment_created', 'shipment_picked_up', 'shipment_delivered', 'shipment_exception', 'payment_due', 'payment_received', 'account_security']),
                    'sms_enabled' => false, // Default to false for all types
                    'push_enabled' => false, // Default to false for all types
                    'in_app_enabled' => true,
                ]);
            }

            // Reload preferences
            $preferences = NotificationPreference::where('user_type', 'customer')
                ->where('user_id', $customer->id)
                ->get()
                ->keyBy('notification_type');
        }

        // Format preferences for frontend
        $formattedPreferences = [
            'customer_id' => $customer->id,
            'email_enabled' => $preferences->where('email_enabled', true)->count() > 0,
            'sms_enabled' => $preferences->where('sms_enabled', true)->count() > 0,
            'push_enabled' => $preferences->where('push_enabled', true)->count() > 0,
            'in_app_enabled' => $preferences->where('in_app_enabled', true)->count() > 0,
            'email_address' => $user->email,
            'phone_number' => $customer->phone,
            'preferences' => $preferences->mapWithKeys(function ($pref) {
                return [$pref->notification_type => [
                    'email' => $pref->email_enabled,
                    'sms' => $pref->sms_enabled,
                    'push' => $pref->push_enabled,
                    'in_app' => $pref->in_app_enabled,
                ]];
            }),
            'quiet_hours' => [
                'enabled' => true,
                'start' => '22:00',
                'end' => '08:00',
                'timezone' => 'America/New_York',
            ],
            'language' => 'en',
            'frequency' => [
                'digest' => 'daily',
                'summary' => 'weekly',
            ],
        ];

        return response()->json([
            'success' => true,
            'preferences' => $formattedPreferences,
        ]);
    }

    /**
     * Update notification preferences
     */
    public function updatePreferences(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'email_enabled' => 'boolean',
            'sms_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'in_app_enabled' => 'boolean',
            'email_address' => 'nullable|email',
            'phone_number' => 'nullable|string',
            'preferences' => 'array',
            'quiet_hours' => 'array',
            'language' => 'string|in:en,es,fr,de,sw',
            'frequency' => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update individual notification type preferences
        if ($request->has('preferences')) {
            foreach ($request->preferences as $type => $channels) {
                NotificationPreference::updateOrCreate(
                    [
                        'user_type' => 'customer',
                        'user_id' => $customer->id,
                        'notification_type' => $type,
                    ],
                    [
                        'email_enabled' => $channels['email'] ?? false,
                        'sms_enabled' => $channels['sms'] ?? false,
                        'push_enabled' => $channels['push'] ?? false,
                        'in_app_enabled' => $channels['in_app'] ?? false,
                    ]
                );
            }
        }

        // Get updated preferences
        $updatedPreferences = NotificationPreference::where('user_type', 'customer')
            ->where('user_id', $customer->id)
            ->get()
            ->keyBy('notification_type');

        $formattedPreferences = [
            'customer_id' => $customer->id,
            'email_enabled' => $updatedPreferences->where('email_enabled', true)->count() > 0,
            'sms_enabled' => $updatedPreferences->where('sms_enabled', true)->count() > 0,
            'push_enabled' => $updatedPreferences->where('push_enabled', true)->count() > 0,
            'in_app_enabled' => $updatedPreferences->where('in_app_enabled', true)->count() > 0,
            'preferences' => $updatedPreferences->mapWithKeys(function ($pref) {
                return [$pref->notification_type => [
                    'email' => $pref->email_enabled,
                    'sms' => $pref->sms_enabled,
                    'push' => $pref->push_enabled,
                    'in_app' => $pref->in_app_enabled,
                ]];
            }),
        ];

        return response()->json([
            'success' => true,
            'preferences' => $formattedPreferences,
        ]);
    }

    /**
     * Get notification history
     */
    public function getHistory(Request $request)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        $query = Notification::where('recipient_type', 'customer')
            ->where('recipient_id', $customer->id);

        // Apply filters
        if ($request->has('type') && $request->type !== 'all') {
            // Map frontend types to database types
            $typeMapping = [
                'shipment' => ['shipment_update', 'delivery_confirmation', 'shipment_created', 'shipment_picked_up', 'shipment_in_transit', 'shipment_delivered', 'shipment_exception'],
                'payment' => ['payment_reminder', 'payment_confirmation', 'payment_due', 'payment_received'],
                'account' => ['account_security', 'account_update'],
                'marketing' => ['promotion', 'newsletter'],
                'system' => ['system_maintenance', 'system_update'],
            ];

            if (isset($typeMapping[$request->type])) {
                $query->whereIn('type', $typeMapping[$request->type]);
            } else {
                $query->where('type', $request->type);
            }
        }

        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'read') {
                $query->whereNotNull('read_at');
            } elseif ($request->status === 'unread') {
                $query->whereNull('read_at');
            } elseif ($request->status === 'archived') {
                // For now, we don't have archived field in the existing table
                $query->where('status', 'archived');
            }
        }

        if ($request->has('date_filter') && $request->date_filter !== 'all') {
            $date = now();
            switch ($request->date_filter) {
                case 'today':
                    $query->whereDate('created_at', $date->toDateString());
                    break;
                case 'week':
                    $query->where('created_at', '>=', $date->subWeek());
                    break;
                case 'month':
                    $query->where('created_at', '>=', $date->subMonth());
                    break;
            }
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhere('notification_id', 'like', "%{$search}%");
            });
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        // Get statistics
        $stats = $this->getNotificationStats($customer);

        // Format notifications for frontend
        $formattedNotifications = $notifications->items();
        foreach ($formattedNotifications as &$notification) {
            // Add mock fields that the frontend expects
            $notification->read = !empty($notification->read_at);
            $notification->archived = false;
            $notification->channels = [
                'email' => [
                    'sent' => !empty($notification->sent_at),
                    'delivered' => !empty($notification->delivered_at),
                    'opened' => !empty($notification->read_at),
                ],
            ];
            $notification->metadata = [];
        }

        return response()->json([
            'success' => true,
            'notifications' => $formattedNotifications,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        $notification = Notification::where('recipient_type', 'customer')
            ->where('recipient_id', $customer->id)
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'notification' => $notification,
        ]);
    }

    /**
     * Get notification summary for dashboard
     */
    private function getNotificationSummary(Customer $customer)
    {
        // Mock data for now - in real app would query actual notifications
        return [
            'total_notifications' => 247,
            'unread_count' => 12,
            'today_count' => 8,
            'failed_count' => 3,
            'channels' => [
                'email' => [
                    'enabled' => true,
                    'verified' => true,
                    'success_rate' => 98.5,
                ],
                'sms' => [
                    'enabled' => true,
                    'verified' => true,
                    'success_rate' => 97.2,
                ],
                'push' => [
                    'enabled' => false,
                    'verified' => false,
                    'success_rate' => 0,
                ],
                'in_app' => [
                    'enabled' => true,
                    'verified' => true,
                    'success_rate' => 100,
                ],
            ],
            'smart_rules' => [
                'total' => 5,
                'active' => 4,
                'triggered_today' => 2,
            ],
            'proactive_alerts' => [
                'active' => 3,
                'dismissed_today' => 1,
            ],
        ];
    }

    /**
     * Get notification statistics
     */
    private function getNotificationStats(Customer $customer)
    {
        // Mock data for now - in real app would query actual notifications
        return [
            'total' => 127,
            'unread' => 8,
            'delivered' => 119,
            'failed' => 3,
            'engagement' => [
                'email_open_rate' => 68.5,
                'email_click_rate' => 12.3,
                'sms_delivery_rate' => 98.2,
                'push_click_rate' => 24.7,
            ],
        ];
    }
}
