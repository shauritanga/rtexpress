import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { 
    CheckSquare, 
    Square, 
    Minus,
    Trash2,
    Edit,
    Archive,
    Send,
    Download,
    Loader2,
    AlertTriangle
} from 'lucide-react';

interface BulkAction {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
    requiresConfirmation?: boolean;
    confirmationTitle?: string;
    confirmationDescription?: string;
}

interface BulkOperationsProps {
    selectedItems: string[];
    totalItems: number;
    onSelectAll: () => void;
    onSelectNone: () => void;
    onToggleItem: (id: string) => void;
    actions: BulkAction[];
    onAction: (actionId: string, selectedItems: string[]) => Promise<void>;
    className?: string;
    disabled?: boolean;
}

export function BulkOperations({
    selectedItems,
    totalItems,
    onSelectAll,
    onSelectNone,
    onToggleItem,
    actions,
    onAction,
    className,
    disabled = false
}: BulkOperationsProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
    const [selectedAction, setSelectedAction] = useState<string>('');

    const isAllSelected = selectedItems.length === totalItems && totalItems > 0;
    const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < totalItems;
    const hasSelection = selectedItems.length > 0;

    const handleSelectAll = () => {
        if (isAllSelected) {
            onSelectNone();
        } else {
            onSelectAll();
        }
    };

    const handleAction = async (actionId: string) => {
        const action = actions.find(a => a.id === actionId);
        if (!action) return;

        if (action.requiresConfirmation) {
            setConfirmAction(action);
            return;
        }

        await executeAction(action);
    };

    const executeAction = async (action: BulkAction) => {
        setIsProcessing(true);
        setProcessingProgress(0);

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setProcessingProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 100);

            await onAction(action.id, selectedItems);
            
            clearInterval(progressInterval);
            setProcessingProgress(100);
            
            // Reset after a short delay
            setTimeout(() => {
                setProcessingProgress(0);
                setIsProcessing(false);
                setSelectedAction('');
            }, 1000);

        } catch (error) {
            console.error('Bulk action failed:', error);
            setIsProcessing(false);
            setProcessingProgress(0);
        }
    };

    const confirmAndExecute = async () => {
        if (confirmAction) {
            await executeAction(confirmAction);
            setConfirmAction(null);
        }
    };

    const getSelectionIcon = () => {
        if (isAllSelected) {
            return <CheckSquare className="h-4 w-4" />;
        } else if (isPartiallySelected) {
            return <Minus className="h-4 w-4" />;
        } else {
            return <Square className="h-4 w-4" />;
        }
    };

    return (
        <>
            <div className={cn("flex items-center space-x-4", className)}>
                {/* Selection Checkbox */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={disabled || totalItems === 0}
                    className="flex items-center space-x-2"
                >
                    {getSelectionIcon()}
                    <span className="text-sm">
                        {hasSelection 
                            ? `${selectedItems.length} selected`
                            : `Select all ${totalItems}`
                        }
                    </span>
                </Button>

                {/* Bulk Actions */}
                {hasSelection && !isProcessing && (
                    <div className="flex items-center space-x-2">
                        <Select
                            value={selectedAction}
                            onValueChange={setSelectedAction}
                            disabled={disabled}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Choose action..." />
                            </SelectTrigger>
                            <SelectContent>
                                {actions.map((action) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <SelectItem key={action.id} value={action.id}>
                                            <div className="flex items-center space-x-2">
                                                <IconComponent className="h-4 w-4" />
                                                <span>{action.label}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={() => handleAction(selectedAction)}
                            disabled={!selectedAction || disabled}
                            variant={actions.find(a => a.id === selectedAction)?.variant || 'default'}
                        >
                            Apply
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSelectNone}
                            disabled={disabled}
                        >
                            Clear
                        </Button>
                    </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                    <div className="flex items-center space-x-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                                Processing {selectedItems.length} items...
                            </p>
                            <Progress value={processingProgress} className="h-1 mt-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <span>
                                {confirmAction?.confirmationTitle || 'Confirm Action'}
                            </span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.confirmationDescription || 
                             `Are you sure you want to ${confirmAction?.label.toLowerCase()} ${selectedItems.length} selected items? This action cannot be undone.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAndExecute}
                            className={cn(
                                confirmAction?.variant === 'destructive' && 
                                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            )}
                        >
                            {confirmAction?.label || 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Checkbox component for individual items
interface BulkSelectCheckboxProps {
    id: string;
    checked: boolean;
    onToggle: (id: string) => void;
    disabled?: boolean;
    className?: string;
}

export function BulkSelectCheckbox({
    id,
    checked,
    onToggle,
    disabled = false,
    className
}: BulkSelectCheckboxProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(id)}
            disabled={disabled}
            className={cn("p-1", className)}
        >
            {checked ? (
                <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
            )}
        </Button>
    );
}

// Common bulk actions
export const commonBulkActions: BulkAction[] = [
    {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationTitle: 'Delete Items',
        confirmationDescription: 'Are you sure you want to delete the selected items? This action cannot be undone.'
    },
    {
        id: 'archive',
        label: 'Archive',
        icon: Archive,
        variant: 'secondary',
        requiresConfirmation: true,
        confirmationTitle: 'Archive Items',
        confirmationDescription: 'Are you sure you want to archive the selected items?'
    },
    {
        id: 'export',
        label: 'Export',
        icon: Download,
        variant: 'outline'
    },
    {
        id: 'edit',
        label: 'Bulk Edit',
        icon: Edit,
        variant: 'outline'
    }
];
