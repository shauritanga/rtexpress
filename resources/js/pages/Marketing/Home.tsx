import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MarketingLayout from '@/layouts/marketing-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Globe, HeadphonesIcon, MapPin, Package, Phone, Shield, Star, Truck, User, Zap } from 'lucide-react';

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
            <section className="relative flex min-h-screen items-center overflow-hidden">
                {/* Background with Unsplash Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-indigo-900/90"></div>
                    <img
                        src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Global shipping and logistics"
                        className="h-full w-full object-cover"
                    />
                    {/* Animated overlay particles */}
                    <div className="absolute inset-0 z-20">
                        <div className="animate-float absolute top-20 left-10 h-2 w-2 rounded-full bg-blue-400 opacity-60"></div>
                        <div
                            className="animate-float absolute top-40 right-20 h-3 w-3 rounded-full bg-indigo-400 opacity-40"
                            style={{ animationDelay: '1s' }}
                        ></div>
                        <div
                            className="animate-float absolute bottom-40 left-20 h-2 w-2 rounded-full bg-cyan-400 opacity-50"
                            style={{ animationDelay: '2s' }}
                        ></div>
                        <div
                            className="animate-float absolute right-40 bottom-20 h-4 w-4 rounded-full bg-blue-300 opacity-30"
                            style={{ animationDelay: '3s' }}
                        ></div>
                    </div>
                </div>

                <div className="relative z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        <div className="animate-slideInLeft space-y-8">
                            <div className="space-y-6">
                                <Badge className="animate-pulse-glow border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                                    🚀 Trusted by 5,000+ businesses worldwide
                                </Badge>
                                <h1 className="text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-7xl">
                                    Fast, Reliable
                                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Shipping</span>
                                    <br />
                                    <span className="text-3xl text-blue-200 sm:text-4xl lg:text-5xl">Solutions</span>
                                </h1>
                                <p className="max-w-2xl text-xl leading-relaxed text-blue-100">
                                    Ship your packages worldwide with confidence. Real-time tracking, competitive rates, and exceptional customer
                                    service powered by cutting-edge technology.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="transform bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-6 text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl"
                                    asChild
                                >
                                    <Link href="/register/customer">
                                        Get Started Free
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/30 px-10 py-6 text-lg text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10"
                                    asChild
                                >
                                    <Link href="/track">
                                        Track Package
                                        <Package className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-6 pt-8 sm:grid-cols-4">
                                <div className="glass hover-lift rounded-xl p-4 text-center">
                                    <div className="animate-package-bounce text-3xl font-bold text-cyan-400">{stats.total_shipments}</div>
                                    <div className="text-sm text-blue-200">Shipments Delivered</div>
                                </div>
                                <div className="glass hover-lift rounded-xl p-4 text-center" style={{ animationDelay: '0.2s' }}>
                                    <div className="text-3xl font-bold text-cyan-400">{stats.countries_served}</div>
                                    <div className="text-sm text-blue-200">Countries Served</div>
                                </div>
                                <div className="glass hover-lift rounded-xl p-4 text-center" style={{ animationDelay: '0.4s' }}>
                                    <div className="text-3xl font-bold text-cyan-400">{stats.satisfied_customers}</div>
                                    <div className="text-sm text-blue-200">Happy Customers</div>
                                </div>
                                <div className="glass hover-lift rounded-xl p-4 text-center" style={{ animationDelay: '0.6s' }}>
                                    <div className="text-3xl font-bold text-cyan-400">{stats.years_experience}</div>
                                    <div className="text-sm text-blue-200">Years Experience</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Animation/Illustration */}
                        <div className="animate-slideInRight relative">
                            <div className="relative">
                                {/* Main tracking card */}
                                <div className="glass hover-lift rounded-3xl p-8 text-white shadow-2xl">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-semibold">Track Your Package</h3>
                                                <p className="text-blue-200">Real-time updates</p>
                                            </div>
                                            <div className="animate-pulse-glow rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-4">
                                                <MapPin className="h-7 w-7" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="animate-fadeInUp flex items-center space-x-4">
                                                <div className="h-4 w-4 animate-pulse rounded-full bg-green-400"></div>
                                                <span className="text-sm">Package picked up</span>
                                                <div className="h-0.5 flex-1 bg-green-400"></div>
                                            </div>
                                            <div className="animate-fadeInUp flex items-center space-x-4" style={{ animationDelay: '0.2s' }}>
                                                <div className="h-4 w-4 rounded-full bg-green-400"></div>
                                                <span className="text-sm">In transit</span>
                                                <div className="h-0.5 flex-1 bg-green-400"></div>
                                            </div>
                                            <div className="animate-fadeInUp flex items-center space-x-4" style={{ animationDelay: '0.4s' }}>
                                                <div className="h-4 w-4 animate-pulse rounded-full bg-cyan-400"></div>
                                                <span className="text-sm">Out for delivery</span>
                                                <div className="h-0.5 flex-1 bg-cyan-400/50"></div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-gradient-to-r from-white/10 to-white/5 p-4 backdrop-blur-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-blue-200">Estimated delivery</span>
                                                <span className="font-semibold text-cyan-400">Today, 3:00 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <div className="animate-package-bounce absolute -top-4 -right-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-3 shadow-lg">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <div
                                    className="animate-float absolute -bottom-4 -left-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-3 shadow-lg"
                                    style={{ animationDelay: '1s' }}
                                >
                                    <Truck className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative overflow-hidden py-24">
                {/* Background with subtle pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50"></div>
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp mb-20 space-y-6 text-center">
                        <Badge className="bg-blue-100 px-4 py-2 text-blue-800">⚡ Industry Leading Features</Badge>
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Why Choose
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> RT Express</span>?
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
                            We provide comprehensive shipping solutions with cutting-edge technology, global reach, and unmatched customer service
                            that sets us apart from the competition.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => {
                            const Icon = getIcon(feature.icon);
                            const gradients = [
                                'from-blue-500 to-cyan-500',
                                'from-indigo-500 to-purple-500',
                                'from-emerald-500 to-teal-500',
                                'from-orange-500 to-red-500',
                            ];
                            return (
                                <Card
                                    key={index}
                                    className="group animate-scaleIn hover-lift border-0 bg-white/80 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <CardContent className="space-y-6">
                                        <div
                                            className={`bg-gradient-to-br ${gradients[index]} mx-auto flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                                        >
                                            <Icon className="h-10 w-10 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                            {feature.title}
                                        </h3>
                                        <p className="leading-relaxed text-gray-600">{feature.description}</p>
                                        <div className="mx-auto h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Services Preview */}
            <section className="relative overflow-hidden py-24">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Modern logistics warehouse"
                        className="h-full w-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-50/95"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp mb-20 space-y-6 text-center">
                        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white">🚚 Premium Services</Badge>
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Our
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Services</span>
                        </h2>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            Comprehensive shipping solutions designed for every business need, from express delivery to global freight
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <Card className="group animate-slideInLeft hover-lift border-0 bg-white/90 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">
                            <CardContent className="space-y-6">
                                <div className="relative">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                                        <Zap className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 animate-pulse rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                                        FAST
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-emerald-600">Express Shipping</h3>
                                <p className="leading-relaxed text-gray-600">
                                    Lightning-fast delivery for urgent shipments with guaranteed delivery times and real-time tracking.
                                </p>
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent">
                                    From $25
                                </div>
                                <Button
                                    className="w-full transform bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 hover:scale-105 hover:from-emerald-600 hover:to-teal-700"
                                    asChild
                                >
                                    <Link href="/services">
                                        Learn More
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card
                            className="group animate-fadeInUp hover-lift border-0 bg-white/90 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <CardContent className="space-y-6">
                                <div className="relative">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                                        <Package className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                                        POPULAR
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">Standard Shipping</h3>
                                <p className="leading-relaxed text-gray-600">
                                    Cost-effective solution for regular shipments with reliable delivery and comprehensive tracking.
                                </p>
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
                                    From $12
                                </div>
                                <Button
                                    className="w-full transform bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-indigo-700"
                                    asChild
                                >
                                    <Link href="/services">
                                        Learn More
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card
                            className="group animate-slideInRight hover-lift border-0 bg-white/90 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <CardContent className="space-y-6">
                                <div className="relative">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                                        <Globe className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 rounded-full bg-purple-500 px-2 py-1 text-xs font-bold text-white">
                                        GLOBAL
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-purple-600">International</h3>
                                <p className="leading-relaxed text-gray-600">
                                    Global shipping solutions with customs clearance support and international compliance.
                                </p>
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
                                    From $35
                                </div>
                                <Button
                                    className="w-full transform bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-pink-700"
                                    asChild
                                >
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
            <section className="relative overflow-hidden py-24">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Happy business team"
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp mb-20 space-y-6 text-center">
                        <Badge className="border-white/30 bg-white/20 px-4 py-2 text-white backdrop-blur-sm">⭐ Customer Success Stories</Badge>
                        <h2 className="text-4xl font-bold text-white sm:text-5xl">
                            What Our
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Customers</span> Say
                        </h2>
                        <p className="mx-auto max-w-2xl text-xl text-blue-100">
                            Don't just take our word for it - hear from businesses who trust RT Express for their shipping needs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="group animate-scaleIn hover-lift border-white/20 bg-white/10 p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/20"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <CardContent className="space-y-6">
                                    <div className="flex space-x-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-6 w-6 animate-pulse fill-current text-yellow-400"
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                            />
                                        ))}
                                    </div>
                                    <blockquote className="text-lg leading-relaxed text-white italic">"{testimonial.content}"</blockquote>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
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
                    <div className="animate-fadeInUp mt-20 text-center" style={{ animationDelay: '0.8s' }}>
                        <p className="mb-8 text-blue-200">Trusted by industry leaders worldwide</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                            <div className="text-lg font-bold text-white">DHL Partner</div>
                            <div className="text-lg font-bold text-white">UPS Certified</div>
                            <div className="text-lg font-bold text-white">FedEx Alliance</div>
                            <div className="text-lg font-bold text-white">ISO 9001</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden py-24">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
                <div className="absolute inset-0 opacity-30">
                    <img
                        src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80"
                        alt="Global shipping network"
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Animated elements */}
                <div className="absolute inset-0">
                    <div className="animate-float absolute top-20 left-20 h-4 w-4 rounded-full bg-cyan-400 opacity-60"></div>
                    <div
                        className="animate-float absolute top-40 right-32 h-3 w-3 rounded-full bg-blue-300 opacity-40"
                        style={{ animationDelay: '1s' }}
                    ></div>
                    <div
                        className="animate-float absolute bottom-32 left-40 h-5 w-5 rounded-full bg-indigo-300 opacity-50"
                        style={{ animationDelay: '2s' }}
                    ></div>
                    <div
                        className="animate-float absolute right-20 bottom-20 h-2 w-2 rounded-full bg-purple-300 opacity-70"
                        style={{ animationDelay: '3s' }}
                    ></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp space-y-10">
                        <div className="space-y-6">
                            <Badge className="animate-pulse-glow border-white/30 bg-white/20 px-6 py-3 text-lg text-white backdrop-blur-sm">
                                🚀 Ready to Get Started?
                            </Badge>
                            <h2 className="text-4xl leading-tight font-bold text-white sm:text-6xl">
                                Ready to Ship with
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> RT Express</span>?
                            </h2>
                            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-blue-100">
                                Join thousands of businesses who trust RT Express for their shipping needs. Get started today with our free account
                                and experience the difference.
                            </p>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                            <Button
                                size="lg"
                                className="animate-package-bounce transform bg-gradient-to-r from-cyan-500 to-blue-600 px-12 py-6 text-lg shadow-2xl transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-blue-700 hover:shadow-cyan-500/25"
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
                                className="border-white/30 px-12 py-6 text-lg text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10"
                                asChild
                            >
                                <Link href="/contact">
                                    Contact Sales
                                    <Phone className="ml-3 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        {/* Additional trust indicators */}
                        <div className="border-t border-white/20 pt-12">
                            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
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
