<script lang="ts">
	export let name: string;
	import { unzip } from "unzipit";


	async function readFiles(e: Event) {
		let file = (e.target as HTMLInputElement).files[0];

		const { entries } = await unzip(file);
		console.log(entries);
	}
</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>

	<input type="file" on:change={(e) => readFiles(e)}/>
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