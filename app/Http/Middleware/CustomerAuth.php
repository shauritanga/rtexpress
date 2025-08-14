<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
        Log::info('CustomerAuth middleware started', [
            'url' => $request->fullUrl(),
            'authenticated' => Auth::check(),
        ]);

        // Check if user is authenticated
        if (! Auth::check()) {
            Log::warning('CustomerAuth: User not authenticated');
            return redirect('/login');
        }

        $user = Auth::user();

        Log::info('CustomerAuth: User details', [
            'user_id' => $user->id,
            'email' => $user->email,
            'customer_id' => $user->customer_id,
        ]);

        // Check if user has customer role
        $hasCustomerRole = $user->hasRole('customer');
        Log::info('CustomerAuth: Role check', [
            'has_customer_role' => $hasCustomerRole,
            'all_roles' => $user->roles->pluck('name')->toArray(),
        ]);

        if (! $hasCustomerRole) {
            Log::warning('CustomerAuth: User does not have customer role');
            return redirect('/login')->withErrors([
                'access' => 'You do not have permission to access the customer portal.',
            ]);
        }

        // Check if customer account is approved
        $customerStatus = $user->customer ? $user->customer->status : null;
        Log::info('CustomerAuth: Customer status check', [
            'has_customer' => $user->customer ? true : false,
            'customer_status' => $customerStatus,
        ]);

        if ($user->customer && $user->customer->status !== 'active') {
            Log::warning('CustomerAuth: Customer not active, logging out', [
                'customer_status' => $user->customer->status,
            ]);
            Auth::logout();

            $message = match($user->customer->status) {
                'pending_completion' => 'Please complete your profile to continue.',
                'pending_approval' => 'Your account is pending admin approval. You will be able to access the system once approved.',
                'suspended' => 'Your account has been suspended. Please contact support for assistance.',
                default => 'Your account is not active. Please contact support for assistance.',
            };

            return redirect('/login')->withErrors([
                'access' => $message,
            ]);
        }

        Log::info('CustomerAuth: All checks passed, proceeding');
        return $next($request);
    }
}
