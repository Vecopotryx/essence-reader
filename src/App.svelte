<script lang="ts">
	import { parser, Book } from "./parse";

	let book: Book;

	async function readFiles(e: Event) {
		let file = (e.target as HTMLInputElement).files[0];

		book = await parser(file);
	}
</script>

<main>
	<h1>{book !== undefined ? book.meta.title : ""}</h1>
	<h2>{book !== undefined ? book.meta.author : ""}</h2>

	{#each book !== undefined ? book.contents : "" as content}
		{@html content}
	{/each}

	<input type="file" on:change={(e) => readFiles(e)} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
