import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    CheckCircle,
    Globe,
    HeadphonesIcon,
    MapPin,
    Package,
    Shield,
    Star,
    Truck,
    Zap,
    Users,
    Clock,
    Award,
    User,
    Phone
} from 'lucide-react';

interface Feature {
    title: string;
    description: string;
    icon: string;
}

interface Testimonial {
    name: string;
    company: string;
    content: string;
    rating: number;
}

interface Stats {
    total_shipments: string;
    countries_served: string;
    satisfied_customers: string;
    years_experience: string;
}

interface Props {
    stats: Stats;
    features: Feature[];
    testimonials: Testimonial[];
}

export default function MarketingHome({ stats, features, testimonials }: Props) {
    const getIcon = (iconName: string) => {
        const icons = {
            MapPin,
            Globe,
            Shield,
            HeadphonesIcon,
            Package,
            Truck,
            Zap,
            CheckCircle,
        };
        return icons[iconName as keyof typeof icons] || Package;
    };

    return (
        <MarketingLayout>
            <Head title="RT Express - Fast, Reliable Shipping Solutions" />
            
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background with Unsplash Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-indigo-900/90 z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Global shipping and logistics"
                        className="w-full h-full object-cover"
                    />
                    {/* Animated overlay particles */}
                    <div className="absolute inset-0 z-20">
                        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
                        <div className="absolute top-40 right-20 w-3 h-3 bg-indigo-400 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
                        <div className="absolute bottom-40 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
                        <div className="absolute bottom-20 right-40 w-4 h-4 bg-blue-300 rounded-full animate-float opacity-30" style={{animationDelay: '3s'}}></div>
                    </div>
                </div>

                <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-slideInLeft">
                            <div className="space-y-6">
                                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm animate-pulse-glow">
                                    🚀 Trusted by 5,000+ businesses worldwide
                                </Badge>
                                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
                                    Fast, Reliable
                                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Shipping</span>
                                    <br />
                                    <span className="text-3xl sm:text-4xl lg:text-5xl text-blue-200">Solutions</span>
                                </h1>
                                <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                                    Ship your packages worldwide with confidence. Real-time tracking,
                                    competitive rates, and exceptional customer service powered by cutting-edge technology.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-6">
                                <Button size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" asChild>
                                    <Link href="/register/customer">
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300" asChild>
                                    <Link href="/track">
                                        Track Package
                                        <Package className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                                <div className="text-center glass rounded-xl p-4 hover-lift">
                                    <div className="text-3xl font-bold text-cyan-400 animate-package-bounce">{stats.total_shipments}</div>
                                    <div className="text-sm text-blue-200">Shipments Delivered</div>
                                </div>
                                <div className="text-center glass rounded-xl p-4 hover-lift" style={{animationDelay: '0.2s'}}>
                                    <div className="text-3xl font-bold text-cyan-400">{stats.countries_served}</div>
                                    <div className="text-sm text-blue-200">Countries Served</div>
                                </div>
                                <div className="text-center glass rounded-xl p-4 hover-lift" style={{animationDelay: '0.4s'}}>
                                    <div className="text-3xl font-bold text-cyan-400">{stats.satisfied_customers}</div>
                                    <div className="text-sm text-blue-200">Happy Customers</div>
                                </div>
                                <div className="text-center glass rounded-xl p-4 hover-lift" style={{animationDelay: '0.6s'}}>
                                    <div className="text-3xl font-bold text-cyan-400">{stats.years_experience}</div>
                                    <div className="text-sm text-blue-200">Years Experience</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Animation/Illustration */}
                        <div className="relative animate-slideInRight">
                            <div className="relative">
                                {/* Main tracking card */}
                                <div className="glass rounded-3xl p-8 text-white shadow-2xl hover-lift">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold">Track Your Package</h3>
                                                <p className="text-blue-200">Real-time updates</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-4 rounded-xl animate-pulse-glow">
                                                <MapPin className="h-7 w-7" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-4 animate-fadeInUp">
                                                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-sm">Package picked up</span>
                                                <div className="flex-1 h-0.5 bg-green-400"></div>
                                            </div>
                                            <div className="flex items-center space-x-4 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                                                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                                                <span className="text-sm">In transit</span>
                                                <div className="flex-1 h-0.5 bg-green-400"></div>
                                            </div>
                                            <div className="flex items-center space-x-4 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                                                <div className="w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
                                                <span className="text-sm">Out for delivery</span>
                                                <div className="flex-1 h-0.5 bg-cyan-400/50"></div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 backdrop-blur-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-blue-200">Estimated delivery</span>
                                                <span className="font-semibold text-cyan-400">Today, 3:00 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-full animate-package-bounce shadow-lg">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-full animate-float shadow-lg" style={{animationDelay: '1s'}}>
                                    <Truck className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative overflow-hidden">
                {/* Background with subtle pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50"></div>
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-20 animate-fadeInUp">
                        <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                            ⚡ Industry Leading Features
                        </Badge>
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                            Why Choose
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> RT Express</span>?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            We provide comprehensive shipping solutions with cutting-edge technology,
                            global reach, and unmatched customer service that sets us apart from the competition.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = getIcon(feature.icon);
                            const gradients = [
                                'from-blue-500 to-cyan-500',
                                'from-indigo-500 to-purple-500',
                                'from-emerald-500 to-teal-500',
                                'from-orange-500 to-red-500'
                            ];
                            return (
                                <Card
                                    key={index}
                                    className="group text-center p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-scaleIn hover-lift"
                                    style={{animationDelay: `${index * 0.1}s`}}
                                >
                                    <CardContent className="space-y-6">
                                        <div className={`bg-gradient-to-br ${gradients[index]} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                                            <Icon className="h-10 w-10 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                        <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Services Preview */}
            <section className="py-24 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Modern logistics warehouse"
                        className="w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-50/95"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-20 animate-fadeInUp">
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2">
                            🚚 Premium Services
                        </Badge>
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                            Our
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Services</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Comprehensive shipping solutions designed for every business need, from express delivery to global freight
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-white/90 backdrop-blur-sm animate-slideInLeft hover-lift">
                            <CardContent className="space-y-6">
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                        <Zap className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                        FAST
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Express Shipping</h3>
                                <p className="text-gray-600 leading-relaxed">Lightning-fast delivery for urgent shipments with guaranteed delivery times and real-time tracking.</p>
                                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">From $25</div>
                                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300" asChild>
                                    <Link href="/services">
                                        Learn More
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-white/90 backdrop-blur-sm animate-fadeInUp hover-lift" style={{animationDelay: '0.2s'}}>
                            <CardContent className="space-y-6">
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                        <Package className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        POPULAR
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Standard Shipping</h3>
                                <p className="text-gray-600 leading-relaxed">Cost-effective solution for regular shipments with reliable delivery and comprehensive tracking.</p>
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">From $12</div>
                                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300" asChild>
                                    <Link href="/services">
                                        Learn More
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-white/90 backdrop-blur-sm animate-slideInRight hover-lift" style={{animationDelay: '0.4s'}}>
                            <CardContent className="space-y-6">
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                        <Globe className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        GLOBAL
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">International</h3>
                                <p className="text-gray-600 leading-relaxed">Global shipping solutions with customs clearance support and international compliance.</p>
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">From $35</div>
                                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300" asChild>
                                    <Link href="/services">
                                        Learn More
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Happy business team"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-20 animate-fadeInUp">
                        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 backdrop-blur-sm">
                            ⭐ Customer Success Stories
                        </Badge>
                        <h2 className="text-4xl sm:text-5xl font-bold text-white">
                            What Our
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Customers</span> Say
                        </h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Don't just take our word for it - hear from businesses who trust RT Express for their shipping needs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="group p-8 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 animate-scaleIn hover-lift"
                                style={{animationDelay: `${index * 0.2}s`}}
                            >
                                <CardContent className="space-y-6">
                                    <div className="flex space-x-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-6 w-6 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                                        ))}
                                    </div>
                                    <blockquote className="text-white text-lg leading-relaxed italic">
                                        "{testimonial.content}"
                                    </blockquote>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{testimonial.name}</div>
                                            <div className="text-sm text-blue-200">{testimonial.company}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-20 text-center animate-fadeInUp" style={{animationDelay: '0.8s'}}>
                        <p className="text-blue-200 mb-8">Trusted by industry leaders worldwide</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                            <div className="text-white font-bold text-lg">DHL Partner</div>
                            <div className="text-white font-bold text-lg">UPS Certified</div>
                            <div className="text-white font-bold text-lg">FedEx Alliance</div>
                            <div className="text-white font-bold text-lg">ISO 9001</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
                <div className="absolute inset-0 opacity-30">
                    <img
                        src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80"
                        alt="Global shipping network"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Animated elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-4 h-4 bg-cyan-400 rounded-full animate-float opacity-60"></div>
                    <div className="absolute top-40 right-32 w-3 h-3 bg-blue-300 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-32 left-40 w-5 h-5 bg-indigo-300 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
                    <div className="absolute bottom-20 right-20 w-2 h-2 bg-purple-300 rounded-full animate-float opacity-70" style={{animationDelay: '3s'}}></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="space-y-10 animate-fadeInUp">
                        <div className="space-y-6">
                            <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg backdrop-blur-sm animate-pulse-glow">
                                🚀 Ready to Get Started?
                            </Badge>
                            <h2 className="text-4xl sm:text-6xl font-bold text-white leading-tight">
                                Ready to Ship with
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> RT Express</span>?
                            </h2>
                            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                                Join thousands of businesses who trust RT Express for their shipping needs.
                                Get started today with our free account and experience the difference.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Button
                                size="lg"
                                className="text-lg px-12 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 animate-package-bounce"
                                asChild
                            >
                                <Link href="/register/customer">
                                    Start Shipping Today
                                    <ArrowRight className="ml-3 h-6 w-6" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-12 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300"
                                asChild
                            >
                                <Link href="/contact">
                                    Contact Sales
                                    <Phone className="ml-3 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        {/* Additional trust indicators */}
                        <div className="pt-12 border-t border-white/20">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-cyan-400">24/7</div>
                                    <div className="text-sm text-blue-200">Customer Support</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-cyan-400">99.9%</div>
                                    <div className="text-sm text-blue-200">Delivery Success</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-cyan-400">25+</div>
                                    <div className="text-sm text-blue-200">Countries Served</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-cyan-400">Free</div>
                                    <div className="text-sm text-blue-200">Account Setup</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
