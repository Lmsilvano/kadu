import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

interface Props {
    onImageSelected: (imageElement: HTMLImageElement) => void;
}

export default function CameraInput({ onImageSelected }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Selected file is not an image');
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
            setError('Failed to load image');
            URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex space-x-4 w-full">
                {/* Camera capture (mobile prioritizes camera app) */}
                <button
                    onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.removeAttribute('capture');
                            fileInputRef.current.setAttribute('capture', 'environment');
                            fileInputRef.current.click();
                        }
                    }}
                    className="flex-1 flex flex-col items-center justify-center p-6 bg-blue-600 text-white rounded-xl active:bg-blue-700 transition-colors"
                >
                    <Camera size={32} className="mb-2" />
                    <span className="font-semibold">Take Photo</span>
                </button>

                {/* File upload fallback */}
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
                    <span className="font-semibold">Upload</span>
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
