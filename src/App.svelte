<script lang="ts">
	import { onMount } from "svelte";
	import { db, storeBook } from "./db";

	import { parseEpub } from "./services/parse";
	import { prepareBook } from "./services/assemble";
	import type { Book } from "./services/types";

	import Reader from "./reader/Reader.svelte";
	import BookSelector from "./components/BookSelector.svelte";
	import { fade } from "svelte/transition";

	let currentBook: Book = null;
	let reading: boolean = false;
	let dragging: boolean = false;
	let loading: boolean = false;

	const readFiles = async (file: File) => {
		try {
			loading = true;
			const book = await parseEpub(file);

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

	let saveBooksOn: boolean = null;

	// Update localStorage to reflect saveBooksOn
	$: saveBooksOn, localStorage.setItem("saveBooksOn", JSON.stringify(saveBooksOn));

	if (localStorage.getItem("saveBooksOn") !== null) {
		saveBooksOn = JSON.parse(localStorage.getItem("saveBooksOn"));
	} else {
		saveBooksOn = true;
	}

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
		currentBook = prepareBook(book);
		reading = true;
		location.hash = id ? id.toString() : "-1";
		currentId = id ? id : -1;
		//console.log(performance.now() - startTime);
	};

	const openExisting = (id: number) => {
		if (id === currentId) {
			reading = true;
			location.hash = id.toString();
		} else {
			loadingSaved = true;

			db.transaction("r", db.books, async () => {
				let stored = await db.books.get(id);
				if (stored) {
					openBook(stored, stored.id);
				} else {
					location.hash = "";
				}
				loadingSaved = false;
			}).catch(() => {
				// Stop loading if database error occurs
				loadingSaved = false;
				location.hash = "";
			});
		}
	};

	onMount(() => {
		if (location.hash !== "") {
			openExisting(parseInt(location.hash.substring(1)));
		}
	});

	window.onhashchange = () => {
		if (location.hash === "") {
			document.title = "Essence Reader";
			reading = false;
			history.replaceState(null, "", " "); // Remove empty hash from URL
		} else {
			openExisting(parseInt(location.hash.substring(1)));
		}
	};

	window.addEventListener("dragover", (e) => e.preventDefault());

	window.addEventListener("drop", (e) => {
		e.preventDefault();
		dragging = false;
		readFiles(e.dataTransfer.files[0]);
	});

	let currentId: number = null;
	let loadingSaved: boolean = false;
</script>

<main>
	{#if reading}
		<Reader bind:currentBook bind:reading bind:currentId />
	{:else if loadingSaved || loading}
		<p style="text-align: center;" in:fade>Loading</p>
	{:else}
		<BookSelector
			{readFiles}
			{openExisting}
			{dragging}
			bind:saveBooksOn
		/>
	{/if}
</main>
