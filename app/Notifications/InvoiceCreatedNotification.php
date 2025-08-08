<?php

namespace App\Notifications;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceCreatedNotification extends Notification implements ShouldQueue
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
            ->subject('New Invoice - '.$this->invoice->invoice_number)
            ->greeting('Hello '.$customer->contact_person.',')
            ->line('A new invoice has been created for your account.')
            ->line('**Invoice Details:**')
            ->line('Invoice Number: '.$this->invoice->invoice_number)
            ->line('Amount: '.$formattedAmount)
            ->line('Due Date: '.$this->invoice->due_date->format('M d, Y'))
            ->line('Payment Terms: '.($this->invoice->payment_terms ?: 'Net 30 days'))
            ->action('View Invoice', url('/customer/invoices/'.$this->invoice->id))
            ->line('Please review the invoice and make payment by the due date.')
            ->line('If you have any questions, please contact our billing department.')
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

        return [
            'type' => 'invoice_created',
            'title' => 'New Invoice Created',
            'message' => "Invoice {$this->invoice->invoice_number} for {$formattedAmount} has been created",
            'invoice_id' => $this->invoice->id,
            'invoice_number' => $this->invoice->invoice_number,
            'customer_id' => $customer->id,
            'customer_name' => $customer->company_name,
            'amount' => $this->invoice->total_amount,
            'currency' => $this->invoice->currency,
            'due_date' => $this->invoice->due_date,
            'action_url' => '/customer/invoices/'.$this->invoice->id,
            'icon' => 'FileText',
            'color' => 'blue',
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
