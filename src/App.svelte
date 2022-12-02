<script lang="ts">
	import { onMount } from "svelte";
	import { db, storeBook } from "./db";

	import { parser } from "./services/parse";
	import { openBookThing } from "./services/assemble";
	import type { Book } from "./services/types";

	import Reader from "./Reader.svelte";
	import BookSelector from "./components/BookSelector.svelte";

	let currentBook: Book;
	let reading = false;
	let dragging = false;
	let loading = false;

	const readFiles = async (file: File) => {
		try {
			loading = true;
			const book = await parser(file);

			if (saveBooksOn && file.size < 30000000) {
				const id = (await storeBook(book)) as number;
				openBook(book, id);
			} else {
				openBook(book);
			}
		} catch (e) {
			alert(e);
		}
		loading = false;
	};

	let saveBooksOn: boolean;

	if (localStorage.getItem("saveBooksOn") !== null) {
		saveBooksOn = JSON.parse(localStorage.getItem("saveBooksOn"));
	} else {
		saveBooksOn = true;
	}

	const updateSaving = () => {
		localStorage.setItem("saveBooksOn", JSON.stringify(saveBooksOn));
	};

	$: saveBooksOn, updateSaving();

	window.addEventListener("dragenter", (e) => {
		if (e.dataTransfer.types.includes("Files")) {
			dragging = true;
		}
	});

	window.addEventListener("dragleave", (e) => {
		dragging = false;
		e.preventDefault();
	});

	const openBook = (book: Book, id?: number) => {
		//let startTime = performance.now();
		currentBook = openBookThing(book);
		reading = true;
		location.hash = id ? id.toString() : "";
		//console.log(performance.now() - startTime);
	};

	const openExisting = (id: number) => {
		db.transaction("r", db.books, async () => {
			let stored = await db.books.get(id);
			if (stored) {
				openBook(stored, stored.id);
			} else {
				location.hash = ""
			}
		})
	};

	onMount(() => {
		if (location.hash !== "") {
			openExisting(parseInt(location.hash.substring(1)));
		}
	});

	window.onhashchange = () => {
		if (saveBooksOn && location.hash === "") {
			document.title = "Essence Reader";
			reading = false;
			history.replaceState(null, "", ' '); // Remove empty hash from URL
		} else if (saveBooksOn && location.hash !== "") {
			openExisting(parseInt(location.hash.substring(1)));
		}
	};

	window.addEventListener("dragover", (e) => e.preventDefault());

	window.addEventListener("drop", (e) => {
		e.preventDefault();
		dragging = false;
		readFiles(e.dataTransfer.files[0]);
	});
</script>

<main>
	{#if reading}
		<Reader {currentBook} bind:reading />
	{:else}
		<BookSelector {readFiles} {openExisting} {dragging} bind:saveBooksOn  bind:loading />
	{/if}
</main>
