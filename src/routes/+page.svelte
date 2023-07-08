<script lang="ts">
	import { goto } from '$app/navigation';
	import { setLoaded } from '$lib/stores';
	import type { Metadata } from '$lib/types';
	import { onMount } from 'svelte';
	import Topbar from '$lib/components/Topbar.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import { Settings } from 'carbon-icons-svelte';
	import ThemePicker from '$lib/components/ThemePicker.svelte';
    import { flip } from "svelte/animate";

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

	const deleteAllBooks = async () => {
		// TODO: Implement
	};

	onMount(async () => {
		bookDB = (await import('$lib/db')).default;
		bookDB.getAllMetas().then((books) => {
			bookList = books;
		});
	});
</script>

<svelte:head>
	<title>Essence Reader</title>
</svelte:head>

<Topbar>
	<h3 slot="toptext">Essence Reader</h3>
	<Popover slot="rightbar">
		<Settings slot="icon" size={24} />
		<div style="width: 8em">
			<label>
				<input type="checkbox" bind:checked={saveBooksOn} />
				Save books
			</label>
			<button on:click={deleteAllBooks}>Remove all</button>
			<hr />
			Select theme
			<ThemePicker />
		</div>
	</Popover>
</Topbar>

<div id="parent">
	{#if bookList}
		{#each bookList as book (book.id)}
			<button
				class="libraryItem"
				on:click={() => goto(`reading/${book.id}`)}
				animate:flip={{ duration: 200 }}
			>
				<img src={book.cover ? URL.createObjectURL(book.cover) : ''} width="100px" alt={book.title} />
				<!-- <BookPreview {book} {deleteBook} /> -->
			</button>
		{/each}
	{/if}

	<button
		class="libraryItem"
		on:click={() => clickFile()}
	>
		<h1 id="dropInfoIcon">📚</h1>

		<h2>Drop anywhere or click to select a file</h2>
	</button>
</div>

<style>
	#parent {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		padding: 3.5em 1em 1em;
		gap: 1em;
	}

	#dropInfoIcon {
		font-size: 5em;
		margin: 0;
	}

	.libraryItem {
		color: inherit;
		border: none;
		overflow: hidden;
		font-size: inherit;
		font-family: inherit;
		flex: 1 1 100%;
		height: 15em;
		padding: 0;
		max-width: 30vw;
		min-width: 20em;
		border-radius: 0.5em;
		filter: drop-shadow(0 15px 15px rgb(0 0 0 / 0.15));
		background-color: rgb(var(--secondary-bg));
		transition: transform 0.25s;
	}

	.libraryItem:hover,
	.libraryItem:focus {
		cursor: pointer;
		transform: translateY(-0.5em);
	}
</style>
