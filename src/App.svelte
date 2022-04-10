<script lang="ts">
	import { parser, Book } from "./parse";

	import Reader from "./Reader.svelte";

	let book: Book;

	async function readFiles(e: Event) {
		let file = (e.target as HTMLInputElement).files[0];

		book = await parser(file);
	}
</script>

<main>
	<input type="file" on:change={(e) => readFiles(e)} />
	<Reader book={book}/>
</main>

<style>

</style>
