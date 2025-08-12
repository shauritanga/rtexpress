<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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
            $googleUser = Socialite::driver('google')->user();
            
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
            Log::error('Google OAuth error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

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
                'role' => 'customer',
                'email_verified_at' => now(),
            ]);

            $customer->update(['email_verified_at' => now()]);
        }

        // Log the user in
        Auth::login($user);

        Log::info('Customer logged in via Google OAuth', [
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'email' => $customer->email,
        ]);

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
                'country' => 'Tanzania', // Default country
                'status' => 'pending_approval', // Requires admin approval
            ]);

            // Create user account
            $user = User::create([
                'name' => $fullName,
                'email' => $googleUser->getEmail(),
                'password' => Hash::make(str()->random(32)), // Random password since they use Google
                'customer_id' => $customer->id,
                'role' => 'customer',
                'email_verified_at' => now(),
            ]);

            // Log the user in
            Auth::login($user);

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


}
