import React from 'react';
import { useToast } from '@/hooks/useToast';
import { Toast, ToastClose, ToastDescription, ToastTitle } from '@/components/ui/toast';

export function Toaster() {
    const { toasts } = useToast();

    return (
        <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            {toasts.map(function ({ id, title, description, ...props }) {
                return (
                    <Toast key={id} {...props}>
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && (
                                <ToastDescription>{description}</ToastDescription>
                            )}
                        </div>
                        <ToastClose />
                    </Toast>
                );
            })}
        </div>
    );
}
