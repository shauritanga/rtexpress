import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, Trash2, UserPlus, Send } from 'lucide-react';

interface ConfirmationDialogProps {
    children: React.ReactNode; // Trigger element
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive' | 'info';
    icon?: 'warning' | 'info' | 'delete' | 'create' | 'send';
    onConfirm: () => void;
    onCancel?: () => void;
}

export function ConfirmationDialog({
    children,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    icon,
    onConfirm,
    onCancel
}: ConfirmationDialogProps) {
    const [open, setOpen] = React.useState(false);
    const getIcon = () => {
        switch (icon) {
            case 'warning':
                return <AlertTriangle className="h-6 w-6 text-amber-600" />;
            case 'delete':
                return <Trash2 className="h-6 w-6 text-red-600" />;
            case 'create':
                return <UserPlus className="h-6 w-6 text-green-600" />;
            case 'send':
                return <Send className="h-6 w-6 text-blue-600" />;
            case 'info':
            default:
                return <Info className="h-6 w-6 text-blue-600" />;
        }
    };
    const handleConfirm = () => {
        setOpen(false);
        onConfirm();
    };

    const handleCancel = () => {
        setOpen(false);
        onCancel?.();
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center space-x-3">
                        {icon && getIcon()}
                        <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="whitespace-pre-line text-sm text-muted-foreground mt-2">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
