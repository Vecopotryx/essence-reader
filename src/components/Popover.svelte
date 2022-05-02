<script lang="ts">
    export let visible: boolean;
    export let top: string;
    export let right: string;

</script>

<main>
    {#if visible}
        <div id="popover" style="top: {top}; right: {right}">
            <slot />
        </div>
    {/if}
</main>

<style>
    #popover {
        position: fixed;
        padding: 0.5em;
        background-color: var(--secondary-bg);
        text-align: center;
        color: var(--primary-color);
        filter: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));
        border-radius: 0.5em;
    }
</style>
