import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive' | 'warning' | 'success';
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    isLoading = false,
}: ConfirmationModalProps) {
    const getIcon = () => {
        switch (variant) {
            case 'destructive':
                return <XCircle className="h-6 w-6 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            default:
                return <Info className="h-6 w-6 text-blue-600" />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (variant) {
            case 'destructive':
                return 'destructive';
            case 'warning':
                return 'default';
            case 'success':
                return 'default';
            default:
                return 'default';
        }
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        {getIcon()}
                        <span>{title}</span>
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={getConfirmButtonVariant()}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Hook for easier usage
export function useConfirmationModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        title: string;
        description: string;
        onConfirm: () => void;
        confirmText?: string;
        cancelText?: string;
        variant?: 'default' | 'destructive' | 'warning' | 'success';
    }>({
        title: '',
        description: '',
        onConfirm: () => {},
    });

    const openModal = (modalConfig: typeof config) => {
        setConfig(modalConfig);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const ConfirmationModalComponent = () => (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={closeModal}
            onConfirm={config.onConfirm}
            title={config.title}
            description={config.description}
            confirmText={config.confirmText}
            cancelText={config.cancelText}
            variant={config.variant}
        />
    );

    return {
        openModal,
        closeModal,
        ConfirmationModal: ConfirmationModalComponent,
    };
}
