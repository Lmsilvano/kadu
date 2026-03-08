import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, Settings } from 'lucide-react';
import CameraInput from '../components/CameraInput';
import { prepareImageForOcr } from '../vision/documentProcessor';
import { saveList } from '../storage/attendanceStore';
import { processSlicesToNames } from '../ocr/ocrWorker';
import { extractNamesWithGemini } from '../ocr/geminiOcr';
import { extractNamesWithOpenAI } from '../ocr/openaiOcr';
import { extractNamesWithGroq } from '../ocr/groqOcr';
import { getGeminiApiKey, getOpenAIApiKey, getGroqApiKey, setApiStatus } from '../storage/settingsStore';

export default function ScannerPage() {
    const navigate = useNavigate();
    const [processingState, setProcessingState] = useState<'idle' | 'vision' | 'ocr' | 'saving'>('idle');
    const [ocrMethod, setOcrMethod] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasAnyKey, setHasAnyKey] = useState(false);

    useEffect(() => {
        Promise.all([getGeminiApiKey(), getOpenAIApiKey(), getGroqApiKey()]).then(([g, o, gr]) => {
            setHasAnyKey(!!(g || o || gr));
        });
    }, []);

    const processImage = async (imgElement: HTMLImageElement) => {
        setProcessingState('vision');
        setError(null);

        try {
            const dataUrl = prepareImageForOcr(imgElement);
            setProcessingState('ocr');

            let names: string[] = [];
            const warnings: string[] = [];

            if (navigator.onLine) {
                const geminiKey = await getGeminiApiKey();
                if (geminiKey) {
                    setOcrMethod('✨ Gemini IA');
                    try {
                        names = await extractNamesWithGemini(dataUrl, geminiKey);
                        await setApiStatus('gemini', 'ok');
                    } catch (e: any) {
                        warnings.push('Gemini: ' + e.message);
                        console.warn('Gemini failed:', e.message);
                        if (e.message.includes('429') || e.message.includes('403') || e.message.includes('400')) {
                            await setApiStatus('gemini', 'error');
                        }
                    }
                }

                if (names.length === 0) {
                    const openaiKey = await getOpenAIApiKey();
                    if (openaiKey) {
                        setOcrMethod('🤖 OpenAI');
                        try {
                            names = await extractNamesWithOpenAI(dataUrl, openaiKey);
                            await setApiStatus('openai', 'ok');
                        } catch (e: any) {
                            warnings.push('OpenAI: ' + e.message);
                            console.warn('OpenAI failed:', e.message);
                            if (e.message.includes('429') || e.message.includes('403') || e.message.includes('401')) {
                                await setApiStatus('openai', 'error');
                            }
                        }
                    }
                }

                // Try Groq if OpenAI didn't work
                if (names.length === 0) {
                    const groqKey = await getGroqApiKey();
                    if (groqKey) {
                        setOcrMethod('⚡ Groq (Llama)');
                        try {
                            names = await extractNamesWithGroq(dataUrl, groqKey);
                            await setApiStatus('groq', 'ok');
                        } catch (e: any) {
                            warnings.push('Groq: ' + e.message);
                            console.warn('Groq failed:', e.message);
                            if (e.message.includes('429') || e.message.includes('403') || e.message.includes('400')) {
                                await setApiStatus('groq', 'error');
                            }
                        }
                    }
                }
            }

            if (names.length === 0) {
                setOcrMethod('📱 OCR local');
                names = await processSlicesToNames(dataUrl, () => { });
            }

            if (warnings.length > 0) {
                console.warn('API warnings:', warnings);
                setError('⚠️ ' + warnings.join(' | '));
            }

            if (names.length === 0) {
                throw new Error('Nenhum nome foi detectado. Por favor, tente outra foto.');
            }

            setProcessingState('saving');
            const participants = names.map(n => ({
                id: crypto.randomUUID(),
                name: n,
                present: false
            }));

            const newListId = await saveList(
                'Escaneado em ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                new Date().toISOString(),
                participants
            );

            navigate(`/list/${newListId}`, { replace: true });
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Falha ao processar a imagem.');
            setProcessingState('idle');
            setOcrMethod(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="flex items-center p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <Link to="/" className="p-2 -ml-2 text-gray-600 rounded-full active:bg-gray-100">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="flex-1 px-4 text-lg font-bold text-gray-900 text-center">
                    Escanear Documento
                </h1>
                <Link to="/settings" className="p-2 -mr-2 text-gray-600 rounded-full active:bg-gray-100">
                    <Settings size={20} />
                </Link>
            </header>

            <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col items-center space-y-6">
                <div className="w-full text-center py-6">
                    {processingState === 'vision' ? (
                        <div className="flex flex-col items-center text-blue-600">
                            <Loader2 size={48} className="animate-spin mb-3" />
                            <p className="font-medium animate-pulse">Processando Imagem...</p>
                        </div>
                    ) : processingState === 'ocr' ? (
                        <div className="flex flex-col items-center text-indigo-600">
                            <Loader2 size={48} className="animate-spin mb-3" />
                            <p className="font-medium animate-pulse">Lendo Nomes...</p>
                            {ocrMethod && (
                                <p className="text-xs mt-2 text-gray-400">{ocrMethod}</p>
                            )}
                        </div>
                    ) : processingState === 'saving' ? (
                        <div className="flex flex-col items-center text-green-600">
                            <CheckCircle size={48} className="mb-3 animate-bounce" />
                            <p className="font-medium">Salvando Lista...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-4 text-sm">
                                Garanta uma boa iluminação e capture a página inteira.
                            </p>
                            {!hasAnyKey && (
                                <div className="mx-auto max-w-sm mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-left">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                                        <Settings size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-amber-900 mb-1">Potencialize o Scanner</h3>
                                        <p className="text-xs text-amber-800 leading-relaxed mb-3">
                                            O modo local pode falhar em letras difíceis. Ative o OCR por IA nas configurações para máxima precisão.
                                        </p>
                                        <Link
                                            to="/settings"
                                            className="inline-flex items-center text-xs font-bold text-amber-900 bg-white px-3 py-2 rounded-lg border border-amber-200 shadow-sm active:bg-amber-50 transition-colors"
                                        >
                                            Configurar agora
                                        </Link>
                                    </div>
                                </div>
                            )}
                            <CameraInput onImageSelected={processImage} />
                        </>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
