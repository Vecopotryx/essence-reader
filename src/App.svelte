<script lang="ts">
	import { parser, type Book } from "./parse";
	import { db } from "./db";

	import Reader from "./Reader.svelte";
	import Topbar from "./components/Topbar.svelte";
	import Popover from "./components/Popover.svelte";
	import ThemePicker from "./components/ThemePicker.svelte";
	import BookSelector from "./components/BookSelector.svelte";

	let book: Book;

	async function readFiles(file: object) {
		book = await parser(file);
		if (saveBooksOn) {
			let shouldSave = file.size < 30000000;
			for (let storedBook of await db.books.toArray()) {
				if (storedBook.title === book.meta.title) {
					shouldSave = false;
				}
			}
			if (shouldSave) {
				addBook(book.meta, file);
			}
		}

		reading = true;
	}

	let reading = false;

	let dragging = false;

	let saveBooksOn: boolean;

	if (localStorage.getItem("saveBooksOn") !== null) {
		saveBooksOn = JSON.parse(localStorage.getItem("saveBooksOn"));
	} else {
		saveBooksOn = true;
	}

	const updateSaving = () => {
		localStorage.setItem("saveBooksOn", JSON.stringify(saveBooksOn));
	};

	$: saveBooksOn, updateSaving();

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
			const id = await db.books.add({
				author: meta.author,
				title: meta.title,
				cover: await fetch(meta.cover).then((r) => r.blob()),
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
				<label style="user-select: none">
					<input type="checkbox" bind:checked={saveBooksOn} />
					Save books
				</label><br />
				<hr />
				<p style="display: inline">Select theme</p>

				<ThemePicker bind:theme />
			</div>
		</Popover>

		<BookSelector {dragging} {readFiles} />
	{/if}
</main>
