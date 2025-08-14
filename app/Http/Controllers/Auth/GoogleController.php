<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use App\Notifications\NewCustomerRegistrationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback()
    {
        try {
            Log::info('Google OAuth callback started', [
                'request_url' => request()->fullUrl(),
                'request_params' => request()->all(),
            ]);

            // Use stateless() to bypass state validation issues
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            Log::info('Google OAuth callback received', [
                'google_id' => $googleUser->getId(),
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName(),
            ]);

            // Check if customer already exists with this Google ID
            $customer = Customer::where('google_id', $googleUser->getId())->first();

            if ($customer) {
                // Customer exists, log them in
                return $this->loginExistingCustomer($customer);
            }

            // Check if customer exists with this email
            $customer = Customer::where('email', $googleUser->getEmail())->first();

            if ($customer) {
                // Link Google account to existing customer
                $customer->update([
                    'google_id' => $googleUser->getId(),
                    'email_verified_at' => now(),
                ]);

                return $this->loginExistingCustomer($customer);
            }

            // Create new customer
            return $this->createNewCustomer($googleUser);

        } catch (\Exception $e) {
            // Try to get more specific error information
            $errorDetails = [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request_url' => request()->fullUrl(),
                'request_params' => request()->all(),
                'google_config' => [
                    'client_id' => config('services.google.client_id'),
                    'redirect' => config('services.google.redirect'),
                ],
            ];

            // Check if it's a GuzzleHttp exception with response body
            if (method_exists($e, 'getResponse') && $e->getResponse()) {
                $response = $e->getResponse();
                $errorDetails['http_status'] = $response->getStatusCode();
                $errorDetails['response_body'] = $response->getBody()->getContents();
            }

            // Check if it's a Laravel Socialite exception
            if ($e instanceof \Laravel\Socialite\Two\InvalidStateException) {
                $errorDetails['socialite_error'] = 'Invalid state - possible CSRF attack or session timeout';
            }

            Log::error('Google OAuth error', $errorDetails);

            return redirect()->route('customer.register')
                ->withErrors(['google' => 'Unable to authenticate with Google. Please try again or register manually.']);
        }
    }

    /**
     * Login existing customer
     */
    private function loginExistingCustomer(Customer $customer)
    {
        // Check if customer has a user account
        $user = $customer->user;

        if (!$user) {
            // Create user account for the customer
            $user = User::create([
                'name' => $customer->contact_person ?: $customer->company_name,
                'email' => $customer->email,
                'password' => Hash::make(str()->random(32)), // Random password since they use Google
                'customer_id' => $customer->id,
                'email_verified_at' => now(),
            ]);

            // Assign customer role
            $user->assignRole('customer');

            $customer->update(['email_verified_at' => now()]);
        } else {
            // For existing users, ensure email is verified
            if (!$user->hasVerifiedEmail()) {
                $user->update(['email_verified_at' => now()]);
            }
        }

        // Log the user in
        Auth::login($user);

        // Update last activity to prevent immediate logout
        $user->updateLastActivity();

        Log::info('Customer logged in via Google OAuth', [
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'email' => $customer->email,
            'status' => $customer->status,
        ]);

        // Check if customer needs to complete profile
        if ($customer->status === 'pending_completion' || $this->isProfileIncomplete($customer)) {
            return redirect()->route('customer.profile.complete')
                ->with('success', 'Welcome back! Please complete your profile to continue.');
        }

        // Check if customer is pending approval
        if ($customer->status === 'pending_approval') {
            Auth::logout();
            return redirect()->route('login')
                ->with('info', 'Your account is pending admin approval. You will be able to log in once approved.');
        }

        // Customer is active, redirect to dashboard
        return redirect()->intended(route('customer.dashboard'))
            ->with('success', 'Welcome back! You have been logged in successfully.');
    }

    /**
     * Create new customer from Google OAuth
     */
    private function createNewCustomer($googleUser)
    {
        try {
            // Extract name parts
            $nameParts = explode(' ', $googleUser->getName(), 2);
            $firstName = $nameParts[0] ?? '';
            $lastName = $nameParts[1] ?? '';
            $fullName = trim($firstName . ' ' . $lastName);

            // Create customer
            $customer = Customer::create([
                'company_name' => $fullName . "'s Company", // Default company name
                'contact_person' => $fullName,
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'email_verified_at' => now(),
                'phone' => '', // Will be filled in profile completion
                'address_line_1' => '', // Will be filled in profile completion
                'city' => '',
                'state_province' => '',
                'postal_code' => '',
                'country' => '', // Will be filled in profile completion
                'status' => 'pending_completion', // Requires profile completion
            ]);

            // Create user account
            $user = User::create([
                'name' => $fullName,
                'email' => $googleUser->getEmail(),
                'password' => Hash::make(str()->random(32)), // Random password since they use Google
                'customer_id' => $customer->id,
                'email_verified_at' => now(),
            ]);

            // Assign customer role
            $user->assignRole('customer');

            // Log the user in
            Auth::login($user);

            // Update last activity to prevent immediate logout
            $user->updateLastActivity();

            Log::info('New customer created via Google OAuth', [
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'email' => $customer->email,
                'google_id' => $googleUser->getId(),
            ]);

            return redirect()->route('customer.profile.complete')
                ->with('success', 'Welcome to RT Express! Please complete your profile to start using our services.');

        } catch (\Exception $e) {
            Log::error('Error creating customer from Google OAuth', [
                'error' => $e->getMessage(),
                'google_user' => [
                    'id' => $googleUser->getId(),
                    'email' => $googleUser->getEmail(),
                    'name' => $googleUser->getName(),
                ],
            ]);

            return redirect()->route('customer.register')
                ->withErrors(['google' => 'Unable to create your account. Please try registering manually.']);
        }
    }

    /**
     * Check if customer profile is incomplete
     */
    private function isProfileIncomplete(Customer $customer): bool
    {
        $requiredFields = ['phone', 'address_line_1', 'city', 'state_province', 'postal_code', 'country'];

        foreach ($requiredFields as $field) {
            if (empty($customer->$field)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Notify admins of new customer registration
     */
    private function notifyAdminsOfNewRegistration(Customer $customer, User $user, string $registrationType): void
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
