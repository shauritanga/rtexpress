<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page (customer registration only).
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle customer registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email|unique:customers,email',
            'phone' => [
                'required',
                'string',
                'regex:/^[\+]?[1-9][\d]{0,15}$/', // International format
                'min:10',
                'max:20',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'terms' => 'required|accepted',
        ]);

        try {
            // Create user account with OTP enabled by default
            $user = User::create([
                'name' => $request->contact_person,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'status' => 'active',
                'otp_enabled' => config('otp.enabled_by_default', true), // Enable OTP by default for security
            ]);

            // Create customer record
            $customer = Customer::create([
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
                'credit_limit' => 5000.00, // Default credit limit
                'payment_terms' => 'net_30', // Default payment terms
                'status' => 'inactive', // Require admin approval - use inactive until approved
                'created_by' => $user->id,
            ]);

            // Link user to customer
            $user->update(['customer_id' => $customer->id]);

            // Fire registered event (this sends the verification email)
            event(new Registered($user));

            // Log security event
            Log::info('Customer registration completed', [
                'user_id' => $user->id,
                'email' => $request->email,
                'company' => $request->company_name,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Log in the user temporarily for verification process
            Auth::login($user);

            return redirect()->route('verification.notice')->with([
                'success' => 'Registration successful! Welcome to RT Express.',
                'email_sent' => true,
                'user_email' => $request->email,
                'company_name' => $request->company_name,
            ]);

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Registration failed. Please try again.']);
        }
    }
}
