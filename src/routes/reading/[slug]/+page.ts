export const ssr = false;
import type { PageLoad } from './$types';
import { getLoadedBook, setLoadedBook } from '$lib/stores';
import { goto } from '$app/navigation';

export const load = (async ({ params }) => {
    const bookDB = (await import('$lib/db')).default;
    const loadedBook = getLoadedBook();
    const slugID = Number(params.slug);

    // Handles the case where book is loaded, but saving of books is off.
    if(loadedBook && slugID === -1) {
        return { currentBook: loadedBook };
    }

    if (!loadedBook || loadedBook.id !== slugID) {
        const book = await bookDB.getBook(slugID).catch((e) => {
            console.log("Error occured when loading book from database: ", e);
            goto("/");
        });
        setLoadedBook(book);
        return { currentBook: book };

    } else {
        return { currentBook: loadedBook };
    }
}) satisfies PageLoad;