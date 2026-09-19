import type { Participant } from '../storage/db';
import { formatBRL, listTotals } from '../utils/money';

export default function MarketTotalsBar({ participants }: { participants: Participant[] }) {
    const { estimatedCents, inCartCents, missingPrice } = listTotals(participants);

    return (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
            <div className="max-w-2xl mx-auto px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-gray-500">No carrinho</span>
                    <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">{formatBRL(inCartCents)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-0.5 text-xs">
                    <span className="text-gray-500">
                        Estimado <strong className="text-gray-800 tabular-nums">{formatBRL(estimatedCents)}</strong>
                    </span>
                    {missingPrice > 0 && (
                        <span className="font-semibold text-amber-600">{missingPrice} sem preço</span>
                    )}
                </div>
            </div>
        </div>
    );
}
