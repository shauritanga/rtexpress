import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowRight,
    CheckCircle,
    Globe,
    Package,
    Truck,
    Zap,
    Clock,
    Shield,
    Star,
    Plane,
    Ship
} from 'lucide-react';

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
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-800/85 to-purple-900/90 z-10"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80" 
                        alt="Global logistics and shipping services" 
                        className="w-full h-full object-cover"
                    />
                    {/* Animated elements */}
                    <div className="absolute inset-0 z-20">
                        <div className="absolute top-20 left-10 animate-float">
                            <Plane className="h-8 w-8 text-blue-400 opacity-60" />
                        </div>
                        <div className="absolute top-40 right-20 animate-truck-move">
                            <Truck className="h-6 w-6 text-cyan-400 opacity-50" />
                        </div>
                        <div className="absolute bottom-40 left-20 animate-float" style={{animationDelay: '2s'}}>
                            <Ship className="h-7 w-7 text-indigo-400 opacity-40" />
                        </div>
                    </div>
                </div>

                <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="text-center space-y-8 animate-fadeInUp">
                        <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg backdrop-blur-sm animate-pulse-glow">
                            🚚 Premium Shipping Services
                        </Badge>
                        <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight">
                            Our 
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Services</span>
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            Comprehensive shipping solutions designed for every business need, 
                            from express delivery to global freight with cutting-edge technology.
                        </p>
                        <Button 
                            size="lg" 
                            className="text-lg px-10 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" 
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
            <section className="py-24 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50"></div>
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-20 animate-fadeInUp">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                            Choose Your 
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Perfect</span> Service
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From lightning-fast express delivery to cost-effective standard shipping, 
                            we have the right solution for your business needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {services.map((service, index) => {
                            const Icon = getIcon(service.icon);
                            const gradients = [
                                'from-emerald-500 to-teal-600',
                                'from-blue-500 to-indigo-600',
                                'from-purple-500 to-pink-600',
                                'from-orange-500 to-red-600'
                            ];
                            const isPopular = index === 1; // Make second service popular
                            
                            return (
                                <Card 
                                    key={index} 
                                    className={`group relative p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-white/90 backdrop-blur-sm animate-scaleIn hover-lift ${
                                        isPopular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                                    }`}
                                    style={{animationDelay: `${index * 0.2}s`}}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 shadow-lg">
                                                ⭐ Most Popular
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    <CardHeader className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className={`bg-gradient-to-br ${gradients[index]} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                                                <Icon className="h-8 w-8 text-white" />
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-3xl font-bold bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}>
                                                    {service.price_from}
                                                </div>
                                                <div className="text-sm text-gray-500">Starting from</div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {service.title}
                                            </CardTitle>
                                            <CardDescription className="text-gray-600 text-lg mt-2 leading-relaxed">
                                                {service.description}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            {service.features.map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-center space-x-3">
                                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <Button 
                                            className={`w-full bg-gradient-to-r ${gradients[index]} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
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
            <section className="py-24 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-20 animate-fadeInUp">
                        <h2 className="text-4xl sm:text-5xl font-bold">
                            Why Choose 
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> RT Express</span>?
                        </h2>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Industry-leading features that set us apart from the competition
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 hover:bg-white/20 transition-all duration-300 hover-lift">
                            <CardContent className="space-y-4 text-center">
                                <div className="bg-gradient-to-br from-cyan-400 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                                    <Clock className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">Real-Time Tracking</h3>
                                <p className="text-blue-100">Advanced GPS tracking with live updates and delivery notifications</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 hover:bg-white/20 transition-all duration-300 hover-lift">
                            <CardContent className="space-y-4 text-center">
                                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">Secure Handling</h3>
                                <p className="text-blue-100">Comprehensive insurance coverage and secure handling protocols</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 hover:bg-white/20 transition-all duration-300 hover-lift">
                            <CardContent className="space-y-4 text-center">
                                <div className="bg-gradient-to-br from-purple-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
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
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>
                
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="space-y-8 animate-fadeInUp">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Join thousands of businesses who trust RT Express for their shipping needs. 
                            Create your free account today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button 
                                size="lg" 
                                className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" 
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
                                className="text-lg px-10 py-6 border-gray-300 hover:bg-gray-50 hover:scale-105 transition-all duration-300" 
                                asChild
                            >
                                <Link href="/contact">
                                    Contact Sales
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
