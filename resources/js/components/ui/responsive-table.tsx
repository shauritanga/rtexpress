import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    ChevronDown, 
    ChevronUp, 
    MoreHorizontal,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { Link } from '@inertiajs/react';

// Enhanced column definition with mobile-first considerations
export interface ResponsiveColumn {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
    sortable?: boolean;
    // Mobile-first visibility controls
    mobileVisible?: boolean;      // Show on mobile (default: first 2 columns)
    tabletVisible?: boolean;      // Show on tablet (default: true)
    desktopVisible?: boolean;     // Show on desktop (default: true)
    // Priority for mobile display (1 = highest priority)
    mobilePriority?: number;
    // Column width for desktop
    width?: string;
}

export interface ResponsiveAction {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: (row: any) => void;
    href?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    // Mobile visibility
    mobileVisible?: boolean;
    // Show in dropdown menu on mobile
    mobileDropdown?: boolean;
}

interface ResponsiveTableProps {
    data: any[];
    columns: ResponsiveColumn[];
    actions?: ResponsiveAction[] | ((row: any) => ResponsiveAction[]);
    emptyState?: React.ReactNode;
    className?: string;
    // Mobile-first options
    mobileCardStyle?: 'compact' | 'detailed' | 'minimal';
    showMobileSearch?: boolean;
    mobileItemsPerPage?: number;
}

