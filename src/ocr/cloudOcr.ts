import { compressImageForApiAsync } from '../vision/imageCompressor';
import { getGeminiApiKey, getGroqApiKey, getOpenAIApiKey, setApiStatus } from '../storage/settingsStore';

interface Provider {
    id: 'gemini' | 'openai' | 'groq';
    name: string;
    label: string;
    getKey: () => Promise<string | null>;
    request: (imageDataUrl: string, prompt: string, apiKey: string) => Promise<string>;
}

class ProviderError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const LOCAL_LABEL = '📱 OCR local';
const KEY_ERROR_STATUSES = [400, 401, 403, 429];

function extractApiError(body: string): string {
    try {
        const json = JSON.parse(body);
        return json.error?.message || body.slice(0, 100);
    } catch {
        return body.slice(0, 100);
    }
}

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}): Promise<any> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new ProviderError(response.status, `(${response.status}) ${extractApiError(errBody)}`);
    }
    return response.json();
}

async function requestGemini(imageDataUrl: string, prompt: string, apiKey: string): Promise<string> {
    const [meta, base64] = imageDataUrl.split(',');
    const mimeType = meta.split(';')[0].split(':')[1];

    const data = await postJson(`${GEMINI_API_URL}?key=${apiKey}`, {
        contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64 } }] }],
    });
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function chatCompletions(url: string, model: string): Provider['request'] {
    return async (imageDataUrl, prompt, apiKey) => {
        const data = await postJson(url, {
            model,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: imageDataUrl } },
                ],
            }],
            max_tokens: 2000,
        }, { Authorization: `Bearer ${apiKey}` });
        return data.choices?.[0]?.message?.content ?? '';
    };
}

// Order is the fallback order.
const PROVIDERS: Provider[] = [
    { id: 'gemini', name: 'Gemini', label: '✨ Gemini IA', getKey: getGeminiApiKey, request: requestGemini },
    {
        id: 'openai', name: 'OpenAI', label: '🤖 OpenAI', getKey: getOpenAIApiKey,
        request: chatCompletions('https://api.openai.com/v1/chat/completions', 'gpt-4o-mini'),
    },
    {
        id: 'groq', name: 'Groq', label: '⚡ Groq (Llama)', getKey: getGroqApiKey,
        request: chatCompletions('https://api.groq.com/openai/v1/chat/completions', 'meta-llama/llama-4-scout-17b-16e-instruct'),
    },
];

export async function hasAnyApiKey(): Promise<boolean> {
    const keys = await Promise.all(PROVIDERS.map(p => p.getKey()));
    return keys.some(Boolean);
}

interface RunOcrOptions<T> {
    image: string;
    prompt: string;
    /** Returns null when the response is unusable, so the next provider is tried. */
    parse: (rawText: string) => T | null;
    local: (image: string) => Promise<T | null>;
    onMethod?: (label: string) => void;
}

export async function runOcr<T>({ image, prompt, parse, local, onMethod }: RunOcrOptions<T>): Promise<{ result: T | null; warnings: string[] }> {
    const warnings: string[] = [];

    if (navigator.onLine) {
        let compressed: string | undefined;
        for (const provider of PROVIDERS) {
            const key = await provider.getKey();
            if (!key) continue;

            onMethod?.(provider.label);
            try {
                compressed ??= await compressImageForApiAsync(image);
                const result = parse(await provider.request(compressed, prompt, key));
                await setApiStatus(provider.id, 'ok');
                if (result !== null) return { result, warnings };
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                warnings.push(`${provider.name}: ${message}`);
                console.warn(`${provider.name} failed:`, message);
                if (e instanceof ProviderError && KEY_ERROR_STATUSES.includes(e.status)) {
                    await setApiStatus(provider.id, 'error');
                }
            }
        }
    }

    onMethod?.(LOCAL_LABEL);
    return { result: await local(image), warnings };
}
