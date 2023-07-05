<script lang="ts">
	import { goto } from '$app/navigation';
	import { setLoadedBook } from '$lib/stores';

	let saveBooksOn = true;

	const readFiles = async (file: File) => {
		try {
			const parseEpub = (await import('$lib/services/parse')).parseEpub;
            const addBook = (await import('$lib/db')).default.addBook;
			const book = await parseEpub(file);
			setLoadedBook(book);

			if (saveBooksOn && file.size < 30000000) {
				const id = (await addBook(book)) as number;
				goto(`reading/${id}`);
			} else {
				goto(`/reading/-1`);
			}
		} catch (e) {
			alert(e);
		}
	};

	const clickFile = () => {
		let input = document.createElement('input');
		input.type = 'file';
		input.onchange = (e) => {
			readFiles((e.target as HTMLInputElement).files[0]);
		};

		input.click();
	};
</script>

<button on:click={() => clickFile()}>
	<h1>📚</h1>
	<h2>Click to select a file</h2>
</button>
