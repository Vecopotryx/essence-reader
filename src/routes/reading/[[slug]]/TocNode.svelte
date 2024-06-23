<script lang="ts">
	import type { TableOfContentsItem } from '$lib/types';

	let {
		tocitem,
		onClick,
		currentSection
	}: { tocitem: TableOfContentsItem; onClick: (href: string) => void; currentSection: number } =
		$props();

	const toggleExpansion = (e: Event) => {
		e.stopPropagation();
		expanded = !expanded;
	};

	let expanded: boolean = $state(false);

	let selected: boolean = $state(false);

	$effect(() => {
		if (tocitem.index === currentSection) {
			selected = true;
		} else if (tocitem.children) {
			selected = tocitem.children.some((child) => child.index === currentSection);
			if (selected) expanded = true; // Auto-Expanded if any child is selected
		} else {
			selected = false;
		}
	});
</script>

<div class="tocNode">
	{#if tocitem.children}
		<button class="expansionBtn" class:expanded onclick={toggleExpansion}>▶</button>
	{/if}
	<button class="tocButton" class:selected onclick={() => onClick(tocitem.href)}>
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
