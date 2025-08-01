<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            'phone' => 'required|string|max:20',
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
            // Create user account
            $user = User::create([
                'name' => $request->contact_person,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => 'active',
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
                'status' => 'active',
                'created_by' => $user->id,
            ]);

            // Link user to customer
            $user->update(['customer_id' => $customer->id]);

            event(new Registered($user));
            Auth::login($user);

            return redirect('/customer/dashboard')->with('success', 'Welcome to RT Express! Your account has been created successfully.');

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Registration failed. Please try again.']);
        }
    }
}
