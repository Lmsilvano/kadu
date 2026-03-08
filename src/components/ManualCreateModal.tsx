import { useState } from 'react';
import { X } from 'lucide-react';
import { normalizeName } from '../parsing/cleanText';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (names: string[]) => void;
}

export default function ManualCreateModal({ isOpen, onClose, onSubmit }: Props) {
    const [text, setText] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        // Split by newline, trim, and filter out empty strings
        const names = text
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length >= 2)
            .map(normalizeName);

        onSubmit(names);
        setText('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-gray-900/50 backdrop-blur-sm transition-opacity">
            <div
                className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Criar Lista Manual</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                    <p className="text-sm text-gray-500 mb-4">
                        Cole ou digite os nomes dos participantes. Coloque <strong>um nome por linha</strong>.
                    </p>
                    <textarea
                        className="w-full h-64 p-4 border border-blue-200 rounded-2xl bg-blue-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed shadow-inner font-medium text-gray-800"
                        placeholder="Exemplo:&#10;João Silva&#10;Maria Souza&#10;Pedro Costa"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
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
                        disabled={text.trim().length === 0}
                        className="flex-1 py-3 px-4 bg-blue-600 rounded-xl text-white font-semibold active:bg-blue-700 disabled:opacity-50 disabled:active:bg-blue-600 transition-all disabled:select-none"
                    >
                        Criar Lista
                    </button>
                </div>
            </div>
        </div>
    );
}
