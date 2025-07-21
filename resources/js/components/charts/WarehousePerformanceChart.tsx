import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse, TrendingUp } from 'lucide-react';

interface WarehouseData {
    id: number;
    name: string;
    code: string;
    city: string;
    total_shipments: number;
    delivered_shipments: number;
    delivery_rate: number;
    capacity_utilization: number;
}

interface WarehousePerformanceChartProps {
    data: WarehouseData[];
    title?: string;
    description?: string;
    height?: number;
}

export function WarehousePerformanceChart({ 
    data, 
    title = "Warehouse Performance", 
    description = "Shipment volume and delivery rates by location",
    height = 300 
}: WarehousePerformanceChartProps) {
    // Prepare data for the chart
    const chartData = data.map(warehouse => ({
        name: warehouse.code,
        city: warehouse.city,
        shipments: warehouse.total_shipments,
        delivered: warehouse.delivered_shipments,
        deliveryRate: warehouse.delivery_rate,
        utilization: warehouse.capacity_utilization
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm font-medium text-gray-900">
                        {label} - {data.city}
                    </p>
                    <div className="space-y-1 mt-2">
                        <p className="text-sm text-blue-600">
                            Total Shipments: <span className="font-semibold">{data.shipments}</span>
                        </p>
                        <p className="text-sm text-green-600">
                            Delivered: <span className="font-semibold">{data.delivered}</span>
                        </p>
                        <p className="text-sm text-purple-600">
                            Delivery Rate: <span className="font-semibold">{data.deliveryRate}%</span>
                        </p>
                        <p className="text-sm text-orange-600">
                            Utilization: <span className="font-semibold">{data.utilization}%</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Warehouse className="h-5 w-5 text-blue-600" />
                    <div>
                        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#666"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#666"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="shipments" 
                                fill="#3b82f6" 
                                radius={[4, 4, 0, 0]}
                                name="Total Shipments"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Warehouse details table */}
                <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Warehouse Details</h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.map((warehouse) => (
                            <div key={warehouse.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-sm">{warehouse.code}</h5>
                                    <span className="text-xs text-gray-500">{warehouse.city}</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span>Shipments:</span>
                                        <span className="font-medium">{warehouse.total_shipments}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivered:</span>
                                        <span className="font-medium text-green-600">
                                            {warehouse.delivered_shipments}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Rate:</span>
                                        <span className={`font-medium ${
                                            warehouse.delivery_rate >= 95 ? 'text-green-600' :
                                            warehouse.delivery_rate >= 85 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {warehouse.delivery_rate}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Utilization:</span>
                                        <span className={`font-medium ${
                                            warehouse.capacity_utilization >= 80 ? 'text-red-600' :
                                            warehouse.capacity_utilization >= 60 ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {warehouse.capacity_utilization}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Status distribution pie chart component
interface StatusData {
    status: string;
    count: number;
}

interface StatusDistributionChartProps {
    data: StatusData[];
    title?: string;
    description?: string;
}

export function StatusDistributionChart({ 
    data, 
    title = "Shipment Status Distribution", 
    description = "Current status breakdown of all shipments" 
}: StatusDistributionChartProps) {
    const statusColors: { [key: string]: string } = {
        pending: '#f59e0b',
        picked_up: '#3b82f6',
        in_transit: '#8b5cf6',
        out_for_delivery: '#f97316',
        delivered: '#10b981',
        exception: '#ef4444',
        cancelled: '#6b7280'
    };
    
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    const dataWithColors = data.map((item) => ({
        ...item,
        color: statusColors[item.status] || '#6b7280',
        percentage: ((item.count / total) * 100).toFixed(1)
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {dataWithColors.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium capitalize">
                                    {item.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{item.count}</div>
                                <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Progress visualization */}
                <div className="mt-4 space-y-2">
                    {dataWithColors.map((item) => (
                        <div key={`progress-${item.status}`} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="capitalize">{item.status.replace('_', ' ')}</span>
                                <span>{item.count} ({item.percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{ 
                                        width: `${item.percentage}%`,
                                        backgroundColor: item.color 
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
