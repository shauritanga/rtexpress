<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RT Express - Professional Cargo Management</title>
    <meta name="description" content="RT Express - Professional cargo management and tracking system. On Time, The First Time.">
    
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

    {{-- Particles.js --}}
    <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>

    <style>
        .hero-section {
            height: 80vh;
            min-height: 600px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background-color: #C41E3A;
        }
        .hero-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
            background-attachment: scroll;
            opacity: 0;
            transition: opacity 2s ease-in-out, transform 8s ease-in-out;
            transform: scale(1);
        }
        .hero-bg.active {
            opacity: 1;
            transform: scale(1.1);
        }
        .hero-bg.land {
            background:
                linear-gradient(135deg, rgba(196, 30, 58, 0.4) 0%, rgba(153, 27, 46, 0.4) 100%),
                url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=90');
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
        }
        .hero-bg.sea {
            background:
                linear-gradient(135deg, rgba(196, 30, 58, 0.4) 0%, rgba(153, 27, 46, 0.4) 100%),
                url('https://images.unsplash.com/photo-1605745341112-85968b19335b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=90');
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
        }
        .hero-bg.air {
            background:
                linear-gradient(135deg, rgba(196, 30, 58, 0.4) 0%, rgba(153, 27, 46, 0.4) 100%),
                url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=90');
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
        }
        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><pattern id="logistics" patternUnits="userSpaceOnUse" width="100" height="100"><rect width="100" height="100" fill="none"/><g opacity="0.03"><path d="M20 40h40v8h-40z" fill="white"/><path d="M60 40h8v16h-8z" fill="white"/><circle cx="30" cy="52" r="3" fill="white"/><circle cx="50" cy="52" r="3" fill="white"/><path d="M15 30h50v8h-50z" fill="white"/><rect x="10" y="70" width="12" height="12" fill="white" rx="1"/><rect x="25" y="70" width="12" height="12" fill="white" rx="1"/><rect x="40" y="70" width="12" height="12" fill="white" rx="1"/></g></pattern></defs><rect width="100%" height="100%" fill="url(%23logistics)"/></svg>');
            background-size: 200px 200px;
            pointer-events: none;
            animation: float 20s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .hero-content {
            position: relative;
            z-index: 10;
            animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .card-shadow {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .btn-primary {
            background: linear-gradient(135deg, #C41E3A 0%, #991B2E 100%);
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(196, 30, 58, 0.4);
        }
        .hero-stats {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        @media (max-width: 768px) {
            .hero-section {
                height: 70vh;
                min-height: 500px;
            }
        }

        /* Service card icon rotation on hover */
        .service-card:hover .service-icon {
            transform: rotate(-45deg);
        }
        .service-icon {
            transition: transform 0.3s ease;
        }

        /* Enhanced animations and interactivity */
        .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-in-up.animate {
            opacity: 1;
            transform: translateY(0);
        }

        .scale-on-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .scale-on-hover:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .pulse-animation {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .gradient-text {
            background: linear-gradient(135deg, #C41E3A 0%, #991B2E 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .floating {
            animation: floating 3s ease-in-out infinite;
        }
        @keyframes floating {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .particles-bg {
            position: relative;
        }
        #particles-js {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        .glow-effect {
            position: relative;
        }
        .glow-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(196,30,58,0.1) 0%, rgba(153,27,46,0.1) 100%);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .glow-effect:hover::after {
            opacity: 1;
        }

        /* Back to top button */
        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #C41E3A 0%, #991B2E 100%);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(196, 30, 58, 0.3);
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            z-index: 1000;
        }
        .back-to-top.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .back-to-top:hover {
            transform: translateY(-5px) scale(1.1);
            box-shadow: 0 8px 30px rgba(196, 30, 58, 0.4);
        }
    </style>
</head>
<body class="font-sans bg-gray-50">
    {{-- Header --}}
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <img src="/images/logo.jpeg" alt="RT Express" class="h-10 w-10 rounded-lg">
                    <span class="ml-3 text-xl font-bold text-primary">RT EXPRESS</span>
                </div>
                <div class="hidden md:flex items-center space-x-6">
                    <a href="#about" class="text-gray-600 hover:text-primary transition-colors">About Us</a>
                    <a href="#branches" class="text-gray-600 hover:text-primary transition-colors">Branches</a>
                    <a href="#services" class="text-gray-600 hover:text-primary transition-colors">Services</a>
                    <a href="#booking" class="text-gray-600 hover:text-primary transition-colors">Booking</a>
                    <a href="#tracking" class="text-gray-600 hover:text-primary transition-colors">Tracking</a>
                    <a href="#contact" class="text-gray-600 hover:text-primary transition-colors">Contact Us</a>
                    <a href="{{ route('login') }}" class="btn-primary text-white px-4 py-2 rounded-lg font-medium">
                        Login
                    </a>
                </div>

                {{-- Mobile Menu Button --}}
                <div class="md:hidden">
                    <button id="mobile-menu-button" class="text-gray-600 hover:text-primary">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {{-- Mobile Menu --}}
            <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-200">
                <div class="px-4 py-2 space-y-2">
                    <a href="#about" class="block py-2 text-gray-600 hover:text-primary transition-colors">About Us</a>
                    <a href="#branches" class="block py-2 text-gray-600 hover:text-primary transition-colors">Branches</a>
                    <a href="#services" class="block py-2 text-gray-600 hover:text-primary transition-colors">Services</a>
                    <a href="#booking" class="block py-2 text-gray-600 hover:text-primary transition-colors">Booking</a>
                    <a href="#tracking" class="block py-2 text-gray-600 hover:text-primary transition-colors">Tracking</a>
                    <a href="#contact" class="block py-2 text-gray-600 hover:text-primary transition-colors">Contact Us</a>
                    <a href="{{ route('login') }}" class="block py-2 text-primary font-medium">Login</a>
                </div>
            </div>
        </div>
    </header>

    {{-- Hero Section --}}
    <section class="hero-section text-white">
        {{-- Rotating Background Images --}}
        <div class="hero-bg land active"></div>
        <div class="hero-bg sea"></div>
        <div class="hero-bg air"></div>

        <div class="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="mb-8">
                <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    Professional Cargo<br>
                    <span class="text-yellow-300">Management</span>
                </h1>
                <p class="text-xl md:text-3xl mb-8 text-white/95 font-light max-w-7xl mx-auto">
                    On Time, The First Time - Your Trusted Logistics Partner Across Tanzania
                </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-6 justify-center">
                <a href="#booking" class="bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl pulse-animation">
                    📦 Book Shipment
                </a>
                <a href="#tracking" class="border-3 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                    🔍 Track Package
                </a>
            </div>
        </div>
    </section>

    {{-- Features Section --}}
    <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose RT Express?</h2>
                <p class="text-lg text-gray-600">Professional logistics solutions for your business needs</p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">On-Time Delivery</h3>
                    <p class="text-gray-600">Reliable delivery schedules you can count on</p>
                </div>
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Secure Handling</h3>
                    <p class="text-gray-600">Your cargo is safe with our professional team</p>
                </div>
                <div class="text-center p-6">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Real-Time Tracking</h3>
                    <p class="text-gray-600">Track your shipments every step of the way</p>
                </div>
            </div>
        </div>
    </section>

    {{-- About Us Section --}}
    <section id="about" class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">About RT Express</h2>
                <p class="text-lg text-gray-600">Your trusted logistics partner in Tanzania</p>
            </div>

            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-6">Professional Cargo Management Since 2020</h3>
                    <p class="text-gray-600 mb-6">
                        RT Express has been serving Tanzania with reliable cargo management and logistics solutions.
                        We specialize in providing efficient, secure, and timely delivery services across the country
                        and beyond.
                    </p>
                    <p class="text-gray-600 mb-6">
                        Our commitment to excellence and customer satisfaction has made us a trusted partner for
                        businesses and individuals who need reliable shipping solutions. We combine modern technology
                        with experienced logistics professionals to ensure your cargo reaches its destination safely.
                    </p>
                    <div class="grid grid-cols-2 gap-6">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-primary mb-2">500+</div>
                            <div class="text-gray-600">Shipments Delivered</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-primary mb-2">99.8%</div>
                            <div class="text-gray-600">On-Time Delivery</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-primary mb-2">24/7</div>
                            <div class="text-gray-600">Customer Support</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-primary mb-2">100%</div>
                            <div class="text-gray-600">Secure Handling</div>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded-xl card-shadow p-8">
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Our Mission</h4>
                    <p class="text-gray-600 mb-6">
                        To provide reliable, efficient, and secure cargo management services that exceed our
                        customers' expectations while contributing to Tanzania's economic growth.
                    </p>
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Our Vision</h4>
                    <p class="text-gray-600 mb-6">
                        To be the leading logistics company in East Africa, known for innovation, reliability,
                        and exceptional customer service.
                    </p>
                    <h4 class="text-xl font-bold text-gray-900 mb-4">Our Values</h4>
                    <ul class="space-y-2 text-gray-600">
                        <li class="flex items-center">
                            <svg class="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Reliability and Trust
                        </li>
                        <li class="flex items-center">
                            <svg class="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Customer-Centric Service
                        </li>
                        <li class="flex items-center">
                            <svg class="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Innovation and Technology
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    {{-- Services Section --}}
    <section id="services" class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
                <p class="text-lg text-gray-600">Comprehensive logistics solutions for all your shipping needs</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="service-card bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow h-full scale-on-hover glow-effect fade-in-up" data-delay="0">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 floating">
                            <svg class="service-icon w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold mb-3 gradient-text">Land Transport</h3>
                            <p class="text-gray-600 mb-4">Reliable road transport services across Tanzania and neighboring countries.</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li>• Truck and trailer services</li>
                                <li>• Cross-border transport</li>
                                <li>• Door-to-door delivery</li>
                                <li>• Real-time tracking</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="service-card bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow h-full scale-on-hover glow-effect fade-in-up" data-delay="100">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 floating" style="animation-delay: 0.5s;">
                            <svg class="service-icon w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold mb-3 gradient-text">Sea Freight</h3>
                            <p class="text-gray-600 mb-4">Ocean freight services through Dar es Salaam port for international cargo.</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li>• Container shipping (FCL/LCL)</li>
                                <li>• Port handling services</li>
                                <li>• Customs clearance</li>
                                <li>• International routes</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="service-card bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow h-full scale-on-hover glow-effect fade-in-up" data-delay="200">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 floating" style="animation-delay: 1s;">
                            <svg class="service-icon w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold mb-3 gradient-text">Air Freight</h3>
                            <p class="text-gray-600 mb-4">Fast air cargo services for time-sensitive shipments worldwide.</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li>• Express air cargo</li>
                                <li>• International air freight</li>
                                <li>• Priority handling</li>
                                <li>• Temperature-controlled</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="service-card bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow h-full scale-on-hover glow-effect fade-in-up" data-delay="300">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 floating" style="animation-delay: 1.5s;">
                            <svg class="service-icon w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold mb-3 gradient-text">Logistics Solutions</h3>
                            <p class="text-gray-600 mb-4">Comprehensive logistics management and supply chain solutions.</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li>• Supply chain management</li>
                                <li>• Inventory optimization</li>
                                <li>• Distribution planning</li>
                                <li>• Logistics consulting</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="service-card bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow h-full scale-on-hover glow-effect fade-in-up" data-delay="400">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 floating" style="animation-delay: 2s;">
                            <svg class="service-icon w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold mb-3 gradient-text">Express Delivery</h3>
                            <p class="text-gray-600 mb-4">Fast and reliable express delivery services for urgent shipments.</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li>• Same-day delivery</li>
                                <li>• Next-day delivery</li>
                                <li>• Priority handling</li>
                                <li>• Real-time tracking</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="service-card bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow h-full scale-on-hover glow-effect fade-in-up" data-delay="500">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 floating" style="animation-delay: 2.5s;">
                            <svg class="service-icon w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-semibold mb-3 gradient-text">Warehouse Services</h3>
                            <p class="text-gray-600 mb-4">Secure storage and warehouse management solutions.</p>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li>• Climate-controlled storage</li>
                                <li>• Inventory management</li>
                                <li>• Pick and pack services</li>
                                <li>• 24/7 security monitoring</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- Branches Section --}}
    <section id="branches" class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Branches</h2>
                <p class="text-lg text-gray-600">Serving you across Tanzania with multiple convenient locations</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="bg-white rounded-xl card-shadow p-8 text-center">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4">Dar es Salaam (Head Office)</h3>
                    <div class="space-y-2 text-gray-600">
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            </svg>
                            Kariakoo, Dar es Salaam
                        </p>
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            +255 123 456 789
                        </p>
                        <p class="text-sm text-primary font-medium">Main Hub & Administration</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl card-shadow p-8 text-center">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4">Arusha Branch</h3>
                    <div class="space-y-2 text-gray-600">
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            </svg>
                            Central Market, Arusha
                        </p>
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            +255 987 654 321
                        </p>
                        <p class="text-sm text-primary font-medium">Northern Region Hub</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl card-shadow p-8 text-center">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4">Mwanza Branch</h3>
                    <div class="space-y-2 text-gray-600">
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            </svg>
                            Nyerere Road, Mwanza
                        </p>
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            +255 456 789 123
                        </p>
                        <p class="text-sm text-primary font-medium">Lake Zone Hub</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl card-shadow p-8 text-center">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4">Dodoma Branch</h3>
                    <div class="space-y-2 text-gray-600">
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            </svg>
                            Uhuru Street, Dodoma
                        </p>
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            +255 789 123 456
                        </p>
                        <p class="text-sm text-primary font-medium">Central Region Hub</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl card-shadow p-8 text-center">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4">Mbeya Branch</h3>
                    <div class="space-y-2 text-gray-600">
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            </svg>
                            Market Street, Mbeya
                        </p>
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            +255 321 654 987
                        </p>
                        <p class="text-sm text-primary font-medium">Southern Highlands Hub</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl card-shadow p-8 text-center">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4">Zanzibar Branch</h3>
                    <div class="space-y-2 text-gray-600">
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            </svg>
                            Stone Town, Zanzibar
                        </p>
                        <p class="flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            +255 654 321 987
                        </p>
                        <p class="text-sm text-primary font-medium">Island Hub</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- Booking Section --}}
    <section id="booking" class="py-16 bg-gray-50 particles-bg">
        <div id="particles-js"></div>
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Request a Shipment</h2>
                <p class="text-lg text-gray-600">Fill out the form below and we'll get back to you with a quote</p>
            </div>
            
            <div class="bg-white rounded-xl card-shadow p-8">
                @if(session('success'))
                    <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-green-700 font-medium">{{ session('success') }}</span>
                        </div>
                    </div>
                @endif

                @if(isset($errors) && $errors->any())
                    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div class="flex items-center mb-2">
                            <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-red-700 font-medium">Please correct the following errors:</span>
                        </div>
                        <ul class="list-disc list-inside text-red-600 text-sm">
                            @foreach((isset($errors) ? $errors->all() : []) as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form action="{{ route('marketing.shipment.request') }}" method="POST" class="space-y-6">
                    @csrf
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input type="text" id="name" name="name" value="{{ old('name') }}" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                            <input type="tel" id="phone" name="phone" value="{{ old('phone') }}" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                    </div>
                    
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>

                    <div>
                        <label for="item_description" class="block text-sm font-medium text-gray-700 mb-2">Item Description *</label>
                        <textarea id="item_description" name="item_description" rows="3" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">{{ old('item_description') }}</textarea>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label for="pickup_location" class="block text-sm font-medium text-gray-700 mb-2">Pickup Location *</label>
                            <input type="text" id="pickup_location" name="pickup_location" value="{{ old('pickup_location') }}" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div>
                            <label for="delivery_location" class="block text-sm font-medium text-gray-700 mb-2">Delivery Location *</label>
                            <input type="text" id="delivery_location" name="delivery_location" value="{{ old('delivery_location') }}" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                    </div>

                    <div>
                        <label for="additional_notes" class="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                        <textarea id="additional_notes" name="additional_notes" rows="3"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">{{ old('additional_notes') }}</textarea>
                    </div>

                    <button type="submit" class="w-full btn-primary text-white py-3 rounded-lg font-semibold">
                        Request Shipment Quote
                    </button>
                </form>
            </div>
        </div>
    </section>

    {{-- Tracking Section --}}
    <section id="tracking" class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Track Your Shipment</h2>
                <p class="text-lg text-gray-600">Enter your tracking number to get real-time updates</p>
            </div>
            
            <div class="bg-white rounded-xl card-shadow p-8">
                <form action="{{ route('marketing.track') }}" method="POST" class="space-y-6">
                    @csrf
                    <div>
                        <label for="tracking_number" class="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                        <input type="text" id="tracking_number" name="tracking_number" placeholder="Enter your tracking number"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    <button type="submit" class="w-full btn-primary text-white py-3 rounded-lg font-semibold">
                        Track Shipment
                    </button>
                </form>
            </div>
        </div>
    </section>

    {{-- Contact Us Section --}}
    <section id="contact" class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p class="text-lg text-gray-600">Get in touch with our team for any inquiries or support</p>
            </div>

            <div class="grid lg:grid-cols-2 gap-12">
                {{-- Contact Information --}}
                <div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-8">Get In Touch</h3>

                    <div class="space-y-6">
                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-lg font-semibold text-gray-900 mb-2">Head Office</h4>
                                <p class="text-gray-600">Kariakoo, Dar es Salaam</p>
                                <p class="text-gray-600">Tanzania</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-lg font-semibold text-gray-900 mb-2">Phone</h4>
                                <p class="text-gray-600">+255 123 456 789</p>
                                <p class="text-gray-600">+255 987 654 321</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-lg font-semibold text-gray-900 mb-2">Email</h4>
                                <p class="text-gray-600">admin@rtexpress.co.tz</p>
                                <p class="text-gray-600">info@rtexpress.co.tz</p>
                            </div>
                        </div>

                        <div class="flex items-start space-x-4">
                            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 class="text-lg font-semibold text-gray-900 mb-2">Business Hours</h4>
                                <p class="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                                <p class="text-gray-600">Saturday: 8:00 AM - 4:00 PM</p>
                                <p class="text-gray-600">Sunday: Closed</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8">
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Follow Us</h4>
                        <div class="flex space-x-4">
                            <a href="#" class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Follow us on X">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <a href="#" class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Follow us on Facebook">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a href="#" class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Contact us on WhatsApp">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                                </svg>
                            </a>
                            <a href="#" class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors" title="Follow us on Instagram">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {{-- Contact Form --}}
                <div class="bg-white rounded-xl card-shadow p-8">
                    <h3 class="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>

                    <form action="{{ route('marketing.contact') }}" method="POST" class="space-y-6">
                        @csrf
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label for="contact_name" class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input type="text" id="contact_name" name="name" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                            <div>
                                <label for="contact_email" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input type="email" id="contact_email" name="email" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                        </div>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label for="contact_phone" class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input type="tel" id="contact_phone" name="phone"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                            <div>
                                <label for="contact_subject" class="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                                <input type="text" id="contact_subject" name="subject" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>
                        </div>

                        <div>
                            <label for="contact_message" class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                            <textarea id="contact_message" name="message" rows="5" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                        </div>

                        <button type="submit" class="w-full btn-primary text-white py-3 rounded-lg font-semibold">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    {{-- Footer --}}
    <footer class="bg-primary text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {{-- Company Info --}}
                <div class="lg:col-span-1">
                    <div class="flex items-center mb-6">
                        <img src="/images/logo.jpeg" alt="RT Express" class="h-12 w-12 rounded-lg">
                        <span class="ml-3 text-2xl font-bold">RT EXPRESS</span>
                    </div>
                    <p class="text-white/90 leading-relaxed">
                        Professional cargo management and logistics solutions across Tanzania.
                        On Time, The First Time - Your trusted partner for all transport needs.
                    </p>
                </div>

                {{-- Quick Links --}}
                <div>
                    <h3 class="text-lg font-semibold mb-6">Quick Links</h3>
                    <ul class="space-y-3">
                        <li><a href="#about" class="text-white/80 hover:text-white transition-colors">About Us</a></li>
                        <li><a href="#services" class="text-white/80 hover:text-white transition-colors">Our Services</a></li>
                        <li><a href="#branches" class="text-white/80 hover:text-white transition-colors">Branch Locations</a></li>
                        <li><a href="#booking" class="text-white/80 hover:text-white transition-colors">Book Shipment</a></li>
                        <li><a href="#tracking" class="text-white/80 hover:text-white transition-colors">Track Package</a></li>
                        <li><a href="#contact" class="text-white/80 hover:text-white transition-colors">Contact Us</a></li>
                    </ul>
                </div>

                {{-- Services --}}
                <div>
                    <h3 class="text-lg font-semibold mb-6">Our Services</h3>
                    <ul class="space-y-3">
                        <li><a href="#services" class="text-white/80 hover:text-white transition-colors">Land Transport</a></li>
                        <li><a href="#services" class="text-white/80 hover:text-white transition-colors">Sea Freight</a></li>
                        <li><a href="#services" class="text-white/80 hover:text-white transition-colors">Air Freight</a></li>
                        <li><a href="#services" class="text-white/80 hover:text-white transition-colors">Logistics Solutions</a></li>
                        <li><a href="#services" class="text-white/80 hover:text-white transition-colors">Express Delivery</a></li>
                        <li><a href="#services" class="text-white/80 hover:text-white transition-colors">Warehouse Services</a></li>
                    </ul>
                </div>

                {{-- Contact Info --}}
                <div>
                    <h3 class="text-lg font-semibold mb-6">Contact Info</h3>
                    <div class="space-y-4">
                        <div class="flex items-start space-x-3">
                            <svg class="w-5 h-5 text-white/80 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <div>
                                <p class="text-white/80">Kariakoo, Dar es Salaam</p>
                                <p class="text-white/80">Tanzania</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3">
                            <svg class="w-5 h-5 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <p class="text-white/80">+255 123 456 789</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <svg class="w-5 h-5 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <p class="text-white/80">admin@rtexpress.co.tz</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <svg class="w-5 h-5 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p class="text-white/80">Mon-Sat: 8AM-6PM</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Bottom Section --}}
            <div class="pt-8 mt-8">
                <div class="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
                    <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-center">
                        <p class="text-white/80">&copy; {{ date('Y') }} RT Express. All rights reserved.</p>
                        <div class="flex space-x-6">
                            <a href="#" class="text-white/60 hover:text-white transition-colors text-sm">Privacy Policy</a>
                            <a href="#" class="text-white/60 hover:text-white transition-colors text-sm">Terms of Service</a>
                            <a href="#" class="text-white/60 hover:text-white transition-colors text-sm">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    {{-- Back to Top Button --}}
    <button class="back-to-top" id="backToTop" title="Back to top">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
    </button>

    {{-- JavaScript --}}
    <script>
        // Mobile menu toggle
        document.getElementById('mobile-menu-button').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    document.getElementById('mobile-menu').classList.add('hidden');
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileMenuButton = document.getElementById('mobile-menu-button');

            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });

        // Hero background rotation
        const heroBackgrounds = document.querySelectorAll('.hero-bg');
        let currentBg = 0;

        function rotateBackground() {
            // Remove active class from current background
            heroBackgrounds[currentBg].classList.remove('active');

            // Move to next background
            currentBg = (currentBg + 1) % heroBackgrounds.length;

            // Add active class to new background
            heroBackgrounds[currentBg].classList.add('active');
        }

        // Start rotation after page load
        setInterval(rotateBackground, 6000); // Change every 6 seconds

        // Enhanced scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, delay);
                }
            });
        }, observerOptions);

        // Observe all fade-in-up elements
        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });

        // Add parallax effect to hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroBackgrounds = document.querySelectorAll('.hero-bg');
            heroBackgrounds.forEach(bg => {
                bg.style.transform = `translateY(${scrolled * 0.5}px)`;
            });
        });

        // Add typing effect to hero title
        function typeWriter(element, text, speed = 100) {
            let i = 0;
            element.innerHTML = '';
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }
            type();
        }

        // Initialize typing effect after page load
        window.addEventListener('load', () => {
            const heroTitle = document.querySelector('.hero-section h1');
            if (heroTitle) {
                const originalText = heroTitle.textContent;
                typeWriter(heroTitle, originalText, 80);
            }
        });

        // Add smooth scroll behavior for better UX
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    document.getElementById('mobile-menu').classList.add('hidden');
                }
            });
        });

        // Add loading animation
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });

        // Back to top button functionality
        const backToTopButton = document.getElementById('backToTop');

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        // Smooth scroll to top when clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Initialize Particles.js
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                "particles": {
                    "number": {
                        "value": 80,
                        "density": {
                            "enable": true,
                            "value_area": 800
                        }
                    },
                    "color": {
                        "value": "#C41E3A"
                    },
                    "shape": {
                        "type": "circle",
                        "stroke": {
                            "width": 0,
                            "color": "#000000"
                        }
                    },
                    "opacity": {
                        "value": 0.5,
                        "random": false,
                        "anim": {
                            "enable": false,
                            "speed": 1,
                            "opacity_min": 0.1,
                            "sync": false
                        }
                    },
                    "size": {
                        "value": 3,
                        "random": true,
                        "anim": {
                            "enable": false,
                            "speed": 40,
                            "size_min": 0.1,
                            "sync": false
                        }
                    },
                    "line_linked": {
                        "enable": true,
                        "distance": 150,
                        "color": "#C41E3A",
                        "opacity": 0.4,
                        "width": 1
                    },
                    "move": {
                        "enable": true,
                        "speed": 6,
                        "direction": "none",
                        "random": false,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false,
                        "attract": {
                            "enable": false,
                            "rotateX": 600,
                            "rotateY": 1200
                        }
                    }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": {
                        "onhover": {
                            "enable": true,
                            "mode": "repulse"
                        },
                        "onclick": {
                            "enable": true,
                            "mode": "push"
                        },
                        "resize": true
                    },
                    "modes": {
                        "grab": {
                            "distance": 400,
                            "line_linked": {
                                "opacity": 1
                            }
                        },
                        "bubble": {
                            "distance": 400,
                            "size": 40,
                            "duration": 2,
                            "opacity": 8,
                            "speed": 3
                        },
                        "repulse": {
                            "distance": 200,
                            "duration": 0.4
                        },
                        "push": {
                            "particles_nb": 4
                        },
                        "remove": {
                            "particles_nb": 2
                        }
                    }
                },
                "retina_detect": true
            });
        }
    </script>
</body>
</html>
