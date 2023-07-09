import { addBook } from '$lib/db';
import { goto } from '$app/navigation';
import { setLoaded } from '$lib/stores';
import { parseEpub } from './services/parse';
import { page } from '$app/stores';
import { get } from 'svelte/store';

export const readFile = async (file: File) => {
    try {
        if (!file.type.includes('epub') || !file.type.includes('zip')) {
            throw new Error('File is not of type .epub or .zip');
        }
        const { meta, book } = await parseEpub(file);
        setLoaded({ meta, book });

        if (/*saveBooksOn && */file.size < 30000000) {
            const id = await addBook(meta, book) as number;
            if (get(page).route.id?.includes("reading")) {
                // Not an ideal solution, but makes sure that reading page is
                // reloaded with new book when already on reading page.
                await goto(`/`);
            }
            goto(`/reading/${id}`);
        } else {
            goto(`/reading`);
        }
    } catch (e) {
        alert(e);
    }
};

export const relativeToAbs = (path: string, relativeTo: string) => {
    const url = new URL(path, `http://localhost/${relativeTo}`);
    return { path: url.pathname.slice(1), hash: url.hash };
}