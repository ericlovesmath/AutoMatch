
// copied because of import behavior I can't figure out
type MessageType = "register" | "consent" | "chat_message";
type LocationInfo = {
    from: L.LatLng;
    to: L.LatLng;
    from_radius: number;
    to_radius: number;
};

type ContactInfo = {
    name: string;
    info: string;
};


// register user data with the server
export function submitUser(ws: WebSocket | null, loc: LocationInfo, contact: ContactInfo) {
    let data = {
        name: contact.name,
        info: contact.info,
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

// send any message to the server
export function sendMessage(ws: WebSocket | null, type: MessageType, msg: any) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, data: msg }));
    }
}
