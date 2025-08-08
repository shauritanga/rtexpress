import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Menu, Package, Phone, Twitter, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Props {
    children: React.ReactNode;
}

// Floating particles component
const FloatingParticles = () => {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            delay: Math.random() * 5,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="animate-float absolute opacity-20"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: '6s',
                    }}
                >
                    <div className="h-full w-full rounded-full bg-blue-500"></div>
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
        <div className="relative min-h-screen bg-white">
            <FloatingParticles />

            {/* Header */}
            <header
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    scrolled ? 'border-b bg-white/95 shadow-lg backdrop-blur-md' : 'border-b bg-white/90 shadow-sm backdrop-blur-sm'
                }`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="group flex items-center space-x-3">
                                <div className="relative">
                                    <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                                        <Package className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-orange-500"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">RT Express</span>
                                    <span className="-mt-1 text-xs text-gray-500">Global Shipping</span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden space-x-8 md:flex">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`text-sm font-medium transition-colors ${
                                        isActive(item.href) ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden items-center space-x-4 md:flex">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/register/customer">Get Started</Link>
                            </Button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="border-t bg-white md:hidden">
                        <div className="space-y-1 px-2 pt-2 pb-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                                        isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 pt-4 pb-2">
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
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {/* Company Info */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="rounded-lg bg-blue-600 p-2">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-lg font-bold">RT Express</span>
                            </div>
                            <p className="text-sm text-gray-400">Your trusted partner for fast, reliable, and secure shipping solutions worldwide.</p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                    <Facebook className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-gray-400 transition-colors hover:text-white">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Services</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link href="/services" className="transition-colors hover:text-white">
                                        Express Shipping
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/services" className="transition-colors hover:text-white">
                                        Standard Shipping
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/services" className="transition-colors hover:text-white">
                                        International Shipping
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/services" className="transition-colors hover:text-white">
                                        Freight Services
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/track" className="transition-colors hover:text-white">
                                        Package Tracking
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Company</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link href="/about" className="transition-colors hover:text-white">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pricing" className="transition-colors hover:text-white">
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="transition-colors hover:text-white">
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" className="transition-colors hover:text-white">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="transition-colors hover:text-white">
                                        News
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
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
                                    <MapPin className="mt-0.5 h-4 w-4" />
                                    <span>
                                        123 Express Avenue
                                        <br />
                                        New York, NY 10001
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
                        <p className="text-sm text-gray-400">© 2025 RT Express. All rights reserved.</p>
                        <div className="mt-4 flex space-x-6 md:mt-0">
                            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Terms of Service
                            </a>
                            <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
