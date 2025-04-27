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

export function submitUser(ws: WebSocket | null, loc: LocationInfo, contact: ContactInfo) {
    let data = {
        name: contact.name,
        from: {
            latitude: loc.from.lat,
            longitude: loc.from.lng,
            radius: loc.from_radius
        },
        to: {
            latitude: loc.to.lat,
            longitude: loc.to.lng,
            radius: loc.to_radius
        },
    };
    sendMessage(ws, "register", data);
}

export function sendMessage(ws: WebSocket | null, type: MessageType, msg: any) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, data: msg }));
    }
}

export function closeWebSocket(ws: WebSocket | null) {
    if (ws) {
        ws.close();
        ws = null;
    }
}

