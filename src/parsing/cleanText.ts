export function cleanOcrText(rawText: string): string {
    if (!rawText) return "";

    // 1. Remove leading numbers, dots, dashes, parentheses and spaces.
    // E.g., "1. Joao Silva", "2- Maria", "3) Pedro"
    let cleaned = rawText.replace(/^[\d\s\.\-\)]+/g, '');

    // 2. Remove all non-letter characters (except spaces and accented characters)
    // Allowed ranges: A-Z, a-z, and Portuguese accents
    cleaned = cleaned.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');

    // 3. Trim extra spaces and collapse multiple spaces into one
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

export function isValidName(name: string): boolean {
    // A name is valid if it has at least 3 characters and contains at least one space (ideally a first and last name)
    // Given OCR noise, we loosen it to just needing at least 3 letters.
    return name.trim().length >= 3;
}
