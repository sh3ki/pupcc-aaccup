import { cn } from '@/lib/utils';
import { Toast as ToastType, useToast } from '@/contexts/ToastContext';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
    toast: ToastType;
}

const toastStyles = {
    success: {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-800',
        icon: 'text-green-500',
        progress: 'bg-green-500'
    },
    error: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        icon: 'text-red-500',
        progress: 'bg-red-500'
    },
    warning: {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-800',
        icon: 'text-yellow-500',
        progress: 'bg-yellow-500'
    },
    info: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-500',
        progress: 'bg-blue-500'
    }
};

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
};

export function Toast({ toast }: ToastProps) {
    const { removeToast } = useToast();
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);
    
    const style = toastStyles[toast.type];
    const Icon = icons[toast.type];
    const duration = toast.duration ?? 5000;

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (duration <= 0) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (duration / 100));
                return newProgress <= 0 ? 0 : newProgress;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => removeToast(toast.id), 300);
    };

    return (
        <div
            className={cn(
                'relative w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out transform',
                style.bg,
                isVisible 
                    ? 'translate-x-0 opacity-100 scale-100' 
                    : 'translate-x-full opacity-0 scale-95'
            )}
        >
            {/* Progress bar */}
            {duration > 0 && (
                <div className="absolute top-0 left-0 h-1 bg-gray-200">
                    <div 
                        className={cn('h-full transition-all duration-100 ease-linear', style.progress)}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={cn('h-5 w-5', style.icon)} />
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className={cn('text-sm font-medium', style.text)}>
                            {toast.title}
                        </p>
                        {toast.message && (
                            <p className={cn('mt-1 text-sm', style.text, 'opacity-90')}>
                                {toast.message}
                            </p>
                        )}
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            type="button"
                            className={cn(
                                'inline-flex rounded-md p-1.5 transition-colors duration-200 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2',
                                style.text
                            )}
                            onClick={handleClose}
                        >
                            <span className="sr-only">Dismiss</span>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ToastContainer() {
    const { toasts } = useToast();

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast toast={toast} />
                </div>
            ))}
        </div>
    );
}
