<script lang="ts">
    export let theme: string;
</script>

<main id="themePicker">
    <div
        style="background-color: #f6e4bd; color: #000"
        on:click={() => (theme = "warm")}
    >
        warm
    </div>
    <div
        style="background-color: #000; color: #e9e9e9"
        on:click={() => (theme = "black")}
    >
        black
    </div>
    <div
        style="background-color: #032038; color: #e9e9e9"
        on:click={() => (theme = "dark")}
    >
        dark
    </div>
    <div
        style="background-color: #fff; color: #000"
        on:click={() => (theme = "light")}
    >
        light
    </div>
</main>

<style>
    #themePicker > div {
        border-radius: 0.2em;
        margin: 0.2em;
        cursor: pointer;
        user-select: none;
    }
</style>
