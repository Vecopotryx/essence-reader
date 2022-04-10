<script lang="ts">
	import { unzip } from "unzipit";
	import { parseOpf, Book } from "./parse";

	let book: Book;

	async function readFiles(e: Event) {
		let file = (e.target as HTMLInputElement).files[0];

		const { entries } = await unzip(file);
		console.log(entries);
		for (const [name, entry] of Object.entries(entries)) {
			if (name.includes(".opf")) {
				book = parseOpf(await entry.text(), Object.entries(entries));
			}
		}
	}
</script>

<main>
	<h1>{book !== undefined ? book.meta.title : ""}</h1>
	<h2>{book !== undefined ? book.meta.author : ""}</h2>

	{#each book !== undefined ? book.contents : "" as content}
		{#await content then value}
			{@html value}
		{/await}
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
