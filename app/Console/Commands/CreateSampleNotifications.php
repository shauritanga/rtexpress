<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\Notification;
use App\Models\Shipment;
use Illuminate\Console\Command;

class CreateSampleNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:create-samples {--customer-id= : Specific customer ID to create notifications for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create sample notifications for testing the notification center';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $customerId = $this->option('customer-id');

        if ($customerId) {
            $customer = Customer::find($customerId);
            if (! $customer) {
                $this->error("Customer with ID {$customerId} not found.");

                return 1;
            }
            $customers = collect([$customer]);
        } else {
            $customers = Customer::limit(5)->get();
        }

        if ($customers->isEmpty()) {
            $this->error('No customers found. Please create customers first.');

            return 1;
        }

        $this->info('Creating sample notifications...');

        foreach ($customers as $customer) {
            $this->createNotificationsForCustomer($customer);
        }

        $this->info('Sample notifications created successfully!');

        return 0;
    }

    private function createNotificationsForCustomer(Customer $customer)
    {
        $this->info("Creating notifications for customer: {$customer->company_name}");

        // Get some shipments for this customer if available
        $shipments = Shipment::where('customer_id', $customer->id)->limit(3)->get();

        $notificationTypes = [
            [
                'type' => 'shipment_created',
                'title' => 'New Shipment Created',
                'message' => 'Your shipment has been created and is being processed.',
                'priority' => 'medium',
                'channel' => 'email',
            ],
            [
                'type' => 'shipment_picked_up',
                'title' => 'Shipment Picked Up',
                'message' => 'Your shipment has been picked up and is on its way.',
                'priority' => 'medium',
                'channel' => 'sms',
            ],
            [
                'type' => 'shipment_in_transit',
                'title' => 'Shipment In Transit',
                'message' => 'Your shipment is currently in transit to the destination.',
                'priority' => 'low',
                'channel' => 'in_app',
            ],
            [
                'type' => 'shipment_delivered',
                'title' => 'Shipment Delivered',
                'message' => 'Your shipment has been successfully delivered.',
                'priority' => 'high',
                'channel' => 'email',
            ],
            [
                'type' => 'shipment_exception',
                'title' => 'Delivery Exception',
                'message' => 'There was an issue with your shipment delivery. Please contact support.',
                'priority' => 'urgent',
                'channel' => 'sms',
            ],
            [
                'type' => 'payment_received',
                'title' => 'Payment Received',
                'message' => 'We have received your payment. Thank you!',
                'priority' => 'medium',
                'channel' => 'email',
            ],
        ];

        foreach ($notificationTypes as $index => $notificationType) {
            $shipment = $shipments->get($index % $shipments->count());

            $notification = Notification::create([
                'type' => $notificationType['type'],
                'channel' => $notificationType['channel'],
                'recipient_type' => 'customer',
                'recipient_id' => $customer->id,
                'recipient_email' => $customer->email,
                'recipient_phone' => $customer->phone,
                'title' => $notificationType['title'],
                'message' => $notificationType['message'],
                'priority' => $notificationType['priority'],
                'status' => $this->getRandomStatus(),
                'related_type' => $shipment ? 'shipment' : null,
                'related_id' => $shipment ? $shipment->id : null,
                'data' => [
                    'tracking_number' => $shipment ? $shipment->tracking_number : null,
                    'customer_name' => $customer->company_name,
                ],
                'sent_at' => now()->subDays(rand(0, 7)),
                'delivered_at' => rand(0, 1) ? now()->subDays(rand(0, 6)) : null,
                'read_at' => rand(0, 1) ? now()->subDays(rand(0, 5)) : null,
                'created_at' => now()->subDays(rand(0, 10)),
            ]);

            $this->line("  - Created {$notificationType['type']} notification (ID: {$notification->id})");
        }
    }

    private function getRandomStatus(): string
    {
        $statuses = ['pending', 'sent', 'delivered', 'failed', 'read'];
        $weights = [10, 20, 40, 5, 25]; // Weighted distribution

        $random = rand(1, 100);
        $cumulative = 0;

        foreach ($statuses as $index => $status) {
            $cumulative += $weights[$index];
            if ($random <= $cumulative) {
                return $status;
            }
        }

        return 'delivered';
    }
}
