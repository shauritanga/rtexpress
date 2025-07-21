<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class CustomerRegistrationController extends Controller
{
    /**
     * Display the customer registration form.
     */
    public function show(): Response
    {
        return Inertia::render('Auth/CustomerRegister', [
            'countries' => [
                'US' => 'United States',
                'CA' => 'Canada',
                'GB' => 'United Kingdom',
                'AU' => 'Australia',
                'DE' => 'Germany',
                'FR' => 'France',
                'JP' => 'Japan',
                'CN' => 'China',
                'IN' => 'India',
                'BR' => 'Brazil',
                'MX' => 'Mexico',
                'IT' => 'Italy',
                'ES' => 'Spain',
                'NL' => 'Netherlands',
                'SE' => 'Sweden',
                'NO' => 'Norway',
                'DK' => 'Denmark',
                'FI' => 'Finland',
                'CH' => 'Switzerland',
                'AT' => 'Austria',
                'BE' => 'Belgium',
                'IE' => 'Ireland',
                'PT' => 'Portugal',
                'GR' => 'Greece',
                'PL' => 'Poland',
            ],
            'industries' => [
                'technology' => 'Technology',
                'manufacturing' => 'Manufacturing',
                'retail' => 'Retail',
                'healthcare' => 'Healthcare',
                'finance' => 'Finance',
                'education' => 'Education',
                'automotive' => 'Automotive',
                'aerospace' => 'Aerospace',
                'food_beverage' => 'Food & Beverage',
                'fashion' => 'Fashion & Apparel',
                'electronics' => 'Electronics',
                'pharmaceuticals' => 'Pharmaceuticals',
                'construction' => 'Construction',
                'energy' => 'Energy',
                'telecommunications' => 'Telecommunications',
                'media' => 'Media & Entertainment',
                'agriculture' => 'Agriculture',
                'logistics' => 'Logistics',
                'consulting' => 'Consulting',
                'other' => 'Other',
            ],
        ]);
    }

    /**
     * Handle customer registration.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Personal Information
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'required|string|max:20',
            
            // Company Information
            'company_name' => 'required|string|max:255',
            'industry' => 'required|string|max:100',
            'company_size' => 'required|in:1-10,11-50,51-200,201-1000,1000+',
            'website' => 'nullable|url|max:255',
            
            // Address Information
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:2',
            
            // Preferences
            'monthly_volume' => 'required|in:1-10,11-50,51-200,201-500,500+',
            'primary_service' => 'required|in:domestic,international,both',
            'hear_about_us' => 'required|string|max:100',
            
            // Terms
            'terms_accepted' => 'required|accepted',
            'marketing_emails' => 'boolean',
        ]);

        // Generate unique customer code
        $customerCode = $this->generateCustomerCode($validated['company_name']);

        // Create user account
        $user = User::create([
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign customer role
        $user->assignRole('customer');

        // Create customer profile
        $customer = Customer::create([
            'customer_code' => $customerCode,
            'company_name' => $validated['company_name'],
            'industry' => $validated['industry'],
            'company_size' => $validated['company_size'],
            'website' => $validated['website'],
            'contact_person' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address_line_1' => $validated['address_line_1'],
            'address_line_2' => $validated['address_line_2'],
            'city' => $validated['city'],
            'state_province' => $validated['state_province'],
            'postal_code' => $validated['postal_code'],
            'country' => $validated['country'],
            'monthly_volume' => $validated['monthly_volume'],
            'primary_service' => $validated['primary_service'],
            'hear_about_us' => $validated['hear_about_us'],
            'marketing_emails' => $validated['marketing_emails'] ?? false,
            'status' => 'pending', // Requires admin approval
            'credit_limit' => 1000.00, // Default credit limit
            'payment_terms' => 'Net 30',
        ]);

        // Link user to customer
        $user->update(['customer_id' => $customer->id]);

        // Fire registered event
        event(new Registered($user));

        // Log the user in
        Auth::login($user);

        // Redirect to customer dashboard with welcome message
        return redirect()->route('customer.dashboard')->with('success', 
            'Welcome to RT Express! Your account has been created and is pending approval. You can start exploring your dashboard.'
        );
    }

    /**
     * Generate a unique customer code.
     */
    private function generateCustomerCode(string $companyName): string
    {
        // Extract first 4 letters from company name
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $companyName), 0, 4));
        
        // Pad with 'X' if less than 4 characters
        $prefix = str_pad($prefix, 4, 'X');
        
        // Find next available number
        $counter = 1;
        do {
            $code = $prefix . str_pad($counter, 3, '0', STR_PAD_LEFT);
            $exists = Customer::where('customer_code', $code)->exists();
            $counter++;
        } while ($exists && $counter <= 999);
        
        return $code;
    }
}
