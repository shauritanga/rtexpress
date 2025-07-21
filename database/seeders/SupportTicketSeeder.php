<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SupportTicket;
use App\Models\TicketReply;
use App\Models\Customer;
use App\Models\User;

class SupportTicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        $users = User::all(); // Get all users since we don't have role column

        if ($customers->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No customers or admin users found. Please seed customers and users first.');
            return;
        }

        $tickets = [
            [
                'subject' => 'Package delivery delay inquiry',
                'description' => 'My package was supposed to arrive yesterday but I haven\'t received it yet. Can you please check the status?',
                'priority' => 'medium',
                'category' => 'shipping',
                'status' => 'open',
            ],
            [
                'subject' => 'Invoice payment issue',
                'description' => 'I\'m having trouble paying my invoice online. The payment gateway keeps showing an error.',
                'priority' => 'high',
                'category' => 'billing',
                'status' => 'in_progress',
            ],
            [
                'subject' => 'Damaged package received',
                'description' => 'The package I received today was damaged during shipping. The contents appear to be intact but the box was crushed.',
                'priority' => 'high',
                'category' => 'complaint',
                'status' => 'open',
            ],
            [
                'subject' => 'Request for pickup service',
                'description' => 'I need to schedule a pickup for multiple packages from my business location. What are the available time slots?',
                'priority' => 'medium',
                'category' => 'general',
                'status' => 'resolved',
            ],
            [
                'subject' => 'Website login problems',
                'description' => 'I can\'t log into my account on the website. I\'ve tried resetting my password but didn\'t receive the email.',
                'priority' => 'urgent',
                'category' => 'technical',
                'status' => 'open',
            ],
            [
                'subject' => 'Tracking number not working',
                'description' => 'The tracking number RT-2025-12345 is not showing any information when I try to track my package.',
                'priority' => 'medium',
                'category' => 'technical',
                'status' => 'waiting_customer',
            ],
            [
                'subject' => 'Request for express delivery option',
                'description' => 'I would like to request an express delivery option for urgent shipments. Is this service available?',
                'priority' => 'low',
                'category' => 'feature_request',
                'status' => 'closed',
            ],
            [
                'subject' => 'Customs clearance delay',
                'description' => 'My international shipment has been stuck in customs for over a week. Can you help expedite the process?',
                'priority' => 'high',
                'category' => 'shipping',
                'status' => 'in_progress',
            ],
        ];

        foreach ($tickets as $ticketData) {
            $customer = $customers->random();
            $assignedUser = $users->random();

            $ticket = SupportTicket::create([
                'customer_id' => $customer->id,
                'assigned_to' => in_array($ticketData['status'], ['in_progress', 'waiting_customer', 'resolved', 'closed']) ? $assignedUser->id : null,
                'created_by' => $users->first()->id,
                'subject' => $ticketData['subject'],
                'description' => $ticketData['description'],
                'priority' => $ticketData['priority'],
                'category' => $ticketData['category'],
                'status' => $ticketData['status'],
                'source' => 'web',
                'created_at' => now()->subDays(rand(0, 30)),
            ]);

            // Add some replies for tickets that are not just opened
            if (in_array($ticket->status, ['in_progress', 'waiting_customer', 'resolved', 'closed'])) {
                // Customer's initial message (already in description, but add as reply for consistency)
                TicketReply::create([
                    'ticket_id' => $ticket->id,
                    'customer_id' => $customer->id,
                    'message' => $ticketData['description'],
                    'type' => 'reply',
                    'is_internal' => false,
                    'created_at' => $ticket->created_at,
                ]);

                // Agent response
                $agentResponses = [
                    'Thank you for contacting us. I\'m looking into this issue and will get back to you shortly.',
                    'I\'ve reviewed your case and I\'m working on a solution. I\'ll update you within 24 hours.',
                    'I understand your concern. Let me check with our logistics team and provide you with an update.',
                    'I\'ve escalated this to our specialized team. You should receive a resolution soon.',
                    'Thank you for your patience. I\'ve found the issue and here\'s what we\'re doing to resolve it.',
                ];

                TicketReply::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $assignedUser->id,
                    'message' => $agentResponses[array_rand($agentResponses)],
                    'type' => 'reply',
                    'is_internal' => false,
                    'created_at' => $ticket->created_at->addHours(rand(1, 8)),
                ]);

                // Mark as resolved/closed if needed
                if ($ticket->status === 'resolved') {
                    $ticket->update([
                        'resolved_at' => $ticket->created_at->addDays(rand(1, 5)),
                        'first_response_at' => $ticket->created_at->addHours(rand(1, 8)),
                    ]);
                } elseif ($ticket->status === 'closed') {
                    $ticket->update([
                        'resolved_at' => $ticket->created_at->addDays(rand(1, 5)),
                        'closed_at' => $ticket->created_at->addDays(rand(6, 10)),
                        'first_response_at' => $ticket->created_at->addHours(rand(1, 8)),
                        'satisfaction_rating' => rand(4, 5),
                        'satisfaction_feedback' => 'Great service, thank you for the quick resolution!',
                    ]);
                } else {
                    $ticket->update([
                        'first_response_at' => $ticket->created_at->addHours(rand(1, 8)),
                    ]);
                }
            }
        }

        $this->command->info('Support tickets seeded successfully!');
    }
}
