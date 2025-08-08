<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClickPesaAuthService
{
    protected array $config;

    protected string $baseUrl;

    public function __construct()
    {
        $this->config = config('payment.gateways.clickpesa', []);
        $this->baseUrl = $this->config['api_url'] ?? 'https://api.clickpesa.com/third-parties';
    }

    /**
     * Get a valid JWT token for ClickPesa API calls.
     * Tokens are cached for 50 minutes (they expire after 1 hour).
     */
    public function getAuthToken(): string
    {
        $cacheKey = 'clickpesa_auth_token';

        // Try to get cached token
        $token = Cache::get($cacheKey);

        if ($token) {
            return $token;
        }

        // Generate new token
        $token = $this->generateAuthToken();

        // Cache token for 50 minutes (expires after 1 hour)
        Cache::put($cacheKey, $token, now()->addMinutes(50));

        return $token;
    }

    /**
     * Generate a new JWT token from ClickPesa API.
     */
    protected function generateAuthToken(): string
    {
        if (! $this->isConfigured()) {
            throw new Exception('ClickPesa not properly configured. Missing client_id or api_key.');
        }

        try {
            $response = Http::withHeaders([
                'client-id' => $this->config['client_id'],
                'api-key' => $this->config['api_key'],
            ])->post($this->baseUrl.'/generate-token');

            if (! $response->successful()) {
                Log::error('ClickPesa token generation failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                throw new Exception('Failed to generate ClickPesa auth token: '.$response->body());
            }

            $data = $response->json();

            if (! isset($data['success']) || ! $data['success'] || ! isset($data['token'])) {
                throw new Exception('Invalid response from ClickPesa token endpoint');
            }

            return $data['token'];

        } catch (Exception $e) {
            Log::error('ClickPesa authentication error', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Check if ClickPesa is properly configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->config['client_id']) &&
               ! empty($this->config['api_key']) &&
               ! empty($this->config['checksum_secret']);
    }

    /**
     * Clear cached auth token (useful for testing or when token becomes invalid).
     */
    public function clearAuthToken(): void
    {
        Cache::forget('clickpesa_auth_token');
    }

    /**
     * Get configuration value.
     */
    public function getConfig(string $key, $default = null)
    {
        return $this->config[$key] ?? $default;
    }
}
