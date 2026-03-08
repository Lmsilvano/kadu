import { db, type AttendanceList, type Participant } from './db';

// Create
export async function saveList(title: string, date: string, participants: Participant[]): Promise<string> {
    const newId = crypto.randomUUID();
    const newList: AttendanceList = {
        id: newId,
        title,
        date,
        participants,
    };

    await db.attendance_lists.add(newList);
    return newId;
}

// Read All
export async function getAllLists(): Promise<AttendanceList[]> {
    return await db.attendance_lists.orderBy('date').reverse().toArray();
}

// Read One
export async function getListById(id: string): Promise<AttendanceList | undefined> {
    return await db.attendance_lists.get(id);
}

// Delete List
export async function deleteList(id: string): Promise<void> {
    await db.attendance_lists.delete(id);
}

export async function deleteMultipleLists(ids: string[]): Promise<void> {
    await db.attendance_lists.bulkDelete(ids);
}

// Update Operations
export async function updateParticipantPresence(listId: string, participantId: string, present: boolean): Promise<void> {
    const list = await getListById(listId);
    if (!list) return;

    const updatedParticipants = list.participants.map(p =>
        p.id === participantId ? { ...p, present } : p
    );

    await db.attendance_lists.update(listId, { participants: updatedParticipants });
}

export async function updateParticipantName(listId: string, participantId: string, newName: string): Promise<void> {
    const list = await getListById(listId);
    if (!list) return;

    const updatedParticipants = list.participants.map(p =>
        p.id === participantId ? { ...p, name: newName } : p
    );

    await db.attendance_lists.update(listId, { participants: updatedParticipants });
}

export async function deleteParticipant(listId: string, participantId: string): Promise<void> {
    const list = await getListById(listId);
    if (!list) return;

    const updatedParticipants = list.participants.filter(p => p.id !== participantId);
    await db.attendance_lists.update(listId, { participants: updatedParticipants });
}

export async function markAll(listId: string, present: boolean): Promise<void> {
    const list = await getListById(listId);
    if (!list) return;

    const updatedParticipants = list.participants.map(p => ({ ...p, present }));
    await db.attendance_lists.update(listId, { participants: updatedParticipants });
}

export async function addParticipantsToList(listId: string, newParticipants: Participant[]): Promise<void> {
    const list = await getListById(listId);
    if (!list) return;

    const updatedParticipants = [...list.participants, ...newParticipants];
    await db.attendance_lists.update(listId, { participants: updatedParticipants });
}

