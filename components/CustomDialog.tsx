
import React, { useEffect, useRef } from 'react';

export type DialogType = 'error' | 'success' | 'warning' | 'info';

export interface DialogConfig {
    type: DialogType;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm?: () => void;
}

interface CustomDialogProps {
    dialog: DialogConfig | null;
    onClose: () => void;
    isRTL?: boolean;
}

const DialogIcons: Record<DialogType, React.ReactNode> = {
    error: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    success: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
};

const typeStyles: Record<DialogType, { icon: string; badge: string; btn: string }> = {
    error: {
        icon: 'text-red-500 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-100 dark:ring-red-800/40',
        badge: 'bg-red-500',
        btn: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white',
    },
    success: {
        icon: 'text-brand-green bg-green-50 dark:bg-green-900/30 ring-2 ring-green-100 dark:ring-green-800/40',
        badge: 'bg-brand-green',
        btn: 'bg-brand-green hover:opacity-90 active:opacity-80 text-brand-green-dark',
    },
    warning: {
        icon: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 ring-2 ring-amber-100 dark:ring-amber-800/40',
        badge: 'bg-amber-500',
        btn: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white',
    },
    info: {
        icon: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-100 dark:ring-blue-800/40',
        badge: 'bg-blue-500',
        btn: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white',
    },
};

const CustomDialog: React.FC<CustomDialogProps> = ({ dialog, onClose, isRTL = false }) => {
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (dialog) {
            // Focus the button when dialog opens for accessibility
            setTimeout(() => btnRef.current?.focus(), 50);
        }
    }, [dialog]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dialog) onClose();
            if (e.key === 'Enter' && dialog) {
                if (dialog.onConfirm) dialog.onConfirm();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [dialog, onClose]);

    if (!dialog) return null;

    const styles = typeStyles[dialog.type];
    const confirmLabel = dialog.confirmLabel || (isRTL ? 'حسناً' : 'OK');

    const handleConfirm = () => {
        if (dialog.onConfirm) dialog.onConfirm();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-message"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ animation: 'fadeIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog Card */}
            <div
                className="relative w-full max-w-sm bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden"
                style={{
                    animation: 'dialogSlideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top accent bar */}
                <div className={`h-1.5 w-full ${styles.badge}`} />

                <div className="p-7 flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className={`p-4 rounded-2xl ${styles.icon}`}>
                        {DialogIcons[dialog.type]}
                    </div>

                    {/* Title */}
                    <h2
                        id="dialog-title"
                        className="text-lg font-bold text-gray-900 dark:text-white leading-snug"
                    >
                        {dialog.title}
                    </h2>

                    {/* Message */}
                    <p
                        id="dialog-message"
                        className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
                    >
                        {dialog.message}
                    </p>

                    {/* Button */}
                    <button
                        ref={btnRef}
                        id="dialog-confirm-btn"
                        onClick={handleConfirm}
                        className={`mt-1 w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-150 ${styles.btn} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes dialogSlideUp {
                    from { transform: translateY(24px) scale(0.97); opacity: 0; }
                    to   { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default CustomDialog;
