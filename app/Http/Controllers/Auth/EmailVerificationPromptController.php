<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Show the email verification prompt page.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            // Redirect based on user role
            if ($user->hasRole('customer')) {
                // Check if customer account needs approval
                if ($user->customer && $user->customer->status !== 'active') {
                    return redirect()->route('customer.pending-approval');
                }

                return redirect()->intended('/customer/dashboard');
            }

            return redirect()->intended(route('dashboard', absolute: false));
        }

        // For customer users, allow them to access pending approval even without email verification
        if ($user->hasRole('customer') && $user->customer && $user->customer->status !== 'active') {
            return redirect()->route('customer.pending-approval');
        }

        return Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
            'success' => $request->session()->get('success'),
            'email_sent' => $request->session()->get('email_sent'),
            'user_email' => $request->session()->get('user_email'),
            'company_name' => $request->session()->get('company_name'),
        ]);
    }
}
