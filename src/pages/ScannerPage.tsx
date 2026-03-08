import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import CameraInput from '../components/CameraInput';
import { loadOpenCV } from '../vision/openCvLoader';
import { detectDocumentCorners, applyPerspective, sliceRowsNaive } from '../vision/documentProcessor';
import { saveList } from '../storage/attendanceStore';
import { processSlicesToNames } from '../ocr/ocrWorker';

export default function ScannerPage() {
    const navigate = useNavigate();
    const [cvReady, setCvReady] = useState(false);
    const [processingState, setProcessingState] = useState<'idle' | 'vision' | 'ocr' | 'saving'>('idle');
    const [ocrProgress, setOcrProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        loadOpenCV()
            .then(() => setCvReady(true))
            .catch((err) => setError(err.message));
    }, []);

    const processImage = async (imgElement: HTMLImageElement) => {
        if (!cvReady || !window.cv) {
            setError('OpenCV is not ready yet.');
            return;
        }

        setProcessingState('vision');
        setError(null);

        try {
            const cv = window.cv;

            const canvas = canvasRef.current!;
            const MAX_WIDTH = 1200;
            let width = imgElement.width;
            let height = imgElement.height;

            if (width > MAX_WIDTH) {
                height = Math.floor((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(imgElement, 0, 0, width, height);

            const srcMat = cv.imread(canvas);
            let corners = detectDocumentCorners(cv, srcMat);
            let warpedMat;

            if (corners) {
                warpedMat = applyPerspective(cv, srcMat, corners);
            } else {
                console.warn("Could not detect document bounds, using original image");
                warpedMat = srcMat.clone();
            }

            const bwMat = new cv.Mat();
            cv.cvtColor(warpedMat, bwMat, cv.COLOR_RGBA2GRAY, 0);
            cv.adaptiveThreshold(bwMat, bwMat, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

            const slices = sliceRowsNaive(cv, bwMat, 20);

            const dataUrls: string[] = [];
            const tempCanvas = document.createElement('canvas');

            for (const slice of slices) {
                cv.imshow(tempCanvas, slice);
                dataUrls.push(tempCanvas.toDataURL());
                slice.delete();
            }

            srcMat.delete();
            warpedMat.delete();
            bwMat.delete();

            setProcessingState('ocr');
            const names = await processSlicesToNames(dataUrls, (current, total) => {
                setOcrProgress({ current, total });
            });

            if (names.length === 0) {
                throw new Error('No names were detected. Please try another photo.');
            }

            setProcessingState('saving');
            const participants = names.map(n => ({
                id: crypto.randomUUID(),
                name: n,
                present: false
            }));

            const newListId = await saveList(
                'Scanned on ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                new Date().toISOString(),
                participants
            );

            navigate(`/list/${newListId}`, { replace: true });

        } catch (err: any) {
            console.error(err);
            setError('Image processing failed: ' + err.message);
            setProcessingState('idle');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="flex items-center p-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <Link to="/" className="p-2 -ml-2 text-gray-600 rounded-full active:bg-gray-100">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="flex-1 px-4 text-lg font-bold text-gray-900 text-center mr-8">
                    Scan Document
                </h1>
            </header>

            <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col items-center space-y-6">
                <canvas ref={canvasRef} className="hidden" />

                <div className="w-full text-center py-6">
                    {!cvReady ? (
                        <div className="flex flex-col items-center text-gray-500 animate-pulse">
                            <Loader2 size={32} className="animate-spin mb-3 text-blue-500" />
                            <p>Loading Vision Core...</p>
                        </div>
                    ) : processingState === 'vision' ? (
                        <div className="flex flex-col items-center text-blue-600">
                            <Loader2 size={48} className="animate-spin mb-3" />
                            <p className="font-medium animate-pulse">Processing Image...</p>
                        </div>
                    ) : processingState === 'ocr' ? (
                        <div className="flex flex-col items-center text-indigo-600">
                            <Loader2 size={48} className="animate-spin mb-3" />
                            <p className="font-medium animate-pulse">Reading Names...</p>
                            <p className="text-sm mt-2 opacity-80">{ocrProgress.current} / {ocrProgress.total} Rows</p>
                        </div>
                    ) : processingState === 'saving' ? (
                        <div className="flex flex-col items-center text-green-600">
                            <CheckCircle size={48} className="mb-3 animate-bounce" />
                            <p className="font-medium">Saving List...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-4 text-sm">
                                Ensure good lighting and capture the whole paper.
                            </p>
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
