<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpCodeNotification extends Notification // Removed ShouldQueue for immediate sending
{
    use Queueable;

    public string $otpCode;
    public string $type;
    public int $expirationMinutes;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $otpCode, string $type = 'login', int $expirationMinutes = 5)
    {
        $this->otpCode = $otpCode;
        $this->type = $type;
        $this->expirationMinutes = $expirationMinutes;
    }

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
        $subject = $this->getSubject();
        $greeting = $this->getGreeting($notifiable);

        return (new MailMessage)
            ->subject($subject)
            ->greeting($greeting)
            ->line('You are receiving this email because we received a request for a verification code for your account.')
            ->line("Your verification code is: **{$this->otpCode}**")
            ->line("This code will expire in {$this->expirationMinutes} minutes.")
            ->line('If you did not request this code, please ignore this email or contact support if you have concerns.')
            ->line('For security reasons, please do not share this code with anyone.')
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
            'otp_code' => $this->otpCode,
            'type' => $this->type,
            'expires_in_minutes' => $this->expirationMinutes,
        ];
    }

    /**
     * Get the subject line for the notification.
     */
    private function getSubject(): string
    {
        return match ($this->type) {
            'login' => 'RT Express - Login Verification Code',
            'password_reset' => 'RT Express - Password Reset Code',
            'phone_verification' => 'RT Express - Phone Verification Code',
            default => 'RT Express - Verification Code',
        };
    }

    /**
     * Get the greeting for the notification.
     */
    private function getGreeting(object $notifiable): string
    {
        $name = $notifiable->name ?? 'User';

        return match ($this->type) {
            'login' => "Hello {$name}!",
            'password_reset' => "Hello {$name}!",
            'phone_verification' => "Hello {$name}!",
            default => "Hello {$name}!",
        };
    }
}
