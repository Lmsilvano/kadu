import { Link, useNavigate } from 'react-router-dom';
import { Camera, FileText, ChevronRight, Plus, Edit3, Trash2, CheckSquare, Square, Settings, Pencil, Smartphone } from 'lucide-react';
import { useAttendanceStore } from '../hooks/useAttendanceStore';
import { newParticipants, saveList, deleteMultipleLists, updateListTitle } from '../storage/attendanceStore';
import { useEffect, useState } from 'react';
import ManualCreateModal from '../components/ManualCreateModal';
import RenameListModal from '../components/RenameListModal';
import CategoryPicker from '../components/CategoryPicker';
import InstallSheet from '../components/InstallSheet';
import { useModal } from '../context/ModalContext';
import { useLastCategory } from '../hooks/useLastCategory';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { dismissInstallHint, isInstallHintDismissed } from '../storage/settingsStore';
import { CATEGORIES } from '../categories';
import type { ParsedItem } from '../parsing/cleanText';
import type { ListCategory } from '../storage/db';
import { formatBRL, listTotals } from '../utils/money';

export default function HomePage() {
    const { lists, loading } = useAttendanceStore();
    const navigate = useNavigate();

    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newListCategory, setNewListCategory] = useLastCategory();
    const [isInstallSheetOpen, setIsInstallSheetOpen] = useState(false);
    const [hintDismissed, setHintDismissed] = useState(true);
    const { installed, canPrompt } = useInstallPrompt();

    useEffect(() => {
        isInstallHintDismissed().then(setHintDismissed);
    }, []);

    const handleDismissHint = () => {
        setHintDismissed(true);
        dismissInstallHint();
    };

    const handleCreateEmpty = async (name: string) => {
        const newListId = await saveList({
            title: name,
            date: new Date().toISOString(),
            category: newListCategory,
            participants: [],
        });
        navigate(`/list/${newListId}`);
    };

    const handleManualSubmit = async (items: ParsedItem[], category: ListCategory, title: string) => {
        const newListId = await saveList({
            title,
            date: new Date().toISOString(),
            category,
            participants: newParticipants(items),
        });

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

    const selectedList = lists.find(list => selectedIds.has(list.id));

    const handleRenameSelected = async (title: string) => {
        if (!selectedList) return;
        await updateListTitle(selectedList.id, title);
        setSelectedIds(new Set());
        setIsEditing(false);
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

            {!installed && !hintDismissed && (
                <div className="w-full -mt-4 mb-8 p-4 bg-white border border-blue-100 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                            <Smartphone size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900">Instale o Kadu no celular</p>
                            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                                Fica na tela inicial, abre em tela cheia e funciona sem internet.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setIsInstallSheetOpen(true)}
                            className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl active:bg-blue-700 transition-colors"
                        >
                            {canPrompt ? 'Instalar' : 'Como instalar'}
                        </button>
                        <button
                            onClick={handleDismissHint}
                            className="px-4 py-2.5 text-sm font-semibold text-gray-500 rounded-xl active:bg-gray-100 transition-colors"
                        >
                            Agora não
                        </button>
                    </div>
                </div>
            )}

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
                            <button onClick={() => setIsCreateModalOpen(true)} className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300 transition-colors" title="Nova lista">
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
                            const config = CATEGORIES[list.category];
                            const CategoryIcon = config.icon;
                            const estimatedCents = config.features.pricing ? listTotals(list.participants).estimatedCents : 0;

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
                                            <CategoryIcon size={14} className="shrink-0" />
                                            <span className="sr-only">{config.label}</span>
                                            <span>{new Date(list.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{list.participants.filter(p => p.present).length}/{list.participants.length}</span>
                                            {estimatedCents > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-semibold text-gray-700 whitespace-nowrap">{formatBRL(estimatedCents)}</span>
                                                </>
                                            )}
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

            {isEditing && selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-0 right-0 px-4 animate-in slide-in-from-bottom flex justify-center z-40">
                    <div className="flex items-center gap-3 w-full max-w-sm">
                        {selectedIds.size === 1 && (
                            <button
                                onClick={() => setIsRenameModalOpen(true)}
                                className="flex-1 flex items-center space-x-2 bg-white border border-gray-200 text-slate-700 px-5 py-4 rounded-full shadow-lg hover:bg-slate-50 active:scale-95 transition-all justify-center font-bold text-lg"
                            >
                                <Pencil size={22} />
                                <span>Renomear</span>
                            </button>
                        )}
                        <button
                            onClick={handleDeleteSelected}
                            className="flex-1 flex items-center space-x-2 bg-red-600 text-white px-5 py-4 rounded-full shadow-lg hover:bg-red-700 active:scale-95 transition-all justify-center font-bold text-lg"
                        >
                            <Trash2 size={24} />
                            <span>
                                {selectedIds.size === 1
                                    ? 'Excluir'
                                    : `Excluir ${selectedIds.size} Listas`}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            <ManualCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleManualSubmit}
            />
            <RenameListModal
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                currentTitle={selectedList?.title ?? ''}
                onSubmit={handleRenameSelected}
            />
            <RenameListModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                currentTitle=""
                heading="Nova lista"
                confirmLabel="Criar"
                onSubmit={handleCreateEmpty}
            >
                <CategoryPicker value={newListCategory} onChange={setNewListCategory} />
            </RenameListModal>

            {isInstallSheetOpen && <InstallSheet onClose={() => setIsInstallSheetOpen(false)} />}
        </div>
    );
}
