<script lang="ts">
    import ThemePicker from "../components/ThemePicker.svelte";

    interface settingsInterface {
        scale: Number,
        fontFamily: string
    }

    export let settings: settingsInterface;
</script>

    <label for="fontpicker">Font:</label>
    <br />
    <select
        name="fontpicker"
        bind:value={settings.fontFamily}
        style="width: 100%;"
    >
        <option>Default</option>
        <option style="font-family:'Verdana'">Verdana</option>
        <option style="font-family:'Arial'">Arial</option>
        <option style="font-family:'Courier New '">Courier New </option>
        <option style="font-family:'Helvetica'">Helvetica</option>
        <option style="font-family:'Times New Roman'">Times New Roman</option>
    </select>
    <br />
    <label for="scale">Scale:</label>
    <br />
    <input
        name="scale"
        type="range"
        min="5"
        max="30"
        bind:value={settings.scale}
    />

    <ThemePicker />

<style>
</style>