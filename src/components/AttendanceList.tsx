import type { ListCategory, Participant } from '../storage/db';
import { CATEGORIES } from '../categories';
import NameReviewItem from './NameReviewItem';

interface Props {
    participants: Participant[];
    category: ListCategory;
    onTogglePresence: (id: string, present: boolean) => void;
    onDelete: (id: string) => void;
    onOpenDetails: (id: string) => void;
    onMarkAll: (present: boolean) => void;
}

export default function AttendanceList({ participants, category, onTogglePresence, onDelete, onOpenDetails, onMarkAll }: Props) {
    const config = CATEGORIES[category];
    const totalChecked = participants.filter(p => p.present).length;

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col h-full">

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sticky top-0 bg-gray-50 py-2 z-10">
                <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase whitespace-nowrap">
                    {totalChecked} / {participants.length} {config.checkedLabel}
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
            <div className={`flex-1 overflow-y-auto ${config.features.pricing ? 'pb-44' : 'pb-24'}`}>
                {participants.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">Esta lista ainda está vazia.</div>
                ) : (
                    participants.map(p => (
                        <NameReviewItem
                            key={p.id}
                            participant={p}
                            category={category}
                            onTogglePresence={onTogglePresence}
                            onDelete={onDelete}
                            onOpenDetails={onOpenDetails}
                        />
                    ))
                )}
            </div>

        </div>
    );
}
