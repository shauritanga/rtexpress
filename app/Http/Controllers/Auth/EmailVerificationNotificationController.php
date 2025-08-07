<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            // Redirect based on user role
            $user = $request->user();
            if ($user->hasRole('customer')) {
                return redirect()->intended('/customer/dashboard');
            }
            return redirect()->intended(route('dashboard', absolute: false));
        }

        try {
            $request->user()->sendEmailVerificationNotification();

            return back()->with([
                'status' => 'verification-link-sent',
                'success' => 'Verification email sent successfully!'
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'email' => 'Failed to send verification email. Please try again or contact support.'
            ]);
        }
    }
}
