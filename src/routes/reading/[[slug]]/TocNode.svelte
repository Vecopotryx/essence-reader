<script lang="ts">
	import type { TableOfContentsItem } from '$lib/types';

	export let tocitem: TableOfContentsItem;
	export let onClick: (href: string, isRelative: boolean) => void;
	export let currentSection = 0;
</script>

<button
	class="tocButton"
	on:click={() => onClick(tocitem.href, false)}
	style={currentSection === tocitem.index ? 'border: 1px solid lightblue' : ''}
>
	{tocitem.title}
</button>
{#if tocitem.children}
	{#each tocitem.children as tocsection}
		<svelte:self tocitem={tocsection} {onClick} {currentSection} />
	{/each}
{/if}

<style>
	.tocButton {
		display: flex;
		justify-content: space-between;
		border: none;
		font-family: inherit;
		background-color: transparent;
		color: inherit;
		width: 95%;
		padding: 1vh;
		margin: auto;
		text-align: left;
		border-radius: 0.2em;
		border: 1px solid transparent;
	}

	.tocButton:hover {
		cursor: pointer;
		border: 1px solid rgb(var(--primary-color));
	}
</style>
