<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get all input data
        $input = $request->all();

        // Sanitize the input recursively
        $sanitized = $this->sanitizeArray($input);

        // Replace the request input with sanitized data
        $request->replace($sanitized);

        return $next($request);
    }

    /**
     * Recursively sanitize an array of data.
     */
    private function sanitizeArray(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->sanitizeArray($value);
            } elseif (is_string($value)) {
                $data[$key] = $this->sanitizeString($value);
            }
        }

        return $data;
    }

    /**
     * Sanitize a string value.
     */
    private function sanitizeString(string $value): string
    {
        // Remove HTML tags but preserve some safe ones for rich text fields
        $allowedTags = '<p><br><strong><em><u><ol><ul><li>';

        // For password fields, don't sanitize to preserve special characters
        if ($this->isPasswordField($value)) {
            return $value;
        }

        // Strip tags and decode HTML entities
        $sanitized = strip_tags($value, $allowedTags);
        $sanitized = html_entity_decode($sanitized, ENT_QUOTES, 'UTF-8');

        // Remove any remaining script tags or javascript
        $sanitized = preg_replace('/javascript:/i', '', $sanitized);
        $sanitized = preg_replace('/on\w+\s*=/i', '', $sanitized);

        // Trim whitespace
        return trim($sanitized);
    }

    /**
     * Check if the value might be a password field.
     * This is a simple heuristic - in production you might want to
     * check the field name or use a more sophisticated method.
     */
    private function isPasswordField(string $value): bool
    {
        // Don't sanitize if it looks like a password (has special chars and reasonable length)
        return strlen($value) >= 8 && preg_match('/[!@#$%^&*(),.?":{}|<>]/', $value);
    }
}
