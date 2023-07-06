<script lang="ts">
	import { goto } from '$app/navigation';
	import { setLoadedBook } from '$lib/stores';
	import type { Book } from '$lib/types';
	import { onMount } from 'svelte';

	let saveBooksOn = true;

	const readFiles = async (file: File) => {
		try {
			const parseEpub = (await import('$lib/services/parse')).parseEpub;
            const addBook = (await import('$lib/db')).default.addBook;
			const book = await parseEpub(file);
			setLoadedBook(book);

			if (saveBooksOn && file.size < 30000000) {
				const id = (await addBook(book)) as number;
				goto(`reading/${id}`);
			} else {
				goto(`/reading/-1`);
			}
		} catch (e) {
			alert(e);
		}
	};

	const clickFile = () => {
		let input = document.createElement('input');
		input.type = 'file';
		input.onchange = (e) => {
			readFiles((e.target as HTMLInputElement).files[0]);
		};

		input.click();
	};

    let bookList: Book[] = [];

    // Not a good solution. Fix those imports 


    const deleteBook = async(id: number) => {
        let bookDB = (await import('$lib/db')).default;

        bookList = bookList.filter((book) => book.id !== id);
        bookDB.deleteBook(id);
    };

    onMount(async() => {
        let bookDB = (await import('$lib/db')).default;
        bookDB.getAll().then((books) => {
            bookList = books;
        });
    });
</script>

<svelte:head>
	<title>Essence Reader</title>
</svelte:head>

{#if bookList}
            {#each bookList as book (book.id)}
                <button
                    class="libraryItem"
                    on:click={() => { setLoadedBook(book); goto(`reading/${book.id}`); } }
                >
                    <img src={book.meta.cover ? URL.createObjectURL(book.meta.cover) : ""} width="100px" alt={book.meta.title}>
                </button>
            {/each}
        {/if}

<button on:click={() => clickFile()}>
	<h1>📚</h1>
	<h2>Click to select a file</h2>
</button>
