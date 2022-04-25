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

	const clickFile = () => {
		let input = document.createElement("input");
		input.type = "file";
		input.onchange = (e) => {
			readFiles((e.target as HTMLInputElement).files[0]);
		};

		input.click();
	};
</script>

<main>
	{#if reading}
		<Reader {book} />
	{:else}
		<h1>Essence Reader</h1>
		<div
			on:click={() => clickFile()}
			id="dropInfo"
			style={dragging
				? "border: 1px solid green; background-color: #dfffdf"
				: ""}
		>
			<h1>📚</h1>
			<h2 style="color: {dragging ? 'green' : 'black'}">
				Drop anywhere or click to select a file
			</h2>
		</div>
	{/if}
</main>

<style>
	h1 {
		text-align: center;
		font-size: 400%;
		margin-bottom: 0;
	}

	#dropInfo {
		margin: 2% auto;
		border-radius: 10px;
		border: 1px solid black;
		text-align: center;
		user-select: none;
		width: 50%;
		transition: all 0.3s ease;
	}

	#dropInfo:hover {
		background-color: #dfdff0;
	}

	@media (max-width: 900px) {
		#dropInfo {
			width: 90%;
		}
	}
</style>
