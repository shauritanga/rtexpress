<?php

use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

uses(RefreshDatabase::class);

describe('CSP IPv6 Localhost Support', function () {
    test('CSP allows IPv6 localhost in development environment', function () {
        // Create middleware instance
        $middleware = new SecurityHeaders;

        // Create mock request and response
        $request = new Request;
        $response = new Response;

        // Temporarily set environment to local
        $originalEnv = app()->environment();
        app()->instance('env', 'local');

        // Apply middleware
        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $csp = $result->headers->get('Content-Security-Policy');

        // Check that CSP includes broad HTTP support for development
        expect($csp)->toContain('http:');
        expect($csp)->toContain('ws:');
        expect($csp)->toContain("'unsafe-eval'");

        // Check for script-src-elem directive (modern browsers)
        expect($csp)->toContain('script-src-elem');
        expect($csp)->toContain("script-src-elem 'self' 'unsafe-inline' http: data:");

        // Check that broad protocols are supported for development
        expect($csp)->toContain('script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' http: ws: data:');
        expect($csp)->toContain('connect-src \'self\' http: https: ws: wss: data:');

        // Restore original environment
        app()->instance('env', $originalEnv);
    });

    test('CSP is stricter in production environment', function () {
        // Create middleware instance
        $middleware = new SecurityHeaders;

        // Create mock request and response
        $request = new Request;
        $response = new Response;

        // Temporarily set environment to production
        $originalEnv = app()->environment();
        app()->instance('env', 'production');

        // Apply middleware
        $result = $middleware->handle($request, function () use ($response) {
            return $response;
        });

        $csp = $result->headers->get('Content-Security-Policy');

        // Production CSP should not include broad protocol permissions
        expect($csp)->not->toContain('http:');
        expect($csp)->not->toContain('ws:');
        expect($csp)->not->toContain("'unsafe-eval'");

        // But should still have script-src-elem directive
        expect($csp)->toContain('script-src-elem');

        // But should still allow external fonts
        expect($csp)->toContain('https://fonts.bunny.net');
        expect($csp)->toContain('https://fonts.googleapis.com');

        // Restore original environment
        app()->instance('env', $originalEnv);
    });

    test('CSP includes all necessary directives', function () {
        $response = $this->get('/login');

        $csp = $response->headers->get('Content-Security-Policy');

        // Check all required CSP directives are present
        expect($csp)->toContain("default-src 'self'");
        expect($csp)->toContain('script-src');
        expect($csp)->toContain('style-src');
        expect($csp)->toContain('img-src');
        expect($csp)->toContain('font-src');
        expect($csp)->toContain('connect-src');
        expect($csp)->toContain("frame-ancestors 'none'");
    });

    test('CSP allows external font resources', function () {
        $response = $this->get('/login');

        $csp = $response->headers->get('Content-Security-Policy');

        // Should allow external fonts in both dev and production
        expect($csp)->toContain('https://fonts.bunny.net');
        expect($csp)->toContain('https://fonts.googleapis.com');
        expect($csp)->toContain('https://fonts.gstatic.com');
    });

    test('CSP configuration works correctly', function () {
        // Test that the CSP header is present and not empty
        $response = $this->get('/login');

        $csp = $response->headers->get('Content-Security-Policy');

        expect($csp)->not->toBeEmpty();
        expect($csp)->toContain("default-src 'self'");
        expect($csp)->toContain('script-src');
        expect($csp)->toContain('style-src');
        expect($csp)->toContain("frame-ancestors 'none'");
    });
});
