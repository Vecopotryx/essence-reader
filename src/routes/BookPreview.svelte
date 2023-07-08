<script lang="ts">
    import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";
    import { fade } from "svelte/transition";

    export let book: any;
    export let deleteBook: (id: number) => void;
</script>

<div class="book" in:fade={{ duration: 200 }}>
    <button
        class="deleteBtn"
        on:click={(e) => {
            e.stopPropagation();
            deleteBook(book.id);
        }}
    >
        <TrashCan size={20} />
    </button>

    <img
        src={book.meta.cover !== undefined
            ? URL.createObjectURL(book.meta.cover)
            : ""}
        alt="cover"
    />

    <div class="bookInfo">
        <h4>{book.meta.author}</h4>
        <h3>{book.meta.title}</h3>
        <p>{book.progress} / {book.spine.length - 1}</p>
    </div>
</div>

<style>
    .book {
        width: 100%;
        display: grid;
        padding: 0;
        grid-template-columns: auto 1fr;
    }

    .book > img,
    .book > div {
        height: 15em;
        width: 10em;
        object-fit: cover;
    }

    .book > img {
        background-color: gray;
    }

    .deleteBtn {
        display: none;
        position: absolute;
        background-color: transparent;
        right: 0;
        font-size: 1.5em;
        border-radius: 0 0.5em;
        color: inherit;
        cursor: pointer;
        border: none;
        transition: background-color 0.2s;
    }

    .deleteBtn:hover {
        background-color: rgba(255, 10, 50, 1);
        color: white;
    }

    .book:hover .deleteBtn {
        display: inline-block;
    }

    .bookInfo > h3 {
        font-weight: 500;
        color: gray;
    }

    .bookInfo {
        min-width: 100%;
    }
</style>
