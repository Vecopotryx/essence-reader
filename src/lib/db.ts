import { openDB, deleteDB } from 'idb';
import type { Book, Metadata } from '$lib/types';

const DB_NAME = 'bookDB';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const METAS_STORE = 'metas';

const openBookDB = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(BOOKS_STORE) ||!db.objectStoreNames.contains('metas') ) {
      db.createObjectStore(BOOKS_STORE, { keyPath: 'id', autoIncrement: true });
      db.createObjectStore(METAS_STORE, { keyPath: 'id' });
    }
  },
});

const bookDB = {
  async addBook(meta: Metadata, book: Book) {
    try {
      const db = (await openBookDB);
      const metas = await db.getAll('metas');
      const foundBook = metas.find((b) => b.title === meta.title);
  
      // Don't save duplicate books
      if (foundBook) {
        return foundBook.id;
      }
  
      const tx = db.transaction([BOOKS_STORE, 'metas'], 'readwrite');
      const bookStore = tx.objectStore(BOOKS_STORE);
      const metasStore = tx.objectStore(METAS_STORE);
  
      const bookID = await bookStore.add(book);

      meta.id = Number(bookID);
      await metasStore.add(meta);
  
      await tx.done;
      return bookID;
    } catch (error) {
      console.error('Failed to add book:', error);
      return -1;
    }
  },

  async updateMeta(meta: Metadata) {
    try {
      return (await openBookDB).put(METAS_STORE, meta);
    } catch (error) {
      console.error('Failed to update book metadata:', error);
      return -1;
    };
  },

  async deleteBook(id: number) {
    try {
      return (await openBookDB).delete(BOOKS_STORE, id);
    } catch (error) {
      console.error('Failed to delete book:', error);
      return -1;
    }
  },

  async deleteAll() {
    try {
      return (await openBookDB).clear(BOOKS_STORE);
    } catch (error) {
      console.error('Failed to delete all books:', error);
      return -1;
    }
  },

  async getBook(id: number): Promise<{ meta: Metadata, book: Book }> {
    const meta = await (await openBookDB).get(METAS_STORE, id);
    const book = await (await openBookDB).get(BOOKS_STORE, id);
    if (!book) throw new Error("Book not found");
    return { meta, book };
  },


  async getAllMetas() {
    return this.getAll(METAS_STORE);
  },

  async getAll(store?: string) {
    try {
      return (await openBookDB).getAll(store || BOOKS_STORE);
    } catch (error) {
      console.error('Failed to get all books:', error);
      if (error.message.includes("version")) {
        // This is primarily such that if an old (higher version) 
        // database is found (like one from Dexie),
        // a new one can be created and allow the app to continue.
        console.log("Deleting old database");
        await deleteDB(DB_NAME);
        location.reload();
      }
      return [];
    }
  },
};

export default bookDB;
