<script lang="ts">
	const setTheme = (theme: string) => {
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	};
</script>

<button
	style="background-color: #f6e4bd; color: #000"
	on:click={() => setTheme('warm')}>
	warm
</button>
<button
	style="background-color: #000; color: #e9e9e9"
	on:click={() => setTheme('black')}>
	black
</button>
<button
	style="background-color: #032038; color: #e9e9e9"
	on:click={() => setTheme('dark')}>
	dark
</button>
<button
	style="background-color: #fff; color: #000"
	on:click={() => setTheme('light')}>
	light
</button>

<style>
	button {
		display: block;
		width: 90%;
		border: none;
		font-family: inherit;
		font-size: inherit;
		border-radius: 0.2em;
		margin: 0.4em auto;
		cursor: pointer;
		user-select: none;
	}
</style>
