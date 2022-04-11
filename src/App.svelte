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
	{#if reading}
		<Reader {book} />
	{:else}
		<div
			id="dropInfo"
			style="border: 1px solid {dragging ? 'green' : 'black'}"
		>
			<h2 style="color: {dragging ? 'green' : 'black'}">
				Drop or click to select a file
			</h2>
			<input type="file" on:change={(e) => useFileInput(e)} />
		</div>
	{/if}
</main>

<style>
	#dropInfo {
		margin: 2% auto;
		border-radius: 10px;
		border: 1px solid black;
		text-align: center;
		width: 50%;
		height: 50%;
	}
</style>
