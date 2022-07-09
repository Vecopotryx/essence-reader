<script lang="ts">
	import { parser, type Book } from "./parse";
	import { db, storeBook } from "./db";

	import Reader from "./Reader.svelte";
	import BookSelector from "./components/BookSelector.svelte";
	import { onMount } from "svelte";

	let book: Book;
	let reading = false;
	let dragging = false;

	async function readFiles(file: File) {
		book = await parser(file);
		if (saveBooksOn) {
			const id = await storeBook(book.meta, file);
			location.hash = id.toString();
		}
		reading = true;
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

	const openExisting = async () => {
		if (location.hash !== "#") {
			for (let storedBook of await db.books.toArray()) {
				if (storedBook.id.toString() === location.hash.substring(1)) {
					readFiles(storedBook.file);
				}
			}
		}
	};

	onMount(() => {
		openExisting();
	});

	window.onhashchange = () => {
		if(saveBooksOn && reading && location.hash === ""){
			document.title = "Essence Reader";
			reading = false;
		} else if(saveBooksOn && !reading) {
			openExisting();
		}
	}

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
		<BookSelector {readFiles} {dragging} bind:saveBooksOn />
	{/if}
</main>
