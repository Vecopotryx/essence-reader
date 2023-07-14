import { addBook } from '$lib/db';
import { goto } from '$app/navigation';
import { setLoaded, shouldSaveStore } from '$lib/stores';
import { parseEpub } from './services/parse';
import { page } from '$app/stores';
import { get } from 'svelte/store';

export const readFile = async (file: File) => {
    try {
        if (!file.type.includes('epub') || !file.type.includes('zip')) {
            throw new Error('File is not of type .epub or .zip');
        }
        const { meta, book } = await parseEpub(file);
        let id = "";

        if (get(shouldSaveStore) && file.size < 30000000) {
            id = await addBook(meta, book);
        }

        setLoaded({ meta, book });

        if (get(page).route.id?.includes("reading")) {
            // Not an ideal solution, but makes sure that reading page is
            // reloaded with new book when already on reading page.
            await goto(`/`);
        }
        goto(`/reading/${id}`);
    } catch (e) {
        alert(e);
    }
};

export const relativeToAbs = (href: string, relativeTo: string) => {
    const [nohash, hash] = href.split('#');
    const url = new URL(nohash, `http://localhost/${relativeTo}`);
    return { path: decodeURI(url.pathname.slice(1)), hash: `#${hash}` };
}