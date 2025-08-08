import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MarketingLayout from '@/layouts/marketing-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Award, Building, CheckCircle, Globe, Heart, Target, Truck, Zap } from 'lucide-react';

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
            <section className="relative flex min-h-screen items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/85 via-indigo-800/80 to-purple-900/85"></div>
                    <img
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Modern office building and team"
                        className="h-full w-full object-cover"
                    />
                    {/* Animated elements */}
                    <div className="absolute inset-0 z-20">
                        <div className="animate-float absolute top-20 left-10 h-3 w-3 rounded-full bg-cyan-400 opacity-60"></div>
                        <div
                            className="animate-float absolute top-40 right-20 h-2 w-2 rounded-full bg-blue-300 opacity-40"
                            style={{ animationDelay: '1s' }}
                        ></div>
                        <div
                            className="animate-float absolute bottom-40 left-20 h-4 w-4 rounded-full bg-indigo-300 opacity-50"
                            style={{ animationDelay: '2s' }}
                        ></div>
                    </div>
                </div>

                <div className="relative z-30 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        <div className="animate-slideInLeft space-y-8">
                            <Badge className="border-white/30 bg-white/20 px-4 py-2 text-white backdrop-blur-sm">🏢 About RT Express</Badge>
                            <h1 className="text-5xl leading-tight font-bold text-white sm:text-7xl">
                                Connecting the
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> World</span>
                                <br />
                                Through Logistics
                            </h1>
                            <p className="text-xl leading-relaxed text-blue-100">
                                For over a decade, RT Express has been at the forefront of global logistics, delivering excellence through innovation,
                                reliability, and unmatched customer service.
                            </p>
                            <Button
                                size="lg"
                                className="transform bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-6 text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl"
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
                                <Card className="glass hover-lift p-6">
                                    <CardContent className="space-y-2 text-center">
                                        <div className="text-3xl font-bold text-cyan-400">{company.founded}</div>
                                        <div className="text-sm text-blue-200">Founded</div>
                                    </CardContent>
                                </Card>
                                <Card className="glass hover-lift p-6">
                                    <CardContent className="space-y-2 text-center">
                                        <div className="text-3xl font-bold text-cyan-400">{company.employees}</div>
                                        <div className="text-sm text-blue-200">Employees</div>
                                    </CardContent>
                                </Card>
                                <Card className="glass hover-lift p-6">
                                    <CardContent className="space-y-2 text-center">
                                        <div className="text-3xl font-bold text-cyan-400">{company.warehouses}</div>
                                        <div className="text-sm text-blue-200">Warehouses</div>
                                    </CardContent>
                                </Card>
                                <Card className="glass hover-lift p-6">
                                    <CardContent className="space-y-2 text-center">
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
            <section className="relative overflow-hidden py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50"></div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                        <div className="animate-slideInLeft space-y-8">
                            <div className="space-y-6">
                                <Badge className="bg-blue-100 px-4 py-2 text-blue-800">🎯 Our Mission</Badge>
                                <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                                    Delivering
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Excellence</span>
                                </h2>
                                <p className="text-xl leading-relaxed text-gray-600">
                                    To revolutionize global logistics by providing innovative, reliable, and sustainable shipping solutions that
                                    connect businesses and communities worldwide.
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
                                className="hover:shadow-3xl rounded-2xl shadow-2xl transition-shadow duration-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-24 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp mb-20 space-y-6 text-center">
                        <Badge className="border-white/30 bg-white/20 px-4 py-2 text-white backdrop-blur-sm">💎 Our Values</Badge>
                        <h2 className="text-4xl font-bold sm:text-5xl">
                            What Drives
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Us</span>
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-blue-100">
                            Our core values guide every decision we make and every service we provide
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, index) => {
                            const Icon = getIcon(value.icon);
                            const gradients = [
                                'from-cyan-400 to-blue-500',
                                'from-emerald-400 to-teal-500',
                                'from-purple-400 to-pink-500',
                                'from-orange-400 to-red-500',
                            ];

                            return (
                                <Card
                                    key={index}
                                    className="animate-scaleIn hover-lift border-white/20 bg-white/10 p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-white/20"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <CardContent className="space-y-6 text-center">
                                        <div
                                            className={`bg-gradient-to-br ${gradients[index]} mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg`}
                                        >
                                            <Icon className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold">{value.title}</h3>
                                        <p className="leading-relaxed text-blue-100">{value.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="relative overflow-hidden py-24">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp mb-20 space-y-6 text-center">
                        <Badge className="bg-blue-100 px-4 py-2 text-blue-800">👥 Our Team</Badge>
                        <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                            Meet the
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Experts</span>
                        </h2>
                        <p className="mx-auto max-w-3xl text-xl text-gray-600">
                            Our diverse team of logistics professionals brings decades of experience and passion for excellence to every shipment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <Card className="group animate-scaleIn hover-lift p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                            <CardContent className="space-y-6 text-center">
                                <div className="relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=387&q=80"
                                        alt="CEO"
                                        className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg transition-shadow group-hover:shadow-xl"
                                    />
                                    <div className="absolute -right-2 -bottom-2 rounded-full bg-blue-500 p-2 text-white">
                                        <Building className="h-4 w-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">John Smith</h3>
                                    <p className="font-medium text-blue-600">Chief Executive Officer</p>
                                    <p className="mt-2 text-gray-600">Leading RT Express with 15+ years of logistics expertise</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="group animate-scaleIn hover-lift p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <CardContent className="space-y-6 text-center">
                                <div className="relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=387&q=80"
                                        alt="CTO"
                                        className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg transition-shadow group-hover:shadow-xl"
                                    />
                                    <div className="absolute -right-2 -bottom-2 rounded-full bg-purple-500 p-2 text-white">
                                        <Zap className="h-4 w-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Sarah Johnson</h3>
                                    <p className="font-medium text-purple-600">Chief Technology Officer</p>
                                    <p className="mt-2 text-gray-600">Driving innovation in logistics technology and automation</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="group animate-scaleIn hover-lift p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <CardContent className="space-y-6 text-center">
                                <div className="relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=387&q=80"
                                        alt="COO"
                                        className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg transition-shadow group-hover:shadow-xl"
                                    />
                                    <div className="absolute -right-2 -bottom-2 rounded-full bg-green-500 p-2 text-white">
                                        <Truck className="h-4 w-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Michael Chen</h3>
                                    <p className="font-medium text-green-600">Chief Operations Officer</p>
                                    <p className="mt-2 text-gray-600">Ensuring seamless operations across our global network</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-24 text-white">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp space-y-8">
                        <h2 className="text-4xl font-bold sm:text-5xl">Ready to Work with Us?</h2>
                        <p className="mx-auto max-w-2xl text-xl text-blue-100">
                            Join thousands of businesses who trust RT Express for their shipping needs. Let's build something great together.
                        </p>
                        <div className="flex flex-col justify-center gap-6 sm:flex-row">
                            <Button
                                size="lg"
                                className="transform bg-white px-10 py-6 text-lg text-blue-600 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-2xl"
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
                                className="border-white/30 px-10 py-6 text-lg text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10"
                                asChild
                            >
                                <Link href="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
