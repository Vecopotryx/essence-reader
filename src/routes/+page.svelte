<script lang="ts">
	import { goto } from '$app/navigation';
	import { setLoaded } from '$lib/stores';
	import type { Metadata } from '$lib/types';
	import { onMount } from 'svelte';

	let saveBooksOn = true;
	let bookDB: typeof import('$lib/db').default;

	const readFiles = async (file: File) => {
		try {
			const parseEpub = (await import('$lib/services/parse')).parseEpub;
			const { meta, book } = await parseEpub(file);
			setLoaded({ meta, book });

			if (saveBooksOn && file.size < 30000000) {
				const id = (await bookDB.addBook(meta, book)) as number;
				goto(`reading/${id}`);
			} else {
				goto(`/reading`);
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

	let bookList: Metadata[] = [];

	const deleteBook = async (id: number) => {
		bookList = bookList.filter((book) => book.id !== id);
		bookDB.deleteBook(id);
	};

	onMount(async () => {
		bookDB = (await import('$lib/db')).default;
		bookDB.getAllMetas().then((books) => {
			bookList = books;
		});
	});

	const setTheme = (theme: string) => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	};
</script>

<svelte:head>
	<title>Essence Reader</title>
</svelte:head>

{#if bookList}
	{#each bookList as book (book.id)}
		<button
			class="libraryItem"
			on:click={() => {
				// setLoaded(book);
				goto(`reading/${book.id}`);
			}}
		>
			<img src={book.cover ? URL.createObjectURL(book.cover) : ''} width="100px" alt={book.title} />
		</button>
	{/each}
{/if}

<button on:click={() => clickFile()}>
	<h1>📚</h1>
	<h2>Click to select a file</h2>
</button>

<label for="saveBooksOn">Save books on</label>
<input type="checkbox" bind:checked={saveBooksOn} />

<button on:click={() => setTheme('light')}>Light</button>
<button on:click={() => setTheme('dark')}>Dark</button>
<button on:click={() => setTheme('black')}>Black</button>
<button on:click={() => setTheme('warm')}>Warm</button>
