<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\NewCustomerRegistrationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the customer profile page.
     */
    public function show(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        return Inertia::render('Customer/Profile/Show', [
            'user' => $user,
            'customer' => $customer,
        ]);
    }

    /**
     * Show the customer profile edit page.
     */
    public function edit(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        return Inertia::render('Customer/Profile/Edit', [
            'user' => $user,
            'customer' => $customer,
        ]);
    }

    /**
     * Update the customer profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $customer = $user->customer;

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
        ]);

        try {
            // Update user record
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
            ]);

            // Update customer record
            if ($customer) {
                $customer->update([
                    'company_name' => $request->company_name,
                    'contact_person' => $request->contact_person,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'address_line_1' => $request->address_line_1,
                    'address_line_2' => $request->address_line_2,
                    'city' => $request->city,
                    'state_province' => $request->state_province,
                    'postal_code' => $request->postal_code,
                    'country' => $request->country,
                ]);
            }

            return redirect()->route('customer.profile.show')->with('success', 'Profile updated successfully!');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update profile. Please try again.']);
        }
    }

    /**
     * Update the customer password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            Auth::user()->update([
                'password' => Hash::make($request->password),
            ]);

            return back()->with('success', 'Password updated successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update password. Please try again.']);
        }
    }

    /**
     * Show profile completion form for Google OAuth users
     */
    public function complete(): Response
    {
        $user = Auth::user();
        $customer = $user->customer;

        // Check if profile is already complete
        if ($this->isProfileComplete($customer)) {
            return redirect()->route('customer.dashboard')
                ->with('success', 'Your profile is already complete!');
        }

        return Inertia::render('Customer/Profile/Complete', [
            'user' => $user,
            'customer' => $customer,
            'countries' => $this->getAllCountries(),
        ]);
    }

    /**
     * Store completed profile information
     */
    public function storeComplete(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $customer = $user->customer;

        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'company_name' => 'nullable|string|max:255',
        ]);

        try {
            // Update customer with missing information
            $customer->update([
                'phone' => $validated['phone'],
                'address_line_1' => $validated['address_line_1'],
                'address_line_2' => $validated['address_line_2'],
                'city' => $validated['city'],
                'state_province' => $validated['state_province'],
                'postal_code' => $validated['postal_code'],
                'country' => $validated['country'],
                'company_name' => $validated['company_name'] ?: $customer->company_name,
                'status' => 'pending_approval', // Move to pending approval after profile completion
            ]);

            Log::info('Customer profile completed', [
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'email' => $customer->email,
                'status' => 'pending_approval',
            ]);

            // Notify admins of completed registration (for Google OAuth users)
            if ($customer->google_id) {
                $this->notifyAdminsOfNewRegistration($customer, $user, 'google');
            }

            // Log out the user after profile completion
            Auth::logout();

            return redirect()->route('login')
                ->with('success', 'Profile completed successfully! Your account is now pending admin approval. You will be able to log in once approved.');

        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to complete profile. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Check if customer profile is complete
     */
    private function isProfileComplete($customer): bool
    {
        $requiredFields = ['phone', 'address_line_1', 'city', 'state_province', 'postal_code', 'country'];

        foreach ($requiredFields as $field) {
            if (empty($customer->$field)) {
                return false;
            }
        }

        // Also check if status is still pending_completion (indicating incomplete profile)
        return $customer->status !== 'pending_completion';
    }

    /**
     * Get all countries for the dropdown
     */
    private function getAllCountries(): array
    {
        return [
            'Tanzania' => 'Tanzania',
            'Kenya' => 'Kenya',
            'Uganda' => 'Uganda',
            'Rwanda' => 'Rwanda',
            'Burundi' => 'Burundi',
            'South Africa' => 'South Africa',
            'Nigeria' => 'Nigeria',
            'Ghana' => 'Ghana',
            'Egypt' => 'Egypt',
            'Morocco' => 'Morocco',
            'United States' => 'United States',
            'United Kingdom' => 'United Kingdom',
            'Germany' => 'Germany',
            'France' => 'France',
            'China' => 'China',
            'India' => 'India',
            'Japan' => 'Japan',
            'Australia' => 'Australia',
            'Canada' => 'Canada',
            'Brazil' => 'Brazil',
        ];
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
