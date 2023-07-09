<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Book, Metadata } from '$lib/types';
	import Topbar from '$lib/components/Topbar.svelte';
	import ReaderSettings from './ReaderSettings.svelte';
	import Popover from '$lib/components/Popover.svelte';
	import { applySettings, assembleChapter } from './reader';

	// Icons:
	import SettingsIcon from 'carbon-icons-svelte/lib/Settings.svelte';
	import TableOfContents from 'carbon-icons-svelte/lib/TableOfContents.svelte';
	import ArrowRight from 'carbon-icons-svelte/lib/ArrowRight.svelte';
	import ArrowLeft from 'carbon-icons-svelte/lib/ArrowLeft.svelte';
	import ChevronLeft from 'carbon-icons-svelte/lib/ChevronLeft.svelte';
	import DirectionLoopLeft from 'carbon-icons-svelte/lib/DirectionLoopLeft.svelte';

	import type { PageData } from './$types';
	import { unzip, type ZipInfo } from 'unzipit';
	import { openBookDB } from '$lib/db';
	import TocNode from './TocNode.svelte';

	export let data: PageData;
	let meta: Metadata = data.meta;
	let book: Book = data.book;

	let container: HTMLElement;
	let section: number = 0;
	let scrolled: number = 0;

	let storedSettingsJson = localStorage.getItem('settings');
	let settings = storedSettingsJson
		? JSON.parse(storedSettingsJson)
		: {
				scale: 10,
				fontFamily: 'Default'
		  };

	$: settings, applySettings(settings);
	let entries: ZipInfo['entries'];
	let previousJumps: number[] = [];

	onMount(() => {
		book = data.book;
		meta = data.meta;

		unzip(book.file).then((zip) => {
			entries = zip.entries;
			updateSection(meta.progress);
		});
	});

	onDestroy(() => {
		document.head.querySelectorAll('.essence-reader').forEach((styleE) => styleE.remove());
	});

	const updateSection = async (index: number) => {
		if (0 <= index && index < book.spine.length) {
			section = index;
			scrolled = 0;
			meta.progress = section;
			if (meta.id) {
				(await openBookDB).put('metas', meta);
			}
			container.replaceChildren(await assembleChapter(book.spine[section], entries, jumpTo));
		}
	};

	const jumpTo = async (href: string) => {
		previousJumps = [...previousJumps, section];
		const [chapter, elemId] = href.split('#');

		if (chapter) {
			const chapterIndex = book.spine.indexOf(chapter);
			await updateSection(chapterIndex);
		}
		if (elemId) {
			// if there is an element that is to be focused
			await tick(); // Wait until chapter has been loaded
			const element = document.getElementById(elemId);
			if (!element) return;
			element.style.fontSize = '100px';
			element.scrollIntoView({
				behavior: 'auto',
				block: 'center',
				inline: 'center'
			});
			// Make the element "pop" and then resize back into its normal size.
			element.style.transition = 'font 1s ease';
			element.style.fontSize = '';
		}
	};

	const incrementSection = (inc: number) => {
		updateSection(section + inc);
		if (previousJumps.length !== 0) {
			previousJumps = [];
		}
	};

	const handleKeydown = ({ key }: { key: string }) => {
		switch (key) {
			case 'ArrowLeft':
				incrementSection(-1);
				break;
			case 'ArrowRight':
				incrementSection(1);
				break;
			default:
				break;
		}
	};
</script>

<svelte:head>
	<title>
		{meta.title + ' - ' + meta.author}
	</title>
</svelte:head>

<div in:fade={{ duration: 200 }}>
	<Topbar toned={scrolled > 100}>
		<a slot="leftbar" href="/">
			<ChevronLeft size={24} />
		</a>

		<svelte:fragment slot="toptext">
			<h4>
				<b>{meta.title} - </b>
				{meta.author}
			</h4>
			<p>{section}/{meta.length}</p>
		</svelte:fragment>

		<svelte:fragment slot="rightbar">
			{#if previousJumps.length !== 0}
				<button
					transition:fade={{ duration: 200 }}
					id="jumpbtn"
					on:click={() => {
						let lastJump = previousJumps.pop();
						previousJumps = previousJumps;
						if (lastJump !== undefined) {
							updateSection(lastJump);
						}
					}}
				>
					<DirectionLoopLeft />
					{previousJumps[previousJumps.length - 1]}
				</button>
			{/if}
			<Popover>
				<TableOfContents size={24} slot="icon" />
				{#each book.toc as tocitem}
					<TocNode {tocitem} onClick={jumpTo} currentSection={section} />
				{/each}
			</Popover>
			<Popover>
				<SettingsIcon size={24} slot="icon" />
				<ReaderSettings bind:settings />
			</Popover>
			<button on:click={() => incrementSection(-1)}><ArrowLeft size={24} /></button>
			<button on:click={() => incrementSection(1)}><ArrowRight size={24} /></button>
		</svelte:fragment>
	</Topbar>

	<div id="container" data-sveltekit-preload-data="off" bind:this={container} />
</div>

<svelte:window bind:scrollY={scrolled} on:keydown={handleKeydown} />

<style>
	#container {
		margin: auto;
		padding-top: 3em;
		padding-bottom: 2em;
		transform-origin: top;
	}

	#jumpbtn {
		border-radius: 0.25em;
		font-size: 1em;
		line-height: 1em;
	}
</style>
