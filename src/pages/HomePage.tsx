import { Link, useNavigate } from 'react-router-dom';
import { Camera, FileText, ChevronRight, Plus, Edit3, Trash2, CheckSquare, Square, Settings } from 'lucide-react';
import { useAttendanceStore } from '../hooks/useAttendanceStore';
import { saveList, deleteMultipleLists } from '../storage/attendanceStore';
import { useState } from 'react';
import ManualCreateModal from '../components/ManualCreateModal';
import { useModal } from '../context/ModalContext';

export default function HomePage() {
    const { lists, loading } = useAttendanceStore();
    const navigate = useNavigate();

    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateMock = async () => {
        await saveList('Lista Teste ' + Math.floor(Math.random() * 100), new Date().toISOString(), [
            { id: crypto.randomUUID(), name: 'João Silva', present: true },
            { id: crypto.randomUUID(), name: 'Maria Souza', present: false },
            { id: crypto.randomUUID(), name: 'Pedro Costa', present: true },
        ]);
    };

    const handleManualSubmit = async (names: string[]) => {
        const participants = names.map(name => ({
            id: crypto.randomUUID(),
            name,
            present: false
        }));

        const newListId = await saveList(
            'Lista Manual ' + new Date().toLocaleDateString('pt-BR'),
            new Date().toISOString(),
            participants
        );

        navigate(`/list/${newListId}`);
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const { confirm } = useModal();

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;

        const ok = await confirm({
            title: 'Excluir Listas',
            message: `Tem certeza que deseja excluir ${selectedIds.size} lista(s) permanentemente?`,
            type: 'danger',
            confirmLabel: 'Sim, Excluir',
            cancelLabel: 'Manter'
        });

        if (ok) {
            await deleteMultipleLists(Array.from(selectedIds));
            setSelectedIds(newSet => {
                newSet.clear();
                return newSet;
            });
            setIsEditing(false);
        }
    };

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        setSelectedIds(new Set());
    };

    return (
        <div className="flex flex-col min-h-screen p-4 pb-24 max-w-md mx-auto relative bg-gray-50/30">
            <div className="relative text-center space-y-2 mt-8 mb-10">
                <Link
                    to="/settings"
                    className="absolute right-0 top-0 p-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
                    title="Configurações"
                >
                    <Settings size={22} />
                </Link>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Chamada
                </h1>
                <p className="text-gray-500">Escaneie & organize offline.</p>
            </div>

            <div className="w-full mb-8 flex space-x-3">
                <Link
                    to="/scan"
                    className="flex-1 flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-2xl shadow-md active:scale-95 transition-transform"
                >
                    <Camera size={28} className="mb-2" />
                    <span className="text-lg font-semibold tracking-wide">Escanear</span>
                </Link>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 flex flex-col items-center justify-center p-4 bg-white border border-gray-200 text-blue-600 rounded-2xl shadow-sm hover:border-blue-300 active:bg-blue-50 transition-colors"
                >
                    <Edit3 size={28} className="mb-2" />
                    <span className="text-lg font-semibold tracking-wide">Digitar</span>
                </button>
            </div>

            <div className="w-full flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Histórico</h2>

                    <div className="flex space-x-2">
                        {lists.length > 0 && (
                            <button
                                onClick={toggleEditMode}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isEditing ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            >
                                {isEditing ? 'Cancelar' : 'Editar'}
                            </button>
                        )}
                        {!isEditing && (
                            <button onClick={handleCreateMock} className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300 transition-colors" title="Adicionar lista teste">
                                <Plus size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-10 animate-pulse">Carregando listas...</div>
                ) : lists.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Nenhuma lista ainda</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-20">
                        {lists.map(list => {
                            const isSelected = selectedIds.has(list.id);

                            // Wrap inside a div or Link based on mode
                            const CardContent = (
                                <div className={`flex items-center justify-between p-4 rounded-xl shadow-sm border transition-all ${isEditing && isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-100'}`}>

                                    {isEditing && (
                                        <div className="mr-3 text-blue-600">
                                            {isSelected ? <CheckSquare size={24} className="animate-in zoom-in" /> : <Square size={24} className="text-gray-300" />}
                                        </div>
                                    )}

                                    <div className="flex-1 overflow-hidden">
                                        <h3 className={`font-semibold text-lg line-clamp-1 ${isEditing && isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{list.title}</h3>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
                                            <span>{new Date(list.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{list.participants.filter(p => p.present).length}/{list.participants.length}</span>
                                        </div>
                                    </div>

                                    {!isEditing && <ChevronRight className="text-gray-400" />}
                                </div>
                            );

                            return isEditing ? (
                                <div key={list.id} onClick={(e) => toggleSelection(list.id, e)} className="cursor-pointer">
                                    {CardContent}
                                </div>
                            ) : (
                                <Link key={list.id} to={`/list/${list.id}`} className="block active:scale-[0.98] transition-transform">
                                    {CardContent}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Action Bar for Deletion */}
            {isEditing && selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-0 right-0 px-4 animate-in slide-in-from-bottom flex justify-center z-40">
                    <button
                        onClick={handleDeleteSelected}
                        className="flex items-center space-x-2 bg-red-600 text-white px-6 py-4 rounded-full shadow-lg hover:bg-red-700 active:scale-95 transition-all w-full max-w-sm justify-center font-bold text-lg"
                    >
                        <Trash2 size={24} />
                        <span>Excluir {selectedIds.size} Lista{selectedIds.size > 1 ? 's' : ''}</span>
                    </button>
                </div>
            )}

            <ManualCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleManualSubmit}
            />
        </div>
    );
}
