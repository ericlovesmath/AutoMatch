import { writable } from "svelte/store";

export type MessageType = "register" | "consent" | "chat_message";

let ws: WebSocket | null = null;

export const chat = writable<string[]>([]);

export function initWebSocket(url: string) {
  ws = new WebSocket(url);

  ws.onmessage = (e) => {
    const res: { type: string, msg: string } = JSON.parse(e.data);

    switch (res.type) {
      case "status":
        alert(res.msg);
        break;

      case "consent":
        alert(res.msg);
        break;

      case "chat_start":
        alert("TODO: RELEASE CHAT INTERFACE HERE");
        // releaseChatInterface();
        break;

      case "chat_message":
        alert("TODO: UPDATE CHAT INTERFACE HERE");
        chat.update((msgs) => [...msgs, res.msg]);
        break;

      default:
        console.error("Unknown response type:", res.type);
    }
  };

  ws.onerror = (err) => console.error("WebSocket error:", err);
  ws.onclose = () => console.log("WebSocket connection closed");
}

export function sendMessage(type: MessageType, msg: string) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data: msg }));
  }
}

export function closeWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
