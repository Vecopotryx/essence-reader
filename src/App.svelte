<script lang="ts">
	import { parser, Book } from "./parse";

	import Reader from "./Reader.svelte";
	import Topbar from "./components/Topbar.svelte";

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

	let theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

	const updateTheme = () => {
		document.documentElement.setAttribute("data-theme", theme);
	};

	$: theme, updateTheme();
</script>

<main>
	{#if reading}
		<Reader {book} bind:theme />
	{:else}
		<Topbar>
			<h3 slot="toptext" style="display: inline;">Essence Reader</h3>
		</Topbar>
		<button on:click={() => (theme = theme === "dark" ? "light" : "dark")} id="drkModeBtn">
			{theme === "dark" ? "☾" : "☼"}
		</button>
		<div
			on:click={() => clickFile()}
			id="dropInfo"
			style={dragging
				? "border: 1px solid green; background-color: #dfffdf"
				: ""}
		>
			<h1>📚</h1>
			<h2 style="color: {dragging ? 'green' : 'gray'}">
				Drop anywhere or click to select a file
			</h2>
		</div>
	{/if}
</main>

<style>
	#drkModeBtn {
		border: none;
		background: none;
		color: inherit;
		font-size: 200%;
		position: absolute;
		right: 1%;
		top: 1%;
	}

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
