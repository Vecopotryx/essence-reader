<script lang="ts">
	import { parser, type Book } from "./parse";
	import { db } from "./db";

	import Reader from "./Reader.svelte";
	import Topbar from "./components/Topbar.svelte";
	import Popover from "./components/Popover.svelte";
	import ThemePicker from "./components/ThemePicker.svelte";
import StoredBooks from "./components/StoredBooks.svelte";

	let book: Book;

	async function readFiles(file: object) {
		book = await parser(file);
		let shouldSave = file.size < 30000000;
		for (let storedBook of await db.books.toArray()) {
			if (storedBook.title === book.meta.title) {
				shouldSave = false;
			}
		}
		if (shouldSave) {
			addBook(book.meta, file);
		}
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

	let theme: string;

	if (localStorage.getItem("theme") !== null) {
		theme = localStorage.getItem("theme");
	} else {
		theme = window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	const updateTheme = () => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	};

	$: theme, updateTheme();

	let settingsVisible = false;

	async function addBook(meta: any, file: any) {
		try {
			let blob = await fetch(
				"https://c.tenor.com/yheo1GGu3FwAAAAC/rick-roll-rick-ashley.gif"
			).then((r) => r.blob());

			if (meta.cover !== undefined) {
				blob = await fetch(meta.cover).then((r) => r.blob());
			}
			const id = await db.books.add({
				author: meta.author,
				title: meta.title,
				cover: blob,
				file: file,
			});
		} catch (error) {
			console.log(error);
		}
	}
</script>

<main>
	{#if reading}
		<Reader {book} bind:theme bind:reading />
	{:else}
		<Topbar>
			<h3 slot="toptext" style="display: inline;">Essence Reader</h3>
			<button
				class="settingsBtn"
				slot="rightbar"
				on:click={() => (settingsVisible = !settingsVisible)}
			>
				⚙
			</button>
		</Topbar>
		

		<Popover bind:visible={settingsVisible} top={"3.1em"} right={"1%"}>
			<div style="width: 8em">
				<p style="display: inline">Select theme</p>
				<ThemePicker bind:theme />
			</div>
		</Popover>

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

		<StoredBooks readFiles={readFiles}/>

	{/if}
</main>

<style>
	h1 {
		text-align: center;
		font-size: 400%;
		margin-bottom: 0;
	}

	#dropInfo {
		margin: 4em auto;
		border-radius: 10px;
		border: 1px solid #537065;
		text-align: center;
		user-select: none;
		width: 50%;
		transition: all 0.3s ease;
	}

	#dropInfo:hover {
		background-color: #dfdff0;
	}

	@media (max-width: 1000px) {
		#dropInfo {
			width: 90%;
		}
	}
</style>
