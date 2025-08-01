<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationTemplate;
use App\Models\NotificationPreference;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Display notification center dashboard.
     */
    public function index(Request $request)
    {
        $query = Notification::with(['createdBy'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhere('notification_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        $notifications = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = $this->notificationService->getStatistics([
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
        ]);

        // Additional stats
        $stats['pending_notifications'] = Notification::pending()->count();
        $stats['high_priority_pending'] = Notification::pending()->highPriority()->count();
        $stats['failed_today'] = Notification::failed()
            ->whereDate('created_at', today())
            ->count();

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'channel', 'type', 'priority', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show notification details.
     */
    public function show(Notification $notification)
    {
        $notification->load(['createdBy', 'logs']);

        return Inertia::render('Admin/Notifications/Show', [
            'notification' => $notification,
        ]);
    }

    /**
     * Create new notification.
     */
    public function create(Request $request)
    {
        $templates = NotificationTemplate::active()
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Notifications/Create', [
            'templates' => $templates,
        ]);
    }

    /**
     * Store new notification.
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'channel' => 'required|in:email,sms,push,in_app',
            'recipient_type' => 'required|in:user,customer',
            'recipient_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'scheduled_at' => 'nullable|date|after:now',
            'template' => 'nullable|string',
        ]);

        try {
            $notification = $this->notificationService->send([
                'type' => $request->type,
                'channel' => $request->channel,
                'recipient_type' => $request->recipient_type,
                'recipient_id' => $request->recipient_id,
                'recipient_email' => $request->recipient_email,
                'recipient_phone' => $request->recipient_phone,
                'title' => $request->title,
                'message' => $request->message,
                'priority' => $request->priority,
                'scheduled_at' => $request->scheduled_at,
                'template' => $request->template,
                'data' => $request->data,
                'created_by' => auth()->id(),
            ]);

            return redirect()
                ->route('admin.notifications.show', $notification)
                ->with('success', 'Notification created successfully');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to create notification: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Send notification from template.
     */
    public function sendFromTemplate(Request $request)
    {
        $request->validate([
            'template_code' => 'required|string',
            'recipient_type' => 'required|in:user,customer',
            'recipient_id' => 'required|integer',
            'variables' => 'required|array',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        try {
            $notification = $this->notificationService->sendFromTemplate(
                $request->template_code,
                [
                    'recipient_type' => $request->recipient_type,
                    'recipient_id' => $request->recipient_id,
                    'recipient_email' => $request->recipient_email,
                    'recipient_phone' => $request->recipient_phone,
                    'variables' => $request->variables,
                    'scheduled_at' => $request->scheduled_at,
                    'created_by' => auth()->id(),
                ]
            );

            if ($notification) {
                return redirect()
                    ->route('admin.notifications.show', $notification)
                    ->with('success', 'Notification sent successfully');
            } else {
                return redirect()
                    ->back()
                    ->withErrors(['error' => 'Failed to send notification from template'])
                    ->withInput();
            }

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to send notification: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Resend failed notification.
     */
    public function resend(Notification $notification)
    {
        if ($notification->status !== 'failed') {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Only failed notifications can be resent']);
        }

        try {
            // Reset notification status
            $notification->update([
                'status' => 'pending',
                'failed_at' => null,
                'failure_reason' => null,
            ]);

            // Process the notification
            $this->notificationService->processPending();

            return redirect()
                ->route('admin.notifications.show', $notification)
                ->with('success', 'Notification queued for resending');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to resend notification: ' . $e->getMessage()]);
        }
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Process pending notifications.
     */
    public function processPending()
    {
        try {
            $processed = $this->notificationService->processPending();

            return response()->json([
                'success' => true,
                'processed' => $processed,
                'message' => "Processed {$processed} pending notifications",
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process notifications: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get notification analytics.
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', 30);
        $startDate = now()->subDays($period);

        $analytics = [
            'overview' => $this->notificationService->getStatistics([
                'date_from' => $startDate,
                'date_to' => now(),
            ]),
            'channelBreakdown' => $this->getChannelBreakdown($startDate),
            'typeBreakdown' => $this->getTypeBreakdown($startDate),
            'dailyTrends' => $this->getDailyTrends($startDate),
            'failureReasons' => $this->getFailureReasons($startDate),
        ];

        return response()->json($analytics);
    }

    /**
     * Get channel breakdown.
     */
    private function getChannelBreakdown($startDate): array
    {
        return Notification::where('created_at', '>=', $startDate)
            ->select('channel', DB::raw('count(*) as count'))
            ->groupBy('channel')
            ->pluck('count', 'channel')
            ->toArray();
    }

    /**
     * Get type breakdown.
     */
    private function getTypeBreakdown($startDate): array
    {
        return Notification::where('created_at', '>=', $startDate)
            ->select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();
    }

    /**
     * Get daily trends.
     */
    private function getDailyTrends($startDate): array
    {
        return Notification::where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total'),
                DB::raw('sum(case when status = "sent" then 1 else 0 end) as sent'),
                DB::raw('sum(case when status = "failed" then 1 else 0 end) as failed')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get failure reasons.
     */
    private function getFailureReasons($startDate): array
    {
        return Notification::where('created_at', '>=', $startDate)
            ->where('status', 'failed')
            ->whereNotNull('failure_reason')
            ->select('failure_reason', DB::raw('count(*) as count'))
            ->groupBy('failure_reason')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->pluck('count', 'failure_reason')
            ->toArray();
    }
}
