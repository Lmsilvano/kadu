import { useState, useEffect } from 'react';
import { db, type AttendanceList } from '../storage/db';

export function useAttendanceStore() {
    const [lists, setLists] = useState<AttendanceList[]>([]);
    const [loading, setLoading] = useState(true);

    // Auto-subscribe to Dexie changes
    useEffect(() => {
        let active = true;

        async function fetchLists() {
            try {
                const data = await db.attendance_lists.orderBy('date').reverse().toArray();
                if (active) {
                    setLists(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to fetch lists", err);
                setLoading(false);
            }
        }

        fetchLists();

        db.attendance_lists.hook('creating', () => { fetchLists(); });
        db.attendance_lists.hook('updating', () => { fetchLists(); });
        db.attendance_lists.hook('deleting', () => { fetchLists(); });

        return () => {
            active = false;
            // Note: Dexie hooks are global, so we don't unsubscribe here in this simple implementation
        };
    }, []);

    return { lists, loading };
}
