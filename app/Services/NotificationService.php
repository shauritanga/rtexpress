<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\NotificationTemplate;
use App\Models\NotificationPreference;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send notification to recipient.
     */
    public function send(array $data): Notification
    {
        // Create notification record
        $notification = Notification::create([
            'type' => $data['type'],
            'channel' => $data['channel'],
            'recipient_type' => $data['recipient_type'],
            'recipient_id' => $data['recipient_id'],
            'recipient_email' => $data['recipient_email'] ?? null,
            'recipient_phone' => $data['recipient_phone'] ?? null,
            'title' => $data['title'],
            'message' => $data['message'],
            'data' => $data['data'] ?? null,
            'template' => $data['template'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'related_type' => $data['related_type'] ?? null,
            'related_id' => $data['related_id'] ?? null,
            'created_by' => $data['created_by'] ?? auth()->id(),
        ]);

        // Send immediately if not scheduled
        if (!$notification->isScheduled()) {
            $this->sendNotification($notification);
        }

        return $notification;
    }

    /**
     * Send notification using template.
     */
    public function sendFromTemplate(string $templateCode, array $data): ?Notification
    {
        $template = NotificationTemplate::where('template_code', $templateCode)
            ->where('is_active', true)
            ->first();

        if (!$template) {
            Log::warning("Notification template not found: {$templateCode}");
            return null;
        }

        // Validate required variables
        $missing = $template->validateVariables($data['variables'] ?? []);
        if (!empty($missing)) {
            Log::warning("Missing template variables: " . implode(', ', $missing));
            return null;
        }

        // Render template
        $rendered = $template->render($data['variables'] ?? []);

        // Prepare notification data
        $notificationData = array_merge($data, [
            'type' => $template->type,
            'channel' => $template->channel,
            'title' => $rendered['subject'] ?? $data['title'],
            'message' => $rendered['content'],
            'template' => $templateCode,
        ]);

        return $this->send($notificationData);
    }

    /**
     * Send bulk notifications.
     */
    public function sendBulk(array $notifications): array
    {
        $results = [];

        foreach ($notifications as $notificationData) {
            try {
                $results[] = $this->send($notificationData);
            } catch (\Exception $e) {
                Log::error("Failed to send bulk notification: " . $e->getMessage());
                $results[] = null;
            }
        }

        return $results;
    }

    /**
     * Send notification based on user preferences.
     */
    public function sendWithPreferences(string $type, array $data): array
    {
        $preferences = $this->getUserPreferences($data['recipient_type'], $data['recipient_id'], $type);
        $sent = [];

        foreach ($preferences as $channel => $enabled) {
            if ($enabled) {
                $channelData = array_merge($data, [
                    'type' => $type,
                    'channel' => $channel,
                ]);

                $sent[$channel] = $this->send($channelData);
            }
        }

        return $sent;
    }

    /**
     * Process pending notifications.
     */
    public function processPending(): int
    {
        $notifications = Notification::readyToSend()->limit(100)->get();
        $processed = 0;

        foreach ($notifications as $notification) {
            try {
                $this->sendNotification($notification);
                $processed++;
            } catch (\Exception $e) {
                $notification->markAsFailed($e->getMessage());
                Log::error("Failed to send notification {$notification->id}: " . $e->getMessage());
            }
        }

        return $processed;
    }

    /**
     * Send individual notification.
     */
    private function sendNotification(Notification $notification): void
    {
        switch ($notification->channel) {
            case 'email':
                $this->sendEmail($notification);
                break;
            case 'sms':
                $this->sendSMS($notification);
                break;
            case 'push':
                $this->sendPush($notification);
                break;
            case 'in_app':
                $this->sendInApp($notification);
                break;
            default:
                throw new \Exception("Unsupported notification channel: {$notification->channel}");
        }
    }

    /**
     * Send email notification.
     */
    private function sendEmail(Notification $notification): void
    {
        try {
            Mail::send([], [], function ($message) use ($notification) {
                $message->to($notification->recipient_email)
                        ->subject($notification->title)
                        ->html($notification->message);
            });

            $notification->markAsSent();
        } catch (\Exception $e) {
            $notification->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Send SMS notification.
     */
    private function sendSMS(Notification $notification): void
    {
        // This would integrate with SMS providers like Twilio
        // For now, we'll just mark as sent
        try {
            // TODO: Implement actual SMS sending
            Log::info("SMS sent to {$notification->recipient_phone}: {$notification->message}");
            $notification->markAsSent();
        } catch (\Exception $e) {
            $notification->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Send push notification.
     */
    private function sendPush(Notification $notification): void
    {
        // This would integrate with push notification services
        // For now, we'll just mark as sent
        try {
            // TODO: Implement actual push notification sending
            Log::info("Push notification sent: {$notification->title}");
            $notification->markAsSent();
        } catch (\Exception $e) {
            $notification->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Send in-app notification.
     */
    private function sendInApp(Notification $notification): void
    {
        // In-app notifications are just stored in database
        $notification->markAsSent();
    }

    /**
     * Get user notification preferences.
     */
    private function getUserPreferences(string $userType, int $userId, string $notificationType): array
    {
        $preference = NotificationPreference::where('user_type', $userType)
            ->where('user_id', $userId)
            ->where('notification_type', $notificationType)
            ->first();

        if (!$preference) {
            // Return default preferences
            return [
                'email' => true,
                'sms' => false,
                'push' => true,
                'in_app' => true,
            ];
        }

        return [
            'email' => $preference->email_enabled,
            'sms' => $preference->sms_enabled,
            'push' => $preference->push_enabled,
            'in_app' => $preference->in_app_enabled,
        ];
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(int $notificationId): bool
    {
        $notification = Notification::find($notificationId);
        
        if ($notification) {
            $notification->markAsRead();
            return true;
        }

        return false;
    }

    /**
     * Get notification statistics.
     */
    public function getStatistics(array $filters = []): array
    {
        $query = Notification::query();

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $total = $query->count();
        $sent = $query->where('status', 'sent')->count();
        $delivered = $query->where('status', 'delivered')->count();
        $failed = $query->where('status', 'failed')->count();
        $pending = $query->where('status', 'pending')->count();

        return [
            'total' => $total,
            'sent' => $sent,
            'delivered' => $delivered,
            'failed' => $failed,
            'pending' => $pending,
            'delivery_rate' => $total > 0 ? round(($delivered / $total) * 100, 2) : 0,
            'failure_rate' => $total > 0 ? round(($failed / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Quick helper to send shipment update notification.
     */
    public function sendShipmentUpdate($shipment, string $status): array
    {
        $customer = $shipment->customer;

        $variables = [
            'customer_name' => $customer->name,
            'tracking_number' => $shipment->tracking_number,
            'shipment_status' => $status,
            'delivery_date' => $shipment->estimated_delivery_date?->format('M d, Y'),
            'origin_address' => $shipment->origin_address,
            'destination_address' => $shipment->destination_address,
            'company_name' => 'RT Express',
        ];

        return $this->sendWithPreferences('shipment_update', [
            'recipient_type' => 'customer',
            'recipient_id' => $customer->id,
            'recipient_email' => $customer->email,
            'recipient_phone' => $customer->phone,
            'variables' => $variables,
            'related_type' => 'shipment',
            'related_id' => $shipment->id,
        ]);
    }

    /**
     * Quick helper to send payment received notification.
     */
    public function sendPaymentReceived($payment): array
    {
        $customer = $payment->customer;
        $invoice = $payment->invoice;

        $variables = [
            'customer_name' => $customer->name,
            'invoice_number' => $invoice->invoice_number,
            'amount' => '$' . number_format($payment->amount, 2),
            'payment_date' => $payment->created_at->format('M d, Y'),
            'payment_method' => ucfirst($payment->payment_method),
            'company_name' => 'RT Express',
        ];

        return $this->sendWithPreferences('payment_received', [
            'recipient_type' => 'customer',
            'recipient_id' => $customer->id,
            'recipient_email' => $customer->email,
            'recipient_phone' => $customer->phone,
            'variables' => $variables,
            'related_type' => 'payment',
            'related_id' => $payment->id,
        ]);
    }

    /**
     * Quick helper to send support ticket notification.
     */
    public function sendSupportTicketUpdate($ticket): array
    {
        $customer = $ticket->customer;

        $variables = [
            'customer_name' => $customer->name,
            'ticket_number' => $ticket->ticket_number,
            'ticket_subject' => $ticket->subject,
            'ticket_priority' => ucfirst($ticket->priority),
            'ticket_status' => ucfirst($ticket->status),
            'response_time' => '24 hours',
            'company_name' => 'RT Express',
        ];

        return $this->sendWithPreferences('support_ticket_update', [
            'recipient_type' => 'customer',
            'recipient_id' => $customer->id,
            'recipient_email' => $customer->email,
            'recipient_phone' => $customer->phone,
            'variables' => $variables,
            'related_type' => 'support_ticket',
            'related_id' => $ticket->id,
        ]);
    }
}
