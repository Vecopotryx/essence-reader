<script lang="ts">
	import type { TableOfContentsItem } from '$lib/types';

	export let tocitem: TableOfContentsItem;
	export let onClick: (href: string, isRelative: boolean) => void;
	export let currentSection: number;

	let expanded = false;
	const toggleExpansion = (e: Event) => {
		e.stopPropagation();
		expanded = !expanded;
	};

	let selected: boolean = false;

	const updateSelected = () => {
		if (tocitem.index === currentSection) {
			selected = true;
		} else if (tocitem.children) {
			selected = tocitem.children.some((child) => child.index === currentSection);
			if (selected) expanded = true; // Auto-Expanded if any child is selected
		} else {
			selected = false;
		}
	};

	$: currentSection, updateSelected();
</script>

<div class="tocNode">
	<button class="tocButton" class:selected on:click={() => onClick(tocitem.href, false)}>
		{#if tocitem.children}
			<button class="expansionBtn" class:expanded on:click={toggleExpansion}>▶</button>
		{/if}
		{tocitem.title}
	</button>
	{#if expanded && tocitem.children}
		{#each tocitem.children as tocsection}
			<svelte:self tocitem={tocsection} {onClick} {currentSection} />
		{/each}
	{/if}
</div>

<style>
	button {
		border: none;
		font-family: inherit;
		background-color: transparent;
		color: inherit;
		cursor: pointer;
	}

	.tocButton {
		text-align: left;
		padding: 0.5em;
		border-radius: 0.2em;
	}

	.tocNode {
		text-align: left;
		margin-left: 1em;
	}

	.selected {
		border: 1px solid lightblue;
	}

	.expansionBtn {
		margin-right: 0.5em;
		transform: rotate(0deg);
		transition: transform 0.2s;
	}

	.expansionBtn:hover {
		filter: invert(0.6);
	}

	.expanded {
		transform: rotate(90deg);
	}

	.tocButton:hover {
		cursor: pointer;
		border: 1px solid rgb(var(--primary-color));
	}
</style>
