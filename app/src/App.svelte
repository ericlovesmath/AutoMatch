<script>
    import Map from "./lib/Map.svelte";
    // import Info from "./lib/Info.svelte";
    import { chat, sendMessage, initWebSocket } from "./lib/WebsocketStore";
    import { onMount } from "svelte";

    let message = "";

    onMount(() => initWebSocket("ws://localhost:8080"));
</script>

<main>
    <!-- <Info /> -->
    <ul>
      {#each $chat as message}
        <li>{message}</li>
      {/each}
    </ul>
    <input type="text" bind:value="{message}" placeholder="Type a message" />
    <button on:click={() => sendMessage("chat_message", message)}>Send</button>
    <div style="width: 100vw; height:90vh">
        <Map />
    </div>
</main>


