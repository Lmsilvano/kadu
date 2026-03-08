import { Check, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Participant } from '../storage/db';

interface Props {
    participant: Participant;
    onTogglePresence: (id: string, present: boolean) => void;
    onDelete: (id: string) => void;
    onEditName: (id: string, newName: string) => void;
}

export default function NameReviewItem({ participant, onTogglePresence, onDelete, onEditName }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(participant.name);

    const handleSave = () => {
        if (editValue.trim() && editValue !== participant.name) {
            onEditName(participant.id, editValue.trim());
        }
        setIsEditing(false);
    };

    return (
        <div
            className={`flex items-center justify-between p-4 mb-3 rounded-2xl shadow-sm border transition-all duration-300 ease-in-out cursor-pointer overflow-hidden relative
            ${participant.present
                    ? 'bg-emerald-50 border-emerald-200 hover:shadow-md'
                    : 'bg-white border-gray-100 hover:border-blue-100 hover:shadow-md hover:bg-slate-50'
                }`}
            onClick={(e) => {
                // Prevent toggle if clicking on action buttons
                if ((e.target as HTMLElement).closest('.actions')) return;
                if (!isEditing) onTogglePresence(participant.id, !participant.present);
            }}
        >
            {/* Active Left Border for Present State */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${participant.present ? 'bg-emerald-500' : 'bg-transparent'}`} />

            {/* LEFT SIDE: Checkbox + Name */}
            <div className="flex items-center space-x-4 flex-1 overflow-hidden ml-2 min-w-0">
                <button
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300 ${participant.present
                        ? 'bg-emerald-500 border-emerald-500 scale-110'
                        : 'border-slate-300 bg-transparent group-hover:border-blue-400'
                        }`}
                >
                    {participant.present && <Check size={14} className="text-white" />}
                </button>

                {isEditing ? (
                    <input
                        type="text"
                        className="flex-1 px-3 py-1.5 text-slate-800 bg-white border border-blue-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                    />
                ) : (
                    <span className={`text-base font-semibold truncate select-none transition-colors duration-200 ${participant.present ? 'text-slate-900' : 'text-slate-600'}`}>
                        {participant.name}
                    </span>
                )}
            </div>

            {/* RIGHT SIDE: Actions */}
            <div className="actions flex items-center space-x-1 ml-4 opacity-70 hover:opacity-100 transition-opacity">
                {isEditing ? (
                    <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-100/50 rounded-xl transition-colors" title="Salvar">
                        <Check size={18} />
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors" title="Editar Nome">
                        <Edit2 size={16} />
                    </button>
                )}
                <button onClick={() => onDelete(participant.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors" title="Excluir">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
