import { WebSocketServer, WebSocket } from "ws";
import { isMatch } from "./matching";
import { Message, ClientData, Response } from "../../shared/types";

// NOTE FOR BRADY
// - CHANGED API
//   - chat_message gets json { name: string, msg: string } instead of just msg now
//   - map_update gets json { type: add/remove, data: ClientData }
//     - Rejecting is treated the same as removing them from map (since you won't want to consider them anyways)
//     - map_update ADD stream sent for users who connected before you when you register
//   - Client can send { consent : false } to remove the user from both people's interfaces
//   - Client can send info_update like register, but to change the user
//   - ClientData doesn't take an Airport, but [from] and [to] regions

const mkResStatus = (msg: string) => JSON.stringify({ type: "status", msg } as Response);
const mkResConsent = (msg: string) => JSON.stringify({ type: "consent", msg } as Response);
const mkResChat = (msg: string) => JSON.stringify({ type: "chat_start", msg } as Response);
const mkResChatMsg = (msg: { name: string, msg: string; }) => JSON.stringify({ type: "chat_message", msg } as Response);
const mkResMapUpdate = (msg: { type: "add" | "remove", data: ClientData; }) => JSON.stringify({ type: "map_update", msg } as Response);

// TODO: Database instead?
const clients: { ws: WebSocket; data: ClientData; match?: WebSocket, consent?: boolean; }[] = [];

const wss = new WebSocketServer({ port: 8080 });

function checkPair(ws: WebSocket) {
  const client1 = clients.find((client) => client.ws === ws);

  if (client1) {
    for (const client2 of clients) {
      if (client1.ws !== client2.ws && isMatch(client1.data, client2.data)) {
        console.log(`[PAIRING] Found match: ${client1.data.name}, ${client2.data.name}`);

        client1.ws.send(mkResConsent(`Found match: ${client2.data.name}`));
        client2.ws.send(mkResConsent(`Found match: ${client1.data.name}`));

        client1.match = client2.ws;
        client2.match = client1.ws;
      }
    }
  } else {
    console.log(`[PAIRING] Failed to find user`);
    ws.send(mkResStatus("Update request failed, couldn't find user"));
  }
}

wss.on("connection", (ws: WebSocket) => {
  console.log("[CONNECTION] Client Connected");

  for (const client of clients) {
    console.log(`[MAP] Sent ${client.data.name} info to new connection`);
    ws.send(mkResMapUpdate({ type: "add", data: client.data }));
  }

  ws.on("message", (raw: string) => {
    try {
      const message: Message = JSON.parse(raw);
      switch (message.type) {
        case "register": {
          
          // TODO: make sure ws is not already in the client

          const data = message.data as ClientData;
          console.log(`[REGISTER] Received Client Data: ${JSON.stringify(data)}`);

          for (const client of clients) {
            console.log(`[MAP] Sent ${data.name} info to ${client.data.name}`);
            client.ws.send(mkResMapUpdate({ type: "add", data: data }));
          }

          clients.push({ ws, data });
          ws.send(mkResStatus("Registration Successful"));

          checkPair(ws);
          break;
        }

        case "consent": {
          const consented = message.data as boolean;

          const client = clients.find((client) => client.ws === ws);

          console.log(`[CONSENT] Received consent from: ${client?.data.name}`);

          if (client?.ws && consented) {
            client.consent = true;
            const other = clients.find((c) => c.ws === client.match);
            if (other?.consent) {
              console.log(`[CONSENT] Pairing: ${client.data.name}, ${other.data.name}`);
              client.ws.send(mkResChat("Connecting..."));
              other.ws.send(mkResChat("Connecting..."));
            } else {
              client.ws.send(mkResStatus("Waiting for other user to consent"));
            }
          } else if (client?.ws && !consented) {
            client.consent = false;
            const other = clients.find((c) => c.ws === client.match);
            if (other?.consent) {
              console.log(`[CONSENT] Asked ${other.data.name} to remove ${client.data.name}`);
              other.ws.send(mkResMapUpdate({ type: "remove", data: client.data }));
              console.log(`[CONSENT] Asked ${client.data.name} to remove ${other.data.name}`);
              client.ws.send(mkResMapUpdate({ type: "remove", data: other.data }));
            } else {
              client.ws.send(mkResStatus("Can't find opposing user to reject"));
            }
          }
          break;
        }

        case "chat_message": {
          const client = clients.find((client) => client.ws === ws);
          const other = clients.find((c) => c.ws === client?.match);
          if (client?.consent && other?.consent) {
            let msg = message.data as string;
            console.log(`[CHAT] Sent message from ${client.data.name} to ${other.data.name}: ${msg}`);
            ws.send(mkResChatMsg({ name: client.data.name, msg }));
            other.ws.send(mkResChatMsg({ name: client.data.name, msg }));
          } else {
            console.log(`[CHAT] Failed to send message`);
            ws.send(mkResStatus("Chat failed to send (check consent?)"));
          }
          break;
        }

        case "info_update": {
          const client = clients.find((client) => client.ws === ws);
          if (client) {
            let data = message.data as ClientData;

            for (const client of clients) {
              if (client.ws !== ws) {
                console.log(`[MAP] Asked ${data.name} to remove ${client.data.name}`);
                client.ws.send(mkResMapUpdate({ type: "remove", data: data }));
              }
            }

            client.ws = ws;
            client.data = data;
            client.match = undefined;
            client.consent = undefined;
            console.log(`[UPDATE] Updated info of ${client.data.name}: ${data}`);
            ws.send(mkResStatus("Updated user information"));

            for (const client of clients) {
              if (client.ws !== ws) {
                console.log(`[MAP] Asked ${data.name} to add ${client.data.name}`);
                client.ws.send(mkResMapUpdate({ type: "add", data: data }));
              }
            }

          } else {
            console.log(`[UPDATE] Failed to find user`);
            ws.send(mkResStatus("Update request failed, couldn't find user"));
          }
          break;
        }

        default:
          console.log(`[ERROR] Unexpected Message Type: ${message.type}`);
          ws.send(mkResStatus("Unknown Message Type"));
          break;
      }

    } catch (error) {
      console.log(`[ERROR] Failed to parse client data: ${error}`);
      ws.send(mkResStatus("Invalid data format, server requests a JSON"));
    }
  });

  ws.on("close", () => {
    // TODO: remove ws from clients
    console.log("[DISCONNECTION] Client disconnected");
  });
});
