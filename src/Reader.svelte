<script lang="ts">
    import type { Book } from "./parse";

    export let book: Book;

    let section = 0;

    $: percent = Math.floor(100 * (section / book.contents.length));

    let fontSize = 16;
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
        <input name="fontsize" style="float: right; margin-right: 2%" type="range" min="12" max="40" bind:value={fontSize}>
        <label for="fontsize" style="float: right">Font size:</label>
    </div>

    <div id="container" style="font-size: {fontSize}px">
        {@html book.contents[section]}
        {@html book.contents[section + 1]}
    </div>
</main>

<style>
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
