<?php

namespace App\Notifications;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomerAccountCreated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Customer $customer,
        public User $user,
        public string $temporaryPassword
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to RT Express - Your Account Has Been Created')
            ->greeting('Welcome to RT Express!')
            ->line('Your customer account has been successfully created by our admin team.')
            ->line("**Company:** {$this->customer->company_name}")
            ->line("**Customer Code:** {$this->customer->customer_code}")
            ->line("**Contact Person:** {$this->customer->contact_person}")
            ->line('')
            ->line('**Your Login Credentials:**')
            ->line("**Email:** {$this->user->email}")
            ->line("**Temporary Password:** {$this->temporaryPassword}")
            ->line('')
            ->line('**Important Security Information:**')
            ->line('• Please change your password immediately after your first login')
            ->line('• Two-factor authentication (OTP) is enabled for your security')
            ->line('• You will receive an OTP code via email when logging in')
            ->line('')
            ->action('Login to Customer Portal', url('/login'))
            ->line('')
            ->line('**What you can do in the Customer Portal:**')
            ->line('• Create and manage shipments')
            ->line('• Track your packages in real-time')
            ->line('• View shipment history and analytics')
            ->line('• Manage your account settings')
            ->line('• Access support and documentation')
            ->line('')
            ->line('If you have any questions or need assistance, please contact our support team.')
            ->line('Thank you for choosing RT Express for your shipping needs!')
            ->salutation('Best regards, The RT Express Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'customer_id' => $this->customer->id,
            'customer_code' => $this->customer->customer_code,
            'company_name' => $this->customer->company_name,
            'user_id' => $this->user->id,
            'message' => 'Customer account created and credentials sent',
        ];
    }
}
