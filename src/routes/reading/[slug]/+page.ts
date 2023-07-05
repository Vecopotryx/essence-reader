import type { PageLoad } from './$types';
import type { Book } from '$lib/types';
import { currentBook } from '$lib/stores';
import { get } from 'svelte/store';

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

    if(get(currentBook) && params.slug === '-1') {
        return { currentBook: get(currentBook) }
    }

    return { currentBook: book }


}) satisfies PageLoad;