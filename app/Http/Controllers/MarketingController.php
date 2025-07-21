<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class MarketingController extends Controller
{
    /**
     * Display the marketing home page.
     */
    public function home(): Response
    {
        return Inertia::render('Marketing/Home', [
            'stats' => [
                'total_shipments' => '50,000+',
                'countries_served' => '25+',
                'satisfied_customers' => '5,000+',
                'years_experience' => '10+',
            ],
            'features' => [
                [
                    'title' => 'Real-Time Tracking',
                    'description' => 'Track your shipments in real-time with our advanced GPS technology',
                    'icon' => 'MapPin',
                ],
                [
                    'title' => 'Global Coverage',
                    'description' => 'We deliver to over 25 countries worldwide with reliable service',
                    'icon' => 'Globe',
                ],
                [
                    'title' => 'Secure Shipping',
                    'description' => 'Your packages are protected with our comprehensive insurance coverage',
                    'icon' => 'Shield',
                ],
                [
                    'title' => '24/7 Support',
                    'description' => 'Our customer support team is available around the clock',
                    'icon' => 'HeadphonesIcon',
                ],
            ],
            'testimonials' => [
                [
                    'name' => 'Sarah Johnson',
                    'company' => 'Global Imports Ltd',
                    'content' => 'RT Express has transformed our shipping operations. Fast, reliable, and excellent customer service.',
                    'rating' => 5,
                ],
                [
                    'name' => 'Michael Chen',
                    'company' => 'Tech Solutions Inc',
                    'content' => 'The real-time tracking and professional dashboard make managing shipments effortless.',
                    'rating' => 5,
                ],
                [
                    'name' => 'Emma Rodriguez',
                    'company' => 'Fashion Forward',
                    'content' => 'Competitive pricing and reliable delivery times. RT Express is our go-to shipping partner.',
                    'rating' => 5,
                ],
            ],
        ]);
    }

    /**
     * Display the about page.
     */
    public function about(): Response
    {
        return Inertia::render('Marketing/About', [
            'company' => [
                'founded' => '2014',
                'headquarters' => 'New York, USA',
                'employees' => '500+',
                'warehouses' => '15',
            ],
            'values' => [
                [
                    'title' => 'Reliability',
                    'description' => 'We deliver on our promises with consistent, dependable service.',
                    'icon' => 'CheckCircle',
                ],
                [
                    'title' => 'Innovation',
                    'description' => 'Cutting-edge technology drives our logistics solutions.',
                    'icon' => 'Zap',
                ],
                [
                    'title' => 'Customer Focus',
                    'description' => 'Your success is our priority in everything we do.',
                    'icon' => 'Heart',
                ],
                [
                    'title' => 'Global Reach',
                    'description' => 'Connecting businesses worldwide with seamless shipping.',
                    'icon' => 'Globe',
                ],
            ],
        ]);
    }

    /**
     * Display the services page.
     */
    public function services(): Response
    {
        return Inertia::render('Marketing/Services', [
            'services' => [
                [
                    'title' => 'Express Shipping',
                    'description' => 'Fast delivery for urgent shipments with guaranteed delivery times.',
                    'features' => ['1-2 day delivery', 'Real-time tracking', 'Insurance included', 'Priority handling'],
                    'icon' => 'Zap',
                    'price_from' => '$25',
                ],
                [
                    'title' => 'Standard Shipping',
                    'description' => 'Cost-effective solution for regular shipments with reliable delivery.',
                    'features' => ['3-5 day delivery', 'Package tracking', 'Secure handling', 'Competitive rates'],
                    'icon' => 'Package',
                    'price_from' => '$12',
                ],
                [
                    'title' => 'International Shipping',
                    'description' => 'Global shipping solutions with customs clearance support.',
                    'features' => ['Worldwide delivery', 'Customs handling', 'Documentation support', 'Multi-currency'],
                    'icon' => 'Globe',
                    'price_from' => '$35',
                ],
                [
                    'title' => 'Freight Services',
                    'description' => 'Large shipment solutions for businesses with bulk shipping needs.',
                    'features' => ['Bulk shipping', 'Dedicated support', 'Custom solutions', 'Volume discounts'],
                    'icon' => 'Truck',
                    'price_from' => '$150',
                ],
            ],
        ]);
    }

    /**
     * Display the pricing page.
     */
    public function pricing(): Response
    {
        return Inertia::render('Marketing/Pricing', [
            'plans' => [
                [
                    'name' => 'Starter',
                    'description' => 'Perfect for small businesses and individuals',
                    'price' => '$29',
                    'period' => 'month',
                    'features' => [
                        'Up to 50 shipments/month',
                        'Basic tracking',
                        'Email support',
                        'Standard delivery',
                        'Basic insurance',
                    ],
                    'popular' => false,
                ],
                [
                    'name' => 'Professional',
                    'description' => 'Ideal for growing businesses',
                    'price' => '$79',
                    'period' => 'month',
                    'features' => [
                        'Up to 200 shipments/month',
                        'Advanced tracking',
                        'Priority support',
                        'Express delivery options',
                        'Enhanced insurance',
                        'API access',
                        'Custom branding',
                    ],
                    'popular' => true,
                ],
                [
                    'name' => 'Enterprise',
                    'description' => 'For large organizations with high volume',
                    'price' => 'Custom',
                    'period' => '',
                    'features' => [
                        'Unlimited shipments',
                        'Real-time tracking',
                        '24/7 dedicated support',
                        'All delivery options',
                        'Full insurance coverage',
                        'Advanced API access',
                        'White-label solutions',
                        'Custom integrations',
                        'Dedicated account manager',
                    ],
                    'popular' => false,
                ],
            ],
        ]);
    }

    /**
     * Display the contact page.
     */
    public function contact(): Response
    {
        return Inertia::render('Marketing/Contact', [
            'offices' => [
                [
                    'city' => 'New York',
                    'address' => '123 Express Avenue, NY 10001',
                    'phone' => '+1 (555) 123-4567',
                    'email' => 'ny@rtexpress.com',
                ],
                [
                    'city' => 'Los Angeles',
                    'address' => '456 Shipping Blvd, CA 90210',
                    'phone' => '+1 (555) 987-6543',
                    'email' => 'la@rtexpress.com',
                ],
                [
                    'city' => 'London',
                    'address' => '789 Logistics Lane, London SW1A 1AA',
                    'phone' => '+44 20 7123 4567',
                    'email' => 'london@rtexpress.com',
                ],
            ],
        ]);
    }

    /**
     * Handle contact form submission.
     */
    public function submitContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        // In a real application, you would send an email here
        // Mail::to('contact@rtexpress.com')->send(new ContactFormMail($validated));

        return redirect()->back()->with('success', 'Thank you for your message! We will get back to you within 24 hours.');
    }
}
