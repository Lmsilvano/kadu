import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ModalType = 'info' | 'warning' | 'danger' | 'success';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: ModalType;
}

export default function Modal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    type = 'info'
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const typeConfig = {
        info: {
            icon: <Info size={24} className="text-blue-600" />,
            bgColor: "bg-blue-50",
            buttonColor: "bg-blue-600 active:bg-blue-700",
            borderColor: "border-blue-100"
        },
        warning: {
            icon: <AlertTriangle size={24} className="text-amber-600" />,
            bgColor: "bg-amber-50",
            buttonColor: "bg-amber-600 active:bg-amber-700",
            borderColor: "border-amber-100"
        },
        danger: {
            icon: <AlertTriangle size={24} className="text-red-600" />,
            bgColor: "bg-red-50",
            buttonColor: "bg-red-600 active:bg-red-700",
            borderColor: "border-red-100"
        },
        success: {
            icon: <CheckCircle2 size={24} className="text-green-600" />,
            bgColor: "bg-green-50",
            buttonColor: "bg-green-600 active:bg-green-700",
            borderColor: "border-green-100"
        }
    };

    const config = typeConfig[type];

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">

                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={cn("p-3 rounded-2xl", config.bgColor)}>
                            {config.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                            {title}
                        </h3>
                    </div>

                    <div className="text-slate-600 text-sm leading-relaxed mb-8">
                        {message}
                    </div>

                    <div className="flex flex-col gap-2">
                        {onConfirm && (
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                className={cn(
                                    "w-full py-4 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                                    config.buttonColor
                                )}
                            >
                                {confirmLabel}
                                <ChevronRight size={18} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold text-sm active:bg-slate-100 transition-all active:scale-[0.98]"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4">
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-300 hover:text-slate-400 active:bg-slate-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
