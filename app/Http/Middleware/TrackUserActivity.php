<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Update user's last activity if authenticated
        if (Auth::check()) {
            $user = Auth::user();

            // Check if user has been inactive for more than 10 minutes
            if ($user->isInactive(10)) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->with('status', 'You have been logged out due to inactivity.');
            }

            // Update last activity timestamp
            $user->updateLastActivity();
        }

        return $next($request);
    }
}
