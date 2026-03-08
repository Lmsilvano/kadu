import { cleanOcrText, isValidName } from '../parsing/cleanText';
import { compressImageForApiAsync } from '../vision/imageCompressor';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function extractNamesWithGroq(
    imageDataUrl: string,
    apiKey: string
): Promise<string[]> {
    const compressed = await compressImageForApiAsync(imageDataUrl);

    const body = {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: `Analise esta imagem de uma lista de presença/frequência.
Extraia TODOS os nomes de pessoas que aparecem na lista.
Retorne APENAS os nomes, um por linha, sem numeração, sem pontuação, sem cabeçalhos.
Ignore textos como "MASCULINO", "FEMININO", "LISTA DE RESIDENTES", datas, e cabeçalhos.
Se um nome estiver riscado ou ilegível, tente ler mesmo assim.
Não inclua linhas vazias.`
                },
                {
                    type: 'image_url',
                    image_url: { url: compressed }
                }
            ]
        }],
        max_tokens: 2000
    };

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errBody = await response.text();
        console.error(`Groq API error (${response.status}):`, errBody);
        throw new Error(`Groq (${response.status}): ${extractApiError(errBody)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

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
