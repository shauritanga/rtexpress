# ClickPesa Payment Integration

This document describes the complete ClickPesa payment integration for RT Express Cargo Management System.

## Overview

ClickPesa is a Tanzanian payment gateway that enables mobile money payments through M-Pesa, Tigo Pesa, Airtel Money, and Halo Pesa. This integration uses the official ClickPesa API v3 with JWT authentication and USSD-PUSH requests.

## Features

- **Mobile Money Payments**: Support for all major Tanzanian mobile money providers
- **Real-time Payment Processing**: USSD-PUSH requests for immediate payment authorization
- **Webhook Integration**: Automatic payment status updates
- **Secure Authentication**: JWT token-based API authentication
- **Checksum Verification**: SHA-256 checksums for request integrity
- **Comprehensive Logging**: Full audit trail of payment transactions

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# ClickPesa Payment Gateway Configuration
CLICKPESA_ENABLED=true
CLICKPESA_CLIENT_ID=your_client_id_here
CLICKPESA_API_KEY=your_api_key_here
CLICKPESA_CHECKSUM_SECRET=your_checksum_secret_here
CLICKPESA_WEBHOOK_SECRET=your_webhook_secret_here
CLICKPESA_CURRENCY=TZS
CLICKPESA_MODE=sandbox
```

### Getting ClickPesa Credentials

1. Register at [ClickPesa Merchant Portal](https://merchant.clickpesa.com/account-registration)
2. Create an Application to get your `CLIENT_ID` and `API_KEY`
3. Configure your `CHECKSUM_SECRET` for request signing
4. Set up webhook endpoints for payment notifications

## API Endpoints

### Payment Flow

1. **Preview Payment** - Validate payment details and get available methods
2. **Initiate Payment** - Send USSD-PUSH request to customer's phone
3. **Query Status** - Check payment status using order reference
4. **Webhook Handler** - Receive real-time payment updates

### Webhook URL

Configure this webhook URL in your ClickPesa merchant dashboard:
```
https://yourdomain.com/api/webhooks/clickpesa
```

## Usage Examples

### Processing a Payment

```php
use App\Services\PaymentGatewayService;

$paymentService = new PaymentGatewayService();

$paymentData = [
    'gateway' => 'clickpesa',
    'method' => 'mpesa',
    'amount' => 50000, // Amount in TZS
    'phone_number' => '255700000000',
    'reference' => 'INV-2024-001',
];

$result = $paymentService->processPayment($invoice, $paymentData);

if ($result['success']) {
    // Payment initiated successfully
    $orderReference = $result['gateway_response']['order_reference'];
    // Customer will receive USSD prompt on their phone
} else {
    // Handle payment failure
    $error = $result['error'];
}
```

### Creating Payment Intent

```php
use App\Services\Gateways\ClickPesaGateway;

$gateway = new ClickPesaGateway();

$paymentData = [
    'amount' => 25000,
    'currency' => 'TZS',
    'description' => 'Payment for Invoice INV-2024-001',
];

$result = $gateway->createPaymentIntent($paymentData);

if ($result['success']) {
    $availableMethods = $result['available_methods'];
    $orderReference = $result['order_reference'];
}
```

### Querying Payment Status

```php
$gateway = new ClickPesaGateway();
$result = $gateway->queryPaymentStatus($orderReference);

if ($result['success']) {
    $paymentStatus = $result['data']['status'];
    // Status can be: PROCESSING, SUCCESS, FAILED, CANCELLED
}
```

## Testing

### Test Command

Run the integration test command to verify your setup:

```bash
php artisan clickpesa:test --phone=255700000000 --amount=1000
```

This command will:
1. Verify configuration
2. Test authentication
3. Test checksum generation
4. Test payment preview

### Test Phone Numbers

For sandbox testing, use these test phone numbers:
- `255700000000` - Success scenario
- `255700000001` - Failure scenario
- `255700000002` - Timeout scenario

## Payment Status Flow

```
PENDING → PROCESSING → SUCCESS/FAILED/CANCELLED
```

- **PENDING**: Payment request created
- **PROCESSING**: USSD sent to customer's phone
- **SUCCESS**: Payment completed successfully
- **FAILED**: Payment failed or rejected
- **CANCELLED**: Payment cancelled by customer

## Webhook Handling

The webhook handler automatically:
1. Verifies webhook signature
2. Updates payment status in database
3. Updates invoice payment status
4. Logs all webhook events

### Webhook Payload Example

```json
{
    "id": "cp_1234567890",
    "status": "SUCCESS",
    "orderReference": "PAY-1640995200-ABC123",
    "collectedAmount": "50000",
    "collectedCurrency": "TZS",
    "channel": "MPESA",
    "createdAt": "2024-01-01T12:00:00Z",
    "clientId": "your_client_id"
}
```

## Error Handling

Common error scenarios and solutions:

### Authentication Errors
- **401 Unauthorized**: Check `CLICKPESA_CLIENT_ID` and `CLICKPESA_API_KEY`
- **Token Expired**: Tokens are cached for 50 minutes and auto-renewed

### Payment Errors
- **Invalid Phone Number**: Must be valid Tanzanian format (255XXXXXXXXX)
- **Insufficient Funds**: Customer needs to top up their mobile money account
- **Network Issues**: Retry mechanism built into the system

### Webhook Errors
- **Signature Verification Failed**: Check `CLICKPESA_WEBHOOK_SECRET`
- **Payment Not Found**: Webhook received for unknown payment

## Security

- All API requests use JWT authentication
- Request integrity verified with SHA-256 checksums
- Webhook signatures verified before processing
- Sensitive data encrypted in database
- Comprehensive audit logging

## Monitoring

Monitor your ClickPesa integration through:
- Laravel logs (`storage/logs/laravel.log`)
- Payment status dashboard
- ClickPesa merchant portal
- Webhook delivery logs

## Support

For technical support:
- ClickPesa Documentation: https://docs.clickpesa.com
- ClickPesa Support: aly@clickpesa.com
- Integration Issues: Check logs and test command output

## Troubleshooting

### Common Issues

1. **"ClickPesa gateway not configured"**
   - Ensure all environment variables are set
   - Run `php artisan config:clear`

2. **"Failed to generate ClickPesa auth token"**
   - Verify CLIENT_ID and API_KEY
   - Check network connectivity
   - Ensure sandbox/live mode is correct

3. **"Checksum validation failed"**
   - Verify CHECKSUM_SECRET
   - Check request data format

4. **"Payment preview failed"**
   - Test with valid phone number format
   - Ensure amount is within limits
   - Check API endpoint availability

Run the test command for detailed diagnostics:
```bash
php artisan clickpesa:test
```
