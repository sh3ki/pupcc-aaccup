import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = generateId();
        const newToast = { ...toast, id };
        
        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration (default 5 seconds)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((title: string, message?: string, duration?: number) => {
        addToast({ type: 'success', title, message, duration });
    }, [addToast]);

    const error = useCallback((title: string, message?: string, duration?: number) => {
        addToast({ type: 'error', title, message, duration });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string, duration?: number) => {
        addToast({ type: 'warning', title, message, duration });
    }, [addToast]);

    const info = useCallback((title: string, message?: string, duration?: number) => {
        addToast({ type: 'info', title, message, duration });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{
            toasts,
            addToast,
            removeToast,
            success,
            error,
            warning,
            info
        }}>
            {children}
        </ToastContext.Provider>
    );
}
