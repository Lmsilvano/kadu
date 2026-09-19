import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentTitle: string;
    onSubmit: (title: string) => void;
    heading?: string;
    confirmLabel?: string;
    /** Extra fields shown above the name input. */
    children?: ReactNode;
}

export default function RenameListModal({
    isOpen,
    onClose,
    currentTitle,
    onSubmit,
    heading = 'Renomear lista',
    confirmLabel = 'Salvar',
    children,
}: Props) {
    const [title, setTitle] = useState(currentTitle);

    useEffect(() => {
        if (isOpen) setTitle(currentTitle);
    }, [isOpen, currentTitle]);

    if (!isOpen) return null;

    const trimmed = title.trim();

    const handleSubmit = () => {
        if (!trimmed) return;
        onSubmit(trimmed);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-gray-900/50 backdrop-blur-sm transition-opacity">
            <div
                className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{heading}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                    {children && <div className="mb-4">{children}</div>}
                    <label className="block text-sm font-medium text-gray-600 mb-2" htmlFor="rename-list-title">
                        Nome da lista
                    </label>
                    <input
                        id="rename-list-title"
                        type="text"
                        className="w-full p-4 border border-blue-200 rounded-2xl bg-blue-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-800"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        autoFocus
                    />
                </div>

                <div className="p-5 bg-gray-50 border-t border-gray-100 flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold active:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!trimmed}
                        className="flex-1 py-3 px-4 bg-blue-600 rounded-xl text-white font-semibold active:bg-blue-700 disabled:opacity-50 disabled:active:bg-blue-600 transition-all disabled:select-none"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
