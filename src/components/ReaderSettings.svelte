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
        <select bind:value={settings.fontFamily}>
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
        <input
            name="fontsize"
            type="range"
            min="12"
            max="40"
            bind:value={settings.fontSize}
        />
        <div
            style="background-color: #f3dba6; color: #000"
            on:click={() => (theme = "warm")}
        >
            warm
        </div>
        <div
            style="background-color: #1d3040; color: #bfc2c7"
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
    </Popover>
</main>

<style>

</style>
