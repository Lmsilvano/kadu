import { createWorker, PSM } from 'tesseract.js';
import { extractPriceCandidates, type PriceCandidate } from '../parsing/priceText';

export async function recognizeText(image: string): Promise<string> {
    const worker = await createWorker('por');
    try {
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
            preserve_interword_spaces: '1',
        });
        const { data } = await worker.recognize(image);
        return data.text;
    } finally {
        await worker.terminate();
    }
}

export async function recognizePriceCandidates(image: string): Promise<PriceCandidate[]> {
    const worker = await createWorker('por');
    try {
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SPARSE_TEXT,
            tessedit_char_whitelist: '0123456789R$,.',
        });
        const { data } = await worker.recognize(image, {}, { blocks: true });

        // The main price on a shelf tag is almost always the tallest text.
        const lines = (data.blocks ?? [])
            .flatMap(block => block.paragraphs.flatMap(paragraph => paragraph.lines))
            .sort((a, b) => (b.bbox.y1 - b.bbox.y0) - (a.bbox.y1 - a.bbox.y0));

        return extractPriceCandidates(lines.map(line => line.text).join('\n'));
    } finally {
        await worker.terminate();
    }
}
