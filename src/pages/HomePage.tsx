import { Link } from 'react-router-dom';
import { Camera, FileText, ChevronRight, Plus } from 'lucide-react';
import { useAttendanceStore } from '../hooks/useAttendanceStore';
import { saveList } from '../storage/attendanceStore';

export default function HomePage() {
    const { lists, loading } = useAttendanceStore();

    const handleCreateMock = async () => {
        await saveList('Mock List ' + Math.floor(Math.random() * 100), new Date().toISOString(), [
            { id: crypto.randomUUID(), name: 'João Silva', present: true },
            { id: crypto.randomUUID(), name: 'Maria Souza', present: false },
            { id: crypto.randomUUID(), name: 'Pedro Costa', present: true },
        ]);
    };

    return (
        <div className="flex flex-col min-h-screen p-4 pb-20 max-w-md mx-auto relative">
            <div className="text-center space-y-2 mt-8 mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Attendance
                </h1>
                <p className="text-gray-500">Scan & organize offline.</p>
            </div>

            <div className="w-full mb-8">
                <Link
                    to="/scan"
                    className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-2xl shadow-md active:scale-95 transition-transform w-full space-x-3"
                >
                    <Camera size={28} />
                    <span className="text-xl font-semibold tracking-wide">New Scan</span>
                </Link>
            </div>

            <div className="w-full flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">History</h2>
                    <button onClick={handleCreateMock} className="p-2 bg-gray-200 rounded text-gray-600 active:bg-gray-300" title="Add mock list">
                        <Plus size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-10 animate-pulse">Loading lists...</div>
                ) : lists.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No lists yet</p>
                        <p className="text-sm text-gray-400 mt-1">Scan a document to start</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lists.map(list => (
                            <Link
                                key={list.id}
                                to={`/list/${list.id}`}
                                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{list.title}</h3>
                                    <div className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
                                        <span>{new Date(list.date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{list.participants.filter(p => p.present).length}/{list.participants.length}</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-400" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
