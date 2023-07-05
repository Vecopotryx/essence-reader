import { writable } from 'svelte/store';
import type { Book } from '$lib/types';

export const currentBook = writable<Book>(undefined);
