<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
}
