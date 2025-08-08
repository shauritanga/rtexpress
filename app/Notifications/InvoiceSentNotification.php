<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceSentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Invoice $invoice;

    /**
     * Create a new notification instance.
     */
    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

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
        $customer = $this->invoice->customer;
        $formattedAmount = $this->formatCurrency($this->invoice->total_amount, $this->invoice->currency);

        return (new MailMessage)
            ->subject('Invoice Due - '.$this->invoice->invoice_number)
            ->greeting('Hello '.$customer->contact_person.',')
            ->line('Your invoice is now due for payment.')
            ->line('**Invoice Details:**')
            ->line('Invoice Number: '.$this->invoice->invoice_number)
            ->line('Amount Due: '.$formattedAmount)
            ->line('Due Date: '.$this->invoice->due_date->format('M d, Y'))
            ->line('Days Until Due: '.now()->diffInDays($this->invoice->due_date, false))
            ->action('Pay Now', url('/customer/invoices/'.$this->invoice->id))
            ->line('Please make payment by the due date to avoid any late fees.')
            ->line('You can pay online using our secure payment portal.')
            ->line('If you have already made payment, please disregard this notice.')
            ->salutation('Best regards, RT Express Billing Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $customer = $this->invoice->customer;
        $formattedAmount = $this->formatCurrency($this->invoice->total_amount, $this->invoice->currency);
        $daysUntilDue = now()->diffInDays($this->invoice->due_date, false);

        return [
            'type' => 'invoice_sent',
            'title' => 'Invoice Payment Due',
            'message' => "Invoice {$this->invoice->invoice_number} for {$formattedAmount} is due in {$daysUntilDue} days",
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'customer_id' => $customer->id,
            'customer_name' => $customer->company_name,
            'amount' => $this->invoice->total_amount,
            'currency' => $this->invoice->currency,
            'due_date' => $this->invoice->due_date,
            'days_until_due' => $daysUntilDue,
            'action_url' => '/customer/invoices/'.$this->invoice->id,
            'icon' => 'Clock',
            'color' => 'orange',
        ];
    }

    /**
     * Format currency amount.
     */
    private function formatCurrency(float $amount, string $currency): string
    {
        if ($currency === 'TZS') {
            return 'TSh '.number_format($amount, 0);
        }

        return $currency.' '.number_format($amount, 2);
    }
}
