<script>
	import { page } from '$app/stores';
	import CarbonArrowLeft from '~icons/carbon/arrow-left';
</script>

<svelte:head>
	<title>Error {$page.status}: {$page.error?.message}</title>
</svelte:head>

<div>
	<h2>Error {$page.status}</h2>
	<p>{$page.error?.message}</p>
	<a href="/"><CarbonArrowLeft /> Go back to library</a>
</div>

<style>
	div {
		margin: auto;
		font-size: 1.5em;
		width: min(20em, 100vw);
		padding: 0 1em;
	}
	h2 {
		text-align: center;
		margin-bottom: 0;
	}

	a {
		all: unset;
		min-height: 2.5em;
		padding: 0 0.5em;
		border: 1px solid rgba(var(--primary-color), 0.5);
		background-color: transparent;
		border-radius: 10px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	a:hover {
		background-color: rgba(var(--highlight-bg), 0.2);
	}
</style>
