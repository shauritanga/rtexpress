import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MarketingLayout from '@/layouts/marketing-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Clock, Globe, Package, Plane, Shield, Ship, Star, Truck, Zap } from 'lucide-react';

interface Service {
    title: string;
    description: string;
    features: string[];
    icon: string;
    price_from: string;
}

interface Props {
    services: Service[];
}

export default function Services({ services }: Props) {
    const getIcon = (iconName: string) => {
        const icons = {
            Zap,
            Package,
            Globe,
            Truck,
            Plane,
            Ship,
        };
        return icons[iconName as keyof typeof icons] || Package;
    };

    return (
        <MarketingLayout>
            <Head title="Our Services - RT Express" />

            {/* Hero Section */}
            <section className="relative flex min-h-screen items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/90 via-indigo-800/85 to-purple-900/90"></div>
                    <img
                        src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Global logistics and shipping services"
                        className="h-full w-full object-cover"
                    />
                    {/* Animated elements */}
                    <div className="absolute inset-0 z-20">
                        <div className="animate-float absolute top-20 left-10">
                            <Plane className="h-8 w-8 text-blue-400 opacity-60" />
                        </div>
                        <div className="animate-truck-move absolute top-40 right-20">
                            <Truck className="h-6 w-6 text-cyan-400 opacity-50" />
                        </div>
                        <div className="animate-float absolute bottom-40 left-20" style={{ animationDelay: '2s' }}>
                            <Ship className="h-7 w-7 text-indigo-400 opacity-40" />
                        </div>
                    </div>
                </div>

                <div className="relative z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp space-y-8 text-center">
                        <Badge className="animate-pulse-glow border-white/30 bg-white/20 px-6 py-3 text-lg text-white backdrop-blur-sm">
                            🚚 Premium Shipping Services
                        </Badge>
                        <h1 className="text-5xl leading-tight font-bold text-white sm:text-7xl">
                            Our
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Services</span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-blue-100">
                            Comprehensive shipping solutions designed for every business need, from express delivery to global freight with
                            cutting-edge technology.
                        </p>
                        <Button
                            size="lg"
                            className="transform bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-6 text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl"
                            asChild
                        >
                            <Link href="/register/customer">
                                Get Started Today
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="relative overflow-hidden py-24">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50"></div>
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp mb-20 space-y-6 text-center">
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Choose Your
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Perfect</span> Service
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">
                            From lightning-fast express delivery to cost-effective standard shipping, we have the right solution for your business
                            needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                        {services.map((service, index) => {
                            const Icon = getIcon(service.icon);
                            const gradients = [
                                'from-emerald-500 to-teal-600',
                                'from-blue-500 to-indigo-600',
                                'from-purple-500 to-pink-600',
                                'from-orange-500 to-red-600',
                            ];
                            const isPopular = index === 1; // Make second service popular

                            return (
                                <Card
                                    key={index}
                                    className={`group animate-scaleIn hover-lift relative border-0 bg-white/90 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                                        isPopular ? 'ring-opacity-50 ring-2 ring-blue-500' : ''
                                    }`}
                                    style={{ animationDelay: `${index * 0.2}s` }}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white shadow-lg">
                                                ⭐ Most Popular
                                            </Badge>
                                        </div>
                                    )}

                                    <CardHeader className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div
                                                className={`bg-gradient-to-br ${gradients[index]} flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                                            >
                                                <Icon className="h-8 w-8 text-white" />
                                            </div>
                                            <div className="text-right">
                                                <div
                                                    className={`bg-gradient-to-r text-3xl font-bold ${gradients[index]} bg-clip-text text-transparent`}
                                                >
                                                    {service.price_from}
                                                </div>
                                                <div className="text-sm text-gray-500">Starting from</div>
                                            </div>
                                        </div>

                                        <div>
                                            <CardTitle className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                                {service.title}
                                            </CardTitle>
                                            <CardDescription className="mt-2 text-lg leading-relaxed text-gray-600">
                                                {service.description}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            {service.features.map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-center space-x-3">
                                                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            className={`w-full bg-gradient-to-r ${gradients[index]} transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                                            asChild
                                        >
                                            <Link href="/register/customer">
                                                Choose This Service
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Comparison */}
            <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-24 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp mb-20 space-y-6 text-center">
                        <h2 className="text-4xl font-bold sm:text-5xl">
                            Why Choose
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> RT Express</span>?
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-blue-100">Industry-leading features that set us apart from the competition</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <Card className="hover-lift border-white/20 bg-white/10 p-8 backdrop-blur-md transition-all duration-300 hover:bg-white/20">
                            <CardContent className="space-y-4 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500">
                                    <Clock className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">Real-Time Tracking</h3>
                                <p className="text-blue-100">Advanced GPS tracking with live updates and delivery notifications</p>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift border-white/20 bg-white/10 p-8 backdrop-blur-md transition-all duration-300 hover:bg-white/20">
                            <CardContent className="space-y-4 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">Secure Handling</h3>
                                <p className="text-blue-100">Comprehensive insurance coverage and secure handling protocols</p>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift border-white/20 bg-white/10 p-8 backdrop-blur-md transition-all duration-300 hover:bg-white/20">
                            <CardContent className="space-y-4 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500">
                                    <Star className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">24/7 Support</h3>
                                <p className="text-blue-100">Round-the-clock customer support with dedicated account managers</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>

                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp space-y-8">
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">Ready to Get Started?</h2>
                        <p className="mx-auto max-w-2xl text-xl text-gray-600">
                            Join thousands of businesses who trust RT Express for their shipping needs. Create your free account today.
                        </p>
                        <div className="flex flex-col justify-center gap-6 sm:flex-row">
                            <Button
                                size="lg"
                                className="transform bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-6 text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl"
                                asChild
                            >
                                <Link href="/register/customer">
                                    Start Shipping Today
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-gray-300 px-10 py-6 text-lg transition-all duration-300 hover:scale-105 hover:bg-gray-50"
                                asChild
                            >
                                <Link href="/contact">Contact Sales</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
