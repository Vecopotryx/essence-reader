<script lang="ts">
	import { parser, Book } from "./parse";

	import Reader from "./Reader.svelte";

	let book: Book;

	async function readFiles(file: object) {
		book = await parser(file);
		reading = true;
	}

	let reading = false;

	let dragging = false;

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

	const useFileInput = (e: Event) => {
		readFiles((e.target as HTMLInputElement).files[0]);
	};
</script>

<main>
	{#if dragging}
		<h2>Drop file</h2>
	{/if}
	{#if reading}
		<Reader {book} />
	{:else}
		<input type="file" on:change={(e) => useFileInput(e)} />
	{/if}
</main>

<style>
</style>
