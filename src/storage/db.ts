import Dexie, { type EntityTable } from 'dexie';

export const LIST_CATEGORIES = ['padrao', 'mercado'] as const;
export type ListCategory = (typeof LIST_CATEGORIES)[number];

export interface Participant {
    id: string;      // uuid
    name: string;
    present: boolean; // "no carrinho" in mercado lists
    note?: string;
    priceCents?: number; // unit price
    quantity?: number;   // missing = 1
}

export interface AttendanceList {
    id: string;      // uuid
    title: string;
    date: string;    // ISO Date
    category: ListCategory;
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

db.version(3).stores({
    attendance_lists: 'id, title, date, category',
    settings: 'key'
}).upgrade(tx =>
    tx.table('attendance_lists').toCollection().modify(list => {
        list.category ??= 'padrao';
    })
);
