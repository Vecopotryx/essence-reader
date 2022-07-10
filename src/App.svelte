<script lang="ts">
	import { onMount } from "svelte";
	import { db, storeBook } from "./db";

	import { parser } from "./services/parse";
	import { assembleBook } from "./services/assemble";
	import type { Book, Extracted, Metadata } from "./services/types";

	import Reader from "./Reader.svelte";
	import BookSelector from "./components/BookSelector.svelte";

	let book: Book;
	let reading = false;
	let dragging = false;

	const readFiles = async (file: File) => {
		let parsed = await parser(file);

		if (saveBooksOn && file.size < 30000000) {
			const id = (await storeBook(
				parsed.meta,
				parsed.extracted
			)) as number;
			openBook(parsed.meta, parsed.extracted, id);
		} else {
			openBook(parsed.meta, parsed.extracted);
		}
	}

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

	const openBook = (meta: Metadata, extracted: Extracted, id?: number) => {
		//let startTime = performance.now();
		book = assembleBook(meta, extracted);
		location.hash = id ? id.toString() : "";
		reading = true;
		//console.log(performance.now() - startTime);
	};

	const openExisting = async (id: number) => {
		let stored = await db.books.get(id);
		if(stored){
			openBook(stored.meta, stored.extracted, stored.id);
		}
	};

	onMount(() => {
		if (location.hash !== "") {
			openExisting(parseInt(location.hash.substring(1)));
		}
	});

	window.onhashchange = () => {
		if (saveBooksOn && reading && location.hash === "") {
			document.title = "Essence Reader";
			reading = false;
		} else if (saveBooksOn && !reading && location.hash !== "") {
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
		<Reader {book} bind:reading />
	{:else}
		<BookSelector {readFiles} {openExisting} {dragging} bind:saveBooksOn />
	{/if}
</main>
