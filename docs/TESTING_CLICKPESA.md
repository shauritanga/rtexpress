# Testing ClickPesa Integration

This document provides step-by-step instructions for testing the ClickPesa payment integration.

## Prerequisites

1. **Environment Setup**: Ensure your `.env` file has the ClickPesa credentials:
   ```env
   CLICKPESA_ENABLED=true
   CLICKPESA_CLIENT_ID=your_client_id_here
   CLICKPESA_API_KEY=your_api_key_here
   CLICKPESA_CHECKSUM_SECRET=your_checksum_secret_here
   CLICKPESA_MODE=sandbox
   ```

2. **Test Credentials**: Use sandbox credentials for testing
3. **Test Phone Numbers**: Use valid Tanzanian phone numbers for testing

## Step 1: Configuration Test

Run the integration test command:
```bash
php artisan clickpesa:test --phone=255700000000 --amount=1000
```

Expected output:
```
Testing ClickPesa Integration...

1. Testing Configuration...
✅ Configuration is valid

2. Testing Authentication...
✅ Authentication successful
   Token: Bearer eyJhbGciOi...

3. Testing Checksum Generation...
✅ Checksum generation successful
   Order Reference: TEST-1640995200-ABC123
   Checksum: a1b2c3d4e5f6...

4. Testing Payment Preview...
✅ Payment preview successful
   Order Reference: INT-1640995200-DEF456
   Amount: 1000.0 TZS
   Available Methods:
     - MPESA (AVAILABLE)
     - TIGOPESA (AVAILABLE)

✅ All ClickPesa integration tests passed!
Your ClickPesa integration is ready to use.
```

## Step 2: Frontend Payment Test

1. **Login as Customer**: Login to the customer portal
2. **Navigate to Invoices**: Go to `/customer/invoices`
3. **Select Unpaid Invoice**: Find an invoice with balance due > 0
4. **Click Pay Now**: Click the "Pay Now" button
5. **Select ClickPesa**: Choose "ClickPesa Mobile Money" option
6. **Enter Phone Number**: Enter a valid Tanzanian mobile number (e.g., `+255700000000`)
7. **Submit Payment**: Click the pay button

Expected behavior:
- Phone number field appears when ClickPesa is selected
- Form validates phone number format
- Success message: "Payment initiated successfully! Please check your phone for USSD prompt."

## Step 3: Backend API Test

Test the payment API directly:

```bash
curl -X POST http://localhost:8000/customer/invoices/pay \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your_csrf_token" \
  -d '{
    "invoice_id": 1,
    "payment_method": "clickpesa",
    "phone_number": "+255700000000",
    "amount": 50000
  }'
```

Expected response:
```json
{
  "success": true,
  "payment": {
    "id": 123,
    "status": "processing",
    "amount": 50000,
    "currency": "TZS"
  },
  "order_reference": "PAY-1640995200-ABC123",
  "message": "Payment initiated successfully. Please check your phone for USSD prompt."
}
```

## Step 4: Webhook Test

1. **Setup Webhook URL**: Configure in ClickPesa dashboard:
   ```
   https://yourdomain.com/api/webhooks/clickpesa
   ```

2. **Test Webhook**: Send a test webhook payload:
   ```bash
   curl -X POST http://localhost:8000/api/webhooks/clickpesa \
     -H "Content-Type: application/json" \
     -d '{
       "id": "cp_1234567890",
       "status": "SUCCESS",
       "orderReference": "PAY-1640995200-ABC123",
       "collectedAmount": "50000",
       "collectedCurrency": "TZS",
       "channel": "MPESA",
       "createdAt": "2024-01-01T12:00:00Z"
     }'
   ```

3. **Check Logs**: Verify webhook processing in logs:
   ```bash
   tail -f storage/logs/laravel.log | grep ClickPesa
   ```

## Step 5: End-to-End Test

1. **Create Test Invoice**: Create an invoice with balance due
2. **Initiate Payment**: Use the frontend to start payment
3. **Simulate USSD**: In sandbox, payments may auto-complete
4. **Verify Status**: Check that invoice status updates to "paid"
5. **Check Payment Record**: Verify payment record is created

## Test Scenarios

### Successful Payment Flow
1. Valid phone number format
2. Sufficient balance in mobile money account
3. Customer completes USSD prompt
4. Webhook received with SUCCESS status
5. Invoice marked as paid

### Failed Payment Scenarios
1. **Invalid Phone Number**: Test with invalid format
2. **Insufficient Funds**: Test with account having low balance
3. **User Cancellation**: Customer cancels USSD prompt
4. **Network Issues**: Simulate network timeouts

### Error Handling Tests
1. **Missing Phone Number**: Submit without phone number
2. **Invalid Amount**: Test with negative or zero amounts
3. **Unauthorized Access**: Test with wrong customer
4. **Duplicate Payment**: Test paying same invoice twice

## Monitoring and Debugging

### Log Files to Monitor
- `storage/logs/laravel.log` - General application logs
- ClickPesa API responses and errors
- Webhook processing logs
- Payment status changes

### Key Log Messages
- `ClickPesa authentication successful`
- `ClickPesa payment initiated`
- `ClickPesa webhook received`
- `Payment status updated`

### Common Issues and Solutions

1. **"ClickPesa gateway not configured"**
   - Check environment variables
   - Run `php artisan config:clear`

2. **"Authentication failed"**
   - Verify CLIENT_ID and API_KEY
   - Check sandbox vs live mode

3. **"Invalid phone number format"**
   - Use format: +255XXXXXXXXX or 0XXXXXXXXX
   - Ensure it's a valid Tanzanian number

4. **"Payment preview failed"**
   - Check API connectivity
   - Verify checksum calculation

## Production Checklist

Before going live:
- [ ] Update to live ClickPesa credentials
- [ ] Set `CLICKPESA_MODE=live`
- [ ] Configure production webhook URL
- [ ] Test with real mobile money accounts
- [ ] Monitor payment success rates
- [ ] Set up alerting for failed payments

## Support

For issues:
1. Check logs first
2. Run the test command
3. Verify configuration
4. Contact ClickPesa support if API issues persist
