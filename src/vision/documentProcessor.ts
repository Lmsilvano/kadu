/**
 * Lightweight image preparation for OCR.
 * Key: do NOT downscale aggressively (Tesseract needs high-res text).
 * Apply sharpening to make text edges crisper.
 */
export function prepareImageForOcr(img: HTMLImageElement): string {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);

    // Sharpen to improve text edge definition
    sharpen(ctx, width, height);

    return canvas.toDataURL('image/png');
}

function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const src = new Uint8ClampedArray(imageData.data);
    const dst = imageData.data;

    // Unsharp-mask-style kernel: center = 5, neighbors = -1
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
                const val = 5 * src[i + c]
                    - src[((y - 1) * w + x) * 4 + c]
                    - src[((y + 1) * w + x) * 4 + c]
                    - src[(y * w + x - 1) * 4 + c]
                    - src[(y * w + x + 1) * 4 + c];
                dst[i + c] = Math.max(0, Math.min(255, val));
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}
