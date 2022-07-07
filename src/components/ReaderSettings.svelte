<script lang="ts">
    import Popover from "./Popover.svelte";
    import ThemePicker from "./ThemePicker.svelte";

    export let theme: string;

    export let settings = {
        fontSize: 16,
        fontFamily: "Verdana",
    };
    export let settingsVisible = false;
</script>

<Popover bind:visible={settingsVisible} top={"3.1em"} right={"1%"}>
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
        <option style="font-family:'Times New Roman'">Times New Roman</option>
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

    <ThemePicker bind:theme />
</Popover>

<style>
</style>
