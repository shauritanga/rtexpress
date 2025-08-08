import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MarketingLayout from '@/layouts/marketing-layout';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, History, MapPin, Package, Search, Truck } from 'lucide-react';
import React from 'react';

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
            <section className="relative flex min-h-screen items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/85 via-indigo-800/80 to-purple-900/85"></div>
                    <img
                        src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                        alt="Package tracking and delivery"
                        className="h-full w-full object-cover"
                    />
                    {/* Animated tracking elements */}
                    <div className="absolute inset-0 z-20">
                        <div className="animate-truck-move absolute top-20 left-10">
                            <Truck className="h-8 w-8 text-blue-400 opacity-60" />
                        </div>
                        <div className="absolute top-40 right-20 h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
                        <div className="animate-float absolute bottom-40 left-20 h-2 w-2 rounded-full bg-cyan-400"></div>
                        <div
                            className="animate-float absolute right-40 bottom-20 h-4 w-4 rounded-full bg-blue-300"
                            style={{ animationDelay: '2s' }}
                        ></div>
                    </div>
                </div>

                <div className="relative z-30 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-fadeInUp space-y-10 text-center">
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="animate-package-bounce mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl">
                                    <Package className="h-12 w-12 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 h-6 w-6 animate-pulse rounded-full bg-orange-500"></div>
                            </div>
                            <h1 className="text-5xl leading-tight font-bold text-white sm:text-7xl">
                                Track Your
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Package</span>
                            </h1>
                            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-blue-100">
                                Enter your tracking number below to get real-time updates on your shipment's location, delivery status, and estimated
                                arrival time with our advanced tracking system.
                            </p>
                        </div>

                        {/* Tracking Form */}
                        <Card className="glass animate-scaleIn mx-auto max-w-3xl border-white/20 shadow-2xl">
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl text-white">Enter Tracking Number</CardTitle>
                                <CardDescription className="text-lg text-blue-200">
                                    Your tracking number is typically 10-15 characters long (e.g., RT123456789)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-4 h-6 w-6 -translate-y-1/2 transform text-blue-300" />
                                        <Input
                                            type="text"
                                            placeholder="Enter tracking number (e.g., RT123456789)"
                                            value={data.tracking_number}
                                            onChange={(e) => setData('tracking_number', e.target.value.toUpperCase())}
                                            className={`border-white/30 bg-white/10 py-8 pl-12 text-xl text-white transition-all duration-300 placeholder:text-blue-200 focus:border-cyan-400 focus:bg-white/20 ${errors.tracking_number ? 'border-red-400' : ''}`}
                                        />
                                    </div>

                                    {errors.tracking_number && (
                                        <Alert variant="destructive" className="border-red-400 bg-red-500/20 text-red-200">
                                            <AlertCircle className="h-5 w-5" />
                                            <AlertDescription className="text-red-200">{errors.tracking_number}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full transform bg-gradient-to-r from-cyan-500 to-blue-600 py-8 text-xl shadow-xl transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
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
                            <Card className="mx-auto max-w-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <History className="mr-2 h-5 w-5" />
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
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 space-y-4 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How to Track Your Package</h2>
                        <p className="text-xl text-gray-600">Follow these simple steps to track your shipment</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <Card className="p-6 text-center">
                            <CardContent className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <Search className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold">1. Enter Tracking Number</h3>
                                <p className="text-gray-600">
                                    Find your tracking number in your shipping confirmation email or receipt and enter it above.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="p-6 text-center">
                            <CardContent className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <MapPin className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold">2. View Real-time Updates</h3>
                                <p className="text-gray-600">See your package's current location and status with detailed tracking information.</p>
                            </CardContent>
                        </Card>

                        <Card className="p-6 text-center">
                            <CardContent className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                    <CheckCircle className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold">3. Get Delivery Updates</h3>
                                <p className="text-gray-600">Receive notifications about delivery attempts and estimated delivery times.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Tracking Features */}
            <section className="bg-gray-50 py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Advanced Tracking Features</h2>
                                <p className="text-xl text-gray-600">
                                    Get detailed insights into your shipment's journey with our comprehensive tracking system.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="rounded-lg bg-blue-100 p-2">
                                        <MapPin className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Real-time GPS Tracking</h3>
                                        <p className="text-gray-600">See exactly where your package is at any moment with live GPS updates.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="rounded-lg bg-green-100 p-2">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delivery Time Estimates</h3>
                                        <p className="text-gray-600">Get accurate delivery time predictions based on current location and traffic.</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="rounded-lg bg-purple-100 p-2">
                                        <Truck className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delivery Notifications</h3>
                                        <p className="text-gray-600">Receive SMS and email alerts for pickup, transit, and delivery updates.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-8 shadow-lg">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Package Status</h3>
                                    <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">In Transit</div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        <div className="flex-1">
                                            <div className="font-medium">Package picked up</div>
                                            <div className="text-sm text-gray-500">New York, NY - 2 days ago</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                        <div className="flex-1">
                                            <div className="font-medium">In transit</div>
                                            <div className="text-sm text-gray-500">Chicago, IL - 1 day ago</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
                                        <div className="flex-1">
                                            <div className="font-medium">Out for delivery</div>
                                            <div className="text-sm text-gray-500">Los Angeles, CA - Today</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-500">Delivered</div>
                                            <div className="text-sm text-gray-400">Estimated: Today, 3:00 PM</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-blue-50 p-4">
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
            <section className="bg-white py-20">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Need Help with Tracking?</h2>
                        <p className="text-xl text-gray-600">Can't find your tracking number or having issues? We're here to help.</p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                                Contact Support
                            </Button>
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                                FAQ
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
