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
    Heart,
    Users,
    Zap,
    Award,
    Target,
    Truck,
    Building
} from 'lucide-react';

interface Company {
    founded: string;
    headquarters: string;
    employees: string;
    warehouses: string;
}

interface Value {
    title: string;
    description: string;
    icon: string;
}

interface Props {
    company: Company;
    values: Value[];
}

export default function About({ company, values }: Props) {
    const getIcon = (iconName: string) => {
        const icons = {
            CheckCircle,
            Zap,
            Heart,
            Globe,
            Award,
            Target,
        };
        return icons[iconName as keyof typeof icons] || CheckCircle;
    };

    return (
        <MarketingLayout>
            <Head title="About Us - RT Express" />
            
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-indigo-800/80 to-purple-900/85 z-10"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80" 
                        alt="Modern office building and team" 
                        className="w-full h-full object-cover"
                    />
                    {/* Animated elements */}
                    <div className="absolute inset-0 z-20">
                        <div className="absolute top-20 left-10 w-3 h-3 bg-cyan-400 rounded-full animate-float opacity-60"></div>
                        <div className="absolute top-40 right-20 w-2 h-2 bg-blue-300 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
                        <div className="absolute bottom-40 left-20 w-4 h-4 bg-indigo-300 rounded-full animate-float opacity-50" style={{animationDelay: '2s'}}></div>
                    </div>
                </div>

                <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-slideInLeft">
                            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 backdrop-blur-sm">
                                🏢 About RT Express
                            </Badge>
                            <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight">
                                Connecting the 
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> World</span>
                                <br />Through Logistics
                            </h1>
                            <p className="text-xl text-blue-100 leading-relaxed">
                                For over a decade, RT Express has been at the forefront of global logistics, 
                                delivering excellence through innovation, reliability, and unmatched customer service.
                            </p>
                            <Button 
                                size="lg" 
                                className="text-lg px-10 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" 
                                asChild
                            >
                                <Link href="/contact">
                                    Get in Touch
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="animate-slideInRight">
                            <div className="grid grid-cols-2 gap-6">
                                <Card className="glass p-6 hover-lift">
                                    <CardContent className="text-center space-y-2">
                                        <div className="text-3xl font-bold text-cyan-400">{company.founded}</div>
                                        <div className="text-sm text-blue-200">Founded</div>
                                    </CardContent>
                                </Card>
                                <Card className="glass p-6 hover-lift">
                                    <CardContent className="text-center space-y-2">
                                        <div className="text-3xl font-bold text-cyan-400">{company.employees}</div>
                                        <div className="text-sm text-blue-200">Employees</div>
                                    </CardContent>
                                </Card>
                                <Card className="glass p-6 hover-lift">
                                    <CardContent className="text-center space-y-2">
                                        <div className="text-3xl font-bold text-cyan-400">{company.warehouses}</div>
                                        <div className="text-sm text-blue-200">Warehouses</div>
                                    </CardContent>
                                </Card>
                                <Card className="glass p-6 hover-lift">
                                    <CardContent className="text-center space-y-2">
                                        <div className="text-3xl font-bold text-cyan-400">25+</div>
                                        <div className="text-sm text-blue-200">Countries</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-slideInLeft">
                            <div className="space-y-6">
                                <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                                    🎯 Our Mission
                                </Badge>
                                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                                    Delivering 
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Excellence</span>
                                </h2>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    To revolutionize global logistics by providing innovative, reliable, and sustainable 
                                    shipping solutions that connect businesses and communities worldwide.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <span className="text-gray-700">Customer-first approach in everything we do</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <span className="text-gray-700">Sustainable and environmentally responsible practices</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    <span className="text-gray-700">Continuous innovation in logistics technology</span>
                                </div>
                            </div>
                        </div>

                        <div className="animate-slideInRight">
                            <img 
                                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80" 
                                alt="Team collaboration and innovation" 
                                className="rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-20 animate-fadeInUp">
                        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 backdrop-blur-sm">
                            💎 Our Values
                        </Badge>
                        <h2 className="text-4xl sm:text-5xl font-bold">
                            What Drives 
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Us</span>
                        </h2>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Our core values guide every decision we make and every service we provide
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => {
                            const Icon = getIcon(value.icon);
                            const gradients = [
                                'from-cyan-400 to-blue-500',
                                'from-emerald-400 to-teal-500',
                                'from-purple-400 to-pink-500',
                                'from-orange-400 to-red-500'
                            ];
                            
                            return (
                                <Card 
                                    key={index} 
                                    className="bg-white/10 backdrop-blur-md border-white/20 p-8 hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 animate-scaleIn hover-lift"
                                    style={{animationDelay: `${index * 0.1}s`}}
                                >
                                    <CardContent className="space-y-6 text-center">
                                        <div className={`bg-gradient-to-br ${gradients[index]} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg`}>
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold">{value.title}</h3>
                                        <p className="text-blue-100 leading-relaxed">{value.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-20 animate-fadeInUp">
                        <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                            👥 Our Team
                        </Badge>
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
                            Meet the 
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Experts</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our diverse team of logistics professionals brings decades of experience 
                            and passion for excellence to every shipment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-scaleIn hover-lift">
                            <CardContent className="space-y-6 text-center">
                                <div className="relative">
                                    <img 
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=387&q=80" 
                                        alt="CEO" 
                                        className="w-24 h-24 rounded-full mx-auto object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full">
                                        <Building className="h-4 w-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">John Smith</h3>
                                    <p className="text-blue-600 font-medium">Chief Executive Officer</p>
                                    <p className="text-gray-600 mt-2">Leading RT Express with 15+ years of logistics expertise</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-scaleIn hover-lift" style={{animationDelay: '0.2s'}}>
                            <CardContent className="space-y-6 text-center">
                                <div className="relative">
                                    <img 
                                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=387&q=80" 
                                        alt="CTO" 
                                        className="w-24 h-24 rounded-full mx-auto object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white p-2 rounded-full">
                                        <Zap className="h-4 w-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Sarah Johnson</h3>
                                    <p className="text-purple-600 font-medium">Chief Technology Officer</p>
                                    <p className="text-gray-600 mt-2">Driving innovation in logistics technology and automation</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="group p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-scaleIn hover-lift" style={{animationDelay: '0.4s'}}>
                            <CardContent className="space-y-6 text-center">
                                <div className="relative">
                                    <img 
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=387&q=80" 
                                        alt="COO" 
                                        className="w-24 h-24 rounded-full mx-auto object-cover shadow-lg group-hover:shadow-xl transition-shadow"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                                        <Truck className="h-4 w-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Michael Chen</h3>
                                    <p className="text-green-600 font-medium">Chief Operations Officer</p>
                                    <p className="text-gray-600 mt-2">Ensuring seamless operations across our global network</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="space-y-8 animate-fadeInUp">
                        <h2 className="text-4xl sm:text-5xl font-bold">
                            Ready to Work with Us?
                        </h2>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Join thousands of businesses who trust RT Express for their shipping needs. 
                            Let's build something great together.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button 
                                size="lg" 
                                className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300" 
                                asChild
                            >
                                <Link href="/register/customer">
                                    Get Started Today
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button 
                                size="lg" 
                                variant="outline" 
                                className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-300" 
                                asChild
                            >
                                <Link href="/contact">
                                    Contact Us
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
