import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Loader2, X } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { prepareImageForOcr } from '../vision/documentProcessor';
import { hasAnyApiKey, runOcr } from '../ocr/cloudOcr';
import { recognizePriceCandidates } from '../ocr/ocrWorker';
import { extractPriceCandidates, PRICE_PROMPT, type PriceCandidate } from '../parsing/priceText';
import { formatBRL } from '../utils/money';

interface Props {
    onConfirm: (cents: number) => void;
    onClose: () => void;
}

type Phase = 'camera' | 'reading' | 'result';

// Extra area captured around the frame, so a slightly off-center tag still fits.
const FRAME_MARGIN = 0.1;

export default function PriceScanner({ onConfirm, onClose }: Props) {
    const { videoRef, active, error: cameraError, start, stop, capture } = useCameraStream();
    const frameRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [phase, setPhase] = useState<Phase>('camera');
    const [snapshot, setSnapshot] = useState<string | null>(null);
    const [method, setMethod] = useState<string | null>(null);
    const [candidates, setCandidates] = useState<PriceCandidate[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [selected, setSelected] = useState(0);
    const [hasKey, setHasKey] = useState(true);

    useEffect(() => {
        start();
        hasAnyApiKey().then(setHasKey);
    }, [start]);

    const read = async (image: string) => {
        setSnapshot(image);
        setMethod(null);
        setPhase('reading');
        try {
            const { result, warnings } = await runOcr({
                image,
                prompt: PRICE_PROMPT,
                parse: text => {
                    const found = extractPriceCandidates(text);
                    return found.length > 0 ? found : null;
                },
                local: recognizePriceCandidates,
                onMethod: setMethod,
            });
            setCandidates(result ?? []);
            setWarnings(warnings);
        } catch (e) {
            console.error(e);
            setCandidates([]);
            setWarnings([]);
        }
        setSelected(0);
        setPhase('result');
    };

    const handleCapture = () => {
        const video = videoRef.current;
        const frame = frameRef.current;
        if (!video || !frame) return;

        const v = video.getBoundingClientRect();
        const f = frame.getBoundingClientRect();
        const canvas = capture({
            x: f.left - v.left - f.width * FRAME_MARGIN,
            y: f.top - v.top - f.height * FRAME_MARGIN,
            width: f.width * (1 + 2 * FRAME_MARGIN),
            height: f.height * (1 + 2 * FRAME_MARGIN),
        });
        if (!canvas) return;

        stop();
        read(prepareImageForOcr(canvas));
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            stop();
            read(prepareImageForOcr(img));
        };
        img.onerror = () => URL.revokeObjectURL(url);
        img.src = url;
    };

    const retry = () => {
        setSnapshot(null);
        setCandidates([]);
        setPhase('camera');
        start();
    };

    const current = candidates[selected];

    return createPortal(
        <div role="dialog" aria-modal="true" aria-label="Ler preço com a câmera" className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
            <button
                type="button"
                onClick={onClose}
                aria-label="Fechar leitor de preço"
                className="absolute top-3 left-3 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 active:bg-black/70"
            >
                <X size={22} />
            </button>

            {phase === 'camera' ? (
                <>
                    <div className="relative flex-1 overflow-hidden">
                        {active ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <div
                                        ref={frameRef}
                                        className="w-4/5 max-w-sm aspect-[2/1] rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                                    />
                                    <p className="mt-5 px-6 text-center text-sm font-semibold drop-shadow">
                                        Enquadre o preço na área destacada
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
                                {cameraError ? (
                                    <>
                                        <p className="text-base font-semibold">{cameraError}</p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 font-bold rounded-2xl active:bg-gray-200"
                                        >
                                            <Camera size={20} />
                                            Usar câmera do celular
                                        </button>
                                    </>
                                ) : (
                                    <Loader2 size={40} className="animate-spin text-white/70" />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                        <button
                            type="button"
                            onClick={handleCapture}
                            disabled={!active}
                            aria-label="Capturar preço"
                            className="w-[72px] h-[72px] rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
                        >
                            <span className="w-14 h-14 rounded-full bg-white" />
                        </button>
                        {active && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-2 text-xs font-semibold text-white/70 active:text-white"
                            >
                                Usar câmera do celular
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center">
                    {snapshot && (
                        <img src={snapshot} alt="Etiqueta capturada" className="max-h-40 max-w-full rounded-xl object-contain" />
                    )}

                    {phase === 'reading' ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={40} className="animate-spin" />
                            <p className="font-semibold">Lendo preço…</p>
                            {method && <p className="text-xs text-white/60">{method}</p>}
                        </div>
                    ) : current ? (
                        <>
                            <div>
                                <p className="text-sm text-white/60">Preço encontrado</p>
                                <p className="text-5xl font-extrabold tabular-nums">{formatBRL(current.cents)}</p>
                                {current.label && <p className="mt-1 text-sm text-white/60">{current.label}</p>}
                            </div>

                            {candidates.length > 1 && (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {candidates.map((candidate, index) => (
                                        <button
                                            key={candidate.cents}
                                            type="button"
                                            aria-pressed={index === selected}
                                            onClick={() => setSelected(index)}
                                            className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors ${index === selected
                                                ? 'bg-white text-gray-900 border-white'
                                                : 'bg-transparent text-white border-white/30 active:bg-white/10'
                                                }`}
                                        >
                                            {formatBRL(candidate.cents)}
                                            {candidate.label && <span className="opacity-60"> · {candidate.label}</span>}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="w-full max-w-sm flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => onConfirm(current.cents)}
                                    className="py-4 bg-blue-600 rounded-2xl font-bold active:bg-blue-700"
                                >
                                    Usar este preço
                                </button>
                                <button type="button" onClick={retry} className="py-3 font-semibold text-white/80 active:text-white">
                                    Tentar de novo
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="max-w-sm">
                                <p className="text-lg font-bold">Não consegui ler o preço</p>
                                <p className="mt-2 text-sm text-white/70">
                                    Aproxime a câmera da etiqueta e evite reflexos.
                                    {!hasKey && ' Dica: configure uma chave de IA nas Configurações para leituras bem mais precisas.'}
                                </p>
                                {warnings.length > 0 && (
                                    <p className="mt-2 text-xs text-amber-300 break-words">{warnings.join(' | ')}</p>
                                )}
                            </div>
                            <div className="w-full max-w-sm flex flex-col gap-2">
                                <button type="button" onClick={retry} className="py-4 bg-white text-gray-900 rounded-2xl font-bold active:bg-gray-200">
                                    Tentar de novo
                                </button>
                                <button type="button" onClick={onClose} className="py-3 font-semibold text-white/80 active:text-white">
                                    Digitar manualmente
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </div>,
        document.body
    );
}
