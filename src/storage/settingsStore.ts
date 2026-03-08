import { db } from './db';

const GEMINI_KEY = 'gemini_api_key';
const OPENAI_KEY = 'openai_api_key';
const GROQ_KEY = 'groq_api_key';

export async function getGeminiApiKey(): Promise<string | null> {
    const s = await db.settings.get(GEMINI_KEY);
    return s?.value ?? null;
}
export async function setGeminiApiKey(k: string): Promise<void> {
    await db.settings.put({ key: GEMINI_KEY, value: k });
}
export async function removeGeminiApiKey(): Promise<void> {
    await db.settings.delete(GEMINI_KEY);
}

export async function getOpenAIApiKey(): Promise<string | null> {
    const s = await db.settings.get(OPENAI_KEY);
    return s?.value ?? null;
}
export async function setOpenAIApiKey(k: string): Promise<void> {
    await db.settings.put({ key: OPENAI_KEY, value: k });
}
export async function removeOpenAIApiKey(): Promise<void> {
    await db.settings.delete(OPENAI_KEY);
}

export async function getGroqApiKey(): Promise<string | null> {
    const s = await db.settings.get(GROQ_KEY);
    return s?.value ?? null;
}
export async function setGroqApiKey(k: string): Promise<void> {
    await db.settings.put({ key: GROQ_KEY, value: k });
    await clearApiStatus('groq');
}
export async function removeGroqApiKey(): Promise<void> {
    await db.settings.delete(GROQ_KEY);
    await clearApiStatus('groq');
}

// API Health Status
export type ApiStatus = 'ok' | 'error';

export async function getApiStatus(provider: string): Promise<ApiStatus> {
    const s = await db.settings.get(`api_status_${provider}`);
    return (s?.value as ApiStatus) ?? 'ok';
}

export async function setApiStatus(provider: string, status: ApiStatus): Promise<void> {
    await db.settings.put({ key: `api_status_${provider}`, value: status });
}

export async function clearApiStatus(provider: string): Promise<void> {
    await db.settings.delete(`api_status_${provider}`);
}
