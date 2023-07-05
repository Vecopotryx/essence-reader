export const ssr = false;
import type { PageLoad } from './$types';
import { getLoadedBook, setLoadedBook } from '$lib/stores';

export const load = (async ({ params }) => {
    const bookDB = (await import('$lib/db')).default;
    const loadedBook = getLoadedBook();
    const slugID = Number(params.slug);

    if (!loadedBook || loadedBook.id !== slugID) {
        const book = await bookDB.getBook(slugID);
        setLoadedBook(book);
        return { currentBook: book };
    } else {
        return { currentBook: loadedBook };
    }
}) satisfies PageLoad;