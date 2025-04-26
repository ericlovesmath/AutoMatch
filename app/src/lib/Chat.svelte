<script lang="ts">
    import { chat, sendMessage, initWebSocket } from "./WebsocketStore";
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
    handleConsent();

</script>

<main class="popup">
    <div class="popup-content">
        <div id="chatContainer">
            <h2>Chat</h2>
            <div id="chatMessages">
                {#each $chat as msg}
                    <div>{msg}</div>
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
    </div>
</main>

<style>
    .popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5); /* semi-transparent background */
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
    }

    /* Inner popup box */
    .popup-content {
        background: white;
        color: black;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 100%;
        text-align: center;
    }
</style>
