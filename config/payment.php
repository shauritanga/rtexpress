<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway
    |--------------------------------------------------------------------------
    |
    | This option controls the default payment gateway that will be used
    | when no specific gateway is specified.
    |
    */

    'default' => env('PAYMENT_DEFAULT_GATEWAY', 'stripe'),

    /*
    |--------------------------------------------------------------------------
    | Payment Gateways
    |--------------------------------------------------------------------------
    |
    | Here you may configure the payment gateways for your application.
    | Each gateway has its own configuration options.
    |
    */

    'gateways' => [
        'stripe' => [
            'enabled' => env('STRIPE_ENABLED', true),
            'public_key' => env('STRIPE_PUBLIC_KEY'),
            'secret_key' => env('STRIPE_SECRET_KEY'),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
            'currency' => env('STRIPE_CURRENCY', 'USD'),
            'mode' => env('STRIPE_MODE', 'sandbox'), // sandbox or live
        ],

        'paypal' => [
            'enabled' => env('PAYPAL_ENABLED', true),
            'client_id' => env('PAYPAL_CLIENT_ID'),
            'client_secret' => env('PAYPAL_CLIENT_SECRET'),
            'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
            'currency' => env('PAYPAL_CURRENCY', 'USD'),
            'mode' => env('PAYPAL_MODE', 'sandbox'), // sandbox or live
        ],

        'clickpesa' => [
            'enabled' => env('CLICKPESA_ENABLED', true),
            'api_key' => env('CLICKPESA_API_KEY'),
            'secret_key' => env('CLICKPESA_SECRET_KEY'),
            'merchant_id' => env('CLICKPESA_MERCHANT_ID'),
            'webhook_secret' => env('CLICKPESA_WEBHOOK_SECRET'),
            'currency' => env('CLICKPESA_CURRENCY', 'TZS'),
            'mode' => env('CLICKPESA_MODE', 'sandbox'), // sandbox or live
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Currency Settings
    |--------------------------------------------------------------------------
    |
    | Configure supported currencies and their display formats.
    |
    */

    'currencies' => [
        'USD' => [
            'name' => 'US Dollar',
            'symbol' => '$',
            'code' => 'USD',
            'decimal_places' => 2,
        ],
        'EUR' => [
            'name' => 'Euro',
            'symbol' => '€',
            'code' => 'EUR',
            'decimal_places' => 2,
        ],
        'GBP' => [
            'name' => 'British Pound',
            'symbol' => '£',
            'code' => 'GBP',
            'decimal_places' => 2,
        ],
        'TZS' => [
            'name' => 'Tanzanian Shilling',
            'symbol' => 'TSh',
            'code' => 'TZS',
            'decimal_places' => 0,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Methods
    |--------------------------------------------------------------------------
    |
    | Configure available payment methods and their settings.
    |
    */

    'methods' => [
        'card' => [
            'name' => 'Credit/Debit Card',
            'icon' => 'credit-card',
            'gateways' => ['stripe', 'paypal'],
        ],
        'paypal' => [
            'name' => 'PayPal',
            'icon' => 'paypal',
            'gateways' => ['paypal'],
        ],
        'mpesa' => [
            'name' => 'M-Pesa',
            'icon' => 'smartphone',
            'gateways' => ['clickpesa'],
        ],
        'tigopesa' => [
            'name' => 'Tigo Pesa',
            'icon' => 'smartphone',
            'gateways' => ['clickpesa'],
        ],
        'airtelmoney' => [
            'name' => 'Airtel Money',
            'icon' => 'smartphone',
            'gateways' => ['clickpesa'],
        ],
        'bank_transfer' => [
            'name' => 'Bank Transfer',
            'icon' => 'building-2',
            'gateways' => ['stripe', 'paypal', 'clickpesa'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Fee Settings
    |--------------------------------------------------------------------------
    |
    | Configure how payment fees are handled.
    |
    */

    'fees' => [
        'charge_customer' => env('PAYMENT_CHARGE_CUSTOMER_FEES', false),
        'include_in_total' => env('PAYMENT_INCLUDE_FEES_IN_TOTAL', true),
        'display_fees' => env('PAYMENT_DISPLAY_FEES', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Settings
    |--------------------------------------------------------------------------
    |
    | Configure webhook handling for payment gateways.
    |
    */

    'webhooks' => [
        'verify_signatures' => env('PAYMENT_VERIFY_WEBHOOK_SIGNATURES', true),
        'log_webhooks' => env('PAYMENT_LOG_WEBHOOKS', true),
        'retry_failed' => env('PAYMENT_RETRY_FAILED_WEBHOOKS', true),
        'max_retries' => env('PAYMENT_MAX_WEBHOOK_RETRIES', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    |
    | Configure security settings for payment processing.
    |
    */

    'security' => [
        'encrypt_sensitive_data' => env('PAYMENT_ENCRYPT_SENSITIVE_DATA', true),
        'log_payment_data' => env('PAYMENT_LOG_PAYMENT_DATA', false),
        'require_https' => env('PAYMENT_REQUIRE_HTTPS', true),
        'session_timeout' => env('PAYMENT_SESSION_TIMEOUT', 1800), // 30 minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    |
    | Configure payment notifications and alerts.
    |
    */

    'notifications' => [
        'send_payment_confirmations' => env('PAYMENT_SEND_CONFIRMATIONS', true),
        'send_failure_alerts' => env('PAYMENT_SEND_FAILURE_ALERTS', true),
        'admin_email' => env('PAYMENT_ADMIN_EMAIL', env('MAIL_FROM_ADDRESS')),
        'customer_notifications' => env('PAYMENT_CUSTOMER_NOTIFICATIONS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Testing Settings
    |--------------------------------------------------------------------------
    |
    | Configure settings for testing payment functionality.
    |
    */

    'testing' => [
        'simulate_payments' => env('PAYMENT_SIMULATE', false),
        'simulate_failures' => env('PAYMENT_SIMULATE_FAILURES', false),
        'failure_rate' => env('PAYMENT_FAILURE_RATE', 0.1), // 10% failure rate
        'processing_delay' => env('PAYMENT_PROCESSING_DELAY', 1), // seconds
    ],
];
