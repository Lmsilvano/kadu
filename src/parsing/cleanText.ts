export interface ParsedItem {
    name: string;
    quantity?: number;
}

const NOISE_WORDS = [
    'masculino', 'feminino', 'lista', 'residentes',
    'passagem', 'data', 'nome', 'assinatura', 'turno',
    'diurno', 'noturno', 'plantao', 'escala',
];

const MARKET_NOISE_WORDS = [
    'lista', 'compras', 'mercado', 'supermercado', 'feira', 'total',
    'data', 'item', 'itens', 'quantidade', 'qtd', 'preço', 'preco', 'valor',
];

export function parseLines(text: string, parse: (line: string) => ParsedItem | null): ParsedItem[] {
    return text.split('\n').map(parse).filter((item): item is ParsedItem => item !== null);
}

export function normalizeName(name: string): string {
    if (!name) return "";
    const prepositions = ["de", "da", "do", "das", "dos", "e"];

    return name.trim().split(/\s+/).map((word, index) => {
        const lowerWord = word.toLowerCase();
        if (index === 0 || !prepositions.includes(lowerWord)) {
            return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        }
        return lowerWord;
    }).join(' ');
}

export function cleanOcrText(rawText: string): string {
    if (!rawText) return "";

    // Remove leading numbers, dots, dashes, parentheses, colons
    let cleaned = rawText.replace(/^[\d\s.\-\):;,]+/g, '');

    // Remove trailing numbers and punctuation
    cleaned = cleaned.replace(/[\d.\-\):;,?!]+$/g, '');

    // Remove non-letter characters (keep spaces, accented chars)
    cleaned = cleaned.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');

    // Collapse whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Remove single-char words at start/end (OCR noise like "L", "O", "É")
    cleaned = cleaned.replace(/^[A-ZÀ-ÿa-z]\s+/g, '');
    cleaned = cleaned.replace(/\s+[A-ZÀ-ÿa-z]$/g, '');

    return normalizeName(cleaned.trim());
}

export function isValidName(name: string): boolean {
    const trimmed = name.trim();
    if (trimmed.length < 4) return false;

    const lower = trimmed.toLowerCase();

    // Filter document headers / labels
    for (const noise of NOISE_WORDS) {
        if (lower === noise) return false;
        if (lower.includes('lista de')) return false;
        if (lower.includes('passagem')) return false;
        if (lower.includes('residentes')) return false;
    }

    // Must contain at least one vowel
    if (!/[aeiouàáâãéêíóôõú]/i.test(trimmed)) return false;

    // Must have at least 2 word-parts
    const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
    if (words.length < 1) return false;

    // Average word length must be reasonable (filters "Oo Es Cf" type garbage)
    const totalChars = words.reduce((sum, w) => sum + w.length, 0);
    if (totalChars / words.length < 3) return false;

    return true;
}

// A number followed by a unit ("5 kg arroz") is part of the name, not a quantity.
const LEADING_QUANTITY = /^(\d{1,2})\s*(?:x|un|und|unid|unidades?|pct|pacotes?|cx|caixas?)?\.?\s+(?!(?:kg|g|gr|mg|l|lt|ml|litros?)\b)(.+)$/i;
const TRAILING_QUANTITY = /^(.+?)\s+(?:x\s?(\d{1,2})|(\d{1,2})\s?x)$/i;

function toSentenceCase(text: string): string {
    const isAllCaps = text === text.toUpperCase() && /\p{L}/u.test(text);
    const base = isAllCaps ? text.toLowerCase() : text;
    return base.charAt(0).toUpperCase() + base.slice(1);
}

function isValidItem(name: string): boolean {
    const letters = name.match(/\p{L}/gu)?.length ?? 0;
    if (letters < 2) return false;
    const lower = name.toLowerCase();
    return !MARKET_NOISE_WORDS.includes(lower) && !/^lista\b/.test(lower);
}

export function parseMarketLine(rawLine: string): ParsedItem | null {
    let text = rawLine
        .replace(/^[\s•·*\-–—]+/, '')
        .replace(/^\d{1,3}\s*[.)\-–:]\s+/, '') // list numbering: "1. ", "2) ", "3 - "
        .replace(/\s+(?:R\$\s*)?\d{1,5}[.,]\d{2}\s*$/i, '') // a price written after the item
        .trim();

    let quantity: number | undefined;
    const leading = text.match(LEADING_QUANTITY);
    const trailing = leading ? null : text.match(TRAILING_QUANTITY);
    if (leading) {
        quantity = Number(leading[1]);
        text = leading[2];
    } else if (trailing) {
        quantity = Number(trailing[2] ?? trailing[3]);
        text = trailing[1];
    }

    const name = toSentenceCase(
        text
            .replace(/[^\p{L}\p{N}\s.,/%&'()-]/gu, ' ')
            .replace(/\s+/g, ' ')
            .replace(/^[\s.,;:/&'-]+|[\s.,;:/&'-]+$/g, '')
    );
    if (!isValidItem(name)) return null;
    return quantity && quantity > 1 ? { name, quantity } : { name };
}
