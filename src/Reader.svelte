<script lang="ts">
    import { afterUpdate, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import type { Book } from "./services/types";
    import Topbar from "./components/Topbar.svelte";
    import ReaderSettings from "./components/ReaderSettings.svelte";
    import Popover from "./components/Popover.svelte";
    import { db } from "./db";

    export let currentBook: Book;
    export let reading: boolean;
    export let currentId: number;

    let section = 0;

    let settingsVisible = false;
    let settings = JSON.parse(localStorage.getItem("settings")) || {
        scale: 10,
        fontFamily: "Default",
    };

    $: settings, applySettings();

    const applySettings = () => {
        let styleE = document.getElementById("user-settings");
        if (!styleE) {
            styleE = document.createElement("style");
            styleE.id = "user-settings";
            document.head.appendChild(styleE);
        }

        styleE.innerText =
            "#container { transform: scale(" +
            settings.scale / 10 +
            "); width: " +
            50 / (settings.scale / 10) +
            "%; }" +
            " @media (max-width: 1500px) {#container { width: " +
            90 / (settings.scale / 10) +
            "%}}" +
            (settings.fontFamily !== "Default"
                ? " #container p, #container a, #container span { font-family: " +
                  settings.fontFamily +
                  " !important;}"
                : "");
        localStorage.setItem("settings", JSON.stringify(settings));
    };

    let scrolled = 0;

    let currentTitle = currentBook.meta.title;

    afterUpdate(() => {
        if (currentTitle !== currentBook.meta.title) {
            section = 0;
            currentTitle = currentBook.meta.title;
            updateStyles();
        }
    });

    const updateStyles = () => {
        // Doesn't adapt based on which section is loaded, but works for now
        for (const styleE of document.getElementsByTagName("style")) {
            if (styleE.getAttribute("from") === "essence-reader") {
                styleE.remove();
            }
        }

        currentBook.files.styles.forEach((stylesheet) => {
            const styleE = document.createElement("style");
            styleE.innerText = stylesheet.css;
            styleE.setAttribute("from", "essence-reader");
            document.head.appendChild(styleE);
        });
    };

    onMount(() => {
        if (!isNaN(currentBook.progress)) {
            section = Math.floor(currentBook.progress);
        }
    });

    const saveProgress = (progress: number) => {
        if (currentId !== -1) {
            db.books.update(currentId, {
                progress: progress,
            });
        }
    };

    const updateSection = (index: number) => {
        if (0 <= index && index < currentBook.contents.length) {
            section = index;
            scrolled = 0;
            saveProgress(section);
        }
    };

    const incrementSection = (inc: number) => {
        updateSection(section + inc);
    };

    updateStyles();

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

    let tocVisible = false;
</script>

<svelte:head>
    <title>
        {currentBook.meta.title + " - " + currentBook.meta.author}
    </title>
</svelte:head>

<div in:fade={{ duration: 200 }}>
    <Topbar>
        <button
            slot="leftbar"
            on:click={() => {
                reading = false;
                document.title = "Essence Reader";
                location.hash = "";
            }}
            style="opacity: 0.5;"
        >
            {"<"}
        </button>

        <div
            slot="toptext"
            style="transition: opacity 0.3s; {scrolled > 100
                ? 'opacity: 0.5;'
                : ''}"
        >
            <h4>
                <b
                    >{currentBook !== undefined
                        ? currentBook.meta.title + " - "
                        : ""}</b
                >
                {currentBook !== undefined ? currentBook.meta.author : ""}
            </h4>
            <p id="progress">{section}/{currentBook.contents.length - 1}</p>
        </div>

        <div slot="rightbar" style="display: inline-block">
            <button
                id="settingsBtn"
                on:click={() => (tocVisible = !tocVisible)}
            >
                ☰
            </button>
            <button
                id="settingsBtn"
                on:click={() => (settingsVisible = !settingsVisible)}
            >
                ⚙
            </button>
            <button on:click={() => incrementSection(-1)}>«</button>
            <button on:click={() => incrementSection(1)}>»</button>
        </div>
    </Topbar>

    <Popover bind:visible={tocVisible} top={"3em"} right={"1em"}>
        {#each currentBook.toc as tocitem}
            <button
                class="tocButton"
                style="{section === tocitem.index
                    ? 'border: 1px solid lightblue; font-weight: bold;'
                    : ''}  {tocitem.isChild ? 'padding-left: 2em;' : ''}"
                on:click={() => updateSection(tocitem.index)}
                >{tocitem.isChild ? "" : ""} {tocitem.name}</button
            >
        {/each}
    </Popover>

    <div id="container">
        {@html currentBook.contents[section]}
    </div>
</div>

<ReaderSettings bind:settingsVisible bind:settings />

<svelte:window bind:scrollY={scrolled} on:keydown={handleKeydown} />

<style>
    .tocButton {
        display: block;
        border: none;
        font-size: inherit;
        font-family: inherit;
        background-color: transparent;
        color: inherit;
        width: 95%;
        margin: auto;
        text-align: left;
        border-radius: 0.2em;
        border: 1px solid transparent;
    }

    .tocButton:hover {
        cursor: pointer;
        border: 1px solid var(--primary-color);
    }

    h4,
    #progress {
        display: inline;
    }

    #container {
        margin: auto;
        padding-top: 3em;
        padding-bottom: 2em;
        transform-origin: top;
        font-family: Verdana;
    }
</style>
