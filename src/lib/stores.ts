import { get, writable } from 'svelte/store';
import type { Book } from '$lib/types';

const loadedBookStore = writable<Book>(undefined);

export const getLoadedBook = () => {
    return get(loadedBookStore);
}

export const setLoadedBook = (book: Book) => {
    loadedBookStore.set(book);
}