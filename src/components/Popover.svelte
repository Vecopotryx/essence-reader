<script lang="ts">
    export let visible: boolean;
    export let top: string;
    export let right: string;

    function clickOutside(node: Node) {
        const handleClick = (event: Event) => {
            if (event.target instanceof Element) {
                if (
                    !node.contains(event.target) &&
                    event.target.className !== "settingsBtn"
                ) {
                    node.dispatchEvent(new CustomEvent("outclick"));
                }
            }
        };

        document.addEventListener("click", handleClick, true);

        return {
            destroy() {
                document.removeEventListener("click", handleClick, true);
            },
        };
    }
</script>

{#if visible}
    <div
        id="popover"
        style="top: {top}; right: {right}"
        use:clickOutside
        on:outclick={() => (visible = false)}
    >
        <slot />
    </div>
{/if}

<style>
    #popover {
        position: fixed;
        padding: 0.5em;
        background: rgba(var(--secondary-bg), 0.8);
        backdrop-filter: blur(5px);
        text-align: center;
        color: var(--primary-color);
        filter: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03))
            drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));
        border-radius: 0.5em;
    }
</style>
