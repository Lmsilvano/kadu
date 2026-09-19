import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/db';

export function useAttendanceStore() {
    // useLiveQuery handles component unmounting, transactions, and bulk updates automatically.
    // It returns undefined while loading.
    const lists = useLiveQuery(() => db.attendance_lists.orderBy('date').reverse().toArray());

    return {
        lists: lists || [],
        loading: lists === undefined
    };
}

/** undefined while loading, null when the list doesn't exist. */
export function useAttendanceList(id: string | undefined) {
    return useLiveQuery(async () => (id ? await db.attendance_lists.get(id) : undefined) ?? null, [id]);
}
