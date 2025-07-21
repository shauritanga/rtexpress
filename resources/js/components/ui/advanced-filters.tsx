import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
    Filter, 
    X, 
    Calendar,
    ChevronDown,
    Save,
    RotateCcw
} from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

interface FilterConfig {
    key: string;
    label: string;
    type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number';
    options?: FilterOption[];
    placeholder?: string;
}

interface FilterValue {
    [key: string]: any;
}

interface SavedFilter {
    id: string;
    name: string;
    filters: FilterValue;
    createdAt: string;
}

interface AdvancedFiltersProps {
    configs: FilterConfig[];
    values: FilterValue;
    onChange: (filters: FilterValue) => void;
    onSave?: (name: string, filters: FilterValue) => void;
    savedFilters?: SavedFilter[];
    onLoadSaved?: (filters: FilterValue) => void;
    className?: string;
}

export function AdvancedFilters({
    configs,
    values,
    onChange,
    onSave,
    savedFilters = [],
    onLoadSaved,
    className
}: AdvancedFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [saveFilterName, setSaveFilterName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const getActiveFilterCount = () => {
        return Object.values(values).filter(value => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
            }
            return value !== null && value !== undefined && value !== '';
        }).length;
    };

    const updateFilter = (key: string, value: any) => {
        onChange({ ...values, [key]: value });
    };

    const clearFilter = (key: string) => {
        const newValues = { ...values };
        delete newValues[key];
        onChange(newValues);
    };

    const clearAllFilters = () => {
        onChange({});
    };

    const handleSaveFilter = () => {
        if (saveFilterName.trim() && onSave) {
            onSave(saveFilterName.trim(), values);
            setSaveFilterName('');
            setShowSaveDialog(false);
        }
    };

    const renderFilterInput = (config: FilterConfig) => {
        const value = values[config.key];

        switch (config.type) {
            case 'text':
                return (
                    <Input
                        placeholder={config.placeholder}
                        value={value || ''}
                        onChange={(e) => updateFilter(config.key, e.target.value)}
                    />
                );

            case 'number':
                return (
                    <Input
                        type="number"
                        placeholder={config.placeholder}
                        value={value || ''}
                        onChange={(e) => updateFilter(config.key, e.target.value)}
                    />
                );

            case 'select':
                return (
                    <Select
                        value={value || ''}
                        onValueChange={(val) => updateFilter(config.key, val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={config.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {config.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center justify-between w-full">
                                        <span>{option.label}</span>
                                        {option.count !== undefined && (
                                            <Badge variant="secondary" className="ml-2">
                                                {option.count}
                                            </Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'multiselect':
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <div className="space-y-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    {selectedValues.length > 0 
                                        ? `${selectedValues.length} selected`
                                        : config.placeholder
                                    }
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <div className="max-h-60 overflow-y-auto">
                                    {config.options?.map((option) => (
                                        <div
                                            key={option.value}
                                            className="flex items-center space-x-2 p-2 hover:bg-muted cursor-pointer"
                                            onClick={() => {
                                                const newValues = selectedValues.includes(option.value)
                                                    ? selectedValues.filter(v => v !== option.value)
                                                    : [...selectedValues, option.value];
                                                updateFilter(config.key, newValues);
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedValues.includes(option.value)}
                                                onChange={() => {}} // Handled by onClick above
                                                className="rounded"
                                            />
                                            <span className="flex-1">{option.label}</span>
                                            {option.count !== undefined && (
                                                <Badge variant="secondary">
                                                    {option.count}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        
                        {/* Selected Values */}
                        {selectedValues.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {selectedValues.map((val) => {
                                    const option = config.options?.find(o => o.value === val);
                                    return (
                                        <Badge key={val} variant="secondary" className="text-xs">
                                            {option?.label || val}
                                            <button
                                                onClick={() => {
                                                    const newValues = selectedValues.filter(v => v !== val);
                                                    updateFilter(config.key, newValues);
                                                }}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <Input
                        type="date"
                        value={value || ''}
                        onChange={(e) => updateFilter(config.key, e.target.value)}
                    />
                );

            case 'daterange':
                const dateRange = value || { start: '', end: '' };
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">From</Label>
                            <Input
                                type="date"
                                value={dateRange.start || ''}
                                onChange={(e) => updateFilter(config.key, {
                                    ...dateRange,
                                    start: e.target.value
                                })}
                            />
                        </div>
                        <div>
                            <Label className="text-xs">To</Label>
                            <Input
                                type="date"
                                value={dateRange.end || ''}
                                onChange={(e) => updateFilter(config.key, {
                                    ...dateRange,
                                    end: e.target.value
                                })}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2"
                >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                    {getActiveFilterCount() > 0 && (
                        <Badge variant="secondary">
                            {getActiveFilterCount()}
                        </Badge>
                    )}
                </Button>

                {getActiveFilterCount() > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-muted-foreground"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Clear All
                    </Button>
                )}
            </div>

            {/* Active Filters Summary */}
            {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap gap-2">
                    {configs.map((config) => {
                        const value = values[config.key];
                        if (!value) return null;

                        let displayValue = '';
                        if (Array.isArray(value)) {
                            displayValue = `${value.length} selected`;
                        } else if (typeof value === 'object' && config.type === 'daterange') {
                            const { start, end } = value;
                            if (start && end) {
                                displayValue = `${start} to ${end}`;
                            } else if (start) {
                                displayValue = `From ${start}`;
                            } else if (end) {
                                displayValue = `Until ${end}`;
                            }
                        } else {
                            displayValue = String(value);
                        }

                        if (!displayValue) return null;

                        return (
                            <Badge key={config.key} variant="secondary">
                                {config.label}: {displayValue}
                                <button
                                    onClick={() => clearFilter(config.key)}
                                    className="ml-1 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}

            {/* Filter Panel */}
            {isOpen && (
                <div className="border rounded-lg p-4 bg-card space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {configs.map((config) => (
                            <div key={config.key} className="space-y-2">
                                <Label className="text-sm font-medium">
                                    {config.label}
                                </Label>
                                {renderFilterInput(config)}
                            </div>
                        ))}
                    </div>

                    {/* Saved Filters */}
                    {savedFilters.length > 0 && (
                        <div className="border-t pt-4">
                            <Label className="text-sm font-medium mb-2 block">
                                Saved Filters
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {savedFilters.map((filter) => (
                                    <Button
                                        key={filter.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onLoadSaved?.(filter.filters)}
                                    >
                                        {filter.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center space-x-2">
                            {onSave && (
                                <>
                                    {showSaveDialog ? (
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                placeholder="Filter name"
                                                value={saveFilterName}
                                                onChange={(e) => setSaveFilterName(e.target.value)}
                                                className="w-40"
                                            />
                                            <Button size="sm" onClick={handleSaveFilter}>
                                                Save
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => setShowSaveDialog(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowSaveDialog(true)}
                                            disabled={getActiveFilterCount() === 0}
                                        >
                                            <Save className="h-4 w-4 mr-1" />
                                            Save Filter
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
