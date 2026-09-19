import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, ScanLine, Trash2, X } from 'lucide-react';
import type { ListCategory, Participant } from '../storage/db';
import type { ParticipantChanges } from '../storage/attendanceStore';
import { CATEGORIES } from '../categories';
import { digitsToCents, formatBRL } from '../utils/money';
import PriceScanner from './PriceScanner';

interface Props {
    participant: Participant;
    category: ListCategory;
    onSave: (changes: ParticipantChanges) => void;
    onDelete: () => void;
    onClose: () => void;
}

const NOTE_SEPARATOR = ' · ';

function noteParts(note: string): string[] {
    return note.split(NOTE_SEPARATOR).map(part => part.trim()).filter(Boolean);
}

function toggleNotePart(note: string, suggestion: string): string {
    const parts = noteParts(note);
    return (parts.includes(suggestion) ? parts.filter(p => p !== suggestion) : [...parts, suggestion]).join(NOTE_SEPARATOR);
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="block mb-1.5 text-xs font-bold tracking-wide text-gray-500 uppercase">
                {label}
            </label>
            {children}
        </div>
    );
}

const inputClass = 'w-full px-4 py-3 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';

function MoneyInput({ id, value, onChange }: { id: string; value: number | undefined; onChange: (cents: number | undefined) => void }) {
    return (
        <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="R$ 0,00"
            value={value === undefined ? '' : formatBRL(value)}
            onChange={e => onChange(digitsToCents(e.target.value))}
            onFocus={e => {
                // Digits always enter from the right, so keep the caret at the end.
                const input = e.currentTarget;
                requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
            }}
            className={`${inputClass} font-semibold tabular-nums`}
        />
    );
}

function QuantityStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
    const buttonClass = 'w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200 disabled:opacity-40 transition-colors';
    return (
        <div className="flex items-center gap-1">
            <button type="button" aria-label="Diminuir quantidade" disabled={value <= 1} onClick={() => onChange(value - 1)} className={buttonClass}>
                <Minus size={18} />
            </button>
            <span className="w-10 text-center text-lg font-bold text-gray-900 tabular-nums" aria-live="polite">{value}</span>
            <button type="button" aria-label="Aumentar quantidade" disabled={value >= 99} onClick={() => onChange(value + 1)} className={buttonClass}>
                <Plus size={18} />
            </button>
        </div>
    );
}

export default function ItemSheet({ participant, category, onSave, onDelete, onClose }: Props) {
    const config = CATEGORIES[category];
    const { notes, pricing } = config.features;

    const [name, setName] = useState(participant.name);
    const [note, setNote] = useState(participant.note ?? '');
    const [priceCents, setPriceCents] = useState(participant.priceCents);
    const [quantity, setQuantity] = useState(participant.quantity ?? 1);
    const [scanning, setScanning] = useState(false);
    const noteRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useLayoutEffect(() => {
        const textarea = noteRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [note]);

    const handleSave = () => {
        const changes: ParticipantChanges = { name: name.trim() || participant.name };
        if (notes) changes.note = note.trim() || undefined;
        if (pricing) {
            changes.priceCents = priceCents;
            changes.quantity = quantity > 1 ? quantity : undefined;
        }
        onSave(changes);
    };

    const activeSuggestions = noteParts(note);

    return createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="item-sheet-title"
                className="relative w-full sm:max-w-md max-h-[90dvh] flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl motion-safe:animate-sheet-up"
            >
                <div className="flex justify-center pt-2 sm:hidden" aria-hidden="true">
                    <div className="w-10 h-1.5 rounded-full bg-gray-200" />
                </div>

                <div className="flex items-center justify-between px-5 pt-2 pb-1">
                    <h2 id="item-sheet-title" className="text-lg font-bold text-gray-900">Detalhes</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="w-11 h-11 -mr-2 flex items-center justify-center text-gray-400 rounded-full active:bg-gray-100 transition-colors"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="px-5 pb-5 pt-2 space-y-5 overflow-y-auto">
                    <Field label="Nome" htmlFor="item-name">
                        <input
                            id="item-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={inputClass}
                        />
                    </Field>

                    {pricing && (
                        <>
                            <Field label="Preço unitário" htmlFor="item-price">
                                <div className="flex gap-2">
                                    <div className="flex-1 min-w-0">
                                        <MoneyInput id="item-price" value={priceCents} onChange={setPriceCents} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setScanning(true)}
                                        aria-label="Ler preço com a câmera"
                                        className="shrink-0 flex items-center gap-2 px-4 rounded-xl bg-blue-50 text-blue-700 font-semibold active:bg-blue-100 transition-colors"
                                    >
                                        <ScanLine size={20} />
                                        Ler
                                    </button>
                                </div>
                            </Field>

                            <Field label="Quantidade">
                                <div className="flex items-center justify-between">
                                    <QuantityStepper value={quantity} onChange={setQuantity} />
                                    {priceCents !== undefined && (
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">Subtotal</div>
                                            <div className="text-lg font-extrabold text-gray-900 tabular-nums">{formatBRL(priceCents * quantity)}</div>
                                        </div>
                                    )}
                                </div>
                            </Field>
                        </>
                    )}

                    {notes && (
                        <Field label="Observação" htmlFor="item-note">
                            <textarea
                                id="item-note"
                                ref={noteRef}
                                rows={2}
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder={config.notePlaceholder}
                                className={`${inputClass} max-h-40 resize-none leading-relaxed`}
                            />
                            {config.noteSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2.5">
                                    {config.noteSuggestions.map(suggestion => {
                                        const active = activeSuggestions.includes(suggestion);
                                        return (
                                            <button
                                                key={suggestion}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => setNote(current => toggleNotePart(current, suggestion))}
                                                className={`px-3.5 py-2 text-sm font-semibold rounded-full border transition-colors ${active
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'bg-white border-gray-200 text-gray-600 active:bg-gray-100'
                                                    }`}
                                            >
                                                {suggestion}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </Field>
                    )}
                </div>

                <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50 sm:rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex items-center gap-2 px-4 py-3 text-red-600 font-semibold rounded-xl active:bg-red-50 transition-colors"
                    >
                        <Trash2 size={18} />
                        Excluir
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl active:bg-blue-700 transition-colors"
                    >
                        Salvar
                    </button>
                </div>
            </div>

            {scanning && (
                <PriceScanner
                    onClose={() => setScanning(false)}
                    onConfirm={cents => {
                        setPriceCents(cents);
                        setScanning(false);
                    }}
                />
            )}
        </div>,
        document.body
    );
}
