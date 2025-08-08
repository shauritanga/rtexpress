<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Shipment - {{ $shipment->tracking_number }} | RT Express</title>
    <meta name="description" content="Track your RT Express shipment {{ $shipment->tracking_number }}">
    
    {{-- Favicon --}}
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    
    {{-- Fonts --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    
    {{-- Tailwind CSS --}}
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#C41E3A',
                        secondary: '#1F2937'
                    },
                    fontFamily: {
                        sans: ['Instrument Sans', 'sans-serif']
                    }
                }
            }
        }
    </script>
    
    <style>
        .hero-gradient {
            background: linear-gradient(135deg, #C41E3A 0%, #991B2E 100%);
        }
        .card-shadow {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .status-badge {
            @apply px-3 py-1 rounded-full text-sm font-medium;
        }
        .status-pending { @apply bg-yellow-100 text-yellow-800; }
        .status-in_transit { @apply bg-blue-100 text-blue-800; }
        .status-delivered { @apply bg-green-100 text-green-800; }
        .status-cancelled { @apply bg-red-100 text-red-800; }
    </style>
</head>
<body class="font-sans bg-gray-50">
    {{-- Header --}}
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <a href="{{ route('marketing.landing') }}" class="flex items-center">
                        <img src="/images/logo.jpeg" alt="RT Express" class="h-10 w-10 rounded-lg">
                        <span class="ml-3 text-xl font-bold text-gray-900">RT Express</span>
                    </a>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="{{ route('marketing.landing') }}#track" class="text-gray-600 hover:text-primary transition-colors">Track Another</a>
                    <a href="{{ route('login') }}" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Login to System
                    </a>
                </div>
            </div>
        </div>
    </header>

    {{-- Main Content --}}
    <main class="py-12">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {{-- Back Button --}}
            <div class="mb-6">
                <a href="{{ route('marketing.landing') }}" class="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Home
                </a>
            </div>

            {{-- Tracking Header --}}
            <div class="bg-white rounded-xl card-shadow p-8 mb-8">
                <div class="text-center">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Shipment Tracking</h1>
                    <p class="text-lg text-gray-600 mb-6">Track your package in real-time</p>
                    
                    <div class="bg-gray-50 rounded-lg p-4 inline-block">
                        <span class="text-sm text-gray-500">Tracking Number</span>
                        <div class="text-2xl font-mono font-bold text-primary">{{ $shipment->tracking_number }}</div>
                    </div>
                </div>
            </div>

            {{-- Shipment Status --}}
            <div class="bg-white rounded-xl card-shadow p-8 mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Current Status</h2>
                    <span class="status-badge status-{{ $shipment->status }}">
                        {{ ucfirst(str_replace('_', ' ', $shipment->status)) }}
                    </span>
                </div>

                <div class="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Sender:</span>
                                <span class="font-medium">{{ $shipment->sender_name }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Recipient:</span>
                                <span class="font-medium">{{ $shipment->recipient_name }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Service Type:</span>
                                <span class="font-medium">{{ ucfirst($shipment->service_type) }}</span>
                            </div>
                            @if($shipment->estimated_delivery_date)
                            <div class="flex justify-between">
                                <span class="text-gray-600">Est. Delivery:</span>
                                <span class="font-medium">{{ $shipment->estimated_delivery_date->format('M j, Y') }}</span>
                            </div>
                            @endif
                        </div>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Locations</h3>
                        <div class="space-y-3">
                            <div>
                                <span class="text-gray-600 block">From:</span>
                                <span class="font-medium">{{ $shipment->origin_address }}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 block">To:</span>
                                <span class="font-medium">{{ $shipment->destination_address }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Tracking Timeline --}}
            @if($shipment->trackingEvents && $shipment->trackingEvents->count() > 0)
            <div class="bg-white rounded-xl card-shadow p-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">Tracking History</h2>
                
                <div class="space-y-6">
                    @foreach($shipment->trackingEvents->sortByDesc('event_date') as $event)
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            <div class="w-3 h-3 bg-primary rounded-full mt-2"></div>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold text-gray-900">{{ $event->event_type }}</h3>
                                <span class="text-sm text-gray-500">{{ $event->event_date->format('M j, Y g:i A') }}</span>
                            </div>
                            @if($event->location)
                            <p class="text-gray-600 mt-1">📍 {{ $event->location }}</p>
                            @endif
                            @if($event->description)
                            <p class="text-gray-700 mt-2">{{ $event->description }}</p>
                            @endif
                        </div>
                    </div>
                    @if(!$loop->last)
                    <div class="ml-6 border-l-2 border-gray-200 h-4"></div>
                    @endif
                    @endforeach
                </div>
            </div>
            @endif

            {{-- Contact Support --}}
            <div class="bg-gray-50 rounded-xl p-8 mt-8 text-center">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
                <p class="text-gray-600 mb-6">If you have questions about your shipment, our support team is here to help.</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="mailto:admin@rtexpress.co.tz" class="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Email Support
                    </a>
                    <a href="tel:+255000000000" class="border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
                        Call Support
                    </a>
                </div>
            </div>
        </div>
    </main>

    {{-- Footer --}}
    <footer class="bg-secondary text-white py-12 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex items-center justify-center mb-4">
                <img src="/images/logo.jpeg" alt="RT Express" class="h-10 w-10 rounded-lg">
                <span class="ml-3 text-xl font-bold">RT Express</span>
            </div>
            <p class="text-gray-300 mb-4">Professional cargo management and tracking system. On Time, The First Time.</p>
            <div class="space-x-6">
                <a href="{{ route('marketing.landing') }}" class="text-gray-300 hover:text-white transition-colors">Home</a>
                <a href="{{ route('login') }}" class="text-gray-300 hover:text-white transition-colors">Login</a>
                <a href="mailto:admin@rtexpress.co.tz" class="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
            <div class="border-t border-gray-600 mt-8 pt-8 text-gray-300">
                <p>&copy; {{ date('Y') }} RT Express. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>