export function ResponsiveTable({ 
    data, 
    columns, 
    actions = [], 
    emptyState,
    className = '',
    mobileCardStyle = 'detailed',
    showMobileSearch = false,
    mobileItemsPerPage = 10
}: ResponsiveTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [mobileSearchTerm, setMobileSearchTerm] = useState('');

    // Helper function to get actions for a specific row
    const getActionsForRow = (row: any): ResponsiveAction[] => {
        if (typeof actions === 'function') {
            return actions(row);
        }
        return actions;
    };

    // Sort columns by mobile priority
    const sortedColumns = [...columns].sort((a, b) => {
        const aPriority = a.mobilePriority || 999;
        const bPriority = b.mobilePriority || 999;
        return aPriority - bPriority;
    });

    // Get mobile visible columns (first 2 by default, or by mobileVisible flag)
    const mobileColumns = sortedColumns.filter((col, index) => 
        col.mobileVisible !== false && (col.mobileVisible === true || index < 2)
    );

    // Get secondary columns for mobile expansion
    const secondaryColumns = sortedColumns.filter(col => 
        !mobileColumns.includes(col) && col.mobileVisible !== false
    );

    // Filter data for mobile search
    const filteredData = mobileSearchTerm 
        ? data.filter(row => 
            Object.values(row).some(value => 
                String(value).toLowerCase().includes(mobileSearchTerm.toLowerCase())
            )
          )
        : data;

    const toggleRowExpansion = (index: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRows(newExpanded);
    };

    // Desktop/Tablet Table View
    const DesktopTable = () => (
        <div className="hidden md:block overflow-x-auto">
            <Table className={className}>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead 
                                key={column.key}
                                className={cn(
                                    column.className,
                                    column.tabletVisible === false && 'hidden lg:table-cell',
                                    column.desktopVisible === false && 'hidden xl:table-cell',
                                    column.width && `w-${column.width}`
                                )}
                            >
                                {column.label}
                            </TableHead>
                        ))}
                        {(typeof actions === 'function' || actions.length > 0) && (
                            <TableHead className="w-[100px]">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((row, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                            {columns.map((column) => (
                                <TableCell 
                                    key={column.key}
                                    className={cn(
                                        column.className,
                                        column.tabletVisible === false && 'hidden lg:table-cell',
                                        column.desktopVisible === false && 'hidden xl:table-cell'
                                    )}
                                >
                                    {column.render 
                                        ? column.render(row[column.key], row)
                                        : row[column.key]
                                    }
                                </TableCell>
                            ))}
                            {getActionsForRow(row).length > 0 && (
                                <TableCell>
                                    <div className="flex items-center space-x-1">
                                        {getActionsForRow(row).slice(0, 3).map((action, actionIndex) => (
                                            <Button 
                                                key={actionIndex}
                                                variant={action.variant || 'ghost'} 
                                                size="sm"
                                                asChild={!!action.href}
                                                onClick={action.onClick ? () => action.onClick!(row) : undefined}
                                                className="h-8 w-8 p-0"
                                            >
                                                {action.href ? (
                                                    <Link href={action.href.replace(':id', row.id)}>
                                                        {action.icon && <action.icon className="h-4 w-4" />}
                                                    </Link>
                                                ) : (
                                                    <>
                                                        {action.icon && <action.icon className="h-4 w-4" />}
                                                    </>
                                                )}
                                            </Button>
                                        ))}
                                        {actions.length > 3 && (
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    // Mobile Card View - Enhanced with different styles
    const MobileCards = () => (
        <div className="md:hidden space-y-3">
            {/* Mobile Search */}
            {showMobileSearch && (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={mobileSearchTerm}
                        onChange={(e) => setMobileSearchTerm(e.target.value)}
                        className="w-full h-11 px-3 py-2 text-base border border-input rounded-md bg-background touch-manipulation"
                    />
                </div>
            )}

            {filteredData.slice(0, mobileItemsPerPage).map((row, index) => (
                <Card key={index} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-rt-red/30">
                    <CardContent className="p-4">
                        {mobileCardStyle === 'minimal' ? (
                            // Minimal Style - Single line with key info
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                        {mobileColumns[0]?.render 
                                            ? mobileColumns[0].render(row[mobileColumns[0].key], row)
                                            : row[mobileColumns[0].key]
                                        }
                                    </div>
                                    {mobileColumns[1] && (
                                        <div className="text-xs text-muted-foreground truncate">
                                            {mobileColumns[1].render 
                                                ? mobileColumns[1].render(row[mobileColumns[1].key], row)
                                                : row[mobileColumns[1].key]
                                            }
                                        </div>
                                    )}
                                </div>
                                {getActionsForRow(row).filter(a => a.mobileVisible !== false).slice(0, 2).map((action, actionIndex) => (
                                    <Button 
                                        key={actionIndex}
                                        variant="ghost" 
                                        size="sm"
                                        className="ml-2 h-8 w-8 p-0"
                                        asChild={!!action.href}
                                        onClick={action.onClick ? () => action.onClick!(row) : undefined}
                                    >
                                        {action.href ? (
                                            <Link href={action.href.replace(':id', row.id)}>
                                                {action.icon && <action.icon className="h-3 w-3" />}
                                            </Link>
                                        ) : (
                                            <>
                                                {action.icon && <action.icon className="h-3 w-3" />}
                                            </>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        ) : mobileCardStyle === 'compact' ? (
                            // Compact Style - Key info with expand option
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        {mobileColumns.map((column, colIndex) => (
                                            <div key={column.key} className={colIndex > 0 ? "mt-1" : ""}>
                                                {colIndex === 0 ? (
                                                    <div className="font-semibold text-sm">
                                                        {column.render 
                                                            ? column.render(row[column.key], row)
                                                            : row[column.key]
                                                        }
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-muted-foreground">
                                                        {column.render 
                                                            ? column.render(row[column.key], row)
                                                            : row[column.key]
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center space-x-1 ml-2">
                                        {secondaryColumns.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleRowExpansion(index)}
                                                className="h-8 w-8 p-0"
                                            >
                                                {expandedRows.has(index) ? (
                                                    <ChevronUp className="h-3 w-3" />
                                                ) : (
                                                    <ChevronDown className="h-3 w-3" />
                                                )}
                                            </Button>
                                        )}
                                        {getActionsForRow(row).filter(a => a.mobileVisible !== false).slice(0, 1).map((action, actionIndex) => (
                                            <Button 
                                                key={actionIndex}
                                                variant="ghost" 
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                asChild={!!action.href}
                                                onClick={action.onClick ? () => action.onClick!(row) : undefined}
                                            >
                                                {action.href ? (
                                                    <Link href={action.href.replace(':id', row.id)}>
                                                        {action.icon && <action.icon className="h-3 w-3" />}
                                                    </Link>
                                                ) : (
                                                    <>
                                                        {action.icon && <action.icon className="h-3 w-3" />}
                                                    </>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedRows.has(index) && secondaryColumns.length > 0 && (
                                    <div className="pt-3 border-t border-border/50 space-y-2">
                                        {secondaryColumns.map((column) => (
                                            <div key={column.key} className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-medium">
                                                    {column.label}:
                                                </span>
                                                <span className="text-right max-w-[60%] truncate">
                                                    {column.render 
                                                        ? column.render(row[column.key], row)
                                                        : row[column.key]
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                        
                                        {/* Additional Actions */}
                                        {getActionsForRow(row).length > 1 && (
                                            <div className="pt-2 flex flex-wrap gap-2">
                                                {getActionsForRow(row).filter(a => a.mobileVisible !== false).slice(1).map((action, actionIndex) => (
                                                    <Button 
                                                        key={actionIndex}
                                                        variant={action.variant || "outline"}
                                                        size="sm"
                                                        className="text-xs h-8"
                                                        asChild={!!action.href}
                                                        onClick={action.onClick ? () => action.onClick!(row) : undefined}
                                                    >
                                                        {action.href ? (
                                                            <Link href={action.href.replace(':id', row.id)}>
                                                                {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                                                                {action.label}
                                                            </Link>
                                                        ) : (
                                                            <>
                                                                {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                                                                {action.label}
                                                            </>
                                                        )}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Detailed Style - Full information display
                            <div className="space-y-3">
                                {/* Primary Information */}
                                <div className="space-y-2">
                                    {mobileColumns.map((column, colIndex) => (
                                        <div key={column.key} className="flex flex-col space-y-1">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                {column.label}
                                            </span>
                                            <span className={cn(
                                                "text-sm",
                                                colIndex === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                                            )}>
                                                {column.render 
                                                    ? column.render(row[column.key], row)
                                                    : row[column.key]
                                                }
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Secondary Information */}
                                {secondaryColumns.length > 0 && (
                                    <div className="pt-3 border-t border-border/50 space-y-2">
                                        {secondaryColumns.map((column) => (
                                            <div key={column.key} className="flex justify-between items-center">
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {column.label}:
                                                </span>
                                                <span className="text-xs text-right max-w-[60%] truncate">
                                                    {column.render 
                                                        ? column.render(row[column.key], row)
                                                        : row[column.key]
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                {getActionsForRow(row).length > 0 && (
                                    <div className="pt-3 border-t border-border/50">
                                        <div className="flex flex-wrap gap-2">
                                            {getActionsForRow(row).filter(a => a.mobileVisible !== false).map((action, actionIndex) => (
                                                <Button 
                                                    key={actionIndex}
                                                    variant={action.variant || "outline"}
                                                    size="touch"
                                                    className="text-xs flex-1 min-w-[80px]"
                                                    asChild={!!action.href}
                                                    onClick={action.onClick ? () => action.onClick!(row) : undefined}
                                                >
                                                    {action.href ? (
                                                        <Link href={action.href.replace(':id', row.id)}>
                                                            {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                                                            {action.label}
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                                                            {action.label}
                                                        </>
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    // Empty State
    if (filteredData.length === 0) {
        return (
            <div className="text-center py-12">
                {emptyState || (
                    <div className="text-muted-foreground">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-lg font-medium mb-2">No data available</p>
                        <p className="text-sm">There are no items to display at the moment.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            <DesktopTable />
            <MobileCards />
        </div>
    );
}
