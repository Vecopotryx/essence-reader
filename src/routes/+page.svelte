<script lang="ts">
	import { goto } from '$app/navigation';
	import { shouldSaveStore } from '$lib/stores';
	import type { Metadata } from '$lib/types';
	import { onMount } from 'svelte';
	import Topbar from '$lib/components/Topbar.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import { Settings } from 'carbon-icons-svelte';
	import ThemePicker from '$lib/components/ThemePicker.svelte';
	import { flip } from 'svelte/animate';
	import BookPreview from './BookPreview.svelte';
	let openBookDB: typeof import('$lib/db').openBookDB;

	const clickFile = async () => {
		let input = document.createElement('input');
		const readFile = (await import('$lib/utils')).readFile;

		input.type = 'file';
		input.multiple = true;
		input.onchange = (e) => {
			const files = (e.target as HTMLInputElement).files;
			if (!files) return;
			for (const file of files) {
				readFile(file); // Perhaps want to pass saveBooksOn here
			}
		};

		input.click();
	};

	let bookList: Metadata[] = [];

	const deleteBook = async (id: number) => {
		bookList = bookList.filter((book) => book.id !== id);
		try {
			const db = await openBookDB;
			const tx = db.transaction(['metas', 'books'], 'readwrite');
			tx.objectStore('metas').delete(id);
			tx.objectStore('books').delete(id);
			await tx.done;
		} catch (error) {
			console.error('Failed to delete book:', error);
		}
	};

	const deleteAllBooks = async () => {
		bookList = [];
		try {
			const db = await openBookDB;
			const tx = db.transaction(['metas', 'books'], 'readwrite');
			tx.objectStore('metas').clear();
			tx.objectStore('books').clear();
			await tx.done;
		} catch (error) {
			console.error('Failed to delete all books:', error);
		}
	};

	onMount(async () => {
		const libdb = await import('$lib/db');
		openBookDB = libdb.openBookDB;
		libdb.getAllMetas().then((books) => {
			bookList = books;
		});
	});
</script>

<svelte:head>
	<title>Essence Reader</title>
</svelte:head>

<Topbar>
	{#snippet toptext()}
		<h3>Essence Reader</h3>
	{/snippet}
	{#snippet rightbar()}
		<Popover>
			{#snippet icon()}
				<Settings size={24} />
			{/snippet}
			<div style="width: 8em">
				<label>
					<input type="checkbox" bind:checked={$shouldSaveStore} />
					Save books
				</label>
				<button onclick={deleteAllBooks}>Remove all</button>
				<hr />
				Select theme
				<ThemePicker />
			</div>
		</Popover>
	{/snippet}
</Topbar>

<div id="parent">
	{#if bookList}
		{#each bookList as meta (meta.id)}
			<button
				class="libraryItem"
				onclick={() => goto(`reading/${meta.id}`)}
				animate:flip={{ duration: 200 }}>
				<BookPreview {meta} {deleteBook} />
			</button>
		{/each}
	{/if}

	<button class="libraryItem" onclick={() => clickFile()}>
		<h1 id="dropInfoIcon">📚</h1>

		<h2 style="color: gray">Drop anywhere or click to select a file</h2>
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
