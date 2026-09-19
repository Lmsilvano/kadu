import { useCallback, useEffect, useRef, useState } from 'react';

/** A rectangle in CSS pixels, relative to the <video> element's box. */
export interface CaptureRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function useCameraStream() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mountedRef = useRef(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stop = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setStream(null);
    }, []);

    const start = useCallback(async () => {
        setError(null);
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            // The user may have left the screen while the permission prompt was open.
            if (!mountedRef.current) {
                newStream.getTracks().forEach(track => track.stop());
                return;
            }
            streamRef.current?.getTracks().forEach(track => track.stop());
            streamRef.current = newStream;
            setStream(newStream);
        } catch {
            setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            stop();
        };
    }, [stop]);

    // The <video> only mounts once a stream exists, so attach it after that render.
    useEffect(() => {
        const video = videoRef.current;
        if (!stream || !video) return;
        video.srcObject = stream;
        video.play().catch(() => { });
    }, [stream]);

    const capture = useCallback((region?: CaptureRegion): HTMLCanvasElement | null => {
        const video = videoRef.current;
        if (!video || !video.videoWidth) return null;

        const { videoWidth: vw, videoHeight: vh } = video;
        let sx = 0, sy = 0, sw = vw, sh = vh;

        if (region) {
            // Undo object-cover scaling/centering to go from element coordinates to video pixels.
            const scale = Math.max(video.clientWidth / vw, video.clientHeight / vh);
            const offsetX = (vw * scale - video.clientWidth) / 2;
            const offsetY = (vh * scale - video.clientHeight) / 2;
            sx = Math.max(0, (region.x + offsetX) / scale);
            sy = Math.max(0, (region.y + offsetY) / scale);
            sw = Math.min(vw - sx, region.width / scale);
            sh = Math.min(vh - sy, region.height / scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(sw);
        canvas.height = Math.round(sh);
        canvas.getContext('2d')!.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        return canvas;
    }, []);

    return { videoRef, active: stream !== null, error, start, stop, capture };
}
