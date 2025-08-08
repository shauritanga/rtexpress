<?php

namespace App\Services\Gateways;

use App\Models\Payment;

interface PaymentGatewayInterface
{
    /**
     * Process a payment.
     */
    public function processPayment(Payment $payment, array $paymentData): array;

    /**
     * Create payment intent for online payments.
     */
    public function createPaymentIntent(array $paymentData): array;

    /**
     * Handle webhook from payment gateway.
     */
    public function handleWebhook(array $payload): array;

    /**
     * Process refund for a payment.
     */
    public function processRefund(Payment $payment, float $amount, ?string $reason = null): array;

    /**
     * Get available payment methods.
     */
    public function getPaymentMethods(): array;

    /**
     * Check if gateway is properly configured.
     */
    public function isConfigured(): bool;

    /**
     * Calculate fees for amount.
     */
    public function calculateFees(float $amount, string $currency = 'USD'): array;

    /**
     * Get gateway name.
     */
    public function getName(): string;

    /**
     * Get gateway display name.
     */
    public function getDisplayName(): string;

    /**
     * Get supported currencies.
     */
    public function getSupportedCurrencies(): array;

    /**
     * Validate payment data.
     */
    public function validatePaymentData(array $paymentData): array;
}
