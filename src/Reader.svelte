<script lang="ts">
    import type { Book } from "./parse";

    export let book: Book;

    let section = 0;

    $: percent = Math.floor(100 * (section / book.contents.length));

    let fontSize = 16;
    let fontFamily = "Arial";
    let settingsVisible = false;
</script>

<main>
    <div id="topbar">
        <p id="percentage">{percent}%</p>
        <button on:click={() => (section -= 2)}>Previous</button>

        <h4>
            <b>{book !== undefined ? book.meta.title + " - " : ""}</b>
            {book !== undefined ? book.meta.author : ""}
        </h4>

        <button on:click={() => (section += 2)}>Next</button>

        <button
            style="float: right"
            on:click={() => (settingsVisible = !settingsVisible)}
        >
            ⚙ Settings
        </button>
    </div>

    <div
        id="container"
        style="font-size: {fontSize}px; font-family: {fontFamily}"
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
    #readerSettings {
        position: absolute;
        top: 2.5em;
        right: 0;
        width: 20%;
        background-color: lightgray;
    }

    #percentage {
        float: left;
        margin: auto;
        display: inline;
        color: black;
    }

    #container {
        padding-top: 3em;
        height: 100% - 3em;
        columns: 2;
    }

    #topbar {
        text-align: center;
        height: 2em;
        width: 100%;
        background-color: gray;
        position: fixed;
    }

    h4 {
        display: inline;
        color: black;
    }
</style>
