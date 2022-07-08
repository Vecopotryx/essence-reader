<script lang="ts">
    import { db } from "../db";
    import { liveQuery } from "dexie";

    export let readFiles = (file: File) => {};

    let books = liveQuery(() => db.books.toArray());

    async function deleteBook(id: number) {
        await db.books.delete(id);
    }
</script>

{#if $books}
    <div id="parent">
        {#each $books as book (book.id)}
            <div id="book" on:click={() => readFiles(book.file)}>
                <button
                    id="deleteBtn"
                    on:click={(e) => {
                        e.stopPropagation();
                        deleteBook(book.id);
                    }}>Delete book</button
                >
                <img
                    src={book.cover !== undefined
                        ? URL.createObjectURL(book.cover)
                        : ""}
                    alt="cover"
                />
                <p>{book.author + " - " + book.title}</p>
            </div>
        {/each}
        <slot />
    </div>
{/if}

<style>
    #parent {
        padding: 1em;
        padding-top: 3.5em;
        text-align: center;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    #book {
        flex-basis: 0;
        flex-grow: 1;
        max-width: 25em;
        filter: drop-shadow(0 15px 15px rgb(0 0 0 / 0.15));
        transition: transform 0.25s, filter 0.25s;
    }

    #book > img {
        height: 15em;
        border-radius: 0.5em;
        margin: auto;
    }

    #book:hover {
        transform: scale(1.1);
        cursor: pointer;
        filter: drop-shadow(0 55px 55px rgb(0 0 0 / 0.15));
    }

    #deleteBtn {
        display: none;
        position: absolute;
    }

    #book:hover #deleteBtn {
        display: inline-block;
    }
</style>
