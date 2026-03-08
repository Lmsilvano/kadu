import { cleanOcrText, isValidName } from '../parsing/cleanText';
import { compressImageForApiAsync } from '../vision/imageCompressor';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function extractNamesWithGemini(
    imageDataUrl: string,
    apiKey: string
): Promise<string[]> {
    const compressed = await compressImageForApiAsync(imageDataUrl);
    const base64 = compressed.split(',')[1];
    const mimeType = compressed.split(';')[0].split(':')[1];

    const body = {
        contents: [{
            parts: [
                {
                    text: `Analise esta imagem de uma lista de presença/frequência.
Extraia TODOS os nomes de pessoas que aparecem na lista.
Retorne APENAS os nomes, um por linha, sem numeração, sem pontuação, sem cabeçalhos.
Ignore textos como "MASCULINO", "FEMININO", "LISTA DE RESIDENTES", datas, e cabeçalhos.
Se um nome estiver riscado ou ilegível, tente ler mesmo assim.
Não inclua linhas vazias.`
                },
                {
                    inlineData: {
                        mimeType,
                        data: base64
                    }
                }
            ]
        }]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errBody = await response.text();
        console.error(`Gemini API error (${response.status}):`, errBody);
        throw new Error(`Gemini (${response.status}): ${extractApiError(errBody)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return parseNames(text);
}

function extractApiError(body: string): string {
    try {
        const json = JSON.parse(body);
        return json.error?.message || body.slice(0, 100);
    } catch {
        return body.slice(0, 100);
    }
}

function parseNames(text: string): string[] {
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
