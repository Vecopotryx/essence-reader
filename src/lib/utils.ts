import bookDB from '$lib/db';
import { goto } from '$app/navigation';
import { setLoaded } from '$lib/stores';
import { parseEpub } from './services/parse';

export const readFile = async (file: File) => {
    try {
        const { meta, book } = await parseEpub(file);
        setLoaded({ meta, book });

        if (/*saveBooksOn && */file.size < 30000000) {
            const id = await bookDB.addBook(meta, book) as number;
            goto(`/reading/${id}`);
        } else {
            goto(`/reading`);
        }
    } catch (e) {
        alert(e);
    }
};