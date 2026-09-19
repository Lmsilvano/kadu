export interface PriceCandidate {
    cents: number;
    label?: string;
}

// The response format here is what extractPriceCandidates parses.
export const PRICE_PROMPT = `Esta imagem mostra a etiqueta de preço de um produto (gôndola ou embalagem de supermercado).
Liste os preços visíveis, um por linha, no formato "12,99 - descrição curta" (ex.: "preço", "promoção", "clube", "por kg", "leve 3").
Coloque primeiro o preço que o cliente paga por uma unidade.
Centavos escritos pequenos ou sobrescritos fazem parte do preço (ex.: 12⁹⁹ = 12,99).
Não invente valores. Se não houver preço legível, responda apenas NENHUM.`;

// "12,99", "1.299,90", "R$ 12,99", "12.99"
const PRICE_RE = /(?<!\d)(\d{1,3}(?:\.\d{3})+|\d{1,5})\s?[,.]\s?(\d{2})(?!\d)/g;
// Raised cents on shelf tags are often read as a separate group: "12 99"
const RAISED_CENTS_RE = /^\s*(?:R\$\s*)?(\d{1,4})\s+(\d{2})\s*$/;
const MAX_CENTS = 10_000_000;

function toCents(integerPart: string, decimals: string): number {
    return Number(integerPart.replace(/\./g, '')) * 100 + Number(decimals);
}

export function extractPriceCandidates(text: string): PriceCandidate[] {
    const found: PriceCandidate[] = [];

    for (const line of text.split('\n')) {
        const raised = line.match(RAISED_CENTS_RE);
        if (raised) {
            found.push({ cents: toCents(raised[1], raised[2]) });
            continue;
        }

        const matches = [...line.matchAll(PRICE_RE)];
        for (const m of matches) {
            const label = matches.length === 1
                ? line.slice(m.index! + m[0].length).replace(/^[\s\-–—:|·]+/, '').trim().slice(0, 24)
                : '';
            found.push({ cents: toCents(m[1], m[2]), ...(label ? { label } : {}) });
        }
    }

    const seen = new Set<number>();
    return found.filter(c => {
        if (c.cents <= 0 || c.cents >= MAX_CENTS || seen.has(c.cents)) return false;
        seen.add(c.cents);
        return true;
    });
}
