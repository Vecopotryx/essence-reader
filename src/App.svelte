<script lang="ts">
	import { parser, type Book } from "./parse";
	import { storeBook } from "./db";

	import Reader from "./Reader.svelte";
	import BookSelector from "./components/BookSelector.svelte";

	let book: Book;
	let reading = false;
	let dragging = false;

	async function readFiles(file: File) {
		book = await parser(file);
		if (saveBooksOn) {
			storeBook(book.meta, file);
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
