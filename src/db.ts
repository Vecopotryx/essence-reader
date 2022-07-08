import Dexie, { type Table } from 'dexie';

export interface Book {
  id?: number;
  author: string;
  title: string;
  cover: any;
  file: any;
}

export class MySubClassedDexie extends Dexie {
  books!: Table<Book>; 

  constructor() {
    super('bookDB');
    this.version(1).stores({
      books: '++id, author, title, cover, file'
    });
  }
}

export const db = new MySubClassedDexie();

