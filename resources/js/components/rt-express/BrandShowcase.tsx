import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Package, Plane, TrendingUp, Truck } from 'lucide-react';

/**
 * RT Express Brand Color Showcase Component
 * Demonstrates effective use of RT Express brand colors throughout the system
 */
export function BrandShowcase() {
    return (
        <div className="space-y-8 p-6">
            {/* Header Section with RT Express Branding */}
            <div className="bg-rt-gradient shadow-rt-red-lg rounded-lg p-8 text-white">
                <div className="mb-4 flex items-center space-x-4">
                    <div className="rounded-lg bg-white/20 p-3">
                        <Plane className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">RT Express</h1>
                        <p className="text-white/90">On Time, The First Time</p>
                    </div>
                </div>
                <p className="text-lg text-white/80">Professional cargo management with RT Express brand colors</p>
            </div>

            {/* Color Palette Display */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-rt-red">RT Express Color Palette</CardTitle>
                    <CardDescription>Brand colors extracted from the SRS document and implemented throughout the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {/* RT Red Variants */}
                        <div className="space-y-2">
                            <h4 className="text-rt-gray font-semibold">RT Red</h4>
                            <div className="space-y-1">
                                <div className="bg-rt-red-50 text-rt-red-900 rounded p-2 text-xs">50</div>
                                <div className="bg-rt-red-100 text-rt-red-900 rounded p-2 text-xs">100</div>
                                <div className="bg-rt-red-200 text-rt-red-900 rounded p-2 text-xs">200</div>
                                <div className="bg-rt-red-300 rounded p-2 text-xs text-white">300</div>
                                <div className="bg-rt-red-400 rounded p-2 text-xs text-white">400</div>
                                <div className="bg-rt-red rounded p-2 text-xs font-bold text-white">Primary</div>
                                <div className="bg-rt-red-600 rounded p-2 text-xs text-white">600</div>
                                <div className="bg-rt-red-700 rounded p-2 text-xs text-white">700</div>
                                <div className="bg-rt-red-800 rounded p-2 text-xs text-white">800</div>
                                <div className="bg-rt-red-900 rounded p-2 text-xs text-white">900</div>
                            </div>
                        </div>

                        {/* RT Gray Variants */}
                        <div className="space-y-2">
                            <h4 className="text-rt-gray font-semibold">RT Gray</h4>
                            <div className="space-y-1">
                                <div className="bg-rt-gray-50 text-rt-gray-900 rounded p-2 text-xs">50</div>
                                <div className="bg-rt-gray-100 text-rt-gray-900 rounded p-2 text-xs">100</div>
                                <div className="bg-rt-gray-200 text-rt-gray-900 rounded p-2 text-xs">200</div>
                                <div className="bg-rt-gray-300 text-rt-gray-900 rounded p-2 text-xs">300</div>
                                <div className="bg-rt-gray-400 rounded p-2 text-xs text-white">400</div>
                                <div className="bg-rt-gray rounded p-2 text-xs font-bold text-white">Primary</div>
                                <div className="bg-rt-gray-600 rounded p-2 text-xs text-white">600</div>
                                <div className="bg-rt-gray-700 rounded p-2 text-xs text-white">700</div>
                                <div className="bg-rt-gray-800 rounded p-2 text-xs text-white">800</div>
                                <div className="bg-rt-gray-900 rounded p-2 text-xs text-white">900</div>
                            </div>
                        </div>

                        {/* Usage Examples */}
                        <div className="col-span-2 space-y-2">
                            <h4 className="text-rt-gray font-semibold">Usage Examples</h4>
                            <div className="space-y-3">
                                <Button className="bg-rt-red hover:bg-rt-red-700 text-white">Primary Action</Button>
                                <Button variant="outline" className="border-rt-red text-rt-red hover:bg-rt-red-50">
                                    Secondary Action
                                </Button>
                                <Badge className="bg-rt-red-100 text-rt-red hover:bg-rt-red-200">Status Badge</Badge>
                                <div className="bg-rt-gradient-subtle border-rt-red-200 rounded-lg border p-3">
                                    <p className="text-rt-red-700 text-sm">Subtle background with RT branding</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dashboard Cards with RT Express Branding */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="border-rt-red-200 shadow-rt-red">
                    <CardHeader className="bg-rt-red-50">
                        <div className="flex items-center space-x-2">
                            <Package className="text-rt-red h-5 w-5" />
                            <CardTitle className="text-rt-red">Active Shipments</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-rt-gray text-3xl font-bold">1,247</div>
                        <div className="text-rt-red-600 flex items-center space-x-1 text-sm">
                            <TrendingUp className="h-4 w-4" />
                            <span>+12% from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-rt-red-200 shadow-rt-red">
                    <CardHeader className="bg-rt-red-50">
                        <div className="flex items-center space-x-2">
                            <Truck className="text-rt-red h-5 w-5" />
                            <CardTitle className="text-rt-red">In Transit</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-rt-gray text-3xl font-bold">89</div>
                        <div className="text-rt-gray-500 flex items-center space-x-1 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Average 2.3 days</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-rt-red-200 shadow-rt-red">
                    <CardHeader className="bg-rt-red-50">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="text-rt-red h-5 w-5" />
                            <CardTitle className="text-rt-red">Delivered</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-rt-gray text-3xl font-bold">2,156</div>
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>98.5% on time</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Indicators */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-rt-red">Status Indicators</CardTitle>
                    <CardDescription>How to use RT Express colors for different status types</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Badge className="bg-rt-red text-white">Urgent</Badge>
                            <Badge className="bg-rt-red-600 text-white">High Priority</Badge>
                            <Badge className="bg-rt-red-400 text-white">Medium</Badge>
                            <Badge className="bg-rt-red-200 text-rt-red-800">Low Priority</Badge>
                        </div>
                        <div className="space-y-2">
                            <Badge className="bg-green-500 text-white">Delivered</Badge>
                            <Badge className="bg-blue-500 text-white">In Transit</Badge>
                            <Badge className="bg-yellow-500 text-white">Pending</Badge>
                            <Badge className="bg-rt-gray-400 text-white">Cancelled</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="bg-rt-red h-3 w-3 rounded-full"></div>
                                <span className="text-rt-gray text-sm">Critical</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="bg-rt-red-400 h-3 w-3 rounded-full"></div>
                                <span className="text-rt-gray text-sm">Warning</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span className="text-rt-gray text-sm">Success</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="bg-rt-gray-400 h-3 w-3 rounded-full"></div>
                                <span className="text-rt-gray text-sm">Inactive</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Button size="sm" className="bg-rt-red hover:bg-rt-red-700 w-full">
                                Primary
                            </Button>
                            <Button size="sm" variant="outline" className="border-rt-red text-rt-red hover:bg-rt-red-50 w-full">
                                Secondary
                            </Button>
                            <Button size="sm" variant="ghost" className="text-rt-red hover:bg-rt-red-50 w-full">
                                Ghost
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
