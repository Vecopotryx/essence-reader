import { openDB, deleteDB } from 'idb';
import type { Book, Metadata } from '$lib/types';

const DB_NAME = 'bookDB';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const METAS_STORE = 'metas';

export const openBookDB = openDB(DB_NAME, DB_VERSION, {
	upgrade(db) {
		db.createObjectStore(BOOKS_STORE, { keyPath: 'id', autoIncrement: true });
		db.createObjectStore(METAS_STORE, { keyPath: 'id' });
	}
});

export const addBook = async (meta: Metadata, book: Book) => {
	try {
		const db = await openBookDB;
		const tx = db.transaction([BOOKS_STORE, METAS_STORE], 'readwrite');
		const booksStore = tx.objectStore(BOOKS_STORE);
		const metasStore = tx.objectStore(METAS_STORE);

		const foundBook = (await metasStore.getAll()).find(
			(b) => b.title === meta.title
		);
		if (foundBook) return foundBook.id; // Don't save duplicate books

		const bookID = await booksStore.add(book);

		meta.id = Number(bookID);
		await metasStore.add(meta);

		await tx.done;

		return bookID;
	} catch (error) {
		console.error('Failed to add book:', error);
		return -1;
	}
};

export const getAllMetas = async (): Promise<Metadata[]> => {
	try {
		const store = (await openBookDB)
			.transaction(METAS_STORE)
			.objectStore(METAS_STORE);
		return await store.getAll();
	} catch (error) {
		console.error('Failed to get all books:', error);
		if (
			(error as Error).message.includes('version') ||
			(error as Error).message.includes('store name')
		) {
			// This is primarily such that if an old (higher version)
			// database is found (like one from Dexie),
			// a new one can be created and allow the app to continue.
			console.log('Deleting old database');
			await deleteDB(DB_NAME);
			location.reload();
		}
		return [];
	}
};
