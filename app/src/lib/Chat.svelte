<script lang="ts">
    let chatMessage = $state<string>("");

    let { chat, send_message } = $props<{
        chat: string[];
        send_message: (msg: string) => void;
    }>();

    function sendChatMessage() {
        send_message(chatMessage.trim());
        chatMessage = "";
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            sendChatMessage();
        }
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
                onkeydown={handleKeyDown}
            />
            <button onclick={sendChatMessage}>Send</button>
        </div>
    </div>
</main>

<style>
main {
  margin: 0;
  padding: 20px;
  background-color: #EEEEEE;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: black;
}

#chatContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
}

#chatContainer h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
}

#chatMessages {
  height: 300px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}

#chatInput {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

#chatInput input[type="text"] {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
}

#chatInput button {
  padding: 10px 20px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#chatInput button:hover {
  background-color: #0056b3;
}

/* Scrollbar styling, I have no idea how this works */
#chatMessages::-webkit-scrollbar {
  width: 8px;
}

#chatMessages::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 5px;
}

#chatMessages::-webkit-scrollbar-thumb:hover {
  background-color: #b3b3b3;
}
</style>
