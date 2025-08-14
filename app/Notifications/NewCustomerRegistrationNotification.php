<?php

namespace App\Notifications;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCustomerRegistrationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Customer $customer,
        public User $user,
        public string $registrationType = 'email' // 'email' or 'google'
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $registrationMethod = $this->registrationType === 'google' ? 'Google OAuth' : 'Email Registration';

        return (new MailMessage)
            ->subject('New Customer Registration - Approval Required')
            ->greeting('Hello Admin,')
            ->line('A new customer has registered and is awaiting approval.')
            ->line('')
            ->line('**Customer Details:**')
            ->line("**Company:** {$this->customer->company_name}")
            ->line("**Customer Code:** {$this->customer->customer_code}")
            ->line("**Contact Person:** {$this->customer->contact_person}")
            ->line("**Email:** {$this->customer->email}")
            ->line("**Phone:** {$this->customer->phone}")
            ->line("**Registration Method:** {$registrationMethod}")
            ->line("**Status:** {$this->customer->status}")
            ->line('')
            ->action('Review Customer', url('/admin/customers/' . $this->customer->id))
            ->line('')
            ->line('Please review the customer details and approve or reject the registration.')
            ->line('The customer will be notified once you take action.')
            ->salutation('Best regards, RT Express System');
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'New Customer Registration',
            'message' => "New customer {$this->customer->company_name} has registered and is awaiting approval.",
            'customer_id' => $this->customer->id,
            'customer_code' => $this->customer->customer_code,
            'company_name' => $this->customer->company_name,
            'contact_person' => $this->customer->contact_person,
            'email' => $this->customer->email,
            'registration_type' => $this->registrationType,
            'status' => $this->customer->status,
            'action_url' => url('/admin/customers/' . $this->customer->id),
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
