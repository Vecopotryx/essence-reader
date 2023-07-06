import { get, writable } from 'svelte/store';
import type { Book, Metadata } from '$lib/types';

const loadedStore = writable<{ meta: Metadata, book: Book }>(undefined);

export const getLoaded = () => {
    return get(loadedStore);
}

export const setLoaded = (object: { meta: Metadata, book: Book }) => {
    loadedStore.set(object);
}