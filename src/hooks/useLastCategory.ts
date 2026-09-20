import { useCallback, useEffect, useState } from 'react';
import type { ListCategory } from '../storage/db';
import { getLastCategory, setLastCategory } from '../storage/settingsStore';

export function useLastCategory(): [ListCategory, (category: ListCategory) => void] {
    const [category, setCategory] = useState<ListCategory>('padrao');

    useEffect(() => {
        getLastCategory().then(setCategory);
    }, []);

    const update = useCallback((next: ListCategory) => {
        setCategory(next);
        setLastCategory(next);
    }, []);

    return [category, update];
}
