import { Participant } from '../storage/db';
import NameReviewItem from './NameReviewItem';

interface Props {
    participants: Participant[];
    onTogglePresence: (id: string, present: boolean) => void;
    onDelete: (id: string) => void;
    onEditName: (id: string, newName: string) => void;
    onMarkAll: (present: boolean) => void;
}

export default function AttendanceList({ participants, onTogglePresence, onDelete, onEditName, onMarkAll }: Props) {
    const totalPresent = participants.filter(p => p.present).length;

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col h-full">

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sticky top-0 bg-gray-50 py-2 z-10">
                <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase whitespace-nowrap">
                    {totalPresent} / {participants.length} Presentes
                </span>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onMarkAll(true)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg active:bg-blue-200 whitespace-nowrap"
                    >
                        Marcar Todos
                    </button>
                    <button
                        onClick={() => onMarkAll(false)}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg active:bg-gray-300 whitespace-nowrap"
                    >
                        Limpar Todos
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pb-24">
                {participants.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">Não há nomes restantes nesta lista.</div>
                ) : (
                    participants.map(p => (
                        <NameReviewItem
                            key={p.id}
                            participant={p}
                            onTogglePresence={onTogglePresence}
                            onDelete={onDelete}
                            onEditName={onEditName}
                        />
                    ))
                )}
            </div>

        </div>
    );
}
