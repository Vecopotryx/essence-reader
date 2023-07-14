import { get, writable } from 'svelte/store';
import type { Book, Metadata } from '$lib/types';
import { browser } from '$app/environment';

const loadedStore = writable<{ meta: Metadata, book: Book }>(undefined);

export const getLoaded = () => {
    return get(loadedStore);
}

export const setLoaded = (object: { meta: Metadata, book: Book }) => {
    loadedStore.set(object);
}

export const shouldSaveStore = writable<boolean>(true);

if (browser && localStorage.getItem('shouldSave') !== null) {
    try {
        shouldSaveStore.set(JSON.parse(localStorage.getItem('shouldSave') as string));
    } catch {
        localStorage.removeItem('shouldSave');
    }
    shouldSaveStore.subscribe((value) => localStorage.setItem('shouldSave', JSON.stringify(value)));
}
