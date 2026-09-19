import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, Settings } from 'lucide-react';
import CameraInput from '../components/CameraInput';
import CategoryPicker from '../components/CategoryPicker';
import { prepareImageForOcr } from '../vision/documentProcessor';
import { newParticipants, saveList } from '../storage/attendanceStore';
import { recognizeText } from '../ocr/ocrWorker';
import { hasAnyApiKey, runOcr } from '../ocr/cloudOcr';
import { parseLines } from '../parsing/cleanText';
import { CATEGORIES } from '../categories';
import { useLastCategory } from '../hooks/useLastCategory';

export default function ScannerPage() {
    const navigate = useNavigate();
    const [category, setCategory] = useLastCategory();
    const [processingState, setProcessingState] = useState<'idle' | 'vision' | 'ocr' | 'saving'>('idle');
    const [ocrMethod, setOcrMethod] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasAnyKey, setHasAnyKey] = useState(false);

    useEffect(() => {
        hasAnyApiKey().then(setHasAnyKey);
    }, []);

    const config = CATEGORIES[category];

    const processImage = async (imgElement: HTMLImageElement) => {
        setProcessingState('vision');
        setError(null);

        try {
            const dataUrl = prepareImageForOcr(imgElement);
            setProcessingState('ocr');

            const parseItems = (text: string) => parseLines(text, config.parseScannedLine);
            const { result, warnings } = await runOcr({
                image: dataUrl,
                prompt: config.scanPrompt,
                parse: text => {
                    const items = parseItems(text);
                    return items.length > 0 ? items : null;
                },
                local: async image => parseItems(await recognizeText(image)),
                onMethod: setOcrMethod,
            });
            const items = result ?? [];

            if (warnings.length > 0) {
                console.warn('API warnings:', warnings);
                setError('⚠️ ' + warnings.join(' | '));
            }

            if (items.length === 0) {
                throw new Error(`Não encontramos ${config.itemNoun.many} na foto. Por favor, tente outra foto.`);
            }

            setProcessingState('saving');
            const now = new Date();
            const newListId = await saveList({
                title: config.defaultTitle('scan', now),
                date: now.toISOString(),
                category,
                participants: newParticipants(items),
            });

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
                            <p className="font-medium animate-pulse">Lendo a lista...</p>
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
                            <div className="mb-4">
                                <CategoryPicker value={category} onChange={setCategory} />
                            </div>
                            <p className="text-gray-600 mb-4 text-sm">
                                {config.scanHint}
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
