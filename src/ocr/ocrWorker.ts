import { createWorker, PSM } from 'tesseract.js';
import { cleanOcrText, isValidName } from '../parsing/cleanText';

export async function processSlicesToNames(
    imageDataUrl: string,
    onProgress: (current: number, total: number) => void
): Promise<string[]> {
    onProgress(0, 1);

    const worker = await createWorker('por');

    await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
        preserve_interword_spaces: '1',
    });

    const { data: { text } } = await worker.recognize(imageDataUrl);
    await worker.terminate();

    onProgress(1, 1);

    const lines = text.split('\n');
    const names: string[] = [];

    for (const line of lines) {
        const cleaned = cleanOcrText(line);
        if (isValidName(cleaned)) {
            names.push(cleaned);
        }
    }

    return names;
}
