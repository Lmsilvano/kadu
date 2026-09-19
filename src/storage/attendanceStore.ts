import { db, type AttendanceList, type Participant } from './db';
import type { ParsedItem } from '../parsing/cleanText';

export type ParticipantChanges = Partial<Omit<Participant, 'id'>>;

export function newParticipants(items: ParsedItem[]): Participant[] {
    return items.map(item => ({
        id: crypto.randomUUID(),
        name: item.name,
        present: false,
        ...(item.quantity && item.quantity > 1 ? { quantity: item.quantity } : {}),
    }));
}

// Create
export async function saveList(list: Omit<AttendanceList, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.attendance_lists.add({ id, ...list });
    return id;
}

// Read All
export async function getAllLists(): Promise<AttendanceList[]> {
    return await db.attendance_lists.orderBy('date').reverse().toArray();
}

// Delete List
export async function deleteList(id: string): Promise<void> {
    await db.attendance_lists.delete(id);
}

export async function deleteMultipleLists(ids: string[]): Promise<void> {
    await db.attendance_lists.bulkDelete(ids);
}

// Update Operations
export async function updateList(listId: string, changes: Partial<Pick<AttendanceList, 'title' | 'category'>>): Promise<void> {
    await db.attendance_lists.update(listId, changes);
}

// modify() runs read + write in one transaction, so quick successive taps can't overwrite each other.
async function modifyParticipants(listId: string, fn: (participants: Participant[]) => Participant[]): Promise<void> {
    await db.attendance_lists.where('id').equals(listId).modify(list => {
        list.participants = fn(list.participants);
    });
}

export async function updateParticipant(listId: string, participantId: string, changes: ParticipantChanges): Promise<void> {
    await modifyParticipants(listId, participants =>
        participants.map(p => p.id === participantId ? { ...p, ...changes } : p)
    );
}

export async function deleteParticipant(listId: string, participantId: string): Promise<void> {
    await modifyParticipants(listId, participants => participants.filter(p => p.id !== participantId));
}

export async function markAll(listId: string, present: boolean): Promise<void> {
    await modifyParticipants(listId, participants => participants.map(p => ({ ...p, present })));
}

export async function addParticipantsToList(listId: string, participants: Participant[]): Promise<void> {
    await modifyParticipants(listId, existing => [...existing, ...participants]);
}
