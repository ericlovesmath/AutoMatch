<script lang="ts">
    import Map from "./lib/Map.svelte";
    // import Info from "./lib/Info.svelte";
    import { chat, sendMessage, initWebSocket } from "./lib/WebsocketStore";
    import { onMount } from "svelte";

    onMount(() => initWebSocket("ws://localhost:8080"));

    let name = "";
    let airport = "";
    let radius = 1;
    let latitude = 34.138;
    let longitude = -118.125;
    let chatMessage = "";
    let showConsentButton = false;
    let showChatContainer = false;

    function handleSubmit(event: any) {
      event.preventDefault();
      const data = { name, airport, radius, latitude, longitude };
      sendMessage("register", data as any);
      showConsentButton = true;
    }

    function handleConsent() {
      sendMessage("consent", true as any);
      showChatContainer = true;
    }

    function sendChatMessage() {
      sendMessage("chat_message", chatMessage.trim());
      chatMessage = "";
    }
</script>

<main>
    <!-- <Info /> -->

    <h1>Client Information Form</h1>
    <form on:submit={handleSubmit}>
      <label for="name">Name:</label>
      <input type="text" id="name" bind:value={name} required />
      <br /><br />

      <label for="airport">Preferred Airport:</label>
      <input type="text" id="airport" bind:value={airport} required />
      <br /><br />

      <label for="radius">Radius (in km):</label>
      <input type="number" id="radius" bind:value={radius} required />
      <br /><br />

      <label for="latitude">Latitude:</label>
      <input type="number" step="any" id="latitude" bind:value={latitude} required />
      <br /><br />

      <label for="longitude">Longitude:</label>
      <input type="number" step="any" id="longitude" bind:value={longitude} required />
      <br /><br />

      <button type="submit">Submit</button>
    </form>

    {#if showConsentButton}
      <button on:click={handleConsent}>Consent to Chat</button>
    {/if}

    {#if showChatContainer}
      <div id="chatContainer">
        <h2>Chat</h2>
        <div id="chatMessages">
          {#each $chat as msg}
            <div> {msg} </div>
          {/each}
        </div>
        <div id="chatInput">
          <input
            type="text"
            bind:value={chatMessage}
            placeholder="Type your message..."
          />
          <button on:click={sendChatMessage}>Send</button>
        </div>
      </div>
    {/if}

    <div style="width: 100vw; height:90vh">
        <Map />
    </div>
</main>


