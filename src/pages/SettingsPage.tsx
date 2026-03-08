import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, Eye, EyeOff, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import {
    getGeminiApiKey, setGeminiApiKey, removeGeminiApiKey,
    getOpenAIApiKey, setOpenAIApiKey, removeOpenAIApiKey,
    getGroqApiKey, setGroqApiKey, removeGroqApiKey,
    getApiStatus, ApiStatus
} from '../storage/settingsStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function ApiKeySection({
    title,
    subtitle,
    link,
    linkLabel,
    storedKey,
    status,
    onSave,
    onRemove
}: {
    title: string;
    subtitle: string;
    link: string;
    linkLabel: string;
    storedKey: string | null;
    status: ApiStatus;
    onSave: (key: string) => Promise<void>;
    onRemove: () => Promise<void>;
}) {
    const [inputKey, setInputKey] = useState(storedKey ?? '');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { if (storedKey) setInputKey(storedKey); }, [storedKey]);

    const handleSave = async () => {
        if (!inputKey.trim()) return;
        await onSave(inputKey.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleRemove = async () => {
        await onRemove();
        setInputKey('');
    };

    const isError = status === 'error';

    return (
        <div className={cn(
            "bg-white rounded-2xl p-5 shadow-sm border transition-all duration-300",
            isError ? "border-red-500 shadow-md shadow-red-50" : "border-gray-100"
        )}>
            <div className="flex items-center gap-3 mb-3 min-w-0">
                <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    isError ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                )}>
                    {isError ? <AlertCircle size={20} /> : <Key size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-900 truncate">{title}</h2>
                    <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                </div>
                {isError && (
                    <div className="ml-auto text-red-600 text-[10px] font-extrabold uppercase tracking-tight bg-red-50 px-2.5 py-1 rounded-full border border-red-100 shrink-0 whitespace-nowrap">
                        Falha no uso
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={inputKey}
                        onChange={e => setInputKey(e.target.value)}
                        placeholder="Cole sua API key aqui"
                        className={cn(
                            "w-full px-4 py-3 pr-12 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all",
                            isError
                                ? "border-red-200 focus:ring-red-500 focus:border-transparent"
                                : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
                        )}
                    />
                    <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={!inputKey.trim() || (inputKey === storedKey && !isError)}
                        className={cn(
                            "flex-1 py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-40 transition-colors flex items-center justify-center gap-2",
                            isError ? "bg-red-600 active:bg-red-700" : "bg-blue-600 active:bg-blue-700"
                        )}
                    >
                        {saved ? <><CheckCircle size={16} /> Salvo!</> : (isError ? 'Atualizar Chave' : 'Salvar')}
                    </button>
                    {storedKey && (
                        <button
                            onClick={handleRemove}
                            className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm active:bg-red-100 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {storedKey && !isError && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-xs">
                    <CheckCircle size={14} />
                    <span>Configurada ✓</span>
                </div>
            )}

            <a href={link} target="_blank" rel="noopener noreferrer"
                className="mt-3 block text-center text-[10px] text-blue-600 underline uppercase font-bold tracking-tight">
                {linkLabel}
            </a>
        </div>
    );
}

export default function SettingsPage() {
    const [keys, setKeys] = useState<{
        gemini: string | null;
        openai: string | null;
        groq: string | null;
    }>({ gemini: null, openai: null, groq: null });

    const [statuses, setStatuses] = useState<{
        gemini: ApiStatus;
        openai: ApiStatus;
        groq: ApiStatus;
    }>({ gemini: 'ok', openai: 'ok', groq: 'ok' });

    const [loaded, setLoaded] = useState(false);

    const loadData = async () => {
        const [g, o, gr, sg, so, sgr] = await Promise.all([
            getGeminiApiKey(), getOpenAIApiKey(), getGroqApiKey(),
            getApiStatus('gemini'), getApiStatus('openai'), getApiStatus('groq')
        ]);
        setKeys({ gemini: g, openai: o, groq: gr });
        setStatuses({ gemini: sg, openai: so, groq: sgr });
        setLoaded(true);
    };

    useEffect(() => {
        loadData();
    }, []);

    if (!loaded) return null;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="flex items-center p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <Link to="/" className="p-2 -ml-2 text-gray-600 rounded-full active:bg-gray-100">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="flex-1 px-4 text-lg font-bold text-gray-900 text-center mr-8">
                    Configurações
                </h1>
            </header>

            <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
                <p className="text-xs text-gray-500 text-center leading-relaxed italic">
                    Configure pelo menos uma chave de IA para resultados precisos.
                    Sem chaves, o OCR local será usado como fallback.
                </p>

                <ApiKeySection
                    title="Google Gemini"
                    subtitle="1.000 imagens/mês — Recomendado"
                    link="https://aistudio.google.com/apikey"
                    linkLabel="Obter chave Gemini →"
                    storedKey={keys.gemini}
                    status={statuses.gemini}
                    onSave={async (k) => { await setGeminiApiKey(k); loadData(); }}
                    onRemove={async () => { await removeGeminiApiKey(); loadData(); }}
                />

                <ApiKeySection
                    title="OpenAI"
                    subtitle="GPT-4o-mini — Alta Precisão"
                    link="https://platform.openai.com/api-keys"
                    linkLabel="Obter chave OpenAI →"
                    storedKey={keys.openai}
                    status={statuses.openai}
                    onSave={async (k) => { await setOpenAIApiKey(k); loadData(); }}
                    onRemove={async () => { await removeOpenAIApiKey(); loadData(); }}
                />

                <ApiKeySection
                    title="Groq"
                    subtitle="Llama 4 Scout — Ultra-Rápido"
                    link="https://console.groq.com/keys"
                    linkLabel="Obter chave Groq →"
                    storedKey={keys.groq}
                    status={statuses.groq}
                    onSave={async (k) => { await setGroqApiKey(k); loadData(); }}
                    onRemove={async () => { await removeGroqApiKey(); loadData(); }}
                />
            </main>
        </div>
    );
}
