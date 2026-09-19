import type { AttendanceList } from '../storage/db';
import { CATEGORIES } from '../categories';
import { itemSubtotalCents, listTotals } from './money';

type Cell = string | number | undefined;

// ";" and decimal comma are what Excel in pt-BR expects.
const SEPARATOR = ';';

function csvCell(value: Cell): string {
    if (value === undefined) return '';
    const text = String(value);
    return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function decimal(cents: number | undefined): string | undefined {
    return cents === undefined ? undefined : (cents / 100).toFixed(2).replace('.', ',');
}

const yesNo = (value: boolean) => (value ? 'Sim' : 'Não');

export function generateCSV(list: AttendanceList) {
    const { notes, pricing } = CATEGORIES[list.category].features;
    const dateStr = new Date(list.date).toLocaleDateString('pt-BR');

    const rows: Cell[][] = [['Lista', list.title], ['Data', dateStr], []];

    if (pricing) {
        rows.push(['Item', 'Qtd', 'Preço unit.', 'Subtotal', 'No carrinho', ...(notes ? ['Observação'] : [])]);
        for (const p of list.participants) {
            rows.push([
                p.name,
                p.quantity ?? 1,
                decimal(p.priceCents),
                decimal(itemSubtotalCents(p)),
                yesNo(p.present),
                ...(notes ? [p.note] : []),
            ]);
        }
        const totals = listTotals(list.participants);
        rows.push(
            [],
            ['Total estimado', '', '', decimal(totals.estimatedCents)],
            ['Total no carrinho', '', '', decimal(totals.inCartCents)],
        );
    } else {
        rows.push(['Nome', 'Presente', ...(notes ? ['Observação'] : [])]);
        for (const p of list.participants) {
            rows.push([p.name, yesNo(p.present), ...(notes ? [p.note] : [])]);
        }
    }

    // BOM so Excel reads the accents as UTF-8.
    const csv = '﻿' + rows.map(row => row.map(csvCell).join(SEPARATOR)).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));

    const link = document.createElement('a');
    link.href = url;
    link.download = `${list.title.replace(/[\\/:*?"<>|]+/g, '-')}.csv`;
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
