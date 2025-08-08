<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSuccessNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Get the notification's delivery channels.
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
        $invoice = $this->payment->invoice;
        $customer = $this->payment->customer;

        return (new MailMessage)
            ->subject('Payment Received - Invoice '.$invoice->invoice_number)
            ->greeting('Payment Notification')
            ->line('A payment has been successfully received.')
            ->line('**Payment Details:**')
            ->line('Invoice: '.$invoice->invoice_number)
            ->line('Customer: '.$customer->company_name)
            ->line('Amount: '.$this->formatCurrency($this->payment->amount, $this->payment->currency))
            ->line('Payment Method: '.ucfirst($this->payment->payment_method))
            ->line('Transaction ID: '.$this->payment->transaction_id)
            ->line('Payment Date: '.$this->payment->paid_at->format('M d, Y H:i'))
            ->action('View Invoice', url('/admin/invoices/'.$invoice->id))
            ->line('The invoice has been marked as paid and the customer has been notified.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $invoice = $this->payment->invoice;
        $customer = $this->payment->customer;

        return [
            'type' => 'payment_success',
            'title' => 'Payment Received',
            'message' => "Payment of {$this->formatCurrency($this->payment->amount, $this->payment->currency)} received for invoice {$invoice->invoice_number}",
            'payment_id' => $this->payment->id,
            'invoice_id' => $invoice->id,
            'customer_id' => $customer->id,
            'customer_name' => $customer->company_name,
            'amount' => $this->payment->amount,
            'currency' => $this->payment->currency,
            'payment_method' => $this->payment->payment_method,
            'transaction_id' => $this->payment->transaction_id,
            'paid_at' => $this->payment->paid_at,
            'action_url' => '/admin/invoices/'.$invoice->id,
        ];
    }

    /**
     * Format currency amount
     */
    private function formatCurrency($amount, $currency = 'TZS')
    {
        return new \NumberFormatter('sw-TZ', \NumberFormatter::CURRENCY)->formatCurrency($amount, $currency);
    }
}
