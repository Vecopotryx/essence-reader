<script lang="ts">
    import { afterUpdate } from "svelte";
    import type { Book } from "./parse";

    export let book: Book;

    let section = 0;

    $: percent = Math.floor(100 * (section / book.contents.length));

    let fontSize = 16;
    let fontFamily = "Verdana";
    let settingsVisible = false;

    let dark = false;

    const toggleDark = () => {
        dark = !dark;
        window.document.body.classList.toggle("dark-mode");
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
        for (let styleE of document.querySelectorAll("style")) {
            styleE.remove();
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
    <div id="topbar">
        <h4>
            <b>{book !== undefined ? book.meta.title + " - " : ""}</b>
            {book !== undefined ? book.meta.author : ""}
        </h4>
        <p id="percentage">{percent}%</p>
    </div>

    <div
        id="sidebar"
        style={scrolled > 100
            ? "opacity: 0.5; border: 1px solid transparent;"
            : ""}
    >
        <button on:click={() => toggleDark()}>{dark ? "☾" : "☼"}</button>
        <button on:click={() => (settingsVisible = !settingsVisible)}>
            ⚙
        </button>
        <button on:click={() => updateSection(-2)}>«</button>

        <button on:click={() => updateSection(2)}>»</button>
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
    :global(body) {
        background-color: #fff;
        color: black;
        transition: background-color 0.3s;
    }
    :global(body.dark-mode) {
        background-color: #1d3040;
        color: #bfc2c7;
    }

    #readerSettings {
        position: fixed;
        top: calc(10% + 4em);
        left: calc(20% + 3.5em);
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

    #sidebar {
        border: 1px solid gray;
        border-radius: 5px;
        position: fixed;
        top: 10%;
        left: 20%;
        width: 3.5em;
        transition: all 0.3s;
    }

    #sidebar > button {
        margin: auto;
        border: none;
        background-color: transparent;
        cursor: pointer;
        color: inherit;
        height: 2em;
        font-size: 2em;
        display: block;
    }

    #sidebar > button:hover {
        filter: invert(0.5);
    }

    #topbar {
        text-align: center;
        height: 2em;
        width: 100%;
        position: fixed;
    }

    @media (max-width: 900px) {
        #sidebar {
            left: 2%;
        }

        #readerSettings {
            left: calc(2% + 3.5em);
        }
    }
</style>
