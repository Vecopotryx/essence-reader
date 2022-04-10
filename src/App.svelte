<script lang="ts">
	import { parser, Book } from "./parse";

	import Reader from "./Reader.svelte";

	let book: Book;

	async function readFiles(e: Event) {
		let file = (e.target as HTMLInputElement).files[0];

		book = await parser(file);
		reading = true;
	}

	let reading = false;
</script>

<main>
	{#if reading}
		<Reader {book} />
	{:else}
		<input type="file" on:change={(e) => readFiles(e)} />
	{/if}
</main>

<style>
</style>
