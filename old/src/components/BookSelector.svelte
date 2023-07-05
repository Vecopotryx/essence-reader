<script lang="ts">
    import bookDB from "../db";
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { fade } from "svelte/transition";
    import type { Book } from "../services/types";

    import Topbar from "./Topbar.svelte";
    import Popover from "./Popover.svelte";
    import ThemePicker from "./ThemePicker.svelte";
    import Settings from "carbon-icons-svelte/lib/Settings.svelte";
    import BookPreview from "./BookPreview.svelte";

    export let readFiles = (file: File) => {};
    export let openExisting = (id: number) => {};
    export let dragging: boolean;
    export let saveBooksOn: boolean;

    let bookList: Book[];

    const clickFile = () => {
        let input = document.createElement("input");
        input.type = "file";
        input.onchange = (e) => {
            readFiles((e.target as HTMLInputElement).files[0]);
        };

        input.click();
    };

    const deleteBook = (id: number) => {
        bookList = bookList.filter((book) => book.id !== id);
        bookDB.deleteBook(id);
    };

    const deleteAllBooks = () => {
        if (confirm("Are you sure you want to delete all saved books?")) {
            bookDB.deleteAll();
            bookList = [];
        }
    };

    onMount(() => {
        bookDB.getAll().then((books) => {
            bookList = books;
        });
    });
</script>

<div in:fade={{ duration: 200 }}>
    <Topbar>
        <h3 slot="toptext">Essence Reader</h3>
        <Popover slot="rightbar">
            <Settings slot="icon" size={24} />
            <div style="width: 8em">
                <label>
                    <input type="checkbox" bind:checked={saveBooksOn} />
                    Save books
                </label>
                <button on:click={deleteAllBooks}>Remove all</button>
                <hr />
                Select theme
                <ThemePicker />
            </div>
        </Popover>
    </Topbar>

    <div id="parent">
        {#if bookList}
            {#each bookList as book (book.id)}
                <button
                    class="libraryItem"
                    on:click={() => openExisting(book.id)}
                    animate:flip={{ duration: 200 }}
                >
                    <BookPreview {book} {deleteBook} />
                </button>
            {/each}
        {/if}

        <button
            class="libraryItem"
            on:click={() => clickFile()}
            style="color: {dragging ? 'green' : 'gray'}"
        >
            <h1 id="dropInfoIcon">{dragging ? "↓" : "📚"}</h1>

            <h2>Drop anywhere or click to select a file</h2>
        </button>
    </div>
</div>

<style>
    #parent {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        padding: 3.5em 1em 1em;
        gap: 1em;
    }

    #dropInfoIcon {
        font-size: 5em;
        margin: 0;
    }

    .libraryItem {
        color: inherit;
        border: none;
        overflow: hidden;
        font-size: inherit;
        font-family: inherit;
        flex: 1 1 100%;
        height: 15em;
        padding: 0;
        max-width: 30vw;
        min-width: 20em;
        border-radius: 0.5em;
        filter: drop-shadow(0 15px 15px rgb(0 0 0 / 0.15));
        background-color: rgb(var(--secondary-bg));
        transition: transform 0.25s;
    }

    .libraryItem:hover,
    .libraryItem:focus {
        cursor: pointer;
        transform: translateY(-0.5em);
    }
</style>
