import { WebSocketServer, WebSocket } from "ws";
import { ClientData, isMatch } from "./matching";

export interface Message {
  type: "register" | "consent" | "chat_message";
  data: any;
}

export interface Response {
  type: "status" | "consent" | "chat_start" | "chat_message";
  msg: string;
}

const mkResStatus = (msg: string) => JSON.stringify({ type: "status", msg })
const mkResConsent = (msg: string) => JSON.stringify({ type: "consent", msg })
const mkResChat = (msg: string) => JSON.stringify({ type: "chat_start", msg })
const mkResChatMsg = (msg: string) => JSON.stringify({ type: "chat_message", msg })

const clients: { ws: WebSocket; data: ClientData; match?: WebSocket, consent?: boolean }[] = [];

const wss = new WebSocketServer({ port: 8080 });

function checkPair(ws: WebSocket) {
  console.log("PAIRING")
  let client1 = null;
  for (const client of clients) {
    if (ws === client.ws) {
      client1 = client;
    }
  }

  if (client1 == null) {
    throw new Error("Client not found");
  }

  for (const client2 of clients) {
    if (client1.ws !== client2.ws && isMatch(client1.data, client2.data)) {
      console.log(`Found match: ${client1.data.name} and ${client2.data.name}`);

      client1.ws.send(mkResConsent(`Found match: ${client2.data.name}`));
      client2.ws.send(mkResConsent(`Found match: ${client1.data.name}`));

      client1.match = client2.ws;
      client2.match = client1.ws;
    }
  }
}

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.on("message", (raw: string) => {
    try {
      // TODO Parse the received data and validate
      const message: Message = JSON.parse(raw);
      console.log("Recieved message of type: ", message.type);

      switch (message.type as string) {
        case "register": {
          const data = message.data as ClientData;
          console.log(`Received Client Data: ${JSON.stringify(data)}`);

          clients.push({ ws, data });
          ws.send(mkResStatus("Registration Successful"));

          checkPair(ws);
          break;
        }

        case "consent": {
          const consented = message.data as boolean;

          const client = clients.find((client) => client.ws === ws);

          if (client?.ws && consented) {
            client.consent = true;
            const other = clients.find((c) => c.ws === client.match);
            if (other?.consent) {
              client.ws.send(mkResChat("Connecting..."));
              other.ws.send(mkResChat("Connecting..."));
            } else {
              client.ws.send(mkResStatus("Waiting for other user to consent"));
            }
          }
          break;
        }

        case "chat_message": {
          const client = clients.find((client) => client.ws === ws);
          const other = clients.find((c) => c.ws === client?.match);
          if (client?.consent && other?.consent) {
            ws.send(mkResChatMsg(message.data as string));
            other.ws.send(mkResChatMsg(message.data as string));
          } else {
            ws.send(mkResStatus("Chat failed to send (check consent?)"));
          }
          break;
        }

        default:
          console.log(`Unexpected Message Type ${message.type}`);
          ws.send(mkResStatus("Unknown Message Type"));
          break;
      }

    } catch (error) {
      console.error("Error parsing client data:", error);
      ws.send(mkResStatus("Invalid data format, server requests a JSON"));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
