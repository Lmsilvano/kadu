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

export interface AppSettings {
    key: string;
    value: string;
}

export const db = new Dexie('AttendanceScannerDB') as Dexie & {
    attendance_lists: EntityTable<
        AttendanceList,
        'id'
    >;
    settings: EntityTable<
        AppSettings,
        'key'
    >;
};

db.version(1).stores({
    attendance_lists: 'id, title, date'
});

db.version(2).stores({
    attendance_lists: 'id, title, date',
    settings: 'key'
});
