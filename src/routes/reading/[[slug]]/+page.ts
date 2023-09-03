export const ssr = false;
import type { PageLoad } from './$types';
import { getLoaded, setLoaded } from '$lib/stores';
import type { Book, Metadata } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const loaded = getLoaded();

	// Handles the case where book is loaded, but saving of books is off.
	if (!params.slug && !loaded) {
		throw new Error('No book loaded');
	} else if (!params.slug) {
		return loaded;
	}

	const slugID = Number(params.slug);
	if (!loaded || loaded.meta.id !== slugID) {
		const db = await (await import('$lib/db')).openBookDB;

		const tx = db.transaction(['metas', 'books'], 'readonly');
		const meta = await tx.objectStore('metas').get(slugID);
		const book = await tx.objectStore('books').get(slugID);
		await tx.done;

		if (!book) throw error(404, 'Book not found in database');

		const stored = { meta, book };
		setLoaded(stored);

		return stored;
	}

	return loaded;
}) satisfies PageLoad;
