<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CustomerAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (! Auth::check()) {
            return redirect('/login');
        }

        $user = Auth::user();

        // Check if user has customer role
        if (! $user->hasRole('customer')) {
            return redirect('/login')->withErrors([
                'access' => 'You do not have permission to access the customer portal.',
            ]);
        }

        // Check if customer account is approved
        if ($user->customer && $user->customer->status !== 'active') {
            Auth::logout();

            return redirect('/login')->withErrors([
                'access' => 'Your account is pending approval. Please contact support for assistance.',
            ]);
        }

        return $next($request);
    }
}
