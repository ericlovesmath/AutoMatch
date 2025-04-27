export interface Message {
  type: "register" | "consent" | "chat_message" | "unregister";
  data: any;
}

export interface Response {
  type: "notify_status" | "request_consent" | "notify_match_rejected" | "notify_chat_start" | "notify_chat_message" | "notify_map_update" ;
  msg: any;
}

interface Region {
  latitude: number;
  longitude: number;
  radius: number;
}
export interface ClientData {
  name: string;
  info: string;
  from: Region;
  to: Region;
}
