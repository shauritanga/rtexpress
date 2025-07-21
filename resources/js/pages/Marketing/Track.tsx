import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Search,
    Package,
    MapPin,
    Clock,
    Truck,
    CheckCircle,
    AlertCircle,
    History
} from 'lucide-react';

interface Props {
    recentSearches: string[];
}

export default function Track({ recentSearches }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tracking_number: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/track');
    };

    const handleRecentSearch = (trackingNumber: string) => {
        setData('tracking_number', trackingNumber);
    };

    return (
        <MarketingLayout>
            <Head title="Track Your Package - RT Express" />
            
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-indigo-800/80 to-purple-900/85 z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Package tracking and delivery"
                        className="w-full h-full object-cover"
                    />
                    {/* Animated tracking elements */}
                    <div className="absolute inset-0 z-20">
                        <div className="absolute top-20 left-10 animate-truck-move">
                            <Truck className="h-8 w-8 text-blue-400 opacity-60" />
                        </div>
                        <div className="absolute top-40 right-20 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-40 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-float"></div>
                        <div className="absolute bottom-20 right-40 w-4 h-4 bg-blue-300 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
                    </div>
                </div>

                <div className="relative z-30 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="text-center space-y-10 animate-fadeInUp">
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-package-bounce">
                                    <Package className="h-12 w-12 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight">
                                Track Your
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Package</span>
                            </h1>
                            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                                Enter your tracking number below to get real-time updates on your shipment's location,
                                delivery status, and estimated arrival time with our advanced tracking system.
                            </p>
                        </div>

                        {/* Tracking Form */}
                        <Card className="max-w-3xl mx-auto glass border-white/20 shadow-2xl animate-scaleIn">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl text-white">Enter Tracking Number</CardTitle>
                                <CardDescription className="text-blue-200 text-lg">
                                    Your tracking number is typically 10-15 characters long (e.g., RT123456789)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-300" />
                                        <Input
                                            type="text"
                                            placeholder="Enter tracking number (e.g., RT123456789)"
                                            value={data.tracking_number}
                                            onChange={(e) => setData('tracking_number', e.target.value.toUpperCase())}
                                            className={`pl-12 text-xl py-8 bg-white/10 border-white/30 text-white placeholder:text-blue-200 focus:bg-white/20 focus:border-cyan-400 transition-all duration-300 ${errors.tracking_number ? 'border-red-400' : ''}`}
                                        />
                                    </div>

                                    {errors.tracking_number && (
                                        <Alert variant="destructive" className="bg-red-500/20 border-red-400 text-red-200">
                                            <AlertCircle className="h-5 w-5" />
                                            <AlertDescription className="text-red-200">
                                                {errors.tracking_number}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full text-xl py-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                Tracking Your Package...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-3 h-6 w-6" />
                                                Track Package Now
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <Card className="max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center">
                                        <History className="h-5 w-5 mr-2" />
                                        Recent Searches
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((trackingNumber, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRecentSearch(trackingNumber)}
                                                className="text-sm"
                                            >
                                                {trackingNumber}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </section>

            {/* How to Track Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            How to Track Your Package
                        </h2>
                        <p className="text-xl text-gray-600">
                            Follow these simple steps to track your shipment
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center p-6">
                            <CardContent className="space-y-4">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <Search className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold">1. Enter Tracking Number</h3>
                                <p className="text-gray-600">
                                    Find your tracking number in your shipping confirmation email or receipt and enter it above.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center p-6">
                            <CardContent className="space-y-4">
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <MapPin className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold">2. View Real-time Updates</h3>
                                <p className="text-gray-600">
                                    See your package's current location and status with detailed tracking information.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center p-6">
                            <CardContent className="space-y-4">
                                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold">3. Get Delivery Updates</h3>
                                <p className="text-gray-600">
                                    Receive notifications about delivery attempts and estimated delivery times.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Tracking Features */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Advanced Tracking Features
                                </h2>
                                <p className="text-xl text-gray-600">
                                    Get detailed insights into your shipment's journey with our comprehensive tracking system.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <MapPin className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Real-time GPS Tracking</h3>
                                        <p className="text-gray-600">See exactly where your package is at any moment with live GPS updates.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delivery Time Estimates</h3>
                                        <p className="text-gray-600">Get accurate delivery time predictions based on current location and traffic.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-purple-100 p-2 rounded-lg">
                                        <Truck className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delivery Notifications</h3>
                                        <p className="text-gray-600">Receive SMS and email alerts for pickup, transit, and delivery updates.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Package Status</h3>
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        In Transit
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="font-medium">Package picked up</div>
                                            <div className="text-sm text-gray-500">New York, NY - 2 days ago</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="font-medium">In transit</div>
                                            <div className="text-sm text-gray-500">Chicago, IL - 1 day ago</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                        <div className="flex-1">
                                            <div className="font-medium">Out for delivery</div>
                                            <div className="text-sm text-gray-500">Los Angeles, CA - Today</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-500">Delivered</div>
                                            <div className="text-sm text-gray-400">Estimated: Today, 3:00 PM</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Estimated delivery</span>
                                        <span className="font-semibold text-blue-600">Today, 3:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Help Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Need Help with Tracking?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Can't find your tracking number or having issues? We're here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                                Contact Support
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                                FAQ
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
