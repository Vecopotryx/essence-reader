<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentBook } from '$lib/stores';

	const readFiles = async (file: File) => {
		try {
			let parseEpub = (await import('$lib/services/parse')).parseEpub;
			const book = await parseEpub(file);
			currentBook.set(book);
			goto(`/reading/-1`);
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
