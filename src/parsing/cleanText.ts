const NOISE_WORDS = [
    'masculino', 'feminino', 'lista', 'residentes',
    'passagem', 'data', 'nome', 'assinatura', 'turno',
    'diurno', 'noturno', 'plantao', 'escala',
];

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
