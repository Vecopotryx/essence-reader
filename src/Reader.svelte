<script lang="ts">
    import { afterUpdate } from "svelte";
    import type { Book } from "./parse";
    import ReaderSettings from "./components/ReaderSettings.svelte";

    export let book: Book;
    export let theme: string;

    let section = 0;

    //$: percent = Math.floor(100 * (section / book.contents.length));

    let settingsVisible = false;
    let settings = {
        fontSize: 16,
        fontFamily: "Verdana"
    }

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

<main>
    <div id="topbar">
        <div id="toptext" style={scrolled > 100 ? "opacity: 0.5;" : ""}>
            <h4>
                <b>{book !== undefined ? book.meta.title + " - " : ""}</b>
                {book !== undefined ? book.meta.author : ""}
            </h4>
            <p id="progress">{section}/{book.contents.length}</p>
        </div>

        <div id="settingsbar">
            <button on:click={() => (settingsVisible = !settingsVisible)}>
                ⚙
            </button>
            <button on:click={() => updateSection(-2)}>«</button>

            <button on:click={() => updateSection(2)}>»</button>
        </div>
    </div>

    <div
        id="container"
        style="font-size: {settings.fontSize}px; font-family: {settings.fontFamily};"
    >
        {@html book.contents[section]}
        {@html book.contents[section + 1]}
    </div>

    <ReaderSettings bind:theme bind:settingsVisible bind:settings></ReaderSettings>
</main>

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

    #settingsbar {
        position: fixed;
        top: 0;
        right: 10%;
        transition: all 0.3s;
    }

    #settingsbar > button {
        margin: auto;
        border: none;
        background-color: transparent;
        cursor: pointer;
        color: inherit;
        font-size: 1.25em;
        display: inline-block;
    }

    #settingsbar > button:hover {
        filter: invert(0.5);
    }

    #topbar {
        text-align: center;
        line-height: 2em;
        top: 0;
        height: 2em;
        width: 100%;
        font-size: 1.25em;
        position: fixed;
        background: var(--secondary-bg);
        transition: background-color 0.5s;
    }

    #toptext {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        transition: opacity 0.3s;
    }

    @media (max-width: 900px) {
        #settingsbar {
            right: 0;
        }

        #toptext {
            text-align: left;
            padding-left: 1%;
            width: 75%;
        }
    }
</style>
