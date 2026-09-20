import { Check, Edit2, MessageSquareText, Trash2 } from 'lucide-react';
import type { ListCategory, Participant } from '../storage/db';
import { CATEGORIES } from '../categories';
import { formatBRL, itemSubtotalCents } from '../utils/money';

interface Props {
    participant: Participant;
    category: ListCategory;
    onTogglePresence: (id: string, present: boolean) => void;
    onDelete: (id: string) => void;
    onOpenDetails: (id: string) => void;
}

export default function NameReviewItem({ participant, category, onTogglePresence, onDelete, onOpenDetails }: Props) {
    const config = CATEGORIES[category];
    const { notes, pricing } = config.features;
    const checked = participant.present;
    const quantity = participant.quantity ?? 1;
    const subtotal = itemSubtotalCents(participant);

    return (
        <div
            className={`flex items-center justify-between py-3 pl-4 pr-1.5 mb-3 rounded-2xl shadow-sm border transition-all duration-300 ease-in-out cursor-pointer overflow-hidden relative
            ${checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}
            onClick={(e) => {
                // Prevent toggle if clicking on action buttons
                if ((e.target as HTMLElement).closest('.actions')) return;
                onTogglePresence(participant.id, !checked);
            }}
        >
            {/* Active Left Border for checked state */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${checked ? 'bg-emerald-500' : 'bg-transparent'}`} />

            {/* LEFT SIDE: Checkbox + Name + Note */}
            <div className="flex items-center gap-4 flex-1 ml-2 min-w-0">
                <div
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={config.checkedLabel}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300 ${checked
                        ? 'bg-emerald-500 border-emerald-500 scale-110'
                        : 'border-slate-300 bg-transparent'
                        }`}
                >
                    {checked && <Check size={14} className="text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                    <span className={`block text-base font-semibold truncate transition-colors duration-200
                        ${checked ? 'text-slate-900' : 'text-slate-600'}
                        ${checked && config.strikeChecked ? 'line-through decoration-emerald-600/50' : ''}`}
                    >
                        {pricing && quantity > 1 && <span className="mr-1 text-blue-600">{quantity}×</span>}
                        {participant.name}
                    </span>
                    {notes && participant.note && (
                        <p className="mt-0.5 text-sm text-slate-500 line-clamp-2 break-words">
                            <MessageSquareText size={13} className="inline-block -mt-0.5 mr-1 text-slate-400" />
                            {participant.note}
                        </p>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: Actions */}
            <div className="actions flex items-center ml-2 shrink-0">
                {pricing ? (
                    <button
                        type="button"
                        onClick={() => onOpenDetails(participant.id)}
                        className="min-h-11 px-2 flex flex-col items-end justify-center rounded-xl active:bg-slate-100 transition-colors"
                        aria-label="Preço e detalhes"
                    >
                        {subtotal !== undefined ? (
                            <>
                                <span className="text-sm font-bold text-slate-900 whitespace-nowrap tabular-nums">{formatBRL(subtotal)}</span>
                                {quantity > 1 && (
                                    <span className="text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                                        {formatBRL(participant.priceCents!)} cada
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="px-2.5 py-1 text-xs font-semibold text-blue-600 border border-dashed border-blue-300 rounded-full whitespace-nowrap">
                                + preço
                            </span>
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => onOpenDetails(participant.id)}
                        className="w-11 h-11 flex items-center justify-center text-slate-400 rounded-xl active:text-blue-600 active:bg-blue-50 transition-colors"
                        aria-label="Editar e observações"
                        title="Editar e observações"
                    >
                        <Edit2 size={18} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onDelete(participant.id)}
                    className="w-11 h-11 flex items-center justify-center text-slate-400 rounded-xl active:text-red-600 active:bg-red-50 transition-colors"
                    aria-label="Excluir"
                    title="Excluir"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
