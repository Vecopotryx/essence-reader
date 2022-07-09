<script lang="ts">
    const setTheme = (theme: string) => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    };
</script>

<div
    style="background-color: #f6e4bd; color: #000"
    on:click={() => setTheme("warm")}
>
    warm
</div>
<div
    style="background-color: #000; color: #e9e9e9"
    on:click={() => setTheme("black")}
>
    black
</div>
<div
    style="background-color: #032038; color: #e9e9e9"
    on:click={() => setTheme("dark")}
>
    dark
</div>
<div
    style="background-color: #fff; color: #000"
    on:click={() => setTheme("light")}
>
    light
</div>

<style>
    div {
        border-radius: 0.2em;
        margin: 0.2em;
        cursor: pointer;
        user-select: none;
    }
</style>
