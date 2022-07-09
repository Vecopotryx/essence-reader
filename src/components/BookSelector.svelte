<script lang="ts">
    import { db } from "../db";
    import { liveQuery } from "dexie";
    import Topbar from "./Topbar.svelte";
    import Popover from "./Popover.svelte";
    import ThemePicker from "./ThemePicker.svelte";

    export let readFiles = (file: File) => {};
    export let dragging: boolean;
    export let saveBooksOn: boolean;
    export let theme: boolean;

    let books = liveQuery(() => db.books.toArray());
    let hasStored: boolean = false;
    let settingsVisible: boolean = false;

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

    async function updateCount() {
        const count = await db.books.count();
        hasStored = count > 0;
    }

    updateCount();
</script>

<Topbar>
    <h3 slot="toptext" style="display: inline;">Essence Reader</h3>
    <button
        class="settingsBtn"
        slot="rightbar"
        on:click={() => (settingsVisible = !settingsVisible)}
    >
        ⚙
    </button>
</Topbar>

<Popover bind:visible={settingsVisible} top={"3.1em"} right={"1%"}>
    <div style="width: 8em">
        <label style="user-select: none">
            <input type="checkbox" bind:checked={saveBooksOn} />
            Save books
        </label><br />
        <hr />
        <p style="display: inline">Select theme</p>

        <ThemePicker bind:theme />
    </div>
</Popover>

<div id="parent" style={!hasStored ? "justify-content: center" : ""}>
    {#if $books}
        {#each $books as book (book.id)}
            <div class="book" on:click={() => readFiles(book.file)}>
                <button
                    class="deleteBtn"
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
    {/if}

    <div class="book" style={!hasStored ? "max-width: 80em   " : ""}>
        <div
            on:click={() => clickFile()}
            id="dropInfo"
            style="max-width: {!hasStored
                ? '100% '
                : ''}; background-color: {dragging ? ' #87CEFA' : ''}"
        >
            <h1>📚</h1>
            <h2>
                {!hasStored ? "Drop anywhere or click to select a file" : "+"}
            </h2>
        </div>
        {#if hasStored}
            <p style="color: {dragging ? '#87CEFA' : 'inherit'}">
                Drop anywhere or click to select a file
            </p>
        {/if}
    </div>
</div>

<style>
    #parent {
        padding: 1em;
        padding-top: 3.5em;
        text-align: center;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    h1 {
        font-size: 400%;
        margin-bottom: 0;
    }

    h2 {
        font-weight: 500;
        color: gray;
    }

    #dropInfo {
        background-color: rgb(var(--secondary-bg));
        text-align: center;
        user-select: none;
        vertical-align: middle;
        transition: background-color 0.3s ease;
        cursor: pointer;
        overflow: hidden;
    }

    .book {
        flex-basis: 0;
        flex-grow: 1;
        max-width: 25em;
        min-width: 10em;
        filter: drop-shadow(0 15px 15px rgb(0 0 0 / 0.15));
        transition: transform 0.25s, filter 0.25s;
    }

    .book > p {
        vertical-align: bottom;
    }

    .book > img,
    .book > div {
        display: block;
        height: 15em;
        border-radius: 0.5em;
        margin: auto;
        max-width: 10em;
        object-fit: cover;
    }

    .book:hover {
        transform: translateY(-0.5em);
        cursor: pointer;
        filter: drop-shadow(0 55px 55px rgb(0 0 0 / 0.15));
    }

    .deleteBtn {
        display: none;
        position: absolute;
    }

    .book:hover .deleteBtn {
        display: inline-block;
    }
</style>
