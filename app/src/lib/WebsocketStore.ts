import { writable } from "svelte/store";
import L from "leaflet";

export type MessageType = "register" | "consent" | "chat_message";
export type StateType = "location" | "info" | "chat";
export type LocationInfo = {
    from: L.LatLng;
    to: L.LatLng;
    from_radius: number;
    to_radius: number;
};
export type ContactInfo = {
    name: string;
    phone: string;
};

let ws: WebSocket | null = null;

export const chat = writable<string[]>([]);
export const state = writable<StateType>("location");
export const location_info = writable<LocationInfo|null>(null);
export const contact_info = writable<ContactInfo|null>(null);

export function addMessageHandler(listener: (this: WebSocket, ev: any) => any){
    ws?.addEventListener("message", listener);
}

export function submitUser(loc: LocationInfo, contact: ContactInfo){
    sendMessage("register", {
        name: contact.name,
        airport: "LAX",
        radius: loc.from_radius,
        latitude: loc.from.lat,
        longitude: loc.from.lng,
    } as any)
}

export function initWebSocket(url: string) {
  ws = new WebSocket(url);

  addMessageHandler((e) => {
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
  })

  ws.onerror = (err) => console.error("WebSocket error:", err);
  ws.onclose = () => console.log("WebSocket connection closed");
}

export function sendMessage(type: MessageType, msg: any) {
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
