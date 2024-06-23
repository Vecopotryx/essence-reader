<script lang="ts">
	import ThemePicker from '$lib/components/ThemePicker.svelte';
	import Book from 'carbon-icons-svelte/lib/Book.svelte';
	import TextLineSpacing from 'carbon-icons-svelte/lib/TextLineSpacing.svelte';

	interface settingsInterface {
		scale: number;
		fontFamily: string;
		paginated: boolean;
		animations: boolean;
	}

	let {
		settings = $bindable(),
		onScaleChange
	}: { settings: settingsInterface; onScaleChange: () => void } = $props();

	$effect(() => localStorage.setItem('settings', JSON.stringify(settings)));
</script>

<div id="paginationSelectors">
	<label>
		<Book size={32} />
		<br />
		<input type="radio" bind:group={settings.paginated} value={true} />
		Paginated
	</label>
	<label>
		<TextLineSpacing size={32} />
		<br />
		<input type="radio" bind:group={settings.paginated} value={false} />
		Scrolled
	</label>
</div>

{#if settings.paginated}
	<label>
		Animations:
		<input type="checkbox" bind:checked={settings.animations} />
	</label>
	<br />
{/if}
<label>
	Font:
	<select name="fontpicker" bind:value={settings.fontFamily} style="width: 100%;">
		<option>Default</option>
		<option style="font-family:'Verdana'">Verdana</option>
		<option style="font-family:'Arial'">Arial</option>
		<option style="font-family:'Courier New '">Courier New </option>
		<option style="font-family:'Helvetica'">Helvetica</option>
		<option style="font-family:'Times New Roman'">Times New Roman</option>
	</select>
</label>

<br />

<label>
	Font size:
	<br />
	<input
		name="scale"
		type="range"
		min="5"
		max="30"
		bind:value={settings.scale}
		onchange={onScaleChange} />
</label>
<ThemePicker />

<style>
	#paginationSelectors {
		display: flex;
		justify-content: space-between;
	}
</style>
