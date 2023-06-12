<script lang="ts">
    import { onMount, tick } from "svelte";
    import { fade } from "svelte/transition";
    import type { Book } from "../services/types";
    import Topbar from "../components/Topbar.svelte";
    import ReaderSettings from "./ReaderSettings.svelte";
    import Popover from "../components/Popover.svelte";
    import TocButton from "./TOCButton.svelte";
    import {
        applySettings,
        saveProgress,
        updateStyles,
        assembleChapter
    } from "./reader";

    // Icons:
    import SettingsIcon from "carbon-icons-svelte/lib/Settings.svelte";
    import TableOfContents from "carbon-icons-svelte/lib/TableOfContents.svelte";
    import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
    import ArrowLeft from "carbon-icons-svelte/lib/ArrowLeft.svelte";
    import ChevronLeft from "carbon-icons-svelte/lib/ChevronLeft.svelte";
    import DirectionLoopLeft from "carbon-icons-svelte/lib/DirectionLoopLeft.svelte";

    export let currentBook: Book;
    export let reading: boolean;
    export let currentId: number;

    let container: HTMLElement;
    let section: number = 0;
    let scrolled: number = 0;
    let currentTitle: string = currentBook.meta.title;
    let settings = JSON.parse(localStorage.getItem("settings")) || {
        scale: 10,
        fontFamily: "Default",
    };

    $: settings, applySettings(settings);

    const runOnMountOrUpdate = () => {
        if (!isNaN(currentBook.progress)) {
            updateSection(Math.floor(currentBook.progress));
        } else {
            updateSection(0);
        }
        updateStyles(currentBook.files.styles);
    };

    const checkUpdate = () => {
        if (currentTitle !== currentBook.meta.title) {
            currentTitle = currentBook.meta.title;
            runOnMountOrUpdate();
        }
    };

    $: currentBook, checkUpdate();

    onMount(runOnMountOrUpdate);

    const updateSection = (index: number) => {
        if (0 <= index && index < currentBook.spine.length) {
            section = index;
            scrolled = 0;
            currentBook.progress = section;
            saveProgress(currentId, section);
            appendCurrentSection();
        }
    };

    const jumpToElementAndChapter = async (href: string) => {
        let [chapter, elemId] = href.split("#");
            jumpToSection(currentBook.contents.get(chapter).index);
            if (elemId) {
                // if there is an element that is to be focused
                await tick(); // Wait until chapter has been loaded
                const element = document.getElementById(elemId);
                element.style.fontSize = "100px";
                element.scrollIntoView({
                    behavior: "auto",
                    block: "center",
                    inline: "center",
                });
                // Make the element "pop" and then resize back into its normal size.
                element.style.transition = "font 1s ease";
                element.style.fontSize = "";
            }
    }

    const appendCurrentSection = () => {
        const html = currentBook.contents.get(currentBook.spine[section]).html;
        const images = currentBook.files.images;
        container.replaceChildren(assembleChapter(html, images, jumpToElementAndChapter));
    };

    let previousJumps: number[] = [];

    const incrementSection = (inc: number) => {
        updateSection(section + inc);
        if (previousJumps.length !== 0) {
            previousJumps = [];
        }
    };

    const jumpToSection = (index: number) => {
        previousJumps = [...previousJumps, section];
        updateSection(index);
    };

    const handleKeydown = ({ key }) => {
        switch (key) {
            case "ArrowLeft":
                incrementSection(-1);
                break;
            case "ArrowRight":
                incrementSection(1);
                break;
            default:
                break;
        }
    };
</script>

<svelte:head>
    <title>
        {currentBook.meta.title + " - " + currentBook.meta.author}
    </title>
</svelte:head>

<div in:fade={{ duration: 200 }}>
    <Topbar toned={scrolled > 100}>
        <button slot="leftbar" on:click={() => (location.hash = "")}>
            <ChevronLeft size={24} />
        </button>

        <svelte:fragment slot="toptext">
            <h4>
                <b>{currentBook.meta.title} - </b>
                {currentBook.meta.author}
            </h4>
            <p>{section}/{currentBook.spine.length - 1}</p>
        </svelte:fragment>

        <svelte:fragment slot="rightbar">
            {#if previousJumps.length !== 0}
                <button
                    transition:fade={{ duration: 200 }}
                    id="jumpbtn"
                    on:click={() => {
                        updateSection(previousJumps.pop());
                        previousJumps = previousJumps;
                    }}
                >
                    <DirectionLoopLeft />
                    {previousJumps[previousJumps.length - 1]}
                </button>
            {/if}
            <Popover>
                <TableOfContents size={24} slot="icon" />
                {#each currentBook.toc as tocitem}
                    <TocButton
                        {tocitem}
                        selected={section === tocitem.index}
                        onclick={() => jumpToSection(tocitem.index)}
                    />
                {/each}
            </Popover>
            <Popover>
                <SettingsIcon size={24} slot="icon" />
                <ReaderSettings bind:settings />
            </Popover>
            <button on:click={() => incrementSection(-1)}
                ><ArrowLeft size={24} /></button
            >
            <button on:click={() => incrementSection(1)}
                ><ArrowRight size={24} /></button
            >
        </svelte:fragment>
    </Topbar>

    <div id="container" bind:this={container} />
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
