<script lang="ts">
    import { afterUpdate } from "svelte";
    import type { Book } from "./parse";

    export let book: Book;
    export let dark;

    let section = 0;

    //$: percent = Math.floor(100 * (section / book.contents.length));

    let fontSize = 16;
    let fontFamily = "Verdana";
    let settingsVisible = false;

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
</script>

<svelte:head>
    <title>
        {book.meta.title + " - " + book.meta.author}
    </title>
</svelte:head>

<main>
    <div id="topbar" style={scrolled > 100 ? "opacity: 0.5;" : ""}>
        <h4>
            <b>{book !== undefined ? book.meta.title + " - " : ""}</b>
            {book !== undefined ? book.meta.author : ""}
        </h4>
        <p id="percentage">{section}/{book.contents.length}</p>

        <div id="settingsbar">
            <button on:click={() => (dark = !dark)}>
                {dark ? "☾" : "☼"}
            </button>
            <button on:click={() => (settingsVisible = !settingsVisible)}>
                ⚙
            </button>
            <button on:click={() => updateSection(-2)}>«</button>

            <button on:click={() => updateSection(2)}>»</button>
        </div>
    </div>

    <div
        id="container"
        style="font-size: {fontSize}px; font-family: {fontFamily};"
    >
        {@html book.contents[section]}
        {@html book.contents[section + 1]}
    </div>

    {#if settingsVisible}
        <div id="readerSettings">
            <select bind:value={fontFamily}>
                <option style="font-family:'Verdana'">Verdana</option>
                <option style="font-family:'Arial'">Arial</option>
                <option style="font-family:'Courier New '">Courier New </option>
                <option style="font-family:'Helvetica'">Helvetica</option>
                <option style="font-family:'Times New Roman'"
                    >Times New Roman</option
                >
            </select>
            <br />
            <label for="fontsize">Font size:</label>
            <input
                name="fontsize"
                type="range"
                min="12"
                max="40"
                bind:value={fontSize}
            />
        </div>
    {/if}
</main>

<svelte:window bind:scrollY={scrolled} />

<style>
    #readerSettings {
        position: fixed;
        top: 2em;
        right: 10%;
        padding: 0.5em;
        background-color: #414242;
        text-align: center;
        color: #efefef;
        border-radius: 0.5em;
    }

    h4,
    #percentage {
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
    }

    @media (max-width: 900px) {
        #settingsbar {
            right: 0;
        }

        #readerSettings {
            left: calc(2% + 3.5em);
        }
    }
</style>
