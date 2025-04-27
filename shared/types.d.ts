export interface Message {
  type: "register" | "consent" | "chat_message" | "unregister";
  data: any;
}

export interface Response {
  type: "status" | "consent" | "chat_start" | "chat_message" | "map_update" ;
  msg: any;
}

interface Region {
  latitude: number;
  longitude: number;
  radius: number;
}
export interface ClientData {
  name: string;
  from: Region;
  to: Region;
}
