export const ssr = false;
import type { PageLoad } from './$types';
import { getLoaded, setLoaded } from '$lib/stores';
import { goto } from '$app/navigation';
import type { Book, Metadata } from '$lib/types';

export const load = (async ({ params }) => {
    const loaded = getLoaded();

    // Handles the case where book is loaded, but saving of books is off.
    if (!params.slug && !loaded) {
        throw new Error("No book loaded");
    } else if (!params.slug) {
        return loaded;
    }
    
    const bookDB = (await import('$lib/db')).default;
    const slugID = Number(params.slug);

    if (!loaded || loaded.meta.id !== slugID) {
        const stored = await bookDB.getBook(slugID).catch((e) => {
            console.log("Error occured when loading book from database: ", e);
            goto("/");
        }) as { meta: Metadata; book: Book };
        setLoaded(stored);

        return stored;
    } else {
        return loaded;
    }
}) satisfies PageLoad;