import { LIST_CATEGORIES, type ListCategory } from '../storage/db';
import { CATEGORIES } from '../categories';

interface Props {
    value: ListCategory;
    onChange: (category: ListCategory) => void;
}

export default function CategoryPicker({ value, onChange }: Props) {
    return (
        <div role="radiogroup" aria-label="Tipo de lista" className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-2xl">
            {LIST_CATEGORIES.map(id => {
                const { label, description, icon: Icon } = CATEGORIES[id];
                const selected = id === value;
                return (
                    <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(id)}
                        className={`flex items-center gap-2.5 p-2.5 min-h-[56px] rounded-xl text-left transition-all ${selected ? 'bg-white shadow-sm ring-1 ring-blue-200' : 'active:bg-gray-200'}`}
                    >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-400'}`}>
                            <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className={`font-bold text-sm ${selected ? 'text-gray-900' : 'text-gray-500'}`}>{label}</div>
                            <div className="text-[11px] text-gray-500 leading-tight">{description}</div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
