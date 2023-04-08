<script lang="ts">
    import type { TOC } from "../services/types";

    export let tocitem: TOC;
    export let onclick: () => void;
    export let selected: boolean;
</script>

<button
    class="tocButton"
    style="{selected
        ? 'border: 1px solid lightblue; font-weight: bold;'
        : ''}  {tocitem.isChild ? 'padding-left: 2em;' : ''}"
    on:click={onclick}
>
    {tocitem.name} <span> {tocitem.index} </span>
</button>

<style>
    .tocButton {
        display: flex;
        justify-content: space-between;
        border: none;
        font-family: inherit;
        background-color: transparent;
        color: inherit;
        width: 95%;
        padding: 1vh;
        margin: auto;
        text-align: left;
        border-radius: 0.2em;
        border: 1px solid transparent;
    }

    .tocButton:hover {
        cursor: pointer;
        border: 1px solid rgb(var(--primary-color));
    }
</style>
