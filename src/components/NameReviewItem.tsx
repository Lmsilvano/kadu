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
        <div className="flexitems-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm mb-2 transition-all">
            {/* LEFT SIDE: Checkbox + Name */}
            <div className="flex items-center space-x-3 flex-1 overflow-hidden" onClick={() => !isEditing && onTogglePresence(participant.id, !participant.present)}>
                <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors ${participant.present
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 bg-transparent'
                        }`}
                >
                    {participant.present && <Check size={18} className="text-white" />}
                </button>

                {isEditing ? (
                    <input
                        type="text"
                        className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                    />
                ) : (
                    <span className={`text-lg truncate select-none ${participant.present ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {participant.name}
                    </span>
                )}
            </div>

            {/* RIGHT SIDE: Actions */}
            <div className="flex items-center space-x-1 ml-2">
                {isEditing ? (
                    <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Check size={20} />
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={18} />
                    </button>
                )}
                <button onClick={() => onDelete(participant.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
