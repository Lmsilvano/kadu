import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface Props {
    onImageSelected: (imageElement: HTMLImageElement) => void;
}

export default function CameraInput({ onImageSelected }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    }, []);

    const startCamera = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            streamRef.current = stream;
            setCameraActive(true);

            await new Promise<void>(resolve => setTimeout(resolve, 50));

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch {
            setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);

        stopCamera();

        const img = new Image();
        img.onload = () => onImageSelected(img);
        img.src = canvas.toDataURL('image/jpeg', 0.92);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('O arquivo selecionado não é uma imagem');
            return;
        }

        setError(null);
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            onImageSelected(img);
            URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => {
            setError('Falha ao carregar a imagem');
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };

    if (cameraActive) {
        return (
            <div className="flex flex-col items-center w-full">
                <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-lg">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-auto"
                    />
                    <button
                        onClick={stopCamera}
                        className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full active:bg-black/70"
                    >
                        <X size={20} />
                    </button>
                </div>
                <button
                    onClick={capturePhoto}
                    className="mt-4 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:bg-blue-700 transition-colors"
                >
                    <Camera size={28} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex space-x-4 w-full">
                <button
                    onClick={startCamera}
                    className="flex-1 flex flex-col items-center justify-center p-6 bg-blue-600 text-white rounded-xl active:bg-blue-700 transition-colors"
                >
                    <Camera size={32} className="mb-2" />
                    <span className="font-semibold">Tirar Foto</span>
                </button>

                <button
                    onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.removeAttribute('capture');
                            fileInputRef.current.click();
                        }
                    }}
                    className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-100 text-gray-700 rounded-xl active:bg-gray-200 transition-colors"
                >
                    <Upload size={32} className="mb-2 text-gray-500" />
                    <span className="font-semibold">Galeria</span>
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
        </div>
    );
}
