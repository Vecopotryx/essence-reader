<script lang="ts">
    import type { Book } from "./parse";

    export let book: Book;
</script>

<main>
    <div id="topbar">
        <h4>
            <b>{book !== undefined ? book.meta.title + " - " : ""}</b>
            {book !== undefined ? book.meta.author : ""}
        </h4>
    </div>

    {#each book !== undefined ? book.contents : "" as content}
        {@html content}
    {/each}
</main>

<style>
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
