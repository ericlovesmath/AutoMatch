import { WebSocketServer, WebSocket } from "ws";
import { getSharedPoint } from "./matching";
import { Message, ClientData, Response, Path } from "../../shared/types";

// NOTE FOR BRADY
// - CHANGED API
//   - chat_message gets json { name: string, msg: string } instead of just msg now
//   - map_update gets json { type: add/remove, data: ClientData }
//     - Rejecting is treated the same as removing them from map (since you won't want to consider them anyways)
//     - map_update ADD stream sent for users who connected before you when you register
//   - Client can send { consent : false } to remove the user from both people's interfaces
//   - Client can send info_update like register, but to change the user
//   - ClientData doesn't take an Airport, but [from] and [to] regions

const mkResStatus = (msg: string) => JSON.stringify({ type: "notify_status", msg } as Response);
const mkResConsent = (msg: ClientData) => JSON.stringify({ type: "request_consent", msg } as Response);
const mkResReject = () => JSON.stringify({ type: "notify_match_rejected", msg: "" } as Response);
const mkResPaired = (msg: Path | null) => JSON.stringify({ type: "notify_paired", msg } as Response);
const mkResChatMsg = (msg: { name: string, msg: string; }) => JSON.stringify({ type: "notify_chat_message", msg } as Response);
const mkResMapUpdate = (msg: { type: "add" | "remove", data: ClientData; }) => JSON.stringify({ type: "notify_map_update", msg } as Response);

// TODO: Database instead?
const registered_clients: { ws: WebSocket; data: ClientData; match?: WebSocket, consent?: boolean; blacklist: WebSocket[]; }[] = [];
const all_clients: WebSocket[] = [];

const wss = new WebSocketServer({ port: 8080 });

function findMatch(ws: WebSocket) {
    const client1 = registered_clients.find((client) => client.ws === ws);
    if (!client1) {
        console.log(`[PAIRING] Failed to find user`);
        ws.send(mkResStatus("Update request failed, couldn't find user"));
        return;
    }
    if (client1.match) {
        console.log(`[PAIRING] User already matched or waiting`);
        ws.send(mkResStatus("Already matched or waiting"));
        return;
    }

    for (const client2 of registered_clients) {
        // client2 already waiting or matched
        if (client2.match) {
            continue;
        }

        // same client
        if (client1.ws == client2.ws) {
            continue;
        }

        // too far away
        if (getSharedPoint(client1.data, client2.data) === null) {
            continue;
        }

        // one client is blacklisted by the other
        if (client1.blacklist.includes(client2.ws) || client2.blacklist.includes(client1.ws)) {
            continue;
        }

        console.log(`[PAIRING] Found match: ${client1.data.name}, ${client2.data.name}`);

        client1.ws.send(mkResConsent(client2.data));
        client2.ws.send(mkResConsent(client1.data));

        client1.match = client2.ws;
        client2.match = client1.ws;
        return;
    }

    console.log(`[PAIRING] No match found for ${client1.data.name}`);
    ws.send(mkResStatus("No match found, wait for another user"));
}

wss.on("connection", (ws: WebSocket) => {
    console.log("[CONNECTION] Client Connected");

    all_clients.push(ws);

    for (const client of registered_clients) {
        if (client.match && client.consent) {
            continue;
        }
        console.log(`[MAP] Sent ${client.data.name} info to new connection`);
        ws.send(mkResMapUpdate({ type: "add", data: client.data }));
    }

    ws.on("message", (raw: string) => {
        try {
            const message: Message = JSON.parse(raw);
            switch (message.type) {
                case "register": {

                    // make sure ws is not already in the client
                    if (registered_clients.some(client => client.ws === ws)) {
                        return;
                    }

                    const data = message.data as ClientData;
                    console.log(`[REGISTER] Received Client Data: ${JSON.stringify(data)}`);

                    console.log(all_clients.length);
                    for (const w of all_clients) {
                        if (w !== ws) {
                            console.log(`[MAP] Sent ${data.name} info to websocket`);
                            w.send(mkResMapUpdate({ type: "add", data: data }));
                        }
                    }

                    registered_clients.push({ ws, data, blacklist: [] });
                    ws.send(mkResStatus("Registration Successful"));

                    findMatch(ws);
                    break;
                }

                case "consent": {
                    const consented = message.data as boolean;

                    const client = registered_clients.find((client) => client.ws === ws);

                    console.log(`[CONSENT] Consent set: ${client?.data.name} to ${consented}`);

                    if (client?.ws && consented) {
                        // client accepts the match
                        client.consent = true;
                        const other = registered_clients.find((c) => c.ws === client.match);
                        if (other?.consent) {
                            console.log(`[CONSENT] Pairing: ${client.data.name}, ${other.data.name}`);

                            let point = getSharedPoint(client.data, other.data);
                            client.ws.send(mkResPaired(point));
                            other.ws.send(mkResPaired(point));

                            console.log(`[CONSENT] Removing information of pair from all clients`);
                            all_clients.forEach(w => w.send(mkResMapUpdate({ type: "remove", data: other.data })));
                            all_clients.forEach(w => w.send(mkResMapUpdate({ type: "remove", data: client.data })));

                        } else {
                            client.ws.send(mkResStatus("Waiting for other user to consent"));
                        }
                    } else if (client?.ws && !consented) {
                        // client rejects the match
                        const other = registered_clients.find((c) => c.ws === client.match);
                        client.consent = false;
                        client.match = undefined;
                        if (other) {
                            client.blacklist.push(other.ws);
                            console.log(`[CONSENT] ${client.data.name} rejected ${other.data.name}`);
                            console.log("matching other person");
                            other.consent = false;
                            other.match = undefined;
                            other.ws.send(mkResReject()); // tell other person they were rejected
                            findMatch(other.ws); // rematch other person
                        }
                        console.log("matching this client");
                        client.ws.send(mkResReject()); // tell this person the rejection went through
                        findMatch(client.ws); // rematch this person
                    }
                    break;
                }

                case "chat_message": {
                    const client = registered_clients.find((client) => client.ws === ws);
                    const other = registered_clients.find((c) => c.ws === client?.match);
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

                case "unregister": {
                    const ind_registered = registered_clients.findIndex(client => client.ws === ws);
                    if (ind_registered !== -1) {
                        const data = registered_clients[ind_registered].data;
                        all_clients.forEach(w => w.send(mkResMapUpdate({ type: "remove", data: data })));

                        registered_clients.splice(ind_registered, 1);
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
        const ind_all = all_clients.indexOf(ws);
        if (ind_all !== -1) {
            all_clients.splice(ind_all, 1);
        }
        const ind_registered = registered_clients.findIndex(client => client.ws === ws);
        if (ind_registered !== -1) {
            const client = registered_clients[ind_registered];
            if (client.match && !client.consent) {
                const other = registered_clients.find((c) => c.ws === client?.match);
                if (other) {
                    other.ws.send(mkResReject());
                }
            }
            all_clients.forEach(w => w.send(mkResMapUpdate({ type: "remove", data: client.data })));
            registered_clients.splice(ind_registered, 1);
        }
        console.log("[DISCONNECTION] Client disconnected");
    });
});
