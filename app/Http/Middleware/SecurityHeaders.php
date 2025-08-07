<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        
        // Prevent clickjacking attacks
        $response->headers->set('X-Frame-Options', 'DENY');
        
        // Enable XSS protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // Referrer policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Content Security Policy - Development and Production friendly
        $isDevelopment = app()->environment('local', 'development');

        if ($isDevelopment) {
            // More permissive CSP for development with Vite
            // Note: IPv6 localhost [::1] may not be supported in all browsers' CSP
            // Using 'unsafe-eval' and broader localhost permissions for development
            $csp = "default-src 'self'; " .
                   "script-src 'self' 'unsafe-inline' 'unsafe-eval' http: ws: data:; " .
                   "script-src-elem 'self' 'unsafe-inline' http: data:; " .
                   "style-src 'self' 'unsafe-inline' https: http: data:; " .
                   "img-src 'self' data: https: http:; " .
                   "font-src 'self' data: https: http:; " .
                   "connect-src 'self' http: https: ws: wss: data:; " .
                   "frame-ancestors 'none';";
        } else {
            // Stricter CSP for production
            $csp = "default-src 'self'; " .
                   "script-src 'self' 'unsafe-inline'; " .
                   "script-src-elem 'self' 'unsafe-inline'; " .
                   "style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com; " .
                   "img-src 'self' data: https:; " .
                   "font-src 'self' data: https://fonts.bunny.net https://fonts.gstatic.com; " .
                   "connect-src 'self' https:; " .
                   "frame-ancestors 'none';";
        }
        
        $response->headers->set('Content-Security-Policy', $csp);
        
        // Strict Transport Security (only if HTTPS)
        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        
        // Permissions Policy (formerly Feature Policy)
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        return $response;
    }
}
