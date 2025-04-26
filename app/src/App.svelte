<script lang="ts">
    import Map from "./lib/Map.svelte";
    import Info from "./lib/Info.svelte";
    import Chat from "./lib/Chat.svelte";
    import {
        chat,
        sendMessage,
        initWebSocket,
        state,
    } from "./lib/WebsocketStore";
    import { onMount } from "svelte";

    onMount(() => initWebSocket("ws://localhost:8080"));
</script>

<main>
    {#if $state == "location"}
        <div style="width: 100vw; height:90vh">
            <Map />
        </div>
    {:else if $state == "info"}
        <Info />
    {:else if $state == "chat"}
        <Chat />
    {:else}
        unknown state
    {/if}
</main>
