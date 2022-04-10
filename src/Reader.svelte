<script lang="ts">
	import type { Book } from "./parse";

	export let book: Book;

</script>

<main>
	<h1>{book !== undefined ? book.meta.title : ""}</h1>
	<h2>{book !== undefined ? book.meta.author : ""}</h2>

	{#each book !== undefined ? book.contents : "" as content}
		{@html content}
	{/each}
</main>

<style>

</style>
