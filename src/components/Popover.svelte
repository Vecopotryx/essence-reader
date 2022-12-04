<script lang="ts">
    import { fly } from "svelte/transition";
    export let visible: boolean;
    export let top: string;
    export let right: string;

    function clickOutside(node: Node) {
        const handleClick = (event: Event) => {
            if (event.target instanceof Element) {
                if (
                    !node.contains(event.target) &&
                    event.target.id !== "settingsBtn"
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
        transition:fly={{ x: 50, duration: 200 }}
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
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        text-align: center;
        color: var(--primary-color);
        filter: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03))
            drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));
        border-radius: 0.5em;
        z-index: 10;
        overflow: auto;
        max-height: 80vh;
    }

    @supports not (
        (-webkit-backdrop-filter: blur(5px)) or (backdrop-filter: blur(5px))
    ) {
        #popover {
            background-color: rgb(var(--secondary-bg));
        }
    }
</style>
