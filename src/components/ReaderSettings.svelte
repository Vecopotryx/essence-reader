<script lang="ts">
    import Popover from "./Popover.svelte";
    export let theme: string;

    export let settings = {
        fontSize: 16,
        fontFamily: "Verdana",
    };
    export let settingsVisible = false;
</script>

<main>
    <Popover bind:visible={settingsVisible} top={"3em"} right={"10%"}>
        <label for="fontpicker">Font:</label>
        <br />
        <select
            name="fontpicker"
            bind:value={settings.fontFamily}
            style="width: 100%;"
        >
            <option style="font-family:'Verdana'">Verdana</option>
            <option style="font-family:'Arial'">Arial</option>
            <option style="font-family:'Courier New '">Courier New </option>
            <option style="font-family:'Helvetica'">Helvetica</option>
            <option style="font-family:'Times New Roman'"
                >Times New Roman</option
            >
        </select>
        <br />
        <label for="fontsize">Font size:</label>
        <br />
        <input
            name="fontsize"
            type="range"
            min="12"
            max="40"
            bind:value={settings.fontSize}
        />

        <div id="themePicker">
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
        </div>
    </Popover>
</main>

<style>
    #themePicker > div {
        border-radius: 0.2em;
        margin: 0.2em;
        cursor: pointer;
        user-select: none;
    }
</style>
