import Dexie, { type Table } from 'dexie';

export interface Book {
  id?: number;
  name: string;
  cover: any;
  file: any;
}

export class MySubClassedDexie extends Dexie {
  books!: Table<Book>; 

  constructor() {
    super('bookDB');
    this.version(1).stores({
      books: '++id, name, cover, file'
    });
  }
}

export const db = new MySubClassedDexie();

