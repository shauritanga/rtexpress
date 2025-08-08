import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface Column {
    key: string;
    label: string;
    className?: string;
    render?: (value: any, row: any) => ReactNode;
    mobileHidden?: boolean;
    tabletHidden?: boolean;
    desktopOnly?: boolean;
}

interface Action {
    label: string;
    href?: string;
    onClick?: (row: any) => void;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'ghost' | 'outline';
}

interface MobileTableProps {
    data: any[];
    columns: Column[];
    actions?: Action[];
    emptyState?: {
        icon: React.ComponentType<{ className?: string }>;
        title: string;
        description: string;
    };
    className?: string;
}

export function MobileTable({ data, columns, actions = [], emptyState, className = '' }: MobileTableProps) {
    // Desktop/Tablet Table View
    const DesktopTable = () => (
        <div className="hidden overflow-x-auto md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                className={`${column.className || ''} ${column.tabletHidden ? 'hidden lg:table-cell' : ''} ${
                                    column.desktopOnly ? 'hidden xl:table-cell' : ''
                                }`}
                            >
                                {column.label}
                            </TableHead>
                        ))}
                        {actions.length > 0 && <TableHead>Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                            {columns.map((column) => (
                                <TableCell
                                    key={column.key}
                                    className={`${column.className || ''} ${column.tabletHidden ? 'hidden lg:table-cell' : ''} ${
                                        column.desktopOnly ? 'hidden xl:table-cell' : ''
                                    }`}
                                >
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </TableCell>
                            ))}
                            {actions.length > 0 && (
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        {actions.map((action, actionIndex) => (
                                            <Button
                                                key={actionIndex}
                                                variant={action.variant || 'ghost'}
                                                size="sm"
                                                asChild={!!action.href}
                                                onClick={action.onClick ? () => action.onClick!(row) : undefined}
                                            >
                                                {action.href ? (
                                                    <Link href={action.href.replace(':id', row.id)}>
                                                        {action.icon && <action.icon className="h-4 w-4" />}
                                                        {!action.icon && action.label}
                                                    </Link>
                                                ) : (
                                                    <>
                                                        {action.icon && <action.icon className="h-4 w-4" />}
                                                        {!action.icon && action.label}
                                                    </>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    // Mobile Card View
    const MobileCards = () => (
        <div className="space-y-4 md:hidden">
            {data.map((row, index) => (
                <Card key={index} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            {/* Primary Information */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {columns
                                        .filter((col) => !col.mobileHidden)
                                        .slice(0, 2)
                                        .map((column) => (
                                            <div key={column.key} className="mb-2">
                                                {column.key === columns[0].key ? (
                                                    // First column as title
                                                    <div className="text-base font-medium">
                                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                                    </div>
                                                ) : (
                                                    // Second column as subtitle
                                                    <div className="text-sm text-muted-foreground">
                                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>

                                {/* Actions */}
                                {actions.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        {actions.slice(0, 2).map((action, actionIndex) => (
                                            <Button
                                                key={actionIndex}
                                                variant="ghost"
                                                size="sm"
                                                asChild={!!action.href}
                                                onClick={action.onClick ? () => action.onClick!(row) : undefined}
                                            >
                                                {action.href ? (
                                                    <Link href={action.href.replace(':id', row.id)}>
                                                        {action.icon && <action.icon className="h-4 w-4" />}
                                                    </Link>
                                                ) : (
                                                    <>{action.icon && <action.icon className="h-4 w-4" />}</>
                                                )}
                                            </Button>
                                        ))}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Additional Information */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {columns
                                    .filter((col) => !col.mobileHidden)
                                    .slice(2, 6)
                                    .map((column) => (
                                        <div key={column.key}>
                                            <span className="text-muted-foreground">{column.label}: </span>
                                            <span className="font-medium">
                                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    // Empty State
    const EmptyState = () => (
        <div className="py-12 text-center">
            {emptyState?.icon && <emptyState.icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />}
            <h3 className="mb-2 text-lg font-medium text-gray-900">{emptyState?.title || 'No data found'}</h3>
            <p className="text-muted-foreground">{emptyState?.description || 'There are no items to display.'}</p>
        </div>
    );

    return (
        <div className={className}>
            {data.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <DesktopTable />
                    <MobileCards />
                </>
            )}
        </div>
    );
}
