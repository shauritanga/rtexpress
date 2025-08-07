<?php

namespace App\Services;

use Exception;

class ClickPesaChecksumService
{
    protected ?string $checksumSecret = null;

    public function __construct()
    {
        $this->checksumSecret = config('payment.gateways.clickpesa.checksum_secret');
    }

    /**
     * Ensure checksum secret is configured.
     */
    protected function ensureConfigured(): void
    {
        if (empty($this->checksumSecret)) {
            throw new Exception('ClickPesa checksum secret not configured. Please set CLICKPESA_CHECKSUM_SECRET in your .env file.');
        }
    }

    /**
     * Generate checksum for payment request.
     * Based on ClickPesa documentation, uses HMAC-SHA256 with sorted payload values.
     */
    public function generatePaymentChecksum(array $paymentData): string
    {
        $this->ensureConfigured();

        // Required fields for checksum calculation
        $requiredFields = ['amount', 'currency', 'orderReference'];

        foreach ($requiredFields as $field) {
            if (!isset($paymentData[$field])) {
                throw new Exception("Missing required field for checksum: {$field}");
            }
        }

        // Sort payload by keys alphabetically (like JavaScript Object.keys().sort())
        ksort($paymentData);

        // Concatenate all values (like JavaScript Object.values().join(""))
        $payloadString = implode('', array_values($paymentData));

        // Generate HMAC-SHA256 (like crypto.createHmac("sha256", checksumKey))
        return hash_hmac('sha256', $payloadString, $this->checksumSecret);
    }

    /**
     * Generate checksum for webhook verification.
     */
    public function generateWebhookChecksum(array $webhookData): string
    {
        $this->ensureConfigured();

        // Sort webhook data by keys alphabetically
        ksort($webhookData);

        // Concatenate all values
        $payloadString = implode('', array_values($webhookData));

        // Generate HMAC-SHA256
        return hash_hmac('sha256', $payloadString, $this->checksumSecret);
    }

    /**
     * Verify webhook checksum.
     */
    public function verifyWebhookChecksum(array $webhookData, string $receivedChecksum): bool
    {
        $calculatedChecksum = $this->generateWebhookChecksum($webhookData);
        
        return hash_equals($calculatedChecksum, $receivedChecksum);
    }

    /**
     * Generate order reference for payment.
     * ClickPesa requires alphanumeric characters only (no dashes or special characters).
     */
    public function generateOrderReference(string $prefix = 'INV'): string
    {
        // Generate alphanumeric-only reference
        $timestamp = time();
        $randomString = strtoupper(substr(uniqid(), -6));

        // Remove any non-alphanumeric characters and ensure it's alphanumeric only
        $reference = $prefix . $timestamp . $randomString;
        return preg_replace('/[^A-Za-z0-9]/', '', $reference);
    }

    /**
     * Validate checksum format.
     */
    public function isValidChecksumFormat(string $checksum): bool
    {
        return preg_match('/^[a-f0-9]{64}$/i', $checksum) === 1;
    }
}
