<script lang="ts">
    import { afterUpdate } from "svelte";
    import type { Book } from "./services/types";
    import Topbar from "./components/Topbar.svelte";
    import ReaderSettings from "./components/ReaderSettings.svelte";
    import Popover from "./components/Popover.svelte";

    export let currentBook: Book;
    export let reading: boolean;

    let section = 0;

    //$: percent = Math.floor(100 * (section / currentBook.contents.length));

    let settingsVisible = false;
    let settings = {
        fontSize: 16,
        fontFamily: "Verdana",
    };

    let scrolled = 0;

    let currentTitle = currentBook.meta.title;

    afterUpdate(() => {
        if (currentTitle != currentBook.meta.title) {
            section = 0;
            currentTitle = currentBook.meta.title;
            updateStyles();
        }
    });

    const updateStyles = () => {
        // Doesn't adapt based on which section is loaded, but works for now
        for (const styleE of document.getElementsByTagName("style")) {
            if(styleE.getAttribute("from") === "essence-reader") {
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

    const updateSection = (inc: number) => {
        if (
            0 <= section + inc &&
            section + inc < currentBook.contents.length
        ) {
            section += inc;
            scrolled = 0;
        }
    };

    updateStyles();

    const handleKeydown = ({ key }) => {
        switch (key) {
            case "ArrowLeft":
                updateSection(-1);
                break;
            case "ArrowRight":
                updateSection(1);
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
        <button id="settingsBtn" on:click={() => (tocVisible = !tocVisible)}>
            ☰
        </button>
        <button
            id="settingsBtn"
            on:click={() => (settingsVisible = !settingsVisible)}
        >
            ⚙
        </button>
        <button on:click={() => updateSection(-1)}>«</button>
        <button on:click={() => updateSection(1)}>»</button>
    </div>
</Topbar>

<Popover bind:visible={tocVisible} top={"3em"} right={"1em"}>
    {#each currentBook.toc as tocitem}
        <button
            class="tocButton"
            style="{section === tocitem.index
                ? 'border: 1px solid lightblue; font-weight: bold;'
                : ''}  {tocitem.isChild ? 'padding-left: 2em;' : ''}"
            on:click={() => (section = tocitem.index)}
            >{tocitem.isChild ? "" : ""} {tocitem.name}</button
        >
    {/each}
</Popover>

<div
    id="container"
    style="font-size: {settings.fontSize}px; font-family: {settings.fontFamily};"
>
    {@html currentBook.contents[section]}
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
        width: 50%;
    }

    @media (max-width: 1000px) {
        #container {
            width: 90%;
        }
    }
</style>
