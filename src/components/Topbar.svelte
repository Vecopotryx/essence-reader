<div id="topbar">
    <div id="toptext">
        <slot name="toptext" />
    </div>

    <div class="buttonbar" id="leftbar">
        <slot name="leftbar" />
    </div>

    <div class="buttonbar" id="rightbar">
        <slot name="rightbar" />
    </div>
</div>

<style>
    #rightbar {
        right: 10%;
    }

    #leftbar {
        left: 1%;
    }

    .buttonbar {
        position: fixed;
        top: 0;
        transition: all 0.3s;
    }

    .buttonbar :global(button) {
        margin: auto;
        border: none;
        background-color: transparent;
        cursor: pointer;
        color: inherit;
        font-size: 1.25em;
        display: inline-block;
    }

    .buttonbar :global(button:hover) {
        filter: invert(0.5);
    }

    #topbar {
        text-align: center;
        line-height: 2em;
        top: 0;
        height: 2em;
        width: 100%;
        font-size: 1.25em;
        position: fixed;
        background: var(--secondary-bg);
        transition: background-color 0.5s;
    }

    #toptext :global(*) {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    @media (max-width: 1000px) {
        #rightbar {
            right: 0;
        }

        #toptext {
            text-align: left;
            padding-left: 5%;
            width: 75%;
        }
    }
</style>
