<script lang="ts">
	import { unzip } from "unzipit";
	import { XMLParser } from "fast-xml-parser";

	let metadata = "";

	async function readFiles(e: Event) {
		let file = (e.target as HTMLInputElement).files[0];

		const { entries } = await unzip(file);
		console.log(entries);
		for (const [name, entry] of Object.entries(entries)) {
			if (name.includes(".opf")) {
				const xml = await entry.text();
				metadata = parseMeta(xml);
			}
		}
	}

	const parseMeta = (xml: string) => {
    	const parsed = new XMLParser().parse(xml);
		console.log(parsed);
		const title = parsed["package"]["metadata"]["dc:title"];
		const author = parsed["package"]["metadata"]["dc:creator"];
		return title + " - " + author;
	}
</script>

<main>
	<h1>{metadata}</h1>
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