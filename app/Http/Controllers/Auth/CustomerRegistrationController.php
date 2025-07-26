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
        return Inertia::render('auth/CustomerRegisterSimple', [
            'countries' => $this->getAllCountries(),
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
            
            // Address Information
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state_province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:2',

            // Terms
            'terms_accepted' => 'required|accepted',
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
            'contact_person' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address_line_1' => $validated['address_line_1'],
            'address_line_2' => $validated['address_line_2'] ?? null,
            'city' => $validated['city'],
            'state_province' => $validated['state_province'],
            'postal_code' => $validated['postal_code'],
            'country' => $validated['country'],
            'status' => 'active', // Set to active by default
            'credit_limit' => 1000.00, // Default credit limit
            'payment_terms' => 'net_30', // Use enum value
            'created_by' => null, // Self-registration, no admin created this
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

    /**
     * Get all countries for the registration form.
     */
    private function getAllCountries(): array
    {
        return [
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
            'CZ' => 'Czech Republic',
            'HU' => 'Hungary',
            'RO' => 'Romania',
            'BG' => 'Bulgaria',
            'HR' => 'Croatia',
            'SK' => 'Slovakia',
            'SI' => 'Slovenia',
            'EE' => 'Estonia',
            'LV' => 'Latvia',
            'LT' => 'Lithuania',
            'LU' => 'Luxembourg',
            'MT' => 'Malta',
            'CY' => 'Cyprus',
            'IS' => 'Iceland',
            'LI' => 'Liechtenstein',
            'MC' => 'Monaco',
            'SM' => 'San Marino',
            'VA' => 'Vatican City',
            'AD' => 'Andorra',
            'RU' => 'Russia',
            'UA' => 'Ukraine',
            'BY' => 'Belarus',
            'MD' => 'Moldova',
            'GE' => 'Georgia',
            'AM' => 'Armenia',
            'AZ' => 'Azerbaijan',
            'KZ' => 'Kazakhstan',
            'UZ' => 'Uzbekistan',
            'TM' => 'Turkmenistan',
            'TJ' => 'Tajikistan',
            'KG' => 'Kyrgyzstan',
            'MN' => 'Mongolia',
            'KR' => 'South Korea',
            'KP' => 'North Korea',
            'TW' => 'Taiwan',
            'HK' => 'Hong Kong',
            'MO' => 'Macau',
            'SG' => 'Singapore',
            'MY' => 'Malaysia',
            'TH' => 'Thailand',
            'VN' => 'Vietnam',
            'LA' => 'Laos',
            'KH' => 'Cambodia',
            'MM' => 'Myanmar',
            'BD' => 'Bangladesh',
            'LK' => 'Sri Lanka',
            'MV' => 'Maldives',
            'NP' => 'Nepal',
            'BT' => 'Bhutan',
            'PK' => 'Pakistan',
            'AF' => 'Afghanistan',
            'IR' => 'Iran',
            'IQ' => 'Iraq',
            'SY' => 'Syria',
            'LB' => 'Lebanon',
            'JO' => 'Jordan',
            'IL' => 'Israel',
            'PS' => 'Palestine',
            'SA' => 'Saudi Arabia',
            'AE' => 'United Arab Emirates',
            'QA' => 'Qatar',
            'BH' => 'Bahrain',
            'KW' => 'Kuwait',
            'OM' => 'Oman',
            'YE' => 'Yemen',
            'TR' => 'Turkey',
            'EG' => 'Egypt',
            'LY' => 'Libya',
            'TN' => 'Tunisia',
            'DZ' => 'Algeria',
            'MA' => 'Morocco',
            'SD' => 'Sudan',
            'SS' => 'South Sudan',
            'ET' => 'Ethiopia',
            'ER' => 'Eritrea',
            'DJ' => 'Djibouti',
            'SO' => 'Somalia',
            'KE' => 'Kenya',
            'UG' => 'Uganda',
            'TZ' => 'Tanzania',
            'RW' => 'Rwanda',
            'BI' => 'Burundi',
            'CD' => 'Democratic Republic of the Congo',
            'CG' => 'Republic of the Congo',
            'CF' => 'Central African Republic',
            'TD' => 'Chad',
            'CM' => 'Cameroon',
            'GQ' => 'Equatorial Guinea',
            'GA' => 'Gabon',
            'ST' => 'São Tomé and Príncipe',
            'GH' => 'Ghana',
            'TG' => 'Togo',
            'BJ' => 'Benin',
            'BF' => 'Burkina Faso',
            'CI' => 'Côte d\'Ivoire',
            'LR' => 'Liberia',
            'SL' => 'Sierra Leone',
            'GN' => 'Guinea',
            'GW' => 'Guinea-Bissau',
            'SN' => 'Senegal',
            'GM' => 'Gambia',
            'ML' => 'Mali',
            'MR' => 'Mauritania',
            'NE' => 'Niger',
            'NG' => 'Nigeria',
            'ZA' => 'South Africa',
            'NA' => 'Namibia',
            'BW' => 'Botswana',
            'ZW' => 'Zimbabwe',
            'ZM' => 'Zambia',
            'MW' => 'Malawi',
            'MZ' => 'Mozambique',
            'SZ' => 'Eswatini',
            'LS' => 'Lesotho',
            'MG' => 'Madagascar',
            'MU' => 'Mauritius',
            'SC' => 'Seychelles',
            'KM' => 'Comoros',
            'CV' => 'Cape Verde',
            'AR' => 'Argentina',
            'CL' => 'Chile',
            'UY' => 'Uruguay',
            'PY' => 'Paraguay',
            'BO' => 'Bolivia',
            'PE' => 'Peru',
            'EC' => 'Ecuador',
            'CO' => 'Colombia',
            'VE' => 'Venezuela',
            'GY' => 'Guyana',
            'SR' => 'Suriname',
            'GF' => 'French Guiana',
            'FK' => 'Falkland Islands',
            'NZ' => 'New Zealand',
            'FJ' => 'Fiji',
            'PG' => 'Papua New Guinea',
            'SB' => 'Solomon Islands',
            'VU' => 'Vanuatu',
            'NC' => 'New Caledonia',
            'PF' => 'French Polynesia',
            'WS' => 'Samoa',
            'TO' => 'Tonga',
            'KI' => 'Kiribati',
            'TV' => 'Tuvalu',
            'NR' => 'Nauru',
            'PW' => 'Palau',
            'FM' => 'Micronesia',
            'MH' => 'Marshall Islands',
        ];
    }
}
