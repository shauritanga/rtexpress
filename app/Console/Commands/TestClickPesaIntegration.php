<?php

namespace App\Console\Commands;

use App\Services\ClickPesaAuthService;
use App\Services\ClickPesaChecksumService;
use App\Services\Gateways\ClickPesaGateway;
use Illuminate\Console\Command;
use Exception;

class TestClickPesaIntegration extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'clickpesa:test {--phone=255700000000} {--amount=1000}';

    /**
     * The console command description.
     */
    protected $description = 'Test ClickPesa integration with authentication and payment preview';

    protected ClickPesaAuthService $authService;
    protected ClickPesaChecksumService $checksumService;
    protected ClickPesaGateway $gateway;

    public function __construct()
    {
        parent::__construct();
        $this->authService = new ClickPesaAuthService();
        $this->checksumService = new ClickPesaChecksumService();
        $this->gateway = new ClickPesaGateway();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Testing ClickPesa Integration...');
        $this->newLine();

        // Step 1: Check configuration
        if (!$this->testConfiguration()) {
            return 1;
        }

        // Step 2: Test authentication
        if (!$this->testAuthentication()) {
            return 1;
        }

        // Step 3: Test checksum generation
        if (!$this->testChecksumGeneration()) {
            return 1;
        }

        // Step 4: Test payment preview
        if (!$this->testPaymentPreview()) {
            return 1;
        }

        $this->newLine();
        $this->info('✅ All ClickPesa integration tests passed!');
        $this->info('Your ClickPesa integration is ready to use.');
        
        return 0;
    }

    /**
     * Test ClickPesa configuration.
     */
    protected function testConfiguration(): bool
    {
        $this->info('1. Testing Configuration...');

        try {
            if (!$this->authService->isConfigured()) {
                $this->error('❌ ClickPesa not properly configured.');
                $this->error('Please ensure CLICKPESA_CLIENT_ID, CLICKPESA_API_KEY, and CLICKPESA_CHECKSUM_SECRET are set in your .env file.');
                return false;
            }

            $this->info('✅ Configuration is valid');
            return true;

        } catch (Exception $e) {
            $this->error('❌ Configuration test failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Test ClickPesa authentication.
     */
    protected function testAuthentication(): bool
    {
        $this->info('2. Testing Authentication...');

        try {
            $token = $this->authService->getAuthToken();
            
            if (empty($token)) {
                $this->error('❌ Failed to get authentication token');
                return false;
            }

            $this->info('✅ Authentication successful');
            $this->line('   Token: ' . substr($token, 0, 50) . '...');
            return true;

        } catch (Exception $e) {
            $this->error('❌ Authentication failed: ' . $e->getMessage());
            $this->error('Please check your CLICKPESA_CLIENT_ID and CLICKPESA_API_KEY');
            return false;
        }
    }

    /**
     * Test checksum generation.
     */
    protected function testChecksumGeneration(): bool
    {
        $this->info('3. Testing Checksum Generation...');

        try {
            $testData = [
                'amount' => $this->option('amount'),
                'currency' => 'TZS',
                'orderReference' => $this->checksumService->generateOrderReference('TEST'),
            ];

            $checksum = $this->checksumService->generatePaymentChecksum($testData);
            
            if (empty($checksum) || !$this->checksumService->isValidChecksumFormat($checksum)) {
                $this->error('❌ Invalid checksum generated');
                return false;
            }

            $this->info('✅ Checksum generation successful');
            $this->line('   Order Reference: ' . $testData['orderReference']);
            $this->line('   Checksum: ' . $checksum);
            return true;

        } catch (Exception $e) {
            $this->error('❌ Checksum generation failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Test payment preview.
     */
    protected function testPaymentPreview(): bool
    {
        $this->info('4. Testing Payment Preview...');

        try {
            $paymentData = [
                'amount' => (float) $this->option('amount'),
                'currency' => 'TZS',
                'description' => 'Test payment preview',
            ];

            $result = $this->gateway->createPaymentIntent($paymentData);
            
            if (!$result['success']) {
                $this->error('❌ Payment preview failed');
                return false;
            }

            $this->info('✅ Payment preview successful');
            $this->line('   Order Reference: ' . $result['order_reference']);
            $this->line('   Amount: ' . $result['amount'] . ' ' . $result['currency']);
            
            if (isset($result['available_methods']) && !empty($result['available_methods'])) {
                $this->line('   Available Methods:');
                foreach ($result['available_methods'] as $method) {
                    $this->line('     - ' . ($method['name'] ?? 'Unknown') . ' (' . ($method['status'] ?? 'Unknown') . ')');
                }
            }
            
            return true;

        } catch (Exception $e) {
            $this->error('❌ Payment preview failed: ' . $e->getMessage());
            
            // Provide helpful error messages
            if (str_contains($e->getMessage(), 'Unauthorized') || str_contains($e->getMessage(), '401')) {
                $this->error('This might be due to invalid API credentials. Please check your CLICKPESA_CLIENT_ID and CLICKPESA_API_KEY.');
            } elseif (str_contains($e->getMessage(), 'checksum')) {
                $this->error('This might be due to invalid CLICKPESA_CHECKSUM_SECRET.');
            }
            
            return false;
        }
    }
}
