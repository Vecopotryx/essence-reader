<script lang="ts">
    import { flip } from "svelte/animate";
    import { db } from "../db";
    import { liveQuery, type Observable } from "dexie";
    import Topbar from "./Topbar.svelte";
    import Popover from "./Popover.svelte";
    import ThemePicker from "./ThemePicker.svelte";
    import type { Book } from "../services/types";
    import { fade } from "svelte/transition";

    export let readFiles = (file: File) => {};
    export let openExisting = (id: number) => {};
    export let dragging: boolean;
    export let saveBooksOn: boolean;
    export let loading: boolean;

    let books: Observable<Book[]> = liveQuery(() => db.books.toArray());
    let hasStored: boolean = false;

    const clickFile = () => {
        let input = document.createElement("input");
        input.type = "file";
        input.onchange = (e) => {
            readFiles((e.target as HTMLInputElement).files[0]);
        };

        input.click();
    };

    async function deleteBook(id: number) {
        await db.books.delete(id);
    }

    const removeAllBooks = async () => {
        if (confirm("Are you sure you want to remove all saved books?")) {
            await db.books.clear();
        }
    };

    async function updateCount() {
        if (saveBooksOn) {
            const count = await db.books
                .count()
                .catch(() => (saveBooksOn = false));
            hasStored = count > 0;
        }
    }

    updateCount();
</script>

<div in:fade={{ duration: 200 }}>
    <Topbar>
        <h3 slot="toptext" style="display: inline;">Essence Reader</h3>
        <Popover slot="rightbar" text="⚙">
            <div style="width: 8em">
                <label style="user-select: none">
                    <input type="checkbox" bind:checked={saveBooksOn} />
                    Save books
                </label><br />
                <button on:click={removeAllBooks}>Remove all</button>
                <hr />
                <p style="display: inline">Select theme</p>
    
                <ThemePicker />
            </div>
        </Popover>
    </Topbar>



    <div id="parent">
        {#if $books}
            {#each $books as book (book.id)}
                <button
                    animate:flip={{ duration: 200 }}
                    class="book"
                    on:click={() => openExisting(book.id)}
                >
                    <button
                        class="deleteBtn"
                        on:click={(e) => {
                            e.stopPropagation();
                            deleteBook(book.id);
                        }}>✕</button
                    >
                    <img
                        in:fade={{ duration: 200 }}
                        src={book.meta.cover !== undefined
                            ? URL.createObjectURL(book.meta.cover)
                            : ""}
                        alt="cover"
                    />
                    <div class="bookInfo" in:fade={{ duration: 200 }}>
                        <h4>{book.meta.author}</h4>
                        <h3>{book.meta.title}</h3>
                        <p>{book.progress} / {book.contents.length - 1}</p>
                    </div>
                </button>
            {/each}
        {/if}

        <button
            class="book"
            on:click={() => clickFile()}
            style={!hasStored ? "max-width: 50vw" : ""}
        >
            <div
                id="dropInfo"
                class={loading ? "loading" : ""}
                style="max-width: {!hasStored
                    ? '100% '
                    : ''}; background-color: {dragging ? ' #87CEFA' : ''}"
            >
                {#if loading}
                    <h1>📚</h1>
                    <h2>...</h2>
                {:else}
                    <h1>📚</h1>
                    <h2>
                        {!hasStored
                            ? "Drop anywhere or click to select a file"
                            : "+"}
                    </h2>
                {/if}
            </div>
            {#if hasStored}
                <div class="bookInfo">
                    <h4>Load new book</h4>
                    <h3 style="color: {dragging ? '#87CEFA' : ''}">
                        {loading
                            ? "Loading"
                            : "Drop anywhere or click to select a file"}
                    </h3>
                </div>
            {/if}
        </button>
    </div>
</div>

<style>
    @keyframes gradient {
        0% {
            background-position: 0% 0%;
        }
        50% {
            background-position: 0% 100%;
        }
        100% {
            background-position: 0% 0%;
        }
    }

    .loading {
        background: linear-gradient(
            rgb(var(--secondary-bg)),
            #0a1223,
            rgb(var(--secondary-bg))
        );
        background-size: 400% 400%;
        animation: gradient 5s ease infinite;
    }

    #parent {
        padding: 1em;
        padding-top: 3.5em;
        text-align: center;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1em;
    }

    #dropInfo > h1 {
        font-size: 400%;
        margin-bottom: 0;
    }

    .bookInfo > h3 {
        font-weight: 500;
        color: gray;
    }

    #dropInfo {
        background-color: rgb(var(--secondary-bg));
        text-align: center;
        user-select: none;
        min-width: 10em;
        width: 50vw;
        vertical-align: middle;
        transition: background-color 0.3s ease;
        cursor: pointer;
        overflow: hidden;
        margin: auto;
        color: gray;
    }

    .bookInfo {
        min-width: 100%;
    }

    .book {
        max-width: 30vw;
        min-width: 20em;
        filter: drop-shadow(0 15px 15px rgb(0 0 0 / 0.15));
        transition: transform 0.25s, filter 0.25s;
        background-color: rgb(var(--secondary-bg));
        border-radius: 0.5em;
        box-shadow: none;
        border: none;
        display: grid;
        padding: 0;
        flex: 1 1 100%;
        grid-template-columns: auto 1fr;
        color: inherit;
        font-family: inherit;
        font-size: inherit;
        overflow: hidden;
    }

    .book > img,
    .book > div {
        height: 15em;
        margin: auto;
        max-width: 10em;
        object-fit: cover;
    }

    .book:hover,
    .book:focus {
        transform: translateY(-0.5em);
        cursor: pointer;
    }

    .deleteBtn {
        display: none;
        position: absolute;
        background-color: transparent;
        right: 0;
        font-size: 1.5em;
        border-bottom-left-radius: 0.2em;
        color: inherit;
        cursor: pointer;
        border: none;
        transition: background-color 0.2s;
    }

    .deleteBtn:hover {
        background-color: rgba(255, 10, 50, 1);
    }

    .book:hover .deleteBtn {
        display: inline-block;
    }
</style>
