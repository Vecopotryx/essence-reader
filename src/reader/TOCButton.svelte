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
    - {tocitem.name}
</button>

<style>
    .tocButton {
        display: block;
        border: none;
        font-family: inherit;
        background-color: transparent;
        color: inherit;
        width: 95%;
        margin: auto;
        text-align: left;
        border-radius: 0.2em;
        border: 1px solid transparent;
    }

    .tocButton:hover {
        cursor: pointer;
        border: 1px solid var(--primary-color);
    }
</style>
