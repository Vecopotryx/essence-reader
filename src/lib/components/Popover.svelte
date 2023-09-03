<script lang="ts">
	import { fly } from 'svelte/transition';
	let visible: boolean;

	let button: Element;

	function clickOutside(node: Node) {
		const handleClick = (event: Event) => {
			if (event.target instanceof Element) {
				if (!node.contains(event.target) && event.target !== button) {
					visible = false;
				}
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

<button
	class="popoverBtn"
	bind:this={button}
	on:click={() => (visible = !visible)}>
	<slot name="icon" />
</button>

{#if visible}
	<div
		transition:fly={{ x: 50, duration: 200 }}
		class="popover"
		use:clickOutside>
		<!-- Wrapper needed since WebKit on iOS cuts off content when scrolling otherwise -->
		<!-- See: https://stackoverflow.com/questions/26704903/only-in-safari-positionfixed-child-cut-off-when-parent-is-positionfixed-and -->
		<div class="wrapper">
			<slot />
		</div>
	</div>
{/if}

<style>
	.popover {
		position: fixed;
		padding: 0.5em;
		background: rgba(var(--secondary-bg), 0.8);
		backdrop-filter: blur(15px);
		-webkit-backdrop-filter: blur(15px);
		text-align: center;
		color: rgb(var(--primary-color));
		filter: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03))
			drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));
		border-radius: 0.25em;
		z-index: 10;
		right: 0;
		top: 2.5em;
		max-width: 50%;
	}

	.wrapper {
		overflow: auto;
		max-height: 80vh;
	}

	.popoverBtn > :global(*) {
		pointer-events: none;
	}

	@supports not (
		(-webkit-backdrop-filter: blur(5px)) or (backdrop-filter: blur(5px))
	) {
		.popover {
			background-color: rgb(var(--secondary-bg));
		}
	}
</style>
