import Dexie, { type Table } from 'dexie';
import type { Extracted, Metadata } from './services/types';

interface Book {
  id?: number;
  meta: Metadata;
  extracted: Extracted;
}

class BookDB extends Dexie {
  books!: Table<Book>;

  constructor() {
    super('bookDB');
    this.version(1).stores({
      books: '++id, meta, extracted'
    });
  }
}

export const db = new BookDB();

export const storeBook = async (meta: Metadata, extracted: Extracted) => {
  for (let storedBook of await db.books.toArray()) {
    if (storedBook.meta.title === meta.title) {
      return storedBook.id;
    }
  }

  try {
    const id = await db.books.add({ meta, extracted });
    return id;
  } catch (error) {
    console.log(error);
  }
}