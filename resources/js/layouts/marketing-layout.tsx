import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Menu,
    X,
    Package,
    MapPin,
    Phone,
    Mail,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Truck,
    Plane,
    Ship
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
}

// Floating particles component
const FloatingParticles = () => {
    const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute opacity-20 animate-float"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: '6s'
                    }}
                >
                    <div className="w-full h-full bg-blue-500 rounded-full"></div>
                </div>
            ))}
        </div>
    );
};

export default function MarketingLayout({ children }: Props) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { url } = usePage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Services', href: '/services' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Track Package', href: '/track' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return url === '/';
        }
        return url.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-white relative">
            <FloatingParticles />

            {/* Header */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg border-b'
                    : 'bg-white/90 backdrop-blur-sm shadow-sm border-b'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-3 group">
                                <div className="relative">
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                        <Package className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">RT Express</span>
                                    <span className="text-xs text-gray-500 -mt-1">Global Shipping</span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`text-sm font-medium transition-colors ${
                                        isActive(item.href)
                                            ? 'text-blue-600'
                                            : 'text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register/customer">Get Started</Link>
                            </Button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                                        isActive(item.href)
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-4 pb-2 border-t border-gray-200">
                                <div className="flex flex-col space-y-2">
                                    <Button variant="ghost" className="justify-start" asChild>
                                        <Link href="/login">Sign In</Link>
                                    </Button>
                                    <Button className="justify-start" asChild>
                                        <Link href="/register/customer">Get Started</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-bold">RT Express</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Your trusted partner for fast, reliable, and secure shipping solutions worldwide.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Facebook className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Services</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/services" className="hover:text-white transition-colors">Express Shipping</Link></li>
                                <li><Link href="/services" className="hover:text-white transition-colors">Standard Shipping</Link></li>
                                <li><Link href="/services" className="hover:text-white transition-colors">International Shipping</Link></li>
                                <li><Link href="/services" className="hover:text-white transition-colors">Freight Services</Link></li>
                                <li><Link href="/track" className="hover:text-white transition-colors">Package Tracking</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">News</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact</h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4" />
                                    <span>+1 (555) 123-4567</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4" />
                                    <span>support@rtexpress.com</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <MapPin className="h-4 w-4 mt-0.5" />
                                    <span>123 Express Avenue<br />New York, NY 10001</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-400">
                            © 2025 RT Express. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
