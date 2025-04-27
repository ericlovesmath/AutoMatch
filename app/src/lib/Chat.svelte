<script lang="ts">
    let chatMessage = $state<string>("");

    let {chat, send_message} = $props<{
        chat: string[];
        send_message: (msg: string) => void
    }>();

    function sendChatMessage() {
        send_message(chatMessage.trim());
        chatMessage = "";
    }

</script>

<main>
    <div id="chatContainer">
        <h2>Chat</h2>
        <div id="chatMessages">
            {#each chat as msg}
                <div>{msg}</div>
            {/each}
        </div>
        <div id="chatInput">
            <input
                type="text"
                bind:value={chatMessage}
                placeholder="Type your message..."
            />
            <button onclick={sendChatMessage}>Send</button>
        </div>
</main>
