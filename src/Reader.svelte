<script lang="ts">
    import type { Book } from "./parse";

    export let book: Book;

    let section = 0;

    $: percent = Math.floor(100 * (section / book.contents.length));

    let fontSize = 16;
    let fontFamily = "Arial";
    let settingsVisible = false;

    let dark = false;

    const toggleDark = () => {
        dark = !dark;
        window.document.body.classList.toggle("dark-mode");
    };
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

    <div id="sidebar">
        <button style="border: none" on:click={() => toggleDark()}
            >{dark ? "☾" : "☼"}</button
        >
        <button on:click={() => (settingsVisible = !settingsVisible)}>
            ⚙
        </button>
        <button on:click={() => (section -= 2)}>«</button>

        <button on:click={() => (section += 2)}>»</button>

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
            <input
                name="fontsize"
                style="float: right; margin-right: 2%"
                type="range"
                min="12"
                max="40"
                bind:value={fontSize}
            />
            <label for="fontsize" style="float: right">Font size:</label>

            <select bind:value={fontFamily}>
                <option style="font-family:'Arial'">Arial</option>
                <option style="font-family:'Courier New '">Courier New </option>
                <option style="font-family:'Helvetica'">Helvetica</option>
                <option style="font-family:'Times New Roman'"
                    >Times New Roman</option
                >
            </select>
        </div>
    {/if}
</main>

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
        width: 20%;
        background-color: #3e6485;
    }

    h4, #percentage {
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
    }

    #sidebar > button {
        margin: auto;
        border: none;
        background-color: transparent;
        color: inherit;
        height: 2em;
        font-size: 2em;
        display: block;
    }

    #topbar {
        text-align: center;
        height: 2em;
        width: 100%;
        position: fixed;
    }


</style>
