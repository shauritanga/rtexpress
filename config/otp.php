<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OTP (Two-Factor Authentication) Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for the OTP (One-Time Password)
    | two-factor authentication system.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default OTP Status
    |--------------------------------------------------------------------------
    |
    | This option controls whether OTP is enabled by default for new users.
    | When set to true, all new user registrations will have OTP enabled.
    | Users can still disable OTP individually if needed.
    |
    */

    'enabled_by_default' => env('OTP_ENABLED_BY_DEFAULT', true),

    /*
    |--------------------------------------------------------------------------
    | OTP Code Length
    |--------------------------------------------------------------------------
    |
    | The length of the OTP code that will be generated and sent to users.
    | Default is 6 digits for better security and user experience.
    |
    */

    'code_length' => env('OTP_CODE_LENGTH', 6),

    /*
    |--------------------------------------------------------------------------
    | OTP Expiration Time
    |--------------------------------------------------------------------------
    |
    | The time in minutes after which an OTP code will expire.
    | Default is 5 minutes for security purposes.
    |
    */

    'expiration_minutes' => env('OTP_EXPIRATION_MINUTES', 5),

    /*
    |--------------------------------------------------------------------------
    | OTP Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Rate limiting configuration for OTP requests to prevent abuse.
    | 'cooldown_seconds' - Time between OTP requests for the same user
    | 'max_attempts' - Maximum failed attempts before temporary lockout
    |
    */

    'rate_limiting' => [
        'cooldown_seconds' => env('OTP_COOLDOWN_SECONDS', 60),
        'max_attempts' => env('OTP_MAX_ATTEMPTS', 5),
        'lockout_minutes' => env('OTP_LOCKOUT_MINUTES', 15),
    ],

    /*
    |--------------------------------------------------------------------------
    | SMS Provider Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the SMS service provider used to send OTP codes.
    | Currently using a mock service - replace with actual provider settings.
    |
    */

    'sms' => [
        'provider' => env('SMS_PROVIDER', 'mock'),
        'api_key' => env('SMS_API_KEY'),
        'api_secret' => env('SMS_API_SECRET'),
        'sender_id' => env('SMS_SENDER_ID', 'RT Express'),
        'base_url' => env('SMS_BASE_URL'),
    ],

    /*
    |--------------------------------------------------------------------------
    | OTP Message Template
    |--------------------------------------------------------------------------
    |
    | The message template used when sending OTP codes via SMS.
    | Use {code} placeholder for the actual OTP code.
    | Use {app_name} placeholder for the application name.
    |
    */

    'message_template' => env('OTP_MESSAGE_TEMPLATE', 'Your {app_name} verification code is: {code}. Valid for {minutes} minutes.'),

    /*
    |--------------------------------------------------------------------------
    | Require Phone Number
    |--------------------------------------------------------------------------
    |
    | Whether to require a phone number for OTP functionality.
    | When true, users without phone numbers cannot use OTP.
    | When false, OTP can be enabled but won't work until phone is added.
    |
    */

    'require_phone' => env('OTP_REQUIRE_PHONE', true),

    /*
    |--------------------------------------------------------------------------
    | Auto-cleanup Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for automatic cleanup of expired OTP records.
    | 'enabled' - Whether to enable automatic cleanup
    | 'schedule' - Cron expression for cleanup schedule
    |
    */

    'auto_cleanup' => [
        'enabled' => env('OTP_AUTO_CLEANUP', true),
        'schedule' => env('OTP_CLEANUP_SCHEDULE', '0 */6 * * *'), // Every 6 hours
    ],

];
