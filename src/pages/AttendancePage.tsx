import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, Download, Plus } from 'lucide-react';
import AttendanceListWrapper from '../components/AttendanceList';
import AddParticipantModal from '../components/AddParticipantModal';
import { generateCSV } from '../utils/exportUtils';
import { useModal } from '../context/ModalContext';
import {
    getListById,
    deleteList,
    updateParticipantPresence,
    updateParticipantName,
    deleteParticipant,
    markAll,
    addParticipantsToList
} from '../storage/attendanceStore';
import { type AttendanceList, type Participant } from '../storage/db';

export default function AttendancePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [list, setList] = useState<AttendanceList | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        async function fetchList() {
            if (!id) return;
            const data = await getListById(id);
            if (data) {
                setList(data);
            } else {
                navigate('/', { replace: true });
            }
        }
        fetchList();
    }, [id, navigate]);

    if (!list) return <div className="p-4 text-center">Carregando...</div>;

    const handleToggle = async (participantId: string, present: boolean) => {
        await updateParticipantPresence(list.id, participantId, present);
        setList({
            ...list,
            participants: list.participants.map(p => p.id === participantId ? { ...p, present } : p)
        });
    };

    const handleEdit = async (participantId: string, newName: string) => {
        await updateParticipantName(list.id, participantId, newName);
        setList({
            ...list,
            participants: list.participants.map(p => p.id === participantId ? { ...p, name: newName } : p)
        });
    };

    const handleDeleteEntry = async (participantId: string) => {
        await deleteParticipant(list.id, participantId);
        setList({
            ...list,
            participants: list.participants.filter(p => p.id !== participantId)
        });
    };

    const handleMarkAll = async (present: boolean) => {
        await markAll(list.id, present);
        setList({
            ...list,
            participants: list.participants.map(p => ({ ...p, present }))
        });
    };

    const { confirm } = useModal();

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

    const handleExport = () => {
        generateCSV(list.title, list.date, list.participants);
    };

    const handleAddParticipants = async (names: string[]) => {
        const newParticipants: Participant[] = names.map(name => ({
            id: crypto.randomUUID(),
            name,
            present: false
        }));

        await addParticipantsToList(list.id, newParticipants);
        setList({
            ...list,
            participants: [...list.participants, ...newParticipants]
        });
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
                    <p className="text-xs text-gray-500 font-medium">
                        {new Date(list.date).toLocaleDateString()}
                    </p>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={handleExport}
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
                    onTogglePresence={handleToggle}
                    onEditName={handleEdit}
                    onDelete={handleDeleteEntry}
                    onMarkAll={handleMarkAll}
                />
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg active:scale-95 transition-transform z-30"
                title="Adicionar Pessoa"
            >
                <Plus size={28} />
            </button>

            <AddParticipantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddParticipants}
            />
        </div>
    );
}
