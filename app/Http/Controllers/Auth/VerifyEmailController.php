<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\NewCustomerRegistrationNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            /** @var \Illuminate\Contracts\Auth\MustVerifyEmail $user */
            $user = $request->user();

            event(new Verified($user));

            // If this is a customer user, update customer status and notify admins
            if ($user->hasRole('customer') && $user->customer) {
                $customer = $user->customer;

                // Update customer status to pending_approval after email verification
                if ($customer->status === 'inactive') {
                    $customer->update(['status' => 'pending_approval']);

                    Log::info('Customer status updated to pending_approval after email verification', [
                        'customer_id' => $customer->id,
                        'user_id' => $user->id,
                        'email' => $user->email,
                    ]);

                    // Notify admins of new customer registration
                    $this->notifyAdminsOfNewRegistration($customer, $user, 'email');
                }
            }
        }

        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }

    /**
     * Notify admins of new customer registration
     */
    private function notifyAdminsOfNewRegistration($customer, $user, string $registrationType): void
    {
        try {
            // Get all admin users
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            if ($admins->isNotEmpty()) {
                Notification::send($admins, new NewCustomerRegistrationNotification($customer, $user, $registrationType));

                Log::info('Admin notification sent for new customer registration', [
                    'customer_id' => $customer->id,
                    'registration_type' => $registrationType,
                    'admin_count' => $admins->count(),
                ]);
            } else {
                Log::warning('No admin users found to notify of new customer registration', [
                    'customer_id' => $customer->id,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send admin notification for new customer registration', [
                'customer_id' => $customer->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
