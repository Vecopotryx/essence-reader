<script>
	import { onMount } from 'svelte';
	let dragging = false;
	let dragCounter = 0;

	onMount(async () => {
		const readFile = (await import('$lib/utils')).readFile;

		window.addEventListener('dragenter', (e) => {
			if (e.dataTransfer?.types.includes('Files')) {
				dragCounter++;
				dragging = true;
			}
		});

		window.addEventListener('dragleave', (e) => {
			dragCounter--;
			if (dragCounter === 0) {
				dragging = false;
			}
			e.preventDefault();
		});
		window.addEventListener('dragover', (e) => e.preventDefault());

		window.addEventListener('drop', (e) => {
			e.preventDefault();
			dragCounter = 0;
			dragging = false;
			const file = e.dataTransfer?.files?.[0];
			if (file) {
				readFile(file);
			}
		});
	});
</script>

<slot />
