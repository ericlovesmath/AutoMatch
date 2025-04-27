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
    info: string;
};


export type Phase = "info" | "matching" | "chat";
