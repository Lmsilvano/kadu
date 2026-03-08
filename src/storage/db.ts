import Dexie, { type EntityTable } from 'dexie';

export interface Participant {
    id: string;      // uuid
    name: string;
    present: boolean;
}

export interface AttendanceList {
    id: string;      // uuid
    title: string;
    date: string;    // ISO Date
    participants: Participant[];
}

export const db = new Dexie('AttendanceScannerDB') as Dexie & {
    attendance_lists: EntityTable<
        AttendanceList,
        'id' // primary key "id"
    >;
};

// Schema declaration
db.version(1).stores({
    attendance_lists: 'id, title, date' // primary key and indexes
});
