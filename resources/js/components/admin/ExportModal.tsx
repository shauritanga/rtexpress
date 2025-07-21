import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { 
    Download, 
    FileText, 
    FileSpreadsheet,
    Calendar,
    Filter,
    BarChart3,
    Package,
    TrendingUp
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface ExportModalProps {
    trigger?: React.ReactNode;
    type: 'analytics' | 'shipments' | 'performance';
    title?: string;
    description?: string;
    filters?: any;
}

export function ExportModal({ 
    trigger, 
    type, 
    title, 
    description,
    filters = {} 
}: ExportModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
    const [period, setPeriod] = useState('30');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const exportConfigs = {
        analytics: {
            title: 'Export Analytics Report',
            description: 'Download comprehensive analytics data with charts and metrics',
            icon: BarChart3,
            color: 'text-blue-600',
            showPeriod: true,
            showDateRange: false,
        },
        shipments: {
            title: 'Export Shipments Data',
            description: 'Download detailed shipment information with filters applied',
            icon: Package,
            color: 'text-green-600',
            showPeriod: false,
            showDateRange: true,
        },
        performance: {
            title: 'Export Performance Report',
            description: 'Download delivery performance metrics and analysis',
            icon: TrendingUp,
            color: 'text-purple-600',
            showPeriod: false,
            showDateRange: true,
        }
    };

    const config = exportConfigs[type];
    const Icon = config.icon;

    const handleExport = async () => {
        setIsExporting(true);
        
        try {
            const exportData = {
                format,
                ...filters
            };

            if (config.showPeriod) {
                exportData.period = period;
            }

            if (config.showDateRange && startDate && endDate) {
                exportData.start_date = startDate;
                exportData.end_date = endDate;
            }

            // Create a form and submit it to trigger download
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/admin/export/${type}`;
            form.style.display = 'none';

            // Add CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }

            // Add export data
            Object.entries(exportData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                }
            });

            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);

            // Close modal after a short delay
            setTimeout(() => {
                setIsOpen(false);
                setIsExporting(false);
            }, 1000);

        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Icon className={`h-5 w-5 ${config.color}`} />
                        <span>{title || config.title}</span>
                    </DialogTitle>
                    <DialogDescription>
                        {description || config.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Format Selection */}
                    <div className="space-y-2">
                        <Label>Export Format</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Card 
                                className={`cursor-pointer transition-colors ${
                                    format === 'excel' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setFormat('excel')}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center space-x-2">
                                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                        <div>
                                            <div className="font-medium text-sm">Excel</div>
                                            <div className="text-xs text-gray-500">Spreadsheet format</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card 
                                className={`cursor-pointer transition-colors ${
                                    format === 'pdf' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setFormat('pdf')}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-4 w-4 text-red-600" />
                                        <div>
                                            <div className="font-medium text-sm">PDF</div>
                                            <div className="text-xs text-gray-500">Document format</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Period Selection for Analytics */}
                    {config.showPeriod && (
                        <div className="space-y-2">
                            <Label>Time Period</Label>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="90">Last 90 days</SelectItem>
                                    <SelectItem value="365">Last year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Date Range Selection */}
                    {config.showDateRange && (
                        <div className="space-y-2">
                            <Label>Date Range (Optional)</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-gray-500">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">End Date</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applied Filters Info */}
                    {Object.keys(filters).length > 0 && (
                        <div className="space-y-2">
                            <Label className="flex items-center space-x-1">
                                <Filter className="h-3 w-3" />
                                <span>Applied Filters</span>
                            </Label>
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                {Object.entries(filters).map(([key, value]) => (
                                    value && (
                                        <div key={key}>
                                            <strong>{key.replace('_', ' ')}:</strong> {String(value)}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Export Button */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleExport} 
                            disabled={isExporting}
                            className="min-w-[100px]"
                        >
                            {isExporting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Exporting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Download className="h-4 w-4" />
                                    <span>Export {format.toUpperCase()}</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
