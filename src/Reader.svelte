<script lang="ts">
    import { afterUpdate } from "svelte";
    import type { Book } from "./parse";
    import Topbar from "./components/Topbar.svelte";
    import ReaderSettings from "./components/ReaderSettings.svelte";

    export let book: Book;
    export let reading: boolean;

    let section = 0;

    //$: percent = Math.floor(100 * (section / book.contents.length));

    let settingsVisible = false;
    let settings = {
        fontSize: 16,
        fontFamily: "Verdana",
    };

    let scrolled = 0;

    let currentTitle = book.meta.title;

    afterUpdate(() => {
        if (currentTitle != book.meta.title) {
            section = 0;
            currentTitle = book.meta.title;
            updateStyles();
        }
    });

    const updateStyles = () => {
        // Doesn't adapt based on which section is loaded, but works for now
        for (let styleE of document.getElementsByTagName("style")) {
            //styleE.remove(); // Throws error parentNode = null.
            styleE.innerHTML = "";
        }

        book.styles.forEach((stylesheet) => {
            const styleE = document.createElement("style");
            styleE.innerText = stylesheet.css;
            document.head.appendChild(styleE);
        });
    };

    const updateSection = (inc) => {
        if (0 <= section + inc && section + inc <= book.contents.length) {
            section += inc;
            scrolled = 0;
        }
    };

    updateStyles();

    const handleKeydown = ({ key }) => {
        switch (key) {
            case "ArrowLeft":
                updateSection(-2);
                break;
            case "ArrowRight":
                updateSection(2);
                break;
            default:
                break;
        }
    };
</script>

<svelte:head>
    <title>
        {book.meta.title + " - " + book.meta.author}
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
            <b>{book !== undefined ? book.meta.title + " - " : ""}</b>
            {book !== undefined ? book.meta.author : ""}
        </h4>
        <p id="progress">{section}/{book.contents.length}</p>
    </div>

    <div slot="rightbar" style="display: inline-block">
        <button
            class="settingsBtn"
            on:click={() => (settingsVisible = !settingsVisible)}
        >
            ⚙
        </button>
        <button on:click={() => updateSection(-2)}>«</button>
        <button on:click={() => updateSection(2)}>»</button>
    </div>
</Topbar>

<div
    id="container"
    style="font-size: {settings.fontSize}px; font-family: {settings.fontFamily};"
>
    {@html book.contents[section]}
    {@html book.contents[section + 1]}
</div>

<ReaderSettings bind:settingsVisible bind:settings />

<svelte:window bind:scrollY={scrolled} on:keydown={handleKeydown} />

<style>
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
