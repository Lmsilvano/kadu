import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Download, Plus, ChevronDown } from 'lucide-react';
import AttendanceListWrapper from '../components/AttendanceList';
import AddParticipantModal from '../components/AddParticipantModal';
import ItemSheet from '../components/ItemSheet';
import MarketTotalsBar from '../components/MarketTotalsBar';
import { generateCSV } from '../utils/exportUtils';
import { useModal } from '../context/ModalContext';
import { useAttendanceList } from '../hooks/useAttendanceStore';
import { CATEGORIES } from '../categories';
import type { ParsedItem } from '../parsing/cleanText';
import { LIST_CATEGORIES } from '../storage/db';
import {
    deleteList,
    updateList,
    updateParticipant,
    deleteParticipant,
    markAll,
    addParticipantsToList,
    newParticipants,
    type ParticipantChanges
} from '../storage/attendanceStore';

export default function AttendancePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const list = useAttendanceList(id);
    const { confirm } = useModal();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (list === null) navigate('/', { replace: true });
    }, [list, navigate]);

    if (!list) return <div className="p-4 text-center">Carregando...</div>;

    const config = CATEGORIES[list.category];
    const CategoryIcon = config.icon;
    const editing = list.participants.find(p => p.id === editingId);

    const handleToggle = (participantId: string, present: boolean) =>
        updateParticipant(list.id, participantId, { present });

    const handleDeleteEntry = (participantId: string) => deleteParticipant(list.id, participantId);

    const handleMarkAll = (present: boolean) => markAll(list.id, present);

    const handleSaveDetails = (participantId: string, changes: ParticipantChanges) => {
        setEditingId(null);
        updateParticipant(list.id, participantId, changes);
    };

    const handleDeleteFromSheet = (participantId: string) => {
        setEditingId(null);
        deleteParticipant(list.id, participantId);
    };

    const handleAddParticipants = (items: ParsedItem[]) =>
        addParticipantsToList(list.id, newParticipants(items));

    const handleChangeCategory = async () => {
        const next = LIST_CATEGORIES[(LIST_CATEGORIES.indexOf(list.category) + 1) % LIST_CATEGORIES.length];
        const ok = await confirm({
            title: `Converter para lista ${CATEGORIES[next].label}?`,
            message: 'Nada é apagado: observações, marcações, preços e quantidades continuam guardados, mesmo os que não aparecem no novo tipo.',
            type: 'info',
            confirmLabel: 'Converter',
            cancelLabel: 'Cancelar'
        });

        if (ok) await updateList(list.id, { category: next });
    };

    const handleDeleteList = async () => {
        const ok = await confirm({
            title: 'Excluir Lista',
            message: 'Tem certeza que deseja excluir esta lista permanentemente? Todos os dados de presença serão perdidos.',
            type: 'danger',
            confirmLabel: 'Excluir Agora',
            cancelLabel: 'Manter Lista'
        });

        if (ok) {
            await deleteList(list.id);
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex items-center">
                    <Link to="/" className="p-2 -ml-2 text-gray-600 rounded-full active:bg-gray-100">
                        <ArrowLeft size={24} />
                    </Link>
                </div>

                <div className="flex-1 px-2 text-center overflow-hidden">
                    <h1 className="text-lg font-bold text-gray-900 truncate">
                        {list.title}
                    </h1>
                    <button
                        type="button"
                        onClick={handleChangeCategory}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 font-medium rounded-full active:bg-gray-100 transition-colors"
                        title="Trocar tipo de lista"
                    >
                        <CategoryIcon size={12} />
                        <span>{config.label} · {new Date(list.date).toLocaleDateString()}</span>
                        <ChevronDown size={12} />
                    </button>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => generateCSV(list)}
                        className="p-2 text-blue-600 rounded-full active:bg-blue-50"
                        title="Baixar CSV"
                    >
                        <Download size={22} />
                    </button>
                    <button
                        onClick={handleDeleteList}
                        className="p-2 -mr-2 text-red-500 rounded-full active:bg-red-50"
                        title="Excluir Lista"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 bg-gray-50">
                <AttendanceListWrapper
                    participants={list.participants}
                    category={list.category}
                    onTogglePresence={handleToggle}
                    onOpenDetails={setEditingId}
                    onDelete={handleDeleteEntry}
                    onMarkAll={handleMarkAll}
                />
            </main>

            {config.features.pricing && <MarketTotalsBar participants={list.participants} />}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className={`fixed right-6 ${config.features.pricing ? 'bottom-24' : 'bottom-6'} p-4 bg-blue-600 text-white rounded-full shadow-lg active:scale-95 transition-transform z-30`}
                title={`Adicionar ${config.itemNoun.one}`}
                aria-label={`Adicionar ${config.itemNoun.one}`}
            >
                <Plus size={28} />
            </button>

            <AddParticipantModal
                isOpen={isAddModalOpen}
                category={list.category}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddParticipants}
            />

            {editing && (
                <ItemSheet
                    key={editing.id}
                    participant={editing}
                    category={list.category}
                    onSave={changes => handleSaveDetails(editing.id, changes)}
                    onDelete={() => handleDeleteFromSheet(editing.id)}
                    onClose={() => setEditingId(null)}
                />
            )}
        </div>
    );
}
