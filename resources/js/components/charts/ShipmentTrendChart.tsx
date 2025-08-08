import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TrendData {
    date: string;
    count: number;
}

interface ShipmentTrendChartProps {
    data: TrendData[];
    title?: string;
    description?: string;
    height?: number;
}

export function ShipmentTrendChart({
    data,
    title = 'Shipment Trends',
    description = 'Daily shipment volume over time',
    height = 300,
}: ShipmentTrendChartProps) {
    // Calculate trend direction
    const getTrendDirection = () => {
        if (data.length < 2) return null;

        const recent = data.slice(-7); // Last 7 days
        const earlier = data.slice(-14, -7); // Previous 7 days

        const recentAvg = recent.reduce((sum, item) => sum + item.count, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, item) => sum + item.count, 0) / earlier.length;

        if (recentAvg > earlierAvg && earlierAvg > 0) {
            return { direction: 'up', percentage: (((recentAvg - earlierAvg) / earlierAvg) * 100).toFixed(1) };
        } else if (recentAvg < earlierAvg && earlierAvg > 0) {
            return { direction: 'down', percentage: (((earlierAvg - recentAvg) / earlierAvg) * 100).toFixed(1) };
        }
        return { direction: 'stable', percentage: '0' };
    };

    const trend = getTrendDirection();

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-medium text-gray-900">{formatDate(label)}</p>
                    <p className="text-sm text-blue-600">
                        Shipments: <span className="font-semibold">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    {trend && (
                        <div className="flex items-center space-x-1 text-sm">
                            {trend.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : trend.direction === 'down' ? (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : null}
                            <span
                                className={`font-medium ${
                                    trend.direction === 'up' ? 'text-green-600' : trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                                }`}
                            >
                                {trend.direction === 'stable' ? 'Stable' : `${trend.percentage}%`}
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height }}>
                    <ResponsiveContainer>
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

// Donut chart for service type distribution
interface DonutChartProps {
    data: Array<{ service_type: string; count: number }>;
    title?: string;
    description?: string;
}

export function ServiceTypeDonutChart({
    data,
    title = 'Service Type Distribution',
    description = 'Breakdown of shipments by service type',
}: DonutChartProps) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const total = data.reduce((sum, item) => sum + item.count, 0);

    const dataWithColors = data.map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
        percentage: ((item.count / total) * 100).toFixed(1),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {dataWithColors.map((item, index) => (
                        <div key={item.service_type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm font-medium capitalize">{item.service_type}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">{item.count}</div>
                                <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Simple progress bars */}
                <div className="mt-4 space-y-2">
                    {dataWithColors.map((item) => (
                        <div key={`bar-${item.service_type}`} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="capitalize">{item.service_type}</span>
                                <span>{item.percentage}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                                <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: item.color,
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
