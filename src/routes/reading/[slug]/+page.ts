import type { PageLoad } from './$types';
import type { Book } from '$lib/types';

export const ssr = false;

export const load = (async ({ params }) => {

    const book: Book = {
        id: Number(params.slug),
        meta: {
            title: params.slug,
            author: ["Author"],
            cover: undefined,
        },
        contents: new Map<string, { index: number, html: string }>(),
        spine: [],
        toc: [],
        files: {
            images: new Map<string, Blob>(),
            fonts: new Map<string, Blob>(),
            styles: new Map<string, string>(),
        },
        progress: 0,
    };

    return { currentBook: book }


}) satisfies PageLoad;