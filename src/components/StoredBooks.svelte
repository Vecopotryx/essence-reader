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
    <div id="parent" style="padding-top: 3.1em">
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
                    height="300em"
                    alt="cover"
                />
                <p>{book.author + " - " + book.title}</p>
            </div>
        {/each}
    </div>
{/if}

<style>
    #parent {
        text-align: center;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    #book {
        flex-basis:0;
        flex-grow: 1;
        max-width: 25em;
        transition: transform 0.25s;
    }

    #book > img {
        border-radius: 0.5em;
        margin: auto;
    }

    #book:hover {
        transform: scale(1.1);
        cursor: pointer;
    }

    #deleteBtn {
        display: none;
        position: absolute;
        left: 50;
    }

    #book:hover #deleteBtn {
        display: inline-block;
    }
</style>
