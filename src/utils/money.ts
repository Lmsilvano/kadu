import type { Participant } from '../storage/db';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(cents: number): string {
    return brl.format(cents / 100);
}

// ATM-style entry: each typed digit shifts in from the right ("1299" -> R$ 12,99).
export function digitsToCents(input: string): number | undefined {
    const digits = input.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9);
    return digits ? Number(digits) : undefined;
}

export function itemSubtotalCents(p: Participant): number | undefined {
    return p.priceCents === undefined ? undefined : p.priceCents * (p.quantity ?? 1);
}

export interface ListTotals {
    estimatedCents: number;
    inCartCents: number;
    missingPrice: number;
}

export function listTotals(participants: Participant[]): ListTotals {
    const totals: ListTotals = { estimatedCents: 0, inCartCents: 0, missingPrice: 0 };
    for (const p of participants) {
        const subtotal = itemSubtotalCents(p);
        if (subtotal === undefined) {
            totals.missingPrice++;
            continue;
        }
        totals.estimatedCents += subtotal;
        if (p.present) totals.inCartCents += subtotal;
    }
    return totals;
}
