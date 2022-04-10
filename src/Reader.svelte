<script lang="ts">
    import type { Book } from "./parse";

    export let book: Book;

    let section = 0;

    $: percent = Math.floor(100*(section / book.contents.length));
</script>

<main>
    <div id="topbar">
        <p id="percentage">{percent}%</p>
        <button on:click={() => section -= 2 }>Previous</button>

        <h4>
            <b>{book !== undefined ? book.meta.title + " - " : ""}</b>
            {book !== undefined ? book.meta.author : ""}
        </h4>

        <button on:click={() => section += 2 }>Next</button>
    </div>

    <div id="container">
        {@html book.contents[section]}
        {@html book.contents[section+1]}


        
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
        height: 100%;
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
