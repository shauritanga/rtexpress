<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\NotificationTemplate;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $customers = Customer::all();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Please seed users first.');

            return;
        }

        // Create notification templates
        $templates = [
            [
                'template_code' => 'shipment_created_email',
                'name' => 'Shipment Created - Email',
                'description' => 'Email notification when a new shipment is created',
                'type' => 'shipment_update',
                'channel' => 'email',
                'subject' => 'Shipment {{tracking_number}} Created Successfully',
                'content' => '
                    <h2>Shipment Created</h2>
                    <p>Dear {{customer_name}},</p>
                    <p>Your shipment has been created successfully with the following details:</p>
                    <ul>
                        <li><strong>Tracking Number:</strong> {{tracking_number}}</li>
                        <li><strong>Status:</strong> {{shipment_status}}</li>
                        <li><strong>Estimated Delivery:</strong> {{delivery_date}}</li>
                        <li><strong>Origin:</strong> {{origin_address}}</li>
                        <li><strong>Destination:</strong> {{destination_address}}</li>
                    </ul>
                    <p>You can track your shipment at any time using the tracking number above.</p>
                    <p>Thank you for choosing {{company_name}}!</p>
                    <p>Best regards,<br>{{company_name}} Team</p>
                ',
                'variables' => [
                    'customer_name', 'tracking_number', 'shipment_status',
                    'delivery_date', 'origin_address', 'destination_address', 'company_name',
                ],
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'template_code' => 'shipment_delivered_sms',
                'name' => 'Shipment Delivered - SMS',
                'description' => 'SMS notification when shipment is delivered',
                'type' => 'shipment_update',
                'channel' => 'sms',
                'subject' => null,
                'content' => 'Good news! Your shipment {{tracking_number}} has been delivered successfully. Thank you for choosing {{company_name}}!',
                'variables' => ['tracking_number', 'company_name'],
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'template_code' => 'payment_received_email',
                'name' => 'Payment Received - Email',
                'description' => 'Email notification when payment is received',
                'type' => 'payment_received',
                'channel' => 'email',
                'subject' => 'Payment Received - Invoice {{invoice_number}}',
                'content' => '
                    <h2>Payment Confirmation</h2>
                    <p>Dear {{customer_name}},</p>
                    <p>We have successfully received your payment for invoice {{invoice_number}}.</p>
                    <ul>
                        <li><strong>Invoice Number:</strong> {{invoice_number}}</li>
                        <li><strong>Amount Paid:</strong> {{amount}}</li>
                        <li><strong>Payment Date:</strong> {{payment_date}}</li>
                        <li><strong>Payment Method:</strong> {{payment_method}}</li>
                    </ul>
                    <p>Thank you for your prompt payment!</p>
                    <p>Best regards,<br>{{company_name}} Billing Team</p>
                ',
                'variables' => [
                    'customer_name', 'invoice_number', 'amount',
                    'payment_date', 'payment_method', 'company_name',
                ],
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'template_code' => 'delivery_scheduled_email',
                'name' => 'Delivery Scheduled - Email',
                'description' => 'Email notification when delivery is scheduled',
                'type' => 'delivery_scheduled',
                'channel' => 'email',
                'subject' => 'Delivery Scheduled for {{delivery_date}} - {{tracking_number}}',
                'content' => '
                    <h2>Delivery Scheduled</h2>
                    <p>Dear {{customer_name}},</p>
                    <p>Your shipment {{tracking_number}} has been scheduled for delivery:</p>
                    <ul>
                        <li><strong>Delivery Date:</strong> {{delivery_date}}</li>
                        <li><strong>Time Window:</strong> {{delivery_time}}</li>
                        <li><strong>Delivery Address:</strong> {{delivery_address}}</li>
                        <li><strong>Driver Contact:</strong> {{driver_phone}}</li>
                    </ul>
                    <p>Please ensure someone is available to receive the shipment during the scheduled time.</p>
                    <p>Best regards,<br>{{company_name}} Delivery Team</p>
                ',
                'variables' => [
                    'customer_name', 'tracking_number', 'delivery_date',
                    'delivery_time', 'delivery_address', 'driver_phone', 'company_name',
                ],
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'template_code' => 'support_ticket_created_email',
                'name' => 'Support Ticket Created - Email',
                'description' => 'Email notification when support ticket is created',
                'type' => 'support_ticket_update',
                'channel' => 'email',
                'subject' => 'Support Ticket Created - {{ticket_number}}',
                'content' => '
                    <h2>Support Ticket Created</h2>
                    <p>Dear {{customer_name}},</p>
                    <p>Your support ticket has been created successfully:</p>
                    <ul>
                        <li><strong>Ticket Number:</strong> {{ticket_number}}</li>
                        <li><strong>Subject:</strong> {{ticket_subject}}</li>
                        <li><strong>Priority:</strong> {{ticket_priority}}</li>
                        <li><strong>Status:</strong> {{ticket_status}}</li>
                    </ul>
                    <p>Our support team will review your request and respond within {{response_time}}.</p>
                    <p>You can track your ticket status in your customer portal.</p>
                    <p>Best regards,<br>{{company_name}} Support Team</p>
                ',
                'variables' => [
                    'customer_name', 'ticket_number', 'ticket_subject',
                    'ticket_priority', 'ticket_status', 'response_time', 'company_name',
                ],
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'template_code' => 'system_maintenance_email',
                'name' => 'System Maintenance - Email',
                'description' => 'Email notification for system maintenance',
                'type' => 'system_maintenance',
                'channel' => 'email',
                'subject' => 'Scheduled System Maintenance - {{maintenance_date}}',
                'content' => '
                    <h2>Scheduled System Maintenance</h2>
                    <p>Dear {{customer_name}},</p>
                    <p>We will be performing scheduled system maintenance:</p>
                    <ul>
                        <li><strong>Maintenance Date:</strong> {{maintenance_date}}</li>
                        <li><strong>Start Time:</strong> {{start_time}}</li>
                        <li><strong>End Time:</strong> {{end_time}}</li>
                        <li><strong>Duration:</strong> {{duration}}</li>
                    </ul>
                    <p>During this time, our services may be temporarily unavailable.</p>
                    <p>We apologize for any inconvenience and appreciate your understanding.</p>
                    <p>Best regards,<br>{{company_name}} Technical Team</p>
                ',
                'variables' => [
                    'customer_name', 'maintenance_date', 'start_time',
                    'end_time', 'duration', 'company_name',
                ],
                'is_system' => true,
                'is_active' => true,
            ],
        ];

        foreach ($templates as $templateData) {
            NotificationTemplate::create([
                'template_code' => $templateData['template_code'],
                'name' => $templateData['name'],
                'description' => $templateData['description'],
                'type' => $templateData['type'],
                'channel' => $templateData['channel'],
                'subject' => $templateData['subject'],
                'content' => $templateData['content'],
                'variables' => $templateData['variables'],
                'is_system' => $templateData['is_system'],
                'is_active' => $templateData['is_active'],
                'created_by' => $users->first()->id,
                'updated_by' => $users->first()->id,
            ]);
        }

        // Create default notification preferences for users
        foreach ($users as $user) {
            NotificationPreference::createDefaults('user', $user->id);
        }

        // Create default notification preferences for customers
        foreach ($customers as $customer) {
            NotificationPreference::createDefaults('customer', $customer->id);
        }

        // Create sample notifications
        $shipments = Shipment::limit(5)->get();

        if ($shipments->isNotEmpty()) {
            $sampleNotifications = [
                [
                    'type' => 'shipment_update',
                    'channel' => 'email',
                    'recipient_type' => 'customer',
                    'recipient_id' => $customers->first()->id ?? 1,
                    'recipient_email' => $customers->first()->email ?? 'customer@example.com',
                    'title' => 'Shipment Created Successfully',
                    'message' => 'Your shipment '.$shipments->first()->tracking_number.' has been created and is being processed.',
                    'priority' => 'medium',
                    'status' => 'delivered',
                    'sent_at' => now()->subHours(2),
                    'delivered_at' => now()->subHours(1),
                    'related_type' => 'shipment',
                    'related_id' => $shipments->first()->id,
                ],
                [
                    'type' => 'shipment_update',
                    'channel' => 'sms',
                    'recipient_type' => 'customer',
                    'recipient_id' => $customers->skip(1)->first()->id ?? 1,
                    'recipient_phone' => '+1234567890',
                    'title' => 'Shipment Delivered',
                    'message' => 'Good news! Your shipment has been delivered successfully.',
                    'priority' => 'high',
                    'status' => 'delivered',
                    'sent_at' => now()->subMinutes(30),
                    'delivered_at' => now()->subMinutes(25),
                    'related_type' => 'shipment',
                    'related_id' => $shipments->skip(1)->first()->id ?? 1,
                ],
                [
                    'type' => 'payment_received',
                    'channel' => 'email',
                    'recipient_type' => 'customer',
                    'recipient_id' => $customers->first()->id ?? 1,
                    'recipient_email' => $customers->first()->email ?? 'customer@example.com',
                    'title' => 'Payment Received - Invoice INV-2024-001',
                    'message' => 'We have successfully received your payment for invoice INV-2024-001. Amount: $150.00',
                    'priority' => 'medium',
                    'status' => 'sent',
                    'sent_at' => now()->subMinutes(15),
                ],
                [
                    'type' => 'system_maintenance',
                    'channel' => 'email',
                    'recipient_type' => 'user',
                    'recipient_id' => $users->first()->id,
                    'recipient_email' => $users->first()->email,
                    'title' => 'Scheduled System Maintenance',
                    'message' => 'System maintenance is scheduled for tonight from 2:00 AM to 4:00 AM EST.',
                    'priority' => 'low',
                    'status' => 'pending',
                    'scheduled_at' => now()->addHours(6),
                ],
                [
                    'type' => 'delivery_scheduled',
                    'channel' => 'push',
                    'recipient_type' => 'customer',
                    'recipient_id' => $customers->skip(2)->first()->id ?? 1,
                    'title' => 'Delivery Scheduled for Tomorrow',
                    'message' => 'Your shipment is scheduled for delivery tomorrow between 9:00 AM - 5:00 PM.',
                    'priority' => 'high',
                    'status' => 'failed',
                    'sent_at' => now()->subHours(1),
                    'failed_at' => now()->subMinutes(45),
                    'failure_reason' => 'Push notification service unavailable',
                    'related_type' => 'shipment',
                    'related_id' => $shipments->skip(2)->first()->id ?? 1,
                ],
            ];

            foreach ($sampleNotifications as $notificationData) {
                Notification::create(array_merge($notificationData, [
                    'created_by' => $users->first()->id,
                ]));
            }
        }

        $this->command->info('Notification templates, preferences, and sample notifications seeded successfully!');
    }
}
