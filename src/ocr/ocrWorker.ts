import { createWorker, PSM } from 'tesseract.js';
import { cleanOcrText, isValidName } from '../parsing/cleanText';

export async function processSlicesToNames(
    sliceUrls: string[],
    onProgress: (current: number, total: number) => void
): Promise<string[]> {
    const recognizedNames: string[] = [];
    const worker = await createWorker('por');

    // Set parameters to optimize for single line reading
    await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
        // Provide a whitelist to strictly expect Portuguese names
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÉÊÍÓÔÕÚÇàáâãéêíóôõúç .-',
    });

    const total = sliceUrls.length;

    for (let i = 0; i < total; i++) {
        onProgress(i + 1, total);
        try {
            const { data: { text } } = await worker.recognize(sliceUrls[i]);

            const cleaned = cleanOcrText(text);
            if (isValidName(cleaned)) {
                recognizedNames.push(cleaned);
            }
        } catch (err) {
            console.warn(`Failed to OCR slice ${i}:`, err);
        }
    }

    await worker.terminate();
    return recognizedNames;
}
