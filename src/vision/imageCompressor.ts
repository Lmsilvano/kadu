/**
 * Compresses an image data URL to JPEG with max dimensions.
 * Reduces payload size for API calls (from 10MB+ PNG to ~200KB JPEG).
 */
export function compressImageForApi(dataUrl: string, maxWidth = 1600): string {
    const img = new Image();
    img.src = dataUrl;

    const canvas = document.createElement('canvas');
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;

    if (w > maxWidth) {
        h = Math.floor((h * maxWidth) / w);
        w = maxWidth;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);

    return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Async version — waits for image to load before compressing.
 * Use this when the image might not be ready yet.
 */
export function compressImageForApiAsync(dataUrl: string, maxWidth = 1600): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.naturalWidth;
            let h = img.naturalHeight;

            if (w > maxWidth) {
                h = Math.floor((h * maxWidth) / w);
                w = maxWidth;
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, w, h);

            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = dataUrl;
    });
}
